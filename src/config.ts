/**
 * Central site configuration.
 * Values come from PUBLIC_* env vars (see .env.example) with safe fallbacks,
 * so the site builds even before you customise it.
 */
const env = import.meta.env;

export const site = {
  name: env.PUBLIC_SITE_NAME || 'Yudha Ikhsan',
  tagline: env.PUBLIC_SITE_TAGLINE || 'Message-grade clarity. Media-grade reach.',
  role: env.PUBLIC_SITE_ROLE || 'Communication Consultant',
  url: env.PUBLIC_SITE_URL || 'https://yudaikhsan-site.pages.dev',
  description:
    'Portfolio and writing by a communication strategist — brand storytelling, media relations, and content that moves people.',
  email: env.PUBLIC_SITE_EMAIL || 'yudha.ikhsan1993@gmail.com',
  studioName: env.PUBLIC_STUDIO_NAME || 'Ikhsan Communications',
  studioUrl: env.PUBLIC_STUDIO_URL || 'https://yudaikhsan-site.pages.dev',
  calUrl: env.PUBLIC_CAL_URL || 'https://cal.com/yudhaikhsan/discovery',
  social: {
    github: env.PUBLIC_SOCIAL_GITHUB || 'https://github.com/yudaikhsan',
    linkedin: env.PUBLIC_SOCIAL_LINKEDIN || 'https://linkedin.com/in/yudhaikhsan',
    x: env.PUBLIC_SOCIAL_X || 'https://x.com/yudhaikhsan',
  },
  forms: {
    web3formsKey: env.PUBLIC_WEB3FORMS_KEY || '',
    newsletterEndpoint: env.PUBLIC_NEWSLETTER_ENDPOINT || '',
  },
};

export const categoryLabels: Record<string, string> = {
  'media-relations': 'Media Relations',
  'crisis-comms': 'Crisis Comms',
  'brand-strategy': 'Brand Strategy',
  'personal-essays': 'Personal Essays',
};

/** Research item types (must match the enum in src/content.config.ts). */
export const researchTypeLabels: Record<string, string> = {
  report: 'Report',
  whitepaper: 'Whitepaper',
  framework: 'Framework',
  dataset: 'Data',
  article: 'Article',
};

/** Icon shown per research type (see src/components/Icon.astro). */
export type ResearchIcon = 'file-text' | 'book-open' | 'layers' | 'database' | 'microscope';
export const researchTypeIcon: Record<string, ResearchIcon> = {
  report: 'file-text',
  whitepaper: 'book-open',
  framework: 'layers',
  dataset: 'database',
  article: 'microscope',
};

/** Publication status labels for research items. */
export const researchStatusLabels: Record<string, string> = {
  published: 'Published',
  ongoing: 'Ongoing',
  'working-paper': 'Working paper',
};

/**
 * Main navigation — matches the original site exactly (4 items).
 * `/portfolio` is intentionally NOT in the nav; it's reachable from the footer
 * "Read my portfolio" link and the home "Read All Projects" button, just like
 * the original. To surface it in the nav, add:
 *   { name: 'Portfolio', href: '/portfolio' },
 */
export const nav = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Writing', href: '/writing' },
  { name: 'Research', href: '/research' },
  { name: 'Contact', href: '/contact' },
];
