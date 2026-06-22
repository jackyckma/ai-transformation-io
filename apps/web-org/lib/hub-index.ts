import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { getOrgLearnPages, type ContentPageMeta } from '@ai-transformation/content';

const moduleDir = path.dirname(fileURLToPath(import.meta.url));
const hubIndexPath = path.join(moduleDir, '../../../data/curated/org-hub-index.json');

export type HubSectionConfig = {
  id: string;
  title: string;
  orgLearnSlugs?: string[];
};

export type HubPageConfig = {
  title: string;
  description: string;
  sections: HubSectionConfig[];
};

export type HubCardItem = {
  id: string;
  title: string;
  description: string;
  href: string;
  label: string;
};

export type HubSection = {
  id: string;
  title: string;
  items: HubCardItem[];
};

function loadHubIndex(): Record<string, HubPageConfig> {
  return JSON.parse(fs.readFileSync(hubIndexPath, 'utf-8')) as Record<string, HubPageConfig>;
}

function resolveOrgLearnItems(slugs: string[]): HubCardItem[] {
  const pages = getOrgLearnPages();
  return slugs.flatMap((slug) => {
    const page = pages.find((entry) => entry.slug === slug);
    if (!page) return [];
    return [
      {
        id: slug,
        title: page.title,
        description: page.description,
        href: page.pathname,
        label: 'Learn guide',
      },
    ];
  });
}

export function getHubPage(hubId: string): {
  intro: HubPageConfig;
  sections: HubSection[];
} {
  const index = loadHubIndex();
  const intro = index[hubId];
  if (!intro) {
    throw new Error(`Unknown hub: ${hubId}`);
  }

  const sections = intro.sections.map((section) => ({
    id: section.id,
    title: section.title,
    items: resolveOrgLearnItems(section.orgLearnSlugs ?? []),
  }));

  return { intro, sections };
}
