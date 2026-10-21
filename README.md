# Portfolio Site

A personal portfolio + writing site in the style of **prasaja.com**, built with
**Astro**, **Tailwind CSS**, **Markdown content collections**, a **git-based CMS**
(Sveltia) at `/admin`, and optional **Web3Forms** / newsletter integrations.

> ⚠️ **Content is placeholder.** Nothing here is copied from the original site.
> Replace the copy, images, and links with your own before publishing.

---

## Features (mirrors the original)

- **Routes:** `/`, `/about`, `/writing`, `/writing/:slug`, `/portfolio`, `/portfolio/:slug`, `/research`, `/research/:slug`, `/contact`, `/accessibility`, `404`
- **Home sections:** hero with avatar, "Being a Full-stack Writer", latest writings, featured projects, research, studio CTA
- **Dark / Light / System** theme toggle (no flash on load, saved in `localStorage`)
- **Responsive** header with an accessible mobile menu
- **Content editor** at `/admin` — write, edit, and publish posts, projects & research from the browser
- **Real forms:** contact form + newsletter via Web3Forms (not faked)
- **SEO:** per-page titles/descriptions, Open Graph, Twitter cards, canonical URLs
- **`sitemap.xml`, `robots.txt`, `rss.xml`**
- **Accessibility:** skip link, labelled forms with live errors, visible focus states, AA contrast, colour-independent links, `prefers-reduced-motion`-friendly

---

## Quick start

```bash
npm install
cp .env.example .env      # then edit .env
npm run dev               # http://localhost:4321
npm run build             # output in dist/
npm run preview           # preview the build
```

### Customise

Everything personal lives in **`.env`** (name, tagline, socials, studio, Cal.com link)
and in **`src/config.ts`**. Set `site` in **`astro.config.mjs`** to your real domain.

Placeholder images live in `public/images/` (`avatar.svg`, `profile.svg`,
`projects/cover-*.svg`, `og-default.svg`) — swap them for your own (`.png`/`.webp`, or
keep `.svg`).

---

## Add a post (two ways)

### 1. As a file

Create `src/content/posts/my-post.md`:

```markdown
---
title: "My post"
date: 2026-02-04
category: media-relations    # media-relations | crisis-comms | brand-strategy | personal-essays
excerpt: "One-sentence summary shown on cards and in RSS."
tags: [media-relations, pitching]
draft: false
# image: /images/my-cover.png   # optional
---

Your Markdown goes here.
```

Add `draft: true` to keep it out of the build.

### 2. From the editor (`/admin`)

See **Enable the /admin editor** below.

Projects work the same way via `src/content/projects/*.md`.

---

## Enable the `/admin` editor (free)

The editor is **Sveltia CMS** (a fast, open-source, git-based CMS). Locally it works with
no setup; online it needs a tiny free **Cloudflare Worker** to authenticate with GitHub.

### A. Local editing (no setup)

```bash
npm run dev
```

Open **`http://localhost:4321/admin/index.html`** in a Chromium-based browser
(Chrome, Edge, Brave), click **“Work with Local Repository”**, and select this
project’s root folder. Sveltia writes straight to the Markdown files through the
browser’s File System Access API — **no proxy server and no `local_backend` setting**.

> Sveltia ignores `local_backend` and does not support `netlify-cms-proxy-server` /
> `decap-server`. Local mode is Chromium-only (Firefox and Safari lack the File System
> Access API) — use the GitHub login below in those browsers. Changes made locally are
> committed and pushed with your own Git client.

### B. Online editing — easiest path: GitHub access token (no server)

Once the site is deployed, open `https://your-site.pages.dev/admin` and choose
**“Sign in with Access Token”**. Create a **fine-grained personal access token** at
GitHub → *Settings → Developer settings → Fine-grained tokens → Generate new token*:

- **Repository access:** only `yudaikhsan/yudaikhsan-site`
- **Permissions:** *Contents* → **Read and write** (*Metadata* → Read is added automatically)
- **Expiration:** your choice (90 days is fine — regenerate when it lapses)

Paste the token into the editor and you're in. Sveltia commits straight to the repo and
Cloudflare Pages redeploys automatically. **No OAuth app, no Worker, no secrets.**

