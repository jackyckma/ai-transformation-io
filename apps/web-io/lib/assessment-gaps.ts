import type { AssessmentGapId } from '@ai-transformation/shared';

/**
 * Library slugs associated with each Three Gaps dimension. Used by the §9
 * recommendation scorer to boost articles matching a completed assessment's
 * weakest gap. Keep aligned with the weakest-gap CTAs in the assessment wizard
 * and progress dashboard.
 */
export const WEAKEST_GAP_SLUGS: Record<AssessmentGapId, string[]> = {
  work_redesign: ['transformation-roadmap', 'ai-patterns-copilots-agents-automation'],
  governance: ['governance-and-operating-model', 'common-pitfalls'],
  value_measurement: ['measuring-ai-value', 'transformation-roadmap'],
};
