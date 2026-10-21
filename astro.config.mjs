import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// CHANGE THIS to your real domain before deploying.
export const SITE = 'https://yudhaikhsan.pages.dev';

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
