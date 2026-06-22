import type { MetadataRoute } from 'next';
import { getAllPages } from '@ai-transformation/content';
import { FUNCTION_SLUGS } from '@/data/function-pages';

const BASE = 'https://ai-transformation.io';

export default function sitemap(): MetadataRoute.Sitemap {
  const functionRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/functions`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.75 },
    ...FUNCTION_SLUGS.map((slug) => ({
      url: `${BASE}/functions/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ];

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE}/frameworks`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/playbook`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/for-agents`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/assessment`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/ask`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
  ];

  const contentRoutes: MetadataRoute.Sitemap = getAllPages().map((page) => ({
    url: `${BASE}${page.pathname}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.85,
  }));

  return [...staticRoutes, ...functionRoutes, ...contentRoutes];
}
