import type { ActivitySummary } from '@ai-transformation/shared';

export type ActivitySignal = 'followedTopic' | 'contributions' | 'interactions';

export type RecommendationCandidate = {
  id: string;
  kind: 'knowledge' | 'community';
  badge: string;
  title: string;
  description: string;
  href: string;
  /** Lowercased terms used to match a candidate against the member's followed topics. */
  keywords: string[];
};

/** v0 weights — .org Home emphasizes followed topics, contributions, and interactions (§9). */
export const ACTIVITY_WEIGHTS: Record<ActivitySignal, number> = {
  followedTopic: 0.45,
  contributions: 0.3,
  interactions: 0.25,
};

/** Saturating 0..1 map so each extra unit of activity adds less weight. */
function saturate(count: number): number {
  if (count <= 0) {
    return 0;
  }
  return count / (count + 3);
}

/**
 * Share of the member's follow-weight that aligns with a candidate's keywords.
 * Matches are substring either way so "agents" follows "agent operating models".
 */
function followedTopicOverlap(
  keywords: string[],
  followedTopics: ActivitySummary['followedTopics'],
): number {
  if (followedTopics.length === 0 || keywords.length === 0) {
    return 0;
  }
  let total = 0;
  let matched = 0;
  for (const followed of followedTopics) {
    const weight = Math.max(followed.count, 1);
    total += weight;
    const topic = followed.topic.toLowerCase();
    const hit = keywords.some((keyword) => keyword.includes(topic) || topic.includes(keyword));
    if (hit) {
      matched += weight;
    }
  }
  return total > 0 ? Math.min(1, matched / total) : 0;
}

/**
 * Maps a real activity summary onto the three .org Home signals for one candidate.
 * Knowledge items lean on contribution activity, community items on interaction
 * activity, and both are refined by followed-topic overlap. Returns zeros when no
 * summary is available so a new member falls back to stable candidate order.
 */
export function activitySignalsFor(
  candidate: RecommendationCandidate,
  summary: ActivitySummary | null,
): Record<ActivitySignal, number> {
  if (!summary) {
    return { followedTopic: 0, contributions: 0, interactions: 0 };
  }
  return {
    followedTopic: followedTopicOverlap(candidate.keywords, summary.followedTopics),
    contributions: candidate.kind === 'knowledge' ? saturate(summary.contributionsCount) : 0,
    interactions: candidate.kind === 'community' ? saturate(summary.interactionsCount) : 0,
  };
}
