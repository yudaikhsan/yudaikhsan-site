import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Real deployed URL (Cloudflare Pages project: yudaikhsan-site).
export const SITE = 'https://yudaikhsan-site.pages.dev';

export default defineConfig({
  site: SITE,
  integrations: [sitemap()],
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: true,
    },
  },
});
