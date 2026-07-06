/**
 * Editorial review profiles — type-specific bars for L12 `/editorial` + agent review.
 * Human approve/reject stays authoritative; profiles guide founder + LLM expectations.
 */

export type EditorialReviewProfileId =
  | 'knowledge_article'
  | 'knowledge_field_note'
  | 'knowledge_derived'
  | 'community_discussion'
  | 'community_help'
  | 'community_announcement'
  | 'community_default';

/** Reject-worthy on any submission type — vendor/marketing + hard technical failures. */
export const EDITORIAL_GATEKEEPER_FLAGS = [
  'vendor-marketing',
  'product-pitch',
  'promotional-copy',
  'ai-artifact',
  'inconsistent',
] as const;

export type EditorialGatekeeperFlag = (typeof EDITORIAL_GATEKEEPER_FLAGS)[number];

export type EditorialReviewProfile = {
  id: EditorialReviewProfileId;
  label: string;
  /** One line on the editorial queue card. */
  barSummary: string;
  /** Founder-facing guidance (English UI). */
  founderNote: string;
  /** Extra LLM instructions appended to the system prompt. */
  agentPromptSection: string;
  /** substance_score ≥ this → strong tier for this profile. */
  strongSubstanceMin: number;
  /** substance_score ≥ this → caution tier (below strong). */
  cautionSubstanceMin: number;
};

const PROFILES: Record<EditorialReviewProfileId, EditorialReviewProfile> = {
  knowledge_article: {
    id: 'knowledge_article',
    label: 'Knowledge article',
    barSummary: 'High bar — substance, specificity, and stance expected.',
    founderNote:
      'Full knowledge piece. Expect verifiable claims, mechanism or examples, and a debatable or first-hand angle. Reject vendor marketing or scraped brochure copy.',
    agentPromptSection: [
      'Profile: KNOWLEDGE ARTICLE (high bar).',
      'Apply the full substance rubric. Short generic summaries are not enough.',
      'falsifiable_stance and first_hand matter — flag consensus-only or no-first-hand when weak.',
    ].join('\n'),
    strongSubstanceMin: 10,
    cautionSubstanceMin: 6,
  },
  knowledge_field_note: {
    id: 'knowledge_field_note',
    label: 'Field note',
    barSummary: 'Medium bar — short first-hand observation OK.',
    founderNote:
      'Brief capture from the field. A tight observation or lesson is fine; still reject marketing copy. Do not demand essay-length stance.',
    agentPromptSection: [
      'Profile: FIELD NOTE (medium bar).',
      'Short form is OK. Score falsifiable_stance and first_hand leniently if the note is concrete and useful.',
      'Still flag padding and zero-information sentences.',
    ].join('\n'),
    strongSubstanceMin: 8,
    cautionSubstanceMin: 5,
  },
  knowledge_derived: {
    id: 'knowledge_derived',
    label: 'Derived article',
    barSummary: 'Medium-high bar — distill a thread into a readable piece.',
    founderNote:
      'Distilled from community discussion. Needs coherent narrative; may be lighter on first-hand if the source thread carried the insight.',
    agentPromptSection: [
      'Profile: DERIVED ARTICLE (medium-high bar).',
      'Expect coherent synthesis, not a raw thread dump. first_hand may be 2 if sourced from discussion.',
    ].join('\n'),
    strongSubstanceMin: 9,
    cautionSubstanceMin: 6,
  },
  community_discussion: {
    id: 'community_discussion',
    label: 'Community discussion',
    barSummary: 'Light bar — genuine question or observation; agent can clear most.',
    founderNote:
      'Discussion post. A short question, experience share, or prompt is fine — no long-form stance required. Reject vendor/product marketing. Spot-check only if agent flagged gatekeepers.',
    agentPromptSection: [
      'Profile: COMMUNITY DISCUSSION (light bar).',
      'Do NOT apply knowledge-article standards. A clear question, honest observation, or invite to compare approaches is publishable.',
      'Score falsifiable_stance and first_hand at 2 when adequate for a discussion; only flag no-first-hand if entirely generic.',
      'If readable, on-topic, and no gatekeeper flags, substance_score 7–11 is typical for acceptable posts.',
    ].join('\n'),
    strongSubstanceMin: 7,
    cautionSubstanceMin: 5,
  },
  community_help: {
    id: 'community_help',
    label: 'Help request',
    barSummary: 'Light bar — problem context clear; no essay stance.',
    founderNote:
      'Help request. Needs enough context to be actionable. Marketing pitches disguised as questions should be rejected.',
    agentPromptSection: [
      'Profile: HELP REQUEST (light bar).',
      'Focus on whether the problem/context is understandable. Stance and claim density are secondary.',
    ].join('\n'),
    strongSubstanceMin: 6,
    cautionSubstanceMin: 4,
  },
  community_announcement: {
    id: 'community_announcement',
    label: 'Announcement',
    barSummary: 'Factual bar — who/what/when; no vendor brochure.',
    founderNote:
      'Community announcement. Should be factual (what, when, who it is for). Reject product marketing dressed as announcements.',
    agentPromptSection: [
      'Profile: ANNOUNCEMENT (factual bar).',
      'Check clarity and factual content. Brochure tone or product feature lists → promotional-copy / vendor-marketing.',
    ].join('\n'),
    strongSubstanceMin: 6,
    cautionSubstanceMin: 4,
  },
  community_default: {
    id: 'community_default',
    label: 'Community post',
    barSummary: 'Light-medium bar — community-appropriate, not essay depth.',
    founderNote:
      'Other community type (e.g. event). Factual clarity over argumentative depth. Reject vendor marketing.',
    agentPromptSection: [
      'Profile: COMMUNITY (default light-medium bar).',
      'Do not require knowledge-article depth. Flag marketing and ai-artifacts.',
    ].join('\n'),
    strongSubstanceMin: 7,
    cautionSubstanceMin: 5,
  },
};

