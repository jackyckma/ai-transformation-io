import type { MetadataRoute } from 'next';

const BASE = 'https://ai-transformation.io';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${BASE}/sitemap.xml`,
  };
}
