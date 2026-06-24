import {
  DEFAULT_RECOMMENDATION_WEIGHTS,
  scoreRecommendation,
  type OnboardingProfile,
  type RecommendationSignalName,
} from '@ai-transformation/shared';
import type { ContentPageMeta } from '@ai-transformation/content';

export type RecommendationInputs = {
  profile: OnboardingProfile | null;
  /** Slugs editorially boosted on the home feed (spotlight + topics). */
  curatedSlugs: string[];
  /** Pillars of recently-viewed articles, newest first. */
  recentPillars: string[];
  /** Library slugs tied to the completed assessment's weakest gap (§9 input 2). */
  weakestGapSlugs?: string[];
  /** Pillars of the user's bookmarked library articles (§9 input 3, members-only). */
  bookmarkedPillars?: string[];
};

export type RankedArticle = {
  page: ContentPageMeta;
  score: number;
  /** Short, human-readable reasons for the ranking (§9), newest signal first. */
  reasons: string[];
};

/** Reuses the shared §9 signal contract — no bespoke shadow scoring. */
const WEIGHTS: Record<RecommendationSignalName, number> = {
  profileAlignment: DEFAULT_RECOMMENDATION_WEIGHTS.profileAlignment ?? 0.35,
  assessmentAlignment: DEFAULT_RECOMMENDATION_WEIGHTS.assessmentAlignment ?? 0.25,
  recentlyViewedAffinity: DEFAULT_RECOMMENDATION_WEIGHTS.recentlyViewedAffinity ?? 0.15,
  bookmarkAffinity: DEFAULT_RECOMMENDATION_WEIGHTS.bookmarkAffinity ?? 0.15,
  curatedSpotlightBoost: DEFAULT_RECOMMENDATION_WEIGHTS.curatedSpotlightBoost ?? 0.1,
};

const REASON_LABEL: Record<RecommendationSignalName, string> = {
  profileAlignment: 'Matches your role',
  assessmentAlignment: 'Your weakest gap',
  recentlyViewedAffinity: 'Continues your reading',
  bookmarkAffinity: 'Like what you saved',
  curatedSpotlightBoost: "Editor's pick",
};

const REASON_ORDER: RecommendationSignalName[] = [
  'bookmarkAffinity',
  'assessmentAlignment',
  'profileAlignment',
  'recentlyViewedAffinity',
  'curatedSpotlightBoost',
];

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

/** Recency- or frequency-weighted pillar affinity, normalized to [0, 1]. */
function pillarAffinity(pillars: string[], decay: boolean): Map<string, number> {
  const byPillar = new Map<string, number>();
  pillars.forEach((pillar, index) => {
    const weight = decay ? 1 / (index + 1) : 1;
    byPillar.set(pillar, (byPillar.get(pillar) ?? 0) + weight);
  });
  const max = Math.max(0, ...byPillar.values());
  if (max <= 0) return byPillar;
  for (const [pillar, value] of byPillar) {
    byPillar.set(pillar, value / max);
  }
  return byPillar;
}

/**
 * Phase 1 rule-based recommendation engine (§9). Pure + deterministic so it
 * runs identically on server and client. Falls back to curated boost when no
 * profile or history is available. Logged-out callers simply pass no profile,
 * history, or bookmarks, leaving curated order intact.
 */
export function rankArticles(
  pages: ContentPageMeta[],
  {
    profile,
    curatedSlugs,
    recentPillars,
    weakestGapSlugs = [],
    bookmarkedPillars = [],
  }: RecommendationInputs,
): RankedArticle[] {
  const keywords = profileKeywords(profile);
  const curated = new Set(curatedSlugs);
  const gapSlugs = new Set(weakestGapSlugs);
  const recentByPillar = pillarAffinity(recentPillars, true);
  const bookmarkByPillar = pillarAffinity(bookmarkedPillars, false);

  return pages
    .map((page) => {
      const haystack = `${page.title} ${page.description} ${page.pillar}`.toLowerCase();
      const matches = keywords.filter((keyword) => haystack.includes(keyword)).length;
      const signals: Record<RecommendationSignalName, number> = {
        profileAlignment: keywords.length
          ? Math.min(1, matches / Math.min(keywords.length, 3))
          : 0,
        assessmentAlignment: gapSlugs.has(page.slug) ? 1 : 0,
        recentlyViewedAffinity: recentByPillar.get(page.pillar) ?? 0,
        bookmarkAffinity: bookmarkByPillar.get(page.pillar) ?? 0,
        curatedSpotlightBoost: curated.has(page.slug) ? 1 : 0,
      };

      const { score } = scoreRecommendation<RecommendationSignalName>(signals, WEIGHTS);
      const reasons = REASON_ORDER.filter((signal) => signals[signal] > 0).map(
        (signal) => REASON_LABEL[signal],
      );
      return { page, score, reasons };
    })
    .sort((a, b) => b.score - a.score || a.page.title.localeCompare(b.page.title));
}