> The token lives only in your browser. Revoke it on GitHub whenever you like.

### C. Optional — passwordless “Log in with GitHub” (OAuth Worker)

Only needed if you want a one-click GitHub button instead of a token (e.g. several
editors, or you'd rather not manage a token). It needs the free Cloudflare Worker in
[`worker/`](worker/README.md):

1. **Create a GitHub OAuth App** → GitHub → *Settings → Developer settings → OAuth Apps → New*:
   - Homepage URL: `https://your-site.pages.dev`
   - Authorization callback URL: `https://<worker>.workers.dev/callback`
   - Save the **Client ID**, generate a **Client Secret**.
2. **Deploy the Worker:**

   ```bash
   cd worker
   npx wrangler login
   npx wrangler deploy
   npx wrangler secret put GITHUB_CLIENT_ID
   npx wrangler secret put GITHUB_CLIENT_SECRET
   ```

   Set `ALLOWED_DOMAINS = "your-site.pages.dev"` in `worker/wrangler.toml`, then
   `npx wrangler deploy` again.
3. Put the Worker URL in `public/admin/config.yml` → `base_url`, commit and push.
4. Open `https://your-site.pages.dev/admin` → **Log in with GitHub**.

Full walk-through (OAuth App, secrets, local testing): **[`worker/README.md`](worker/README.md)**.

> Just want to publish occasionally? You can also edit the Markdown directly on
> github.com — no editor or Worker required.

---

## Forms

- **Contact form** → set `PUBLIC_WEB3FORMS_KEY` in `.env` (free: 250 submissions/month at
  <https://web3forms.com>). The form posts from the browser and shows inline errors + a
  status message.
- **Newsletter** → either reuse Web3Forms, or set `PUBLIC_NEWSLETTER_ENDPOINT` to a
  Buttondown / MailerLite subscribe URL.

If no key is configured, the forms show a helpful notice instead of pretending to work.

---

## Deploy to Cloudflare Pages (free)

The repo is ready on GitHub as **`yudaikhsan/yudaikhsan-site`**.

1. Sign in at <https://dash.cloudflare.com> (free account).
2. **Workers & Pages → Create → Pages → Connect to Git** → authorize GitHub, pick
   **`yudaikhsan/yudaikhsan-site`** → **Begin setup**.
3. Build settings:
   - **Framework preset:** Astro
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Root directory:** leave blank (the repo root *is* the site)
4. **Save and Deploy** — the first build takes 1–2 minutes.
5. Your URL is `https://<project-name>.pages.dev`.
   - To get **`yudhaikhsan.pages.dev`**, name the project **`yudhaikhsan`**.
   - If that name is taken, choose another and update `SITE` in `astro.config.mjs`
     **and** `PUBLIC_SITE_URL` (`.env` + the Pages env vars) to match.

### Environment variables

Everything except the forms has safe defaults, so you can deploy with none. Add these under
**Settings → Environment variables → Production** when you need them:

| Name | Value |
| --- | --- |
| `PUBLIC_WEB3FORMS_KEY` | your Web3Forms access key (contact + newsletter forms) |
| `PUBLIC_SITE_URL` | `https://yudhaikhsan.pages.dev` (only if the project name differs) |

> `PUBLIC_*` values are inlined at **build time**. After adding or changing one, trigger a
> new deployment (Deployments → Retry, or push a commit).

Every push to `main` auto-deploys.

---

## Project structure

```
public/
  admin/            Sveltia CMS (index.html + config.yml)
  images/           placeholder images + uploads/
src/
  components/       Header, Footer, ModeToggle, cards, forms, Icon
  content/          posts/, projects/ and research/  (Markdown)
  content.config.ts collections + Zod schemas
  layouts/          BaseLayout (meta, theme script, skip link)
  lib/utils.ts      cn(), readingTime(), date helpers
  pages/            routes
  styles/global.css design tokens + component classes
  config.ts         site identity from PUBLIC_* env vars
worker/             Cloudflare Worker: GitHub OAuth for /admin
```

Built with Astro 5 · Tailwind CSS 3 · TypeScript.