import { z } from 'zod';
import * as wave12 from './wave12-objects';

export const communityActionVerbSchema = z.enum([
  'reply',
  'follow',
  'save',
  'turn_into_field_note',
  'draft_reply',
  'offer_help',
  'draft_via_ask',
  'join',
  'read',
  'match',
  'apply',
  'request_mentor',
  'ask_for_intro',
]);
export type CommunityActionVerb = z.infer<typeof communityActionVerbSchema>;

export const communityPhase1ActionTaxonomy = {
  discussion: ['reply', 'follow', 'save', 'turn_into_field_note', 'draft_reply'],
  help_request: ['offer_help', 'save', 'draft_via_ask'],
  event: ['join', 'save', 'follow'],
  community_announcement: ['read', 'save'],
} as const satisfies Record<
  wave12.CommunityPhase1ObjectType,
  readonly CommunityActionVerb[]
>;

export const communityPhase2ReservedActionTaxonomy = {
  question: ['reply', 'follow', 'save', 'match'],
  mentorship_request: ['request_mentor', 'ask_for_intro', 'save', 'follow', 'match'],
  project_request: ['apply', 'offer_help', 'ask_for_intro', 'save', 'follow', 'match'],
  collaboration_offer: ['apply', 'ask_for_intro', 'save', 'follow', 'match'],
  apprenticeship_opportunity: ['apply', 'ask_for_intro', 'save', 'follow', 'match'],
} as const satisfies Record<
  wave12.CommunityPhase2ReservedObjectType,
  readonly CommunityActionVerb[]
>;

export function isCommunityPhase2ReservedType(
  type: wave12.CommunityObjectType | string,
): type is wave12.CommunityPhase2ReservedObjectType {
  return wave12.communityPhase2ReservedObjectTypeSchema.safeParse(type).success;
}

export function getCommunityActions(type: wave12.CommunityObjectType): readonly CommunityActionVerb[] {
  if (isCommunityPhase2ReservedType(type)) {
    return communityPhase2ReservedActionTaxonomy[type];
  }
  return communityPhase1ActionTaxonomy[type];
}

export const communityInteractionKindSchema = z.enum(['follow', 'offer_help', 'join']);
export type CommunityInteractionKind = z.infer<typeof communityInteractionKindSchema>;

const communityInteractionObjectIdSchema = z.string().trim().min(1).max(120);
const communityInteractionBodySchema = z.string().trim().min(1).max(8000);

