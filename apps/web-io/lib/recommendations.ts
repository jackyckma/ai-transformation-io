import { scoreRecommendation, type OnboardingProfile } from '@ai-transformation/shared';
import type { ContentPageMeta } from '@ai-transformation/content';

export type RecommendationInputs = {
  profile: OnboardingProfile | null;
  /** Slugs editorially boosted on the home feed (spotlight + topics). */
  curatedSlugs: string[];
  /** Pillars of recently-viewed articles, newest first. */
  recentPillars: string[];
};

export type RankedArticle = {
  page: ContentPageMeta;
  score: number;
};

type Signal = 'keywordMatch' | 'curatedBoost' | 'affinity';

const WEIGHTS: Record<Signal, number> = {
  keywordMatch: 0.45,
  curatedBoost: 0.25,
  affinity: 0.3,
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

/**
 * Phase 1 rule-based recommendation engine (§9). Pure + deterministic so it
 * runs identically on server and client. Falls back to curated boost when no
 * profile or history is available.
 */
export function rankArticles(
  pages: ContentPageMeta[],
  { profile, curatedSlugs, recentPillars }: RecommendationInputs,
): RankedArticle[] {
  const keywords = profileKeywords(profile);
  const curated = new Set(curatedSlugs);

  const affinityByPillar = new Map<string, number>();
  recentPillars.forEach((pillar, index) => {
    const recencyWeight = 1 / (index + 1);
    affinityByPillar.set(pillar, (affinityByPillar.get(pillar) ?? 0) + recencyWeight);
  });
  const maxAffinity = Math.max(0, ...affinityByPillar.values());

  return pages
    .map((page) => {
      const haystack = `${page.title} ${page.description} ${page.pillar}`.toLowerCase();
      const matches = keywords.filter((keyword) => haystack.includes(keyword)).length;
      const keywordMatch = keywords.length ? Math.min(1, matches / Math.min(keywords.length, 3)) : 0;
      const curatedBoost = curated.has(page.slug) ? 1 : 0;
      const affinity =
        maxAffinity > 0 ? (affinityByPillar.get(page.pillar) ?? 0) / maxAffinity : 0;

      const { score } = scoreRecommendation<Signal>(
        { keywordMatch, curatedBoost, affinity },
        WEIGHTS,
      );
      return { page, score };
    })
    .sort((a, b) => b.score - a.score || a.page.title.localeCompare(b.page.title));
}