export function resolveEditorialReviewProfile(
  objectType: string,
  type: string,
): EditorialReviewProfile {
  if (objectType === 'knowledge') {
    if (type === 'field_note') {
      return PROFILES.knowledge_field_note;
    }
    if (type === 'derived_article') {
      return PROFILES.knowledge_derived;
    }
    return PROFILES.knowledge_article;
  }

  if (objectType === 'community') {
    if (type === 'discussion') {
      return PROFILES.community_discussion;
    }
    if (type === 'help_request') {
      return PROFILES.community_help;
    }
    if (type === 'community_announcement') {
      return PROFILES.community_announcement;
    }
    return PROFILES.community_default;
  }

  return PROFILES.knowledge_article;
}

export function isEditorialGatekeeperFlag(flag: string): flag is EditorialGatekeeperFlag {
  return (EDITORIAL_GATEKEEPER_FLAGS as readonly string[]).includes(flag);
}

export function hasEditorialGatekeeperFlags(flags: string[]): boolean {
  return flags.some(isEditorialGatekeeperFlag);
}

export function substanceTierForProfile(
  substanceScore: number,
  profile: EditorialReviewProfile,
): 'strong' | 'caution' | 'weak' {
  if (substanceScore >= profile.strongSubstanceMin) {
    return 'strong';
  }
  if (substanceScore >= profile.cautionSubstanceMin) {
    return 'caution';
  }
  return 'weak';
}

export function substanceBandHintForProfile(
  tier: 'strong' | 'caution' | 'weak',
  profile: EditorialReviewProfile,
): string {
  if (tier === 'strong') {
    if (profile.id === 'community_discussion' || profile.id === 'community_help') {
      return 'Meets discussion bar — quick founder spot-check';
    }
    return 'Meets this type’s bar — spot-check summary';
  }
  if (tier === 'caution') {
    return 'Borderline for this type — read before approve';
  }
  return 'Below this type’s bar — likely reject or rewrite';
}
