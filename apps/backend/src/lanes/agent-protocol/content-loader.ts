import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const moduleDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(moduleDir, '../../../../../');
const knowledgeBaseDir = path.join(repoRoot, 'knowledge-base');

const CONTENT_REGISTRY: Record<
  string,
  { file: string; pillar: string; pathname: string; description?: string }
> = {
  'what-is-ai-transformation': {
    file: 'what-is-ai-transformation.md',
    pillar: 'framework',
    pathname: '/frameworks/what-is-ai-transformation',
    description: 'Beyond deployment — operating model change for enterprise AI.',
  },
  'ai-transformation-vs-digital-transformation': {
    file: 'ai-transformation-vs-digital-transformation.md',
    pillar: 'framework',
    pathname: '/frameworks/vs-digital-transformation',
  },
  'transformation-roadmap': {
    file: 'transformation-roadmap.md',
    pillar: 'framework',
    pathname: '/frameworks/roadmap',
  },
  'governance-and-operating-model': {
    file: 'governance-and-operating-model.md',
    pillar: 'framework',
    pathname: '/frameworks/governance',
  },
  'measuring-ai-value': {
    file: 'measuring-ai-value.md',
    pillar: 'framework',
    pathname: '/frameworks/measuring-value',
  },
  'use-cases-by-industry': {
    file: 'use-cases-by-industry.md',
    pillar: 'resource',
    pathname: '/playbook/use-cases',
  },
  'ai-patterns-copilots-agents-automation': {
    file: 'ai-patterns-copilots-agents-automation.md',
    pillar: 'resource',
    pathname: '/playbook/patterns',
  },
  'common-pitfalls': {
    file: 'common-pitfalls.md',
    pillar: 'resource',
    pathname: '/playbook/common-pitfalls',
  },
  glossary: {
    file: 'glossary.md',
    pillar: 'resource',
    pathname: '/playbook/glossary',
  },
  faq: {
    file: 'faq.md',
    pillar: 'resource',
    pathname: '/playbook/faq',
  },
};

export const ORG_LEARN_SLUGS = [
  'what-is-ai-transformation',
  'transformation-roadmap',
  'common-pitfalls',
  'ai-patterns-copilots-agents-automation',
  'faq',
] as const;

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

export type ContentListEntry = {
  slug: string;
  title: string;
  description: string;
  pillar: string;
  pathname: string;
};

export type ContentDocument = ContentListEntry & {
  markdown: string;
};

export function listContent(site: 'io' | 'org'): ContentListEntry[] {
  const slugs = site === 'org' ? ORG_LEARN_SLUGS : (Object.keys(CONTENT_REGISTRY) as string[]);
  return slugs.flatMap((slug) => {
    const entry = CONTENT_REGISTRY[slug];
    if (!entry) return [];
    const markdown = fs.readFileSync(path.join(knowledgeBaseDir, entry.file), 'utf-8');
    const title = extractTitle(markdown, slug);
    const pathname = site === 'org' ? `/learn/${slug}` : entry.pathname;
    return [
      {
        slug,
        title,
        description: entry.description ?? extractDescription(markdown, title),
        pillar: entry.pillar,
        pathname,
      },
    ];
  });
}

export function getContent(slug: string, site: 'io' | 'org'): ContentDocument | null {
  if (site === 'org' && !(ORG_LEARN_SLUGS as readonly string[]).includes(slug)) {
    return null;
  }
  const entry = CONTENT_REGISTRY[slug];
  if (!entry) return null;

  const markdown = fs.readFileSync(path.join(knowledgeBaseDir, entry.file), 'utf-8');
  const title = extractTitle(markdown, slug);
  const pathname = site === 'org' ? `/learn/${slug}` : entry.pathname;

  return {
    slug,
    title,
    description: entry.description ?? extractDescription(markdown, title),
    pillar: entry.pillar,
    pathname,
    markdown,
  };
}
