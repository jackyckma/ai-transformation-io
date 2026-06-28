import type { EditorialAgentReview, EditorialSubstanceDimensions } from '@ai-transformation/shared';

export type ReviewScoreTier = 'strong' | 'caution' | 'weak';

export const SUBSTANCE_DIMENSION_ORDER: Array<keyof EditorialSubstanceDimensions> = [
  'claim_density',
  'specificity',
  'argument_coherence',
  'falsifiable_stance',
  'first_hand',
];

export const DIMENSION_LABEL: Record<keyof EditorialSubstanceDimensions, string> = {
  claim_density: 'Claim density',
  specificity: 'Specificity',
  argument_coherence: 'Coherence',
  falsifiable_stance: 'Falsifiable stance',
  first_hand: 'First-hand',
};

const TECHNICAL_FLAGS = new Set(['ai-artifact', 'inconsistent', 'logic-gap']);

/** Substance total bands from docs/EDITORIAL_REVIEW_RUBRIC.md */
export function substanceScoreTier(substanceScore: number): ReviewScoreTier {
  if (substanceScore >= 10) {
    return 'strong';
  }
  if (substanceScore >= 6) {
    return 'caution';
  }
  return 'weak';
}

/** Legacy queue score when substance_score is absent. */
export function legacyScoreTier(score: number): ReviewScoreTier {
  if (score >= 67) {
    return 'strong';
  }
  if (score >= 40) {
    return 'caution';
  }
  return 'weak';
}

export function dimensionTier(value: number): ReviewScoreTier {
  if (value >= 3) {
    return 'strong';
  }
  if (value >= 2) {
    return 'caution';
  }
  return 'weak';
}

export function reviewHeadlineTier(review: Exclude<EditorialAgentReview, { skipped: true }>): ReviewScoreTier {
  if (review.substance_score !== undefined) {
    return substanceScoreTier(review.substance_score);
  }
  return legacyScoreTier(review.score);
}

export function isTechnicalFlag(flag: string): boolean {
  return TECHNICAL_FLAGS.has(flag);
}

const TIER_PILL_CLASS: Record<ReviewScoreTier, string> = {
  strong:
    'border-emerald-700/25 bg-emerald-50 text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-950/25 dark:text-emerald-100',
  caution:
    'border-amber-700/25 bg-amber-50 text-amber-950 dark:border-amber-500/30 dark:bg-amber-950/25 dark:text-amber-100',
  weak: 'border-red-600/30 bg-red-50 text-red-800 dark:border-red-500/35 dark:bg-red-950/30 dark:text-red-100',
};

const TIER_TEXT_CLASS: Record<ReviewScoreTier, string> = {
  strong: 'text-emerald-800 dark:text-emerald-200',
  caution: 'text-amber-900 dark:text-amber-200',
  weak: 'text-red-700 dark:text-red-200',
};

const TIER_CARD_BORDER_CLASS: Record<ReviewScoreTier, string> = {
  strong: 'border-[var(--border)]',
  caution: 'border-amber-600/35 dark:border-amber-500/35',
  weak: 'border-red-600/40 dark:border-red-500/40',
};

export function tierPillClass(tier: ReviewScoreTier): string {
  return TIER_PILL_CLASS[tier];
}

export function tierTextClass(tier: ReviewScoreTier): string {
  return TIER_TEXT_CLASS[tier];
}

export function tierCardBorderClass(tier: ReviewScoreTier): string {
  return TIER_CARD_BORDER_CLASS[tier];
}

export function substanceBandHint(tier: ReviewScoreTier): string {
  if (tier === 'strong') {
    return 'Likely OK to publish — spot-check summary';
  }
  if (tier === 'caution') {
    return 'Review recommended — may need enrichment';
  }
  return 'Needs close read — likely rewrite or heavy edit';
}
