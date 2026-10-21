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
# open http://localhost:4321/admin
```

In `public/admin/config.yml` leave `base_url` empty and add `local_backend: true` to edit
files on your machine. (Sveltia will prompt you to run its local proxy.)

### B. Online editing (login with GitHub)

1. **Edit `public/admin/config.yml`** → set `repo: yudaikhsan/yudaikhsan-site`.
2. **Create a GitHub OAuth App** → GitHub → *Settings → Developer settings → OAuth Apps → New*:
   - Homepage URL: `https://your-site.pages.dev`
   - Authorization callback URL: `https://<worker>.workers.dev/callback`
   - Save the **Client ID**, generate a **Client Secret**.
3. **Deploy the auth Worker** — a ready-to-use one is included in
   [`worker/`](worker/README.md) (self-contained, free on Cloudflare):

   ```bash
   cd worker
   npm install
   npx wrangler login
   npm run deploy
   npx wrangler secret put GITHUB_CLIENT_ID
   npx wrangler secret put GITHUB_CLIENT_SECRET
   ```

   Then set `ALLOWED_DOMAINS = "your-site.pages.dev"` in `worker/wrangler.toml` and
   `npm run deploy` again. *(Prefer a one-click option? You can also use the official
   [`sveltia-cms-auth`](https://github.com/sveltia/sveltia-cms-auth).)*
4. Put the Worker URL in `config.yml` → `base_url`.
5. Open `https://your-site.pages.dev/admin` → **Log in with GitHub**.

Full walk-through (OAuth App setup, secrets, local testing): **[`worker/README.md`](worker/README.md)**.

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

1. Push this repo to GitHub.
2. Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git** → pick the repo.
3. Build settings:
   - **Framework preset:** Astro
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
4. **Save and Deploy** → you get `your-project.pages.dev` (free HTTPS).
5. Add env vars from `.env` under *Settings → Environment variables*.
6. Every push to `main` auto-deploys. *(Custom domain: Pages → Custom domains — free if
   the domain is on Cloudflare; a `.com` costs ~$10–11/yr at Cloudflare Registrar.)*

The same project also deploys to Netlify, Vercel, or GitHub Pages with no code changes.

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