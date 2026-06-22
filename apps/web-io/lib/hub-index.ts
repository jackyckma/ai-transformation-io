import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { getAllPages, type ContentPageMeta } from '@ai-transformation/content';

import { FUNCTION_PAGES } from '@/data/function-pages';

const moduleDir = path.dirname(fileURLToPath(import.meta.url));
const hubIndexPath = path.join(moduleDir, '../../../data/curated/io-hub-index.json');

export type HubSectionConfig = {
  id: string;
  title: string;
  slugs?: string[];
  roleSlugs?: string[];
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

const PILLAR_LABEL: Record<ContentPageMeta['pillar'], string> = {
  framework: 'Framework',
  function: 'Role',
  resource: 'Playbook',
};

function loadHubIndex(): Record<string, HubPageConfig> {
  return JSON.parse(fs.readFileSync(hubIndexPath, 'utf-8')) as Record<string, HubPageConfig>;
}

function pageBySlug(slug: string): ContentPageMeta | undefined {
  return getAllPages().find((page) => page.slug === slug);
}

function resolveContentItems(slugs: string[]): HubCardItem[] {
  return slugs.flatMap((slug) => {
    const page = pageBySlug(slug);
    if (!page) return [];
    return [
      {
        id: slug,
        title: page.title,
        description: page.description,
        href: page.pathname,
        label: PILLAR_LABEL[page.pillar],
      },
    ];
  });
}

function resolveRoleItems(roleSlugs: string[]): HubCardItem[] {
  return roleSlugs.flatMap((slug) => {
    const role = FUNCTION_PAGES[slug];
    if (!role) return [];
    return [
      {
        id: slug,
        title: role.title,
        description: role.description,
        href: `/functions/${slug}`,
        label: 'Role guide',
      },
    ];
  });
}

export function getHubPage(hubId: keyof ReturnType<typeof loadHubIndex> | string): {
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
    items: section.slugs
      ? resolveContentItems(section.slugs)
      : resolveRoleItems(section.roleSlugs ?? []),
  }));

  return { intro, sections };
}
