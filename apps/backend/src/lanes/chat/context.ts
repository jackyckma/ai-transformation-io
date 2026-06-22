import { getContent, listContent, type ContentListEntry } from '../agent-protocol/content-loader.js';

const STOP_WORDS = new Set([
  'a',
  'an',
  'the',
  'and',
  'or',
  'for',
  'to',
  'of',
  'in',
  'on',
  'is',
  'are',
  'what',
  'how',
  'why',
  'when',
  'where',
  'can',
  'do',
  'does',
  'about',
  'with',
  'from',
  'our',
  'your',
  'i',
  'we',
  'my',
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token));
}

function scoreEntry(queryTokens: string[], entry: ContentListEntry): number {
  const haystack = `${entry.title} ${entry.description} ${entry.slug}`.toLowerCase();
  let score = 0;
  for (const token of queryTokens) {
    if (haystack.includes(token)) {
      score += token.length > 5 ? 3 : 2;
    }
  }
  return score;
}

export function selectRelevantContent(site: 'io' | 'org', query: string, limit = 3): ContentListEntry[] {
  const queryTokens = tokenize(query);
  const entries = listContent(site);
  if (queryTokens.length === 0) {
    return entries.slice(0, limit);
  }

  return entries
    .map((entry) => ({ entry, score: scoreEntry(queryTokens, entry) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.entry);
}

export function buildContextSnippets(site: 'io' | 'org', query: string): {
  snippets: string[];
  links: Array<{ label: string; href: string }>;
} {
  const relevant = selectRelevantContent(site, query, 3);
  const links = relevant.map((entry) => ({
    label: entry.title,
    href: entry.pathname,
  }));

  const snippets = relevant.map((entry) => {
    const doc = getContent(entry.slug, site);
    if (!doc) {
      return `Title: ${entry.title}\nSummary: ${entry.description}`;
    }
    const trimmed = doc.markdown
      .replace(/^#.+$/m, '')
      .replace(/^>\s.+$/gm, '')
      .replace(/\*\*/g, '')
      .trim()
      .slice(0, 1800);
    return `Title: ${entry.title}\nPath: ${entry.pathname}\n${trimmed}`;
  });

  return { snippets, links };
}

export function buildFallbackReply(site: 'io' | 'org', query: string): {
  content: string;
  links: Array<{ label: string; href: string }>;
} {
  const { links } = buildContextSnippets(site, query);
  const siteLabel = site === 'org' ? 'Harvest Hub' : 'AI Transformation';

  if (links.length === 0) {
    return {
      content:
        site === 'org'
          ? 'I can point you to learn guides and community paths once you share a bit more about your question. Try asking about governance, workflow redesign, or sharing a field story.'
          : 'I can point you to frameworks and role guides once you share a bit more about your question. Try governance, workflow redesign, or measuring value.',
      links:
        site === 'org'
          ? [{ label: 'Learn guides', href: '/learn' }]
          : [
              { label: 'Frameworks', href: '/frameworks' },
              { label: 'Role guides', href: '/functions' },
            ],
    };
  }

  return {
    content: `Here are ${siteLabel} pages that look relevant to your question. I am still warming up — read these for depth, or ask a follow-up with more context.`,
    links,
  };
}
