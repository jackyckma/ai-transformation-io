export const recommendationSignalNames = [
  'profileAlignment',
  'assessmentAlignment',
  'recentlyViewedAffinity',
  'bookmarkAffinity',
  'curatedSpotlightBoost',
] as const;

export type RecommendationSignalName = (typeof recommendationSignalNames)[number];

export const DEFAULT_RECOMMENDATION_WEIGHTS: RecommendationWeights<RecommendationSignalName> = {
  profileAlignment: 0.35,
  assessmentAlignment: 0.25,
  recentlyViewedAffinity: 0.15,
  bookmarkAffinity: 0.15,
  curatedSpotlightBoost: 0.1,
};

export type RecommendationSignals<TSignal extends string = RecommendationSignalName> = Partial<
  Record<TSignal, number | null | undefined>
>;

export type RecommendationWeights<TSignal extends string = RecommendationSignalName> = Partial<
  Record<TSignal, number>
>;

export type RecommendationScoreResult<TSignal extends string = string> = {
  score: number;
  weightedSum: number;
  totalWeight: number;
  matchedSignals: TSignal[];
};

export function scoreRecommendation<TSignal extends string>(
  signals: RecommendationSignals<TSignal>,
  weights: RecommendationWeights<TSignal>,
): RecommendationScoreResult<TSignal> {
  let weightedSum = 0;
  let totalWeight = 0;
  const matchedSignals: TSignal[] = [];

  for (const [key, rawWeight] of Object.entries(weights) as Array<[TSignal, number | undefined]>) {
    if (typeof rawWeight !== 'number' || !Number.isFinite(rawWeight) || rawWeight <= 0) {
      continue;
    }

    const signalValue = signals[key];
    if (typeof signalValue !== 'number' || !Number.isFinite(signalValue)) {
      continue;
    }

    weightedSum += signalValue * rawWeight;
    totalWeight += rawWeight;
    matchedSignals.push(key);
  }

  return {
    score: totalWeight > 0 ? weightedSum / totalWeight : 0,
    weightedSum,
    totalWeight,
    matchedSignals,
  };
}
