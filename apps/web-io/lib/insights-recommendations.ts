import {
  DEFAULT_RECOMMENDATION_WEIGHTS,
  scoreRecommendation,
  type AssessmentGapId,
  type OnboardingProfile,
  type RecommendationSignalName,
} from '@ai-transformation/shared';

import type { InsightCard } from '@/lib/insights-data';

export type InsightInputs = {
  profile: OnboardingProfile | null;
  weakestGap: AssessmentGapId | null;
};

export type RankedInsight = {
  card: InsightCard;
  score: number;
  /** Short, human-readable reasons surfaced as chips when personalized. */
  reasons: string[];
};

/**
 * Insights reorder reuses the shared §9/§10 signal contract restricted to the
 * two signals that apply to curated benchmarks: onboarding profile alignment
 * and the assessment's weakest gap. No bespoke shadow weights.
 */
type InsightSignal = Extract<
  RecommendationSignalName,
  'profileAlignment' | 'assessmentAlignment'
>;

const WEIGHTS: Record<InsightSignal, number> = {
  profileAlignment: DEFAULT_RECOMMENDATION_WEIGHTS.profileAlignment ?? 0.35,
  assessmentAlignment: DEFAULT_RECOMMENDATION_WEIGHTS.assessmentAlignment ?? 0.25,
};

const REASON_LABEL: Record<InsightSignal, string> = {
  profileAlignment: 'Matches your role',
  assessmentAlignment: 'Your weakest gap',
};

const STOPWORDS = new Set([
  'the',
  'and',
  'for',
  'with',
  'our',
  'your',
  'a',
  'an',
  'of',
  'to',
  'in',
  'on',
  'at',
  'is',
  'are',
  'my',
  'we',
  'i',
]);

function profileKeywords(profile: OnboardingProfile | null): string[] {
  if (!profile) return [];
  const raw = [profile.role, profile.industry, profile.projectFocus ?? '']
    .join(' ')
    .toLowerCase();
  const tokens = raw.match(/[a-z0-9]+/g) ?? [];
  return Array.from(new Set(tokens.filter((token) => token.length > 2 && !STOPWORDS.has(token))));
}

/** True when at least one personal signal is available to reorder by. */
export function canPersonalizeInsights({ profile, weakestGap }: InsightInputs): boolean {
  return Boolean(profile || weakestGap);
}

/**
 * Rule-based Insights reorder (§10). Stable: cards keep curated order when no
 * personal signal applies, so logged-out and signal-free callers get the
 * static curated list unchanged.
 */
export function rankInsights(cards: InsightCard[], inputs: InsightInputs): RankedInsight[] {
  const keywords = profileKeywords(inputs.profile);

  return cards
    .map((card, index) => {
      const haystack = `${card.title} ${card.summary} ${card.source} ${card.interpretation}`.toLowerCase();
      const matches = keywords.filter((keyword) => haystack.includes(keyword)).length;
      const signals: Record<InsightSignal, number> = {
        profileAlignment: keywords.length
          ? Math.min(1, matches / Math.min(keywords.length, 3))
          : 0,
        assessmentAlignment:
          inputs.weakestGap && card.gaps.includes(inputs.weakestGap) ? 1 : 0,
      };

      const { score } = scoreRecommendation<InsightSignal>(signals, WEIGHTS);
      const reasons = (Object.keys(REASON_LABEL) as InsightSignal[])
        .filter((signal) => signals[signal] > 0)
        .map((signal) => REASON_LABEL[signal]);
      return { card, score, reasons, index };
    })
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map(({ card, score, reasons }) => ({ card, score, reasons }));
}
