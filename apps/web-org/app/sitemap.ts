import { getOrgKnowledgePages } from '@ai-transformation/content';
import type { MetadataRoute } from 'next';

const BASE = 'https://ai-transformation.org';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE}/knowledge`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/community`, changeFrequency: 'daily', priority: 0.85 },
    { url: `${BASE}/ask`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/prompts`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/apprenticeship`, changeFrequency: 'monthly', priority: 0.75 },
    { url: `${BASE}/apprenticeship/rationale`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/for-agents`, changeFrequency: 'monthly', priority: 0.7 },
  ];

  const knowledgeRoutes: MetadataRoute.Sitemap = getOrgKnowledgePages().map((page) => ({
    url: `${BASE}${page.pathname}`,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...knowledgeRoutes];
}
