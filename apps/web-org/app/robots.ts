import type { MetadataRoute } from 'next';

const BASE = 'https://ai-transformation.org';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/moderation'],
    },
    sitemap: `${BASE}/sitemap.xml`,
  };
}
