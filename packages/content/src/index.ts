import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import 'server-only';

import { getCuratedHomeFeed, type CuratedTopic } from './curated';

export type ContentPageMeta = {
  slug: string;
  title: string;
  description: string;
  pillar: 'framework' | 'function' | 'resource';
  pathname: string;
};

export type ContentDocument = ContentPageMeta & {
  markdown: string;
};

const moduleDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(moduleDir, '../../..');
const knowledgeBaseDir = path.join(repoRoot, 'knowledge-base');

/** Slug → source file under knowledge-base/ */
export const CONTENT_REGISTRY: Record<
  string,
  { file: string; pillar: ContentPageMeta['pillar']; pathname: string; description?: string }
> = {
  'what-is-ai-transformation': {
    file: 'what-is-ai-transformation.md',
    pillar: 'framework',
    pathname: '/library/what-is-ai-transformation',
    description: 'Beyond deployment — operating model change for enterprise AI.',
  },
  'ai-transformation-vs-digital-transformation': {
    file: 'ai-transformation-vs-digital-transformation.md',
    pillar: 'framework',
    pathname: '/library/vs-digital-transformation',
    description: 'How AI transformation differs from digitizing existing processes.',
  },
  'transformation-roadmap': {
    file: 'transformation-roadmap.md',
    pillar: 'framework',
    pathname: '/library/roadmap',
    description: 'Seven stages from business alignment to governed scaling.',
  },
  'governance-and-operating-model': {
    file: 'governance-and-operating-model.md',
    pillar: 'framework',
    pathname: '/library/governance',
    description: 'Autonomy boundaries, accountability, and operating model design.',
  },
  'measuring-ai-value': {
    file: 'measuring-ai-value.md',
    pillar: 'framework',
    pathname: '/library/measuring-value',
    description: 'ROI, Return on Autonomy, and board-ready measurement.',
  },
  'use-cases-by-industry': {
    file: 'use-cases-by-industry.md',
    pillar: 'resource',
    pathname: '/library/use-cases',
    description: 'Industry and function examples to ground your roadmap.',
  },
  'ai-patterns-copilots-agents-automation': {
    file: 'ai-patterns-copilots-agents-automation.md',
    pillar: 'resource',
    pathname: '/library/patterns',
    description: 'Copilot, RAG, agent, and automation patterns — when to use each.',
  },
  'common-pitfalls': {
    file: 'common-pitfalls.md',
    pillar: 'resource',
    pathname: '/library/common-pitfalls',
    description: 'Why AI transformation stalls — and how to avoid pilot purgatory.',
  },
  glossary: {
    file: 'glossary.md',
    pillar: 'resource',
    pathname: '/library/glossary',
    description: 'Definitions for autonomy, RoA, workflow redesign, and more.',
  },
  faq: {
    file: 'faq.md',
    pillar: 'resource',
    pathname: '/library/faq',
    description: 'Answers to the questions leaders ask first.',
  },
};

/** Curated intro articles for .org /knowledge (SEO + community visitors). */
export const ORG_KNOWLEDGE_SLUGS = [
  'what-is-ai-transformation',
  'transformation-roadmap',
  'common-pitfalls',
  'ai-patterns-copilots-agents-automation',
  'faq',
] as const;

export function getParamSlugMap(routePrefix: string): Record<string, string> {
  return Object.fromEntries(
    Object.entries(CONTENT_REGISTRY)
      .filter(([, entry]) => entry.pathname.startsWith(`${routePrefix}/`))
      .map(([slug, entry]) => {
        const param = entry.pathname.slice(routePrefix.length + 1);
        return [param, slug];
      }),
  );
}

export function getPagesByPillar(pillar: ContentPageMeta['pillar']): ContentPageMeta[] {
  return getAllPages().filter((page) => page.pillar === pillar);
}

export function getOrgKnowledgePages(): ContentPageMeta[] {
  return ORG_KNOWLEDGE_SLUGS.flatMap((slug) => {
    const page = getAllPages().find((p) => p.slug === slug);
    if (!page) return [];
    return [{ ...page, pathname: `/knowledge/${slug}` }];
  });
}

