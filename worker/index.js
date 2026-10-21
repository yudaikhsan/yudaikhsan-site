/**
 * Sveltia CMS — GitHub OAuth proxy (Cloudflare Worker).
 *
 * This is the tiny server that lets Sveltia CMS (`/admin`) log in with GitHub
 * on a static site. It has no dependencies and runs free on Cloudflare Workers.
 *
 * Endpoints
 *   GET /                    → health check
 *   GET /auth?provider=github&scope=repo,user&site_id=<url>
 *                            → redirects to GitHub
 *   GET /callback?code=…&state=…
 *                            → exchanges the code for a token and hands it back
 *                              to the CMS window via postMessage
 *
 * Required variables (set as secrets — see README.md):
 *   GITHUB_CLIENT_ID
 *   GITHUB_CLIENT_SECRET
 * Optional:
 *   ALLOWED_DOMAINS   comma-separated allow-list, e.g. "my-site.pages.dev"
 */

const GITHUB_AUTHORIZE_URL = 'https://github.com/login/oauth/authorize';
const GITHUB_TOKEN_URL = 'https://github.com/login/oauth/access_token';
const DEFAULT_SCOPE = 'repo,user';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // CORS pre-flight (harmless; the CMS talks to us via a popup).
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    if (request.method !== 'GET') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders() });
    }

    switch (url.pathname) {
      case '/':
        return json({ ok: true, service: 'sveltia-cms-auth', endpoints: ['/auth', '/callback'] });
      case '/auth':
        return handleAuth(request, url, env);
      case '/callback':
        return handleCallback(request, url, env);
      default:
        return new Response('Not found', { status: 404, headers: corsHeaders() });
    }
  },
};

/** Step 1 — send the user to GitHub's consent screen. */
function handleAuth(request, url, env) {
  const provider = url.searchParams.get('provider') || 'github';

  if (provider !== 'github') {
    return new Response(`Unsupported provider: ${provider}`, {
      status: 400,
      headers: corsHeaders(),
    });
  }

  // Optional allow-list so this Worker can't be borrowed by other sites.
  if (env.ALLOWED_DOMAINS) {
    const allowed = env.ALLOWED_DOMAINS.split(',')
      .map((domain) => domain.trim().replace(/^https?:\/\//, '').replace(/\/.*$/, ''))
      .filter(Boolean);
    const site = siteHostname(request, url);
    const ok = allowed.some((domain) => site === domain || site.endsWith(`.${domain}`));
    if (!ok) {
      return new Response(`Domain not allowed: ${site || '(unknown)'}`, {
        status: 403,
        headers: corsHeaders(),
      });
    }
  }

  const scope = url.searchParams.get('scope') || DEFAULT_SCOPE;
  const state = crypto.randomUUID();

  const authorize = new URL(GITHUB_AUTHORIZE_URL);
  authorize.searchParams.set('client_id', env.GITHUB_CLIENT_ID || '');
  authorize.searchParams.set('redirect_uri', `${url.origin}/callback`);
  authorize.searchParams.set('scope', scope);
  authorize.searchParams.set('state', state);
  authorize.searchParams.set('allow_signup', 'false');

  return new Response(null, {
    status: 302,
    headers: {
      ...corsHeaders(),
      Location: authorize.toString(),
      // Remember the nonce so /callback can detect a forged request (CSRF).
      'Set-Cookie': `oauth_state=${state}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=600`,
    },
  });
}

/** Step 2 — trade the ?code for an access token and reply to the CMS window. */
async function handleCallback(request, url, env) {
  const provider = url.searchParams.get('provider') || 'github';
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const oauthError = url.searchParams.get('error');

  if (oauthError) {
    const description = url.searchParams.get('error_description');
    return renderHandshake({
      provider,
      error: description ? `${oauthError}: ${description}` : oauthError,
    });
  }

  if (!code) {
    return renderHandshake({ provider, error: 'Missing "code" parameter.' });
  }

  const cookies = parseCookies(request.headers.get('Cookie') || '');
  if (cookies.oauth_state && state && cookies.oauth_state !== state) {
    return renderHandshake({ provider, error: 'Invalid OAuth state — please try again.' });
  }

  if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) {
    return renderHandshake({
      provider,
      error: 'Worker is missing GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET.',
    });
  }

  let data = {};
  try {
    const tokenResponse = await fetch(GITHUB_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: `${url.origin}/callback`,
      }),
    });
    data = await tokenResponse.json();
  } catch {
    return renderHandshake({ provider, error: 'Could not reach GitHub to exchange the token.' });
  }

  if (!data.access_token) {
    return renderHandshake({
      provider,
      error: data.error_description || data.error || 'Failed to exchange code for a token.',
    });
  }

  return renderHandshake({ provider, token: data.access_token });
}

/**
 * The handshake page. The CMS opens us in a popup, then sends a message; we
 * answer with the token/error using the protocol Decap/Sveltia expect.
 */
function renderHandshake({ provider, token, error }) {
  const payload = error
    ? `authorization:${provider}:error:${JSON.stringify({ error, provider })}`
    : `authorization:${provider}:success:${JSON.stringify({ token, provider })}`;

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${error ? 'Authorization failed' : 'Authorizing…'}</title>
    <style>
      body { font-family: system-ui, sans-serif; margin: 3rem auto; max-width: 32rem; padding: 0 1rem; color: #111; }
      code { background: #f3f4f6; padding: .15rem .35rem; border-radius: .25rem; }
    </style>
  </head>
  <body>
    <h1>${error ? 'Authorization failed' : 'Authorizing…'}</h1>
    <p>${
      error
        ? `Something went wrong: <code>${escapeHtml(error)}</code>`
        : 'You can close this window and return to the editor.'
    }</p>
    <script>
      (function () {
        var payload = ${JSON.stringify(payload)};
        function receiveMessage(event) {
          if (!window.opener) return;
          window.opener.postMessage(payload, event.origin);
          window.removeEventListener('message', receiveMessage, false);
        }
        window.addEventListener('message', receiveMessage, false);
        if (window.opener) {
          window.opener.postMessage('authorizing:${provider}', '*');
        }
      })();
    </script>
  </body>
</html>`;

  const headers = {
    ...corsHeaders(),
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-store',
  };

  // Clear the nonce cookie once we're done with it.
  if (!error) {
    headers['Set-Cookie'] = 'oauth_state=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0';
  }

  return new Response(html, { status: 200, headers });
}

function siteHostname(request, url) {
  const siteId = url.searchParams.get('site_id');
  if (siteId) {
    try {
      return new URL(siteId).hostname;
    } catch {
      /* fall through */
    }
  }
  const referer = request.headers.get('Referer') || request.headers.get('Origin');
  if (referer) {
    try {
      return new URL(referer).hostname;
    } catch {
      /* fall through */
    }
  }
  return '';
}

function parseCookies(header) {
  return header.split(';').reduce((cookies, part) => {
    const index = part.indexOf('=');
    if (index > -1) {
      cookies[part.slice(0, index).trim()] = part.slice(index + 1).trim();
    }
    return cookies;
  }, {});
}

function escapeHtml(value) {
  return String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char],
  );
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': '*',
  };
}

function json(body) {
  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders(), 'Content-Type': 'application/json; charset=utf-8' },
  });
}