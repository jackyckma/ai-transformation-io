export type ActivitySignal = 'followedTopic' | 'contributions' | 'interactions';

export type RecommendationCandidate = {
  id: string;
  kind: 'knowledge' | 'community';
  badge: string;
  title: string;
  description: string;
  href: string;
  signals: Record<ActivitySignal, number>;
};

/** v0 weights — .org Home emphasizes followed topics, contributions, and interactions (§9). */
export const ACTIVITY_WEIGHTS: Record<ActivitySignal, number> = {
  followedTopic: 0.45,
  contributions: 0.3,
  interactions: 0.25,
};
