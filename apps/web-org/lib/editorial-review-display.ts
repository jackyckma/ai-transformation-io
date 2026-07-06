import type { EditorialAgentReview, EditorialSubstanceDimensions } from '@ai-transformation/shared';
import {
  hasEditorialGatekeeperFlags,
  isEditorialGatekeeperFlag,
  resolveEditorialReviewProfile,
  substanceBandHintForProfile,
  substanceTierForProfile,
  type EditorialReviewBarLevel,
  type EditorialReviewProfile,
} from '@ai-transformation/shared';

export type ReviewScoreTier = 'strong' | 'caution' | 'weak';

export { resolveEditorialReviewProfile, type EditorialReviewProfile, type EditorialReviewBarLevel };
export { hasEditorialGatekeeperFlags, isEditorialGatekeeperFlag };

export const REVIEW_BAR_LEVEL_LABEL: Record<EditorialReviewBarLevel, string> = {
  light: 'Light bar',
  medium: 'Medium bar',
  high: 'High bar',
};

const REVIEW_BAR_BANNER_CLASS: Record<EditorialReviewBarLevel, string> = {
  light:
    'border-[var(--accent)]/35 bg-[var(--accent)]/8 dark:border-[var(--accent)]/40 dark:bg-[var(--accent)]/10',
  medium:
    'border-amber-700/30 bg-amber-50/90 dark:border-amber-500/35 dark:bg-amber-950/25',
  high: 'border-[var(--foreground)]/15 bg-[var(--card)] dark:border-[var(--border)]',
};

const REVIEW_BAR_LEVEL_PILL_CLASS: Record<EditorialReviewBarLevel, string> = {
  light:
    'border-[var(--accent)]/50 bg-[var(--accent)]/15 text-[var(--foreground)] dark:text-[var(--foreground)]',
  medium:
    'border-amber-700/35 bg-amber-100/80 text-amber-950 dark:border-amber-500/40 dark:bg-amber-950/40 dark:text-amber-100',
  high: 'border-[var(--foreground)]/20 bg-[var(--background)] text-[var(--foreground)]',
};

export function reviewBarBannerClass(level: EditorialReviewBarLevel): string {
  return REVIEW_BAR_BANNER_CLASS[level];
}

export function reviewBarLevelPillClass(level: EditorialReviewBarLevel): string {
  return REVIEW_BAR_LEVEL_PILL_CLASS[level];
}

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

const MARKETING_FLAGS = new Set(['vendor-marketing', 'product-pitch', 'promotional-copy']);

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

export function reviewHeadlineTier(
  review: Exclude<EditorialAgentReview, { skipped: true }>,
  profile?: EditorialReviewProfile,
): ReviewScoreTier {
  if (hasEditorialGatekeeperFlags(review.flags)) {
    return 'weak';
  }
  if (review.substance_score !== undefined && profile) {
    return substanceTierForProfile(review.substance_score, profile);
  }
  if (review.substance_score !== undefined) {
    return substanceScoreTier(review.substance_score);
  }
  return legacyScoreTier(review.score);
}

export function reviewHeadlineHint(
  review: Exclude<EditorialAgentReview, { skipped: true }>,
  profile: EditorialReviewProfile,
): string {
  if (hasEditorialGatekeeperFlags(review.flags)) {
    return 'Gatekeeper — reject vendor/marketing or broken copy';
  }
  const tier = reviewHeadlineTier(review, profile);
  return substanceBandHintForProfile(tier, profile);
}

export function isTechnicalFlag(flag: string): boolean {
  return TECHNICAL_FLAGS.has(flag) || MARKETING_FLAGS.has(flag) || isEditorialGatekeeperFlag(flag);
}

export function isMarketingFlag(flag: string): boolean {
  return MARKETING_FLAGS.has(flag);
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

/** Suggested editorial comment prefill from agent review (editable before approve/reject). */
export function formatAgentReviewComment(
  review: Exclude<EditorialAgentReview, { skipped: true }>,
): string {
  const lines = ['[Agent review — edit before approve/reject]', '', review.summary.trim()];
  const marketingFlags = review.flags.filter(isMarketingFlag);
  if (marketingFlags.length > 0) {
    lines.push('', `Gatekeeper (reject recommended): ${marketingFlags.join(', ')}`);
  }
  const otherFlags = review.flags.filter((flag) => !isMarketingFlag(flag));
  if (otherFlags.length > 0) {
    lines.push('', `Flags: ${otherFlags.join(', ')}`);
  }
  if (review.substance_score !== undefined) {
    lines.push(`Substance: ${review.substance_score}/15`);
  }
  if (review.review_profile) {
    lines.push(`Profile: ${review.review_profile}`);
  }
  return lines.join('\n');
}
