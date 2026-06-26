import { z } from 'zod';
import * as wave12 from './wave12-objects';

/**
 * Editorial-review agent (Wave 19, L12). Written to a draft object's
 * `metadata.editorial_agent` by POST /api/internal/editorial/review-pending.
 * Never changes publish state — purely advisory.
 */
export const editorialAgentReviewSuccessSchema = z.object({
  score: z.number().int().min(0).max(100),
  flags: z.array(z.string()),
  summary: z.string(),
  reviewedAt: z.string(),
  model: z.string().optional(),
});
export type EditorialAgentReviewSuccess = z.infer<typeof editorialAgentReviewSuccessSchema>;

export const editorialAgentReviewSkipSchema = z.object({
  skipped: z.literal(true),
  reviewedAt: z.string(),
  reason: z.string().optional(),
});
export type EditorialAgentReviewSkip = z.infer<typeof editorialAgentReviewSkipSchema>;

export const editorialAgentReviewSchema = z.union([
  editorialAgentReviewSuccessSchema,
  editorialAgentReviewSkipSchema,
]);
export type EditorialAgentReview = z.infer<typeof editorialAgentReviewSchema>;

export const editorialReviewPendingRequestSchema = z.object({
  site: wave12.siteSchema.optional(),
  limit: z.number().int().min(1).max(500).optional(),
});
export type EditorialReviewPendingRequest = z.infer<typeof editorialReviewPendingRequestSchema>;

export const editorialReviewPendingResponseSchema = z.object({
  ok: z.literal(true),
  reviewed: z.number().int(),
  results: z.array(
    z.object({
      id: z.string(),
      editorial_agent: editorialAgentReviewSchema,
    }),
  ),
});
export type EditorialReviewPendingResponse = z.infer<typeof editorialReviewPendingResponseSchema>;

/**
 * Public agent content catalog (Wave 19, pillar 3). One entry per published,
 * public Wave 12 knowledge/community object from GET /api/v1/objects/catalog.
 */
export const objectCatalogEntrySchema = z.object({
  id: z.string(),
  slug: z.string().nullable(),
  title: z.string().nullable(),
  objectType: z.string(),
  type: z.string(),
  human_url: z.string(),
  api_url: z.string(),
  source: z.literal('wave12_object'),
});
export type ObjectCatalogEntry = z.infer<typeof objectCatalogEntrySchema>;

export const objectCatalogResponseSchema = z.object({
  ok: z.literal(true),
  site: wave12.siteSchema,
  origin: z.string(),
  count: z.number().int(),
  objects: z.array(objectCatalogEntrySchema),
});
export type ObjectCatalogResponse = z.infer<typeof objectCatalogResponseSchema>;
