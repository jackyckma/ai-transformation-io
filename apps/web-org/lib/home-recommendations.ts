import { getKnowledgeIndex } from '@/lib/knowledge-index';
import { COMMUNITY_HIGHLIGHTS, COMMUNITY_TYPE_META } from '@/lib/community-highlights';
import type { RecommendationCandidate } from '@/lib/recommendation-types';

export type { ActivitySignal, RecommendationCandidate } from '@/lib/recommendation-types';
export { ACTIVITY_WEIGHTS } from '@/lib/recommendation-types';

function pseudoSignal(seed: string, salt: number): number {
  let hash = salt;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 1000;
  }
  return Math.round((hash / 1000) * 100) / 100;
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
      signals: {
        followedTopic: pseudoSignal(item.slug, 7),
        contributions: pseudoSignal(item.slug, 13),
        interactions: pseudoSignal(item.slug, 19),
      },
    })),
  );

  const community = COMMUNITY_HIGHLIGHTS.map((item) => ({
    id: `cm-${item.id}`,
    kind: 'community' as const,
    badge: COMMUNITY_TYPE_META[item.type].label,
    title: item.title,
    description: item.summary,
    href: '/community',
    signals: {
      followedTopic: pseudoSignal(item.id, 5),
      contributions: pseudoSignal(item.id, 11),
      interactions: pseudoSignal(item.id, 17),
    },
  }));

  return [...knowledge, ...community];
}
