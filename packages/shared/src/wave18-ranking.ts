import { z } from 'zod';

import { siteSchema } from './wave12-objects';

export const rankSuggestionCandidateSchema = z.object({
  id: z.string().trim().min(1).max(200),
  title: z.string().trim().min(1).max(300),
  summary: z.string().trim().max(2000).optional(),
  kind: z.string().trim().max(120).optional(),
});
export type RankSuggestionCandidate = z.infer<typeof rankSuggestionCandidateSchema>;

export const rankSuggestionContextSchema = z
  .object({
    followedTopics: z.array(z.string().trim().min(1).max(120)).max(50).optional(),
    profileSummary: z.string().trim().max(2000).optional(),
    recentInterests: z.array(z.string().trim().min(1).max(120)).max(50).optional(),
  })
  .catchall(z.unknown());
export type RankSuggestionContext = z.infer<typeof rankSuggestionContextSchema>;

export const rankSuggestionsRequestSchema = z.object({
  site: siteSchema,
  candidates: z.array(rankSuggestionCandidateSchema).min(1).max(50),
  context: rankSuggestionContextSchema.optional(),
  useLlmRerank: z.boolean().optional(),
  limit: z.number().int().min(1).max(50).optional(),
});
export type RankSuggestionsRequest = z.infer<typeof rankSuggestionsRequestSchema>;

export const rankedSuggestionSchema = z.object({
  id: z.string().trim().min(1).max(200),
  reason: z.string().trim().min(1).max(400),
});
export type RankedSuggestion = z.infer<typeof rankedSuggestionSchema>;

export const rankSuggestionsResponseSchema = z.object({
  experimental: z.literal(true),
  site: siteSchema,
  generatedAt: z.string(),
  llmAssisted: z.boolean(),
  rerankModel: z.string().trim().min(1).max(120).optional(),
  ranked: z.array(rankedSuggestionSchema),
});
export type RankSuggestionsResponse = z.infer<typeof rankSuggestionsResponseSchema>;
