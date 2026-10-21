# sveltia-cms-auth

A tiny, dependency-free **Cloudflare Worker** that lets [Sveltia CMS](../../public/admin)
log in with **GitHub** on a static site. It's the OAuth middleman: GitHub can't send a
token straight to a static page, so the browser popup asks this Worker, which holds the
secret and hands back a token.

```
CMS popup ──/auth──▶ Worker ──▶ GitHub consent
                                    │
CMS popup ◀──/callback── Worker ◀───┘  (token via postMessage)
```

Free tier is plenty — this only runs for a few seconds when you log in.

---

## 1. Create a GitHub OAuth App

GitHub → **Settings → Developer settings → OAuth Apps → New OAuth App**

| Field | Value |
| --- | --- |
| Application name | Portfolio CMS (anything) |
| Homepage URL | `https://your-site.pages.dev` |
| Authorization callback URL | `https://sveltia-cms-auth.<your-subdomain>.workers.dev/callback` |

Save the **Client ID**, then **Generate a new client secret**. Keep both handy.

> The callback URL must be the Worker's `/callback`, not your site. You'll know the
> exact Worker hostname after the first deploy (step 2) — deploy once, note the URL,
> then go back and fix the callback URL if needed.

## 2. Deploy the Worker

```bash
cd worker
npm install
npx wrangler login        # one-time, opens the browser
npm run deploy
```

Wrangler prints your Worker URL, e.g.
`https://sveltia-cms-auth.your-subdomain.workers.dev`.

## 3. Add the secrets

```bash
npx wrangler secret put GITHUB_CLIENT_ID
npx wrangler secret put GITHUB_CLIENT_SECRET
```

Then edit `wrangler.toml` and set the allow-list to your site, and redeploy:

```toml
[vars]
ALLOWED_DOMAINS = "your-site.pages.dev"
```

```bash
npm run deploy
```

## Local testing (optional)

```bash
cp .dev.vars.example .dev.vars   # fill in the values
npm run dev                      # http://localhost:8787
```

Add `http://localhost:8787/callback` as a **second** callback URL on the OAuth App (or
use a separate OAuth App for local work).

---

## 4. Point the CMS at the Worker

In `../public/admin/config.yml`:

```yaml
backend:
  name: github
  repo: yudaikhsan/yudaikhsan-site
  branch: main
  base_url: https://sveltia-cms-auth.your-subdomain.workers.dev
```

Push, wait for Cloudflare Pages to rebuild, then open
`https://your-site.pages.dev/admin` → **Log in with GitHub**.

---

## Notes

- **`ALLOWED_DOMAINS`** stops other sites from reusing your Worker. Leave it empty to
  allow any origin (not recommended).
- **`GITHUB_CLIENT_SECRET`** is only ever read by the Worker — never put it in the
  site's `.env` or in `config.yml`.
- This Worker returns the token via the standard Decap/Sveltia `postMessage` handshake,
  so it also works with Netlify CMS / Decap CMS.