function extractTitle(markdown: string, fallback: string): string {
  const match = markdown.match(/^#\s+(.+)$/m);
  return match?.[1]?.trim() ?? fallback;
}

function extractDescription(markdown: string, fallback: string): string {
  const blockquote = markdown.match(/^>\s+(.+)$/m);
  if (blockquote?.[1]) {
    return blockquote[1].replace(/^Website content —\s*/i, '').trim();
  }
  const paragraph = markdown
    .split('\n\n')
    .map((block) => block.trim())
    .find((block) => block && !block.startsWith('#') && !block.startsWith('>'));
  if (paragraph) {
    return paragraph.replace(/\*\*/g, '').slice(0, 160);
  }
  return fallback;
}

export function getAllPages(): ContentPageMeta[] {
  return Object.entries(CONTENT_REGISTRY).map(([slug, entry]) => {
    const markdown = fs.readFileSync(path.join(knowledgeBaseDir, entry.file), 'utf-8');
    return {
      slug,
      pathname: entry.pathname,
      pillar: entry.pillar,
      title: extractTitle(markdown, slug),
      description: entry.description ?? extractDescription(markdown, slug),
    };
  });
}

export function getPage(slug: string): ContentDocument | null {
  const entry = CONTENT_REGISTRY[slug];
  if (!entry) return null;

  const markdown = fs.readFileSync(path.join(knowledgeBaseDir, entry.file), 'utf-8');
  const title = extractTitle(markdown, slug);

  return {
    slug,
    pathname: entry.pathname,
    pillar: entry.pillar,
    title,
    description: entry.description ?? extractDescription(markdown, title),
    markdown,
  };
}

export function getPageByPathname(pathname: string): ContentDocument | null {
  const slug = Object.entries(CONTENT_REGISTRY).find(([, e]) => e.pathname === pathname)?.[0];
  return slug ? getPage(slug) : null;
}

export type ResolvedCuratedArticle = {
  slug: string;
  title: string;
  description: string;
  pathname: string;
};

function resolveCuratedSlug(
  slug: string,
  useOrgKnowledgePaths: boolean | undefined,
): ResolvedCuratedArticle | null {
  if (useOrgKnowledgePaths) {
    const page = getOrgKnowledgePages().find((entry) => entry.slug === slug);
    if (!page) return null;
    return {
      slug: page.slug,
      title: page.title,
      description: page.description,
      pathname: page.pathname,
    };
  }

  const page = getAllPages().find((entry) => entry.slug === slug);
  if (!page) return null;
  return {
    slug: page.slug,
    title: page.title,
    description: page.description,
    pathname: page.pathname,
  };
}

export function resolveCuratedArticles(
  slugs: string[],
  useOrgKnowledgePaths?: boolean,
): ResolvedCuratedArticle[] {
  return slugs.flatMap((slug) => {
    const resolved = resolveCuratedSlug(slug, useOrgKnowledgePaths);
    return resolved ? [resolved] : [];
  });
}

type OrgKnowledgePathFlag = {
  useOrgKnowledgePaths?: boolean;
  useOrgLearnPaths?: boolean;
};

function shouldUseOrgKnowledgePaths(value: OrgKnowledgePathFlag): boolean {
  return Boolean(value.useOrgKnowledgePaths ?? value.useOrgLearnPaths);
}

export function getCuratedApiPayload(site: 'io' | 'org') {
  const feed = getCuratedHomeFeed(site);
  const resolveTopic = (topic: CuratedTopic) => {
    const useOrgKnowledgePaths = shouldUseOrgKnowledgePaths(topic);
    const anchor = topic.anchorSlug
      ? resolveCuratedSlug(topic.anchorSlug, useOrgKnowledgePaths)
      : null;
    const related = resolveCuratedArticles(topic.relatedSlugs ?? [], useOrgKnowledgePaths);
    return {
      id: topic.id,
      title: topic.title,
      summary: topic.summary,
      href: topic.externalHref ?? anchor?.pathname ?? null,
      anchor,
      related,
    };
  };

  return {
    ok: true as const,
    site: feed.site,
    updatedAt: feed.updatedAt,
    readerEntry: feed.readerEntry,
    readerPaths: feed.readerPaths.map((pathEntry) => ({
      ...pathEntry,
      articles: resolveCuratedArticles(
        pathEntry.articleSlugs ?? [],
        shouldUseOrgKnowledgePaths(pathEntry),
      ),
    })),
    spotlight: feed.spotlight.map((item) => ({
      ...item,
      article: resolveCuratedSlug(item.slug, shouldUseOrgKnowledgePaths(item)),
    })),
    topics: feed.topics.map(resolveTopic),
    secondaryLinks: feed.secondaryLinks,
  };
}

export {
  getCuratedHomeFeed,
  type CuratedHomeFeed,
  type CuratedHomeTile,
  type CuratedLayout,
  type CuratedReaderPath,
  type CuratedSpotlight,
  type CuratedTopic,
} from './curated';
