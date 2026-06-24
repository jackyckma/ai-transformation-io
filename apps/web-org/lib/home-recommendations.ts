import { getKnowledgeIndex } from '@/lib/knowledge-index';
import { COMMUNITY_HIGHLIGHTS, COMMUNITY_TYPE_META } from '@/lib/community-highlights';
import type { RecommendationCandidate } from '@/lib/recommendation-types';

export type { ActivitySignal, RecommendationCandidate } from '@/lib/recommendation-types';
export { ACTIVITY_WEIGHTS, activitySignalsFor } from '@/lib/recommendation-types';

const STOP_WORDS = new Set([
  'the',
  'and',
  'for',
  'with',
  'you',
  'your',
  'are',
  'how',
  'what',
  'this',
  'that',
  'from',
  'into',
  'when',
  'our',
  'about',
]);

/** Derive lowercased match terms from a label plus the meaningful words in a title. */
function keywordsFrom(label: string, title: string): string[] {
  const words = title
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 3 && !STOP_WORDS.has(word));
  return Array.from(new Set([label.toLowerCase(), ...words]));
}

/** Build a deterministic candidate set from current knowledge + community content. */
export function buildRecommendationCandidates(): RecommendationCandidate[] {
  const knowledge = getKnowledgeIndex().categories.flatMap((category) =>
    category.items.map((item) => ({
      id: `kb-${item.slug}`,
      kind: 'knowledge' as const,
      badge: 'Knowledge',
      title: item.title,
      description: item.description,
      href: item.href,
      keywords: keywordsFrom(category.title, item.title),
    })),
  );

  const community = COMMUNITY_HIGHLIGHTS.map((item) => ({
    id: `cm-${item.id}`,
    kind: 'community' as const,
    badge: COMMUNITY_TYPE_META[item.type].label,
    title: item.title,
    description: item.summary,
    href: '/community',
    keywords: keywordsFrom(COMMUNITY_TYPE_META[item.type].label, item.title),
  }));

  return [...knowledge, ...community];
}
