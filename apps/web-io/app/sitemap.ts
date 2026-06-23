import type { MetadataRoute } from 'next';
import { getAllPages } from '@ai-transformation/content';

const BASE = 'https://ai-transformation.io';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE}/library`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/insights`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.85 },
    {
      url: `${BASE}/insights/assessment`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    { url: `${BASE}/ask`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/for-agents`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/settings`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/progress`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ];

  const contentRoutes: MetadataRoute.Sitemap = getAllPages().map((page) => ({
    url: `${BASE}${page.pathname}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.85,
  }));

  return [...staticRoutes, ...contentRoutes];
}
