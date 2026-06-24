import { z } from 'zod';

import * as wave12 from './wave12-objects';
import { isCommunityPhase2ReservedType } from './wave13-community';

const communityTypeTagSchema = z.array(z.string().trim().min(1).max(60)).max(20).optional();
const communityTypeListSchema = z.array(z.string().trim().min(1).max(120)).max(20).optional();
const communityObjectIdSchema = z.string().trim().min(1).max(120);

export const questionTypeFieldsSchema = z.object({
  questionBody: z.string().trim().min(1).max(12000).optional(),
  tags: communityTypeTagSchema,
});
export type QuestionTypeFields = z.infer<typeof questionTypeFieldsSchema>;

export const mentorshipRequestTypeFieldsSchema = z.object({
  focusArea: z.string().trim().min(1).max(240).optional(),
  seniority: z.string().trim().min(1).max(120).optional(),
  commitment: z.string().trim().min(1).max(240).optional(),
  tags: communityTypeTagSchema,
});
export type MentorshipRequestTypeFields = z.infer<typeof mentorshipRequestTypeFieldsSchema>;

export const projectRequestTypeFieldsSchema = z.object({
  summary: z.string().trim().min(1).max(1200).optional(),
  skillsNeeded: communityTypeListSchema,
  timeline: z.string().trim().min(1).max(240).optional(),
  tags: communityTypeTagSchema,
});
export type ProjectRequestTypeFields = z.infer<typeof projectRequestTypeFieldsSchema>;

export const collaborationOfferTypeFieldsSchema = z.object({
  summary: z.string().trim().min(1).max(1200).optional(),
  offering: communityTypeListSchema,
  seeking: communityTypeListSchema,
  tags: communityTypeTagSchema,
});
export type CollaborationOfferTypeFields = z.infer<typeof collaborationOfferTypeFieldsSchema>;

export const apprenticeshipOpportunityTypeFieldsSchema = z.object({
  summary: z.string().trim().min(1).max(1200).optional(),
  focusArea: z.string().trim().min(1).max(240).optional(),
  cohort: z.string().trim().min(1).max(120).optional(),
  tags: communityTypeTagSchema,
});
export type ApprenticeshipOpportunityTypeFields = z.infer<
  typeof apprenticeshipOpportunityTypeFieldsSchema
>;

export const communityPhase2TypeFieldsSchemaMap = {
  question: questionTypeFieldsSchema,
  mentorship_request: mentorshipRequestTypeFieldsSchema,
  project_request: projectRequestTypeFieldsSchema,
  collaboration_offer: collaborationOfferTypeFieldsSchema,
  apprenticeship_opportunity: apprenticeshipOpportunityTypeFieldsSchema,
} as const satisfies Record<
  wave12.CommunityPhase2ReservedObjectType,
  z.ZodObject<Record<string, z.ZodTypeAny>>
>;

export type CommunityPhase2TypeFieldsSchema =
  (typeof communityPhase2TypeFieldsSchemaMap)[wave12.CommunityPhase2ReservedObjectType];

export const PHASE2_ACTIVE = true as const;

export function isCommunityTypeActive(type: wave12.CommunityObjectType | string): boolean {
  if (wave12.communityPhase1ObjectTypeSchema.safeParse(type).success) {
    return true;
  }
  if (!PHASE2_ACTIVE) {
    return false;
  }
  return isCommunityPhase2ReservedType(type);
}

export function getCommunityTypeFields(type: wave12.CommunityObjectType | string) {
  if (!isCommunityPhase2ReservedType(type)) {
    return null;
  }
  return communityPhase2TypeFieldsSchemaMap[type];
}

export const matchCandidateSchema = z.object({
  objectId: communityObjectIdSchema,
  type: wave12.communityObjectTypeSchema,
  title: z.string().trim().min(1).max(240),
  score: z.number().min(0).max(1),
  reasons: z.array(z.string().trim().min(1).max(240)),
});
export type MatchCandidate = z.infer<typeof matchCandidateSchema>;

export const matchExperimentRequestSchema = z.object({
  site: wave12.siteSchema,
  objectId: communityObjectIdSchema,
  type: wave12.communityObjectTypeSchema.optional(),
  limit: z.number().int().min(1).max(20).default(5),
});
export type MatchExperimentRequest = z.infer<typeof matchExperimentRequestSchema>;

export const matchExperimentResponseSchema = z.object({
  experimental: z.literal(true),
  objectId: communityObjectIdSchema,
  type: wave12.communityObjectTypeSchema,
  generatedAt: z.string(),
  candidates: z.array(matchCandidateSchema),
  note: z.string().trim().min(1).max(500).optional(),
});
export type MatchExperimentResponse = z.infer<typeof matchExperimentResponseSchema>;

export const matchFeedbackRequestSchema = z.object({
  site: wave12.siteSchema,
  objectId: communityObjectIdSchema,
  candidateObjectId: communityObjectIdSchema,
  verdict: z.enum(['up', 'down']),
});
export type MatchFeedbackRequest = z.infer<typeof matchFeedbackRequestSchema>;

export const matchFeedbackResponseSchema = z.object({
  ok: z.literal(true),
  recorded: z.literal(true),
});
export type MatchFeedbackResponse = z.infer<typeof matchFeedbackResponseSchema>;

export const activitySummaryTopicSchema = z.object({
  topic: z.string().trim().min(1).max(120),
  count: z.number().int().min(0),
});
export type ActivitySummaryTopic = z.infer<typeof activitySummaryTopicSchema>;

export const activitySummaryRecentObjectTypeSchema = z.object({
  type: wave12.objectSubtypeSchema,
  count: z.number().int().min(0),
});
export type ActivitySummaryRecentObjectType = z.infer<typeof activitySummaryRecentObjectTypeSchema>;

export const activitySummarySchema = z.object({
  followedTopics: z.array(activitySummaryTopicSchema),
  contributionsCount: z.number().int().min(0),
  interactionsCount: z.number().int().min(0),
  bookmarksCount: z.number().int().min(0),
  recentObjectTypes: z.array(activitySummaryRecentObjectTypeSchema),
  generatedAt: z.string(),
});
export type ActivitySummary = z.infer<typeof activitySummarySchema>;

export const activitySummaryRequestSchema = z.object({
  site: wave12.siteSchema,
});
export type ActivitySummaryRequest = z.infer<typeof activitySummaryRequestSchema>;

export const activitySummaryResponseSchema = z.object({
  ok: z.literal(true),
  summary: activitySummarySchema,
});
export type ActivitySummaryResponse = z.infer<typeof activitySummaryResponseSchema>;
