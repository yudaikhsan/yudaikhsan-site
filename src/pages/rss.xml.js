import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { site } from '../config';

export async function GET(context) {
  const posts = (await getCollection('posts', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.date.getTime() - a.data.date.getTime()
  );
  const research = (await getCollection('research', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.date.getTime() - a.data.date.getTime()
  );

  return rss({
    title: `${site.name} — Writing & Research`,
    description: 'Notes on media relations, crisis comms, and brand strategy — plus research.',
    site: context.site ?? site.url,
    items: [
      ...posts.map((post) => ({
        title: post.data.title,
        pubDate: post.data.date,
        description: post.data.excerpt,
        link: `/writing/${post.id}/`,
      })),
      ...research.map((item) => ({
        title: item.data.title,
        pubDate: item.data.date,
        description: item.data.abstract,
        link: `/research/${item.id}/`,
      })),
    ].sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime()),
    customData: '<language>en</language>',
  });
}