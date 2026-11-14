import type { APIRoute } from 'astro';
import { site as siteConfig } from '../config';

export const GET: APIRoute = () => {
  const sitemap = new URL('sitemap-index.xml', siteConfig.url).href;
  const body = `User-agent: *\nAllow: /\n\nSitemap: ${sitemap}\n`;
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
