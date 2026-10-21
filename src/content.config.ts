import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    category: z.enum(['media-relations', 'crisis-comms', 'brand-strategy', 'personal-essays']),
    excerpt: z.string(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    image: z.string().optional(),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    category: z.string(),
    description: z.string(),
    image: z.string(),
    role: z.string().optional(),
    year: z.number().optional(),
    stack: z.array(z.string()).default([]),
    links: z
      .array(z.object({ label: z.string(), url: z.string() }))
      .default([]),
    featured: z.boolean().default(false),
    order: z.number().default(0),
  }),
});

const research = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/research' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    type: z.enum(['report', 'whitepaper', 'framework', 'dataset', 'article']),
    abstract: z.string(),
    authors: z.array(z.string()).default([]),
    publisher: z.string().optional(),
    status: z.enum(['published', 'ongoing', 'working-paper']).default('published'),
    link: z.string().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    image: z.string().optional(),
  }),
});

export const collections = { posts, projects, research };
