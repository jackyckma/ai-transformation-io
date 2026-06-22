import { getOrgLearnPages } from '@ai-transformation/content';
import type { MetadataRoute } from 'next';

const BASE = 'https://ai-transformation.org';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE}/stories`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/stories/submit`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/prompts`, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${BASE}/learn`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/apprenticeship`, changeFrequency: 'monthly', priority: 0.75 },
    { url: `${BASE}/apprenticeship/rationale`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/for-agents`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/ask`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/join`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/start`, changeFrequency: 'monthly', priority: 0.6 },
  ];

  const learnRoutes: MetadataRoute.Sitemap = getOrgLearnPages().map((page) => ({
    url: `${BASE}${page.pathname}`,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...learnRoutes];
}