export const communityInteractionRecordSchema = z.object({
  id: z.string().min(1),
  objectId: communityInteractionObjectIdSchema,
  userId: z.string().min(1).nullable(),
  site: wave12.siteSchema,
  kind: communityInteractionKindSchema,
  body: communityInteractionBodySchema.optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type CommunityInteractionRecord = z.infer<typeof communityInteractionRecordSchema>;

export const communityInteractionCreateRequestSchema = z.object({
  site: wave12.siteSchema,
  objectId: communityInteractionObjectIdSchema,
  kind: communityInteractionKindSchema,
  body: communityInteractionBodySchema.optional(),
});
export type CommunityInteractionCreateRequest = z.infer<typeof communityInteractionCreateRequestSchema>;

export const communityFollowRequestSchema = communityInteractionCreateRequestSchema.extend({
  kind: z.literal('follow'),
});
export type CommunityFollowRequest = z.infer<typeof communityFollowRequestSchema>;

export const communityOfferHelpRequestSchema = communityInteractionCreateRequestSchema.extend({
  kind: z.literal('offer_help'),
});
export type CommunityOfferHelpRequest = z.infer<typeof communityOfferHelpRequestSchema>;

export const communityJoinRequestSchema = communityInteractionCreateRequestSchema.extend({
  kind: z.literal('join'),
});
export type CommunityJoinRequest = z.infer<typeof communityJoinRequestSchema>;

export const communityInteractionUndoRequestSchema = z.object({
  site: wave12.siteSchema,
  objectId: communityInteractionObjectIdSchema,
  kind: communityInteractionKindSchema,
});
export type CommunityInteractionUndoRequest = z.infer<typeof communityInteractionUndoRequestSchema>;

export const communityUnfollowRequestSchema = communityInteractionUndoRequestSchema.extend({
  kind: z.literal('follow'),
});
export type CommunityUnfollowRequest = z.infer<typeof communityUnfollowRequestSchema>;

export const communityLeaveRequestSchema = communityInteractionUndoRequestSchema.extend({
  kind: z.literal('join'),
});
export type CommunityLeaveRequest = z.infer<typeof communityLeaveRequestSchema>;

export const communityInteractionDeleteRequestSchema = z.object({
  id: z.string().min(1),
});
export type CommunityInteractionDeleteRequest = z.infer<typeof communityInteractionDeleteRequestSchema>;

export const communityInteractionWriteResponseSchema = z.object({
  ok: z.literal(true),
  interaction: communityInteractionRecordSchema,
});
export type CommunityInteractionWriteResponse = z.infer<typeof communityInteractionWriteResponseSchema>;

export const communityInteractionDeleteResponseSchema = z.object({
  ok: z.literal(true),
  id: z.string().min(1),
});
export type CommunityInteractionDeleteResponse = z.infer<typeof communityInteractionDeleteResponseSchema>;

export const communityInteractionUndoResponseSchema = z.object({
  ok: z.literal(true),
  objectId: communityInteractionObjectIdSchema,
  kind: communityInteractionKindSchema,
  undone: z.literal(true),
  id: z.string().min(1).nullable().optional(),
});
export type CommunityInteractionUndoResponse = z.infer<typeof communityInteractionUndoResponseSchema>;

export const communityInteractionListRequestSchema = z.object({
  site: wave12.siteSchema.optional(),
  objectId: communityInteractionObjectIdSchema.optional(),
  kind: communityInteractionKindSchema.optional(),
  limit: z.number().int().min(1).max(100).optional(),
  cursor: z.string().min(1).optional(),
});
export type CommunityInteractionListRequest = z.infer<typeof communityInteractionListRequestSchema>;

export const communityInteractionListResponseSchema = z.object({
  ok: z.literal(true),
  interactions: z.array(communityInteractionRecordSchema),
  nextCursor: z.string().nullable().optional(),
});
export type CommunityInteractionListResponse = z.infer<typeof communityInteractionListResponseSchema>;

export const communityListByTypeRequestSchema = z.object({
  site: wave12.siteSchema.optional(),
  type: wave12.communityObjectTypeSchema.optional(),
  mine: z.boolean().optional(),
  visibility: wave12.visibilitySchema.optional(),
  status: wave12.lifecycleStatusSchema.optional(),
  limit: z.number().int().min(1).max(100).optional(),
  cursor: z.string().min(1).optional(),
});
export type CommunityListByTypeRequest = z.infer<typeof communityListByTypeRequestSchema>;

export const communityListByTypeResponseSchema = z.object({
  ok: z.literal(true),
  objects: z.array(wave12.communityObjectRecordSchema),
  nextCursor: z.string().nullable().optional(),
});
export type CommunityListByTypeResponse = z.infer<typeof communityListByTypeResponseSchema>;

export const communityGetWithRepliesRequestSchema = z.object({
  id: z.string().min(1),
});
export type CommunityGetWithRepliesRequest = z.infer<typeof communityGetWithRepliesRequestSchema>;

export const communityGetWithRepliesResponseSchema = z.object({
  ok: z.literal(true),
  object: wave12.communityObjectRecordSchema,
  replies: z.array(wave12.commentSchema),
});
export type CommunityGetWithRepliesResponse = z.infer<typeof communityGetWithRepliesResponseSchema>;

export const communityReplyRequestSchema = z.object({
  site: wave12.siteSchema,
  objectId: communityInteractionObjectIdSchema,
  body: communityInteractionBodySchema,
});
export type CommunityReplyRequest = z.infer<typeof communityReplyRequestSchema>;

export function toCommunityReplyCommentRequest(
  payload: CommunityReplyRequest,
): wave12.CommentCreateRequest {
  const request = communityReplyRequestSchema.parse(payload);
  return {
    site: request.site,
    target: {
      targetType: 'object',
      targetId: request.objectId,
    },
    body: request.body,
  };
}

const communityReservedNoopSchema = z.object({
  ok: z.literal(true),
  reserved: z.literal(true),
  message: z.string().trim().min(1).max(500),
});

export const communityReservedTypeResultSchema = communityReservedNoopSchema.extend({
  objectId: communityInteractionObjectIdSchema,
  type: wave12.communityPhase2ReservedObjectTypeSchema,
});
export type CommunityReservedTypeResult = z.infer<typeof communityReservedTypeResultSchema>;

export const communityMatchRequestSchema = z.object({
  site: wave12.siteSchema,
  objectId: communityInteractionObjectIdSchema,
  type: wave12.communityPhase2ReservedObjectTypeSchema.optional(),
  body: communityInteractionBodySchema.optional(),
});
export type CommunityMatchRequest = z.infer<typeof communityMatchRequestSchema>;

export const communityMatchResponseSchema = communityReservedNoopSchema.extend({
  objectId: communityInteractionObjectIdSchema,
  action: z.literal('match'),
  type: wave12.communityPhase2ReservedObjectTypeSchema.optional(),
});
export type CommunityMatchResponse = z.infer<typeof communityMatchResponseSchema>;
