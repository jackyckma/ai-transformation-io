import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import 'server-only';

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
  'transformation-roadmap': {
    file: 'transformation-roadmap.md',
    pillar: 'framework',
    pathname: '/frameworks/roadmap',
    description: 'Seven stages from business alignment to governed scaling.',
  },
  'what-is-ai-transformation': {
    file: 'what-is-ai-transformation.md',
    pillar: 'framework',
    pathname: '/frameworks/what-is-ai-transformation',
    description: 'Beyond deployment — operating model change for enterprise AI.',
  },
  'governance-and-operating-model': {
    file: 'governance-and-operating-model.md',
    pillar: 'framework',
    pathname: '/frameworks/governance',
    description: 'Autonomy boundaries, accountability, and operating model design.',
  },
};

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
