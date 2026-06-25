import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { getOrgKnowledgePages, type ContentPageMeta } from '@ai-transformation/content';

const moduleDir = path.dirname(fileURLToPath(import.meta.url));
const hubIndexPath = path.join(moduleDir, '../../../data/curated/org-hub-index.json');

type KnowledgeConfigSection = {
  id: string;
  title: string;
  orgKnowledgeSlugs?: string[];
};

type KnowledgeConfigPage = {
  title: string;
  description: string;
  updatedAt?: string;
  sections: KnowledgeConfigSection[];
};

export type KnowledgeItem = {
  slug: string;
  title: string;
  description: string;
  href: string;
  pillar: ContentPageMeta['pillar'];
};

export type KnowledgeCategory = {
  id: string;
  title: string;
  items: KnowledgeItem[];
};

export type KnowledgeIndex = {
  title: string;
  description: string;
  updatedAt?: string;
  categories: KnowledgeCategory[];
};

const PILLAR_CATEGORY_TITLE: Record<ContentPageMeta['pillar'], string> = {
  framework: 'Frameworks',
  function: 'By function',
  resource: 'References & resources',
};

function loadConfig(): KnowledgeConfigPage | null {
  try {
    const raw = JSON.parse(fs.readFileSync(hubIndexPath, 'utf-8')) as Record<string, KnowledgeConfigPage>;
    return raw.knowledge ?? null;
  } catch {
    return null;
  }
}

function toItem(page: ContentPageMeta): KnowledgeItem {
  return {
    slug: page.slug,
    title: page.title,
    description: page.description,
    href: page.pathname,
    pillar: page.pillar,
  };
}

/** Curated sections from org-hub-index.json, with any uncategorized pages grouped by pillar. */
export function getKnowledgeIndex(): KnowledgeIndex {
  const pages = getOrgKnowledgePages();
  const config = loadConfig();
  const bySlug = new Map(pages.map((page) => [page.slug, page]));
  const placed = new Set<string>();

  const categories: KnowledgeCategory[] = [];

  for (const section of config?.sections ?? []) {
    const items = (section.orgKnowledgeSlugs ?? []).flatMap((slug) => {
      const page = bySlug.get(slug);
      if (!page) return [];
      placed.add(slug);
      return [toItem(page)];
    });
    if (items.length > 0) {
      categories.push({ id: section.id, title: section.title, items });
    }
  }

  const remainingByPillar = new Map<ContentPageMeta['pillar'], KnowledgeItem[]>();
  for (const page of pages) {
    if (placed.has(page.slug)) continue;
    const bucket = remainingByPillar.get(page.pillar) ?? [];
    bucket.push(toItem(page));
    remainingByPillar.set(page.pillar, bucket);
  }

  for (const [pillar, items] of remainingByPillar) {
    categories.push({ id: `pillar-${pillar}`, title: PILLAR_CATEGORY_TITLE[pillar], items });
  }

  return {
    title: config?.title ?? 'Knowledge commons',
    description:
      config?.description ??
      'Durable, contributed knowledge for the community — frameworks, patterns, and references.',
    updatedAt: config?.updatedAt,
    categories,
  };
}
