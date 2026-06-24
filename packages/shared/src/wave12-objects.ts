import { z } from 'zod';

import { onboardingProfileSchema } from './onboarding';

export const siteSchema = z.enum(['io', 'org']);
export type Site = z.infer<typeof siteSchema>;

export const visibilitySchema = z.enum(['public', 'members-only', 'private']);
export type Visibility = z.infer<typeof visibilitySchema>;

export const lifecycleStatusSchema = z.enum([
  'draft',
  'pending',
  'published',
  'featured',
  'archived',
  'rejected',
  'new',
  'reviewed',
  'spam',
]);
export type LifecycleStatus = z.infer<typeof lifecycleStatusSchema>;

export const publishModeSchema = z.enum(['auto', 'review']);
export type PublishMode = z.infer<typeof publishModeSchema>;

export const publishPreferenceSchema = z.object({
  defaultPublishMode: publishModeSchema,
});
export type PublishPreference = z.infer<typeof publishPreferenceSchema>;

export const autoModerationResultSchema = z.object({
  allowed: z.boolean(),
  reasons: z.array(z.string()).optional(),
});
export type AutoModerationResult = z.infer<typeof autoModerationResultSchema>;

export const knowledgeObjectTypeSchema = z.enum(['article', 'field_note', 'derived_article']);
export type KnowledgeObjectType = z.infer<typeof knowledgeObjectTypeSchema>;

export const communityPhase1ObjectTypeSchema = z.enum([
  'discussion',
  'help_request',
  'event',
  'community_announcement',
]);
export type CommunityPhase1ObjectType = z.infer<typeof communityPhase1ObjectTypeSchema>;

export const communityPhase2ReservedObjectTypeSchema = z.enum([
  'question',
  'mentorship_request',
  'project_request',
  'collaboration_offer',
  'apprenticeship_opportunity',
]);
export type CommunityPhase2ReservedObjectType = z.infer<typeof communityPhase2ReservedObjectTypeSchema>;

export const communityObjectTypeSchema = z.union([
  communityPhase1ObjectTypeSchema,
  communityPhase2ReservedObjectTypeSchema,
]);
export type CommunityObjectType = z.infer<typeof communityObjectTypeSchema>;

export const objectTypeSchema = z.enum(['knowledge', 'community']);
export type ObjectType = z.infer<typeof objectTypeSchema>;

export const objectSubtypeSchema = z.union([knowledgeObjectTypeSchema, communityObjectTypeSchema]);
export type ObjectSubtype = z.infer<typeof objectSubtypeSchema>;

export const objectRecordBaseSchema = z.object({
  id: z.string().min(1),
  site: siteSchema,
  ownerUserId: z.string().nullable(),
  visibility: visibilitySchema,
  title: z.string().trim().min(1).max(240).optional(),
  subject: z.string().trim().min(1).max(240).optional(),
  body: z.string(),
  status: lifecycleStatusSchema,
  metadata: z.record(z.string(), z.unknown()),
  sourceContributionId: z.string().nullable(),
  publishedSlug: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const knowledgeObjectRecordSchema = objectRecordBaseSchema.extend({
  objectType: z.literal('knowledge'),
  type: knowledgeObjectTypeSchema,
});
export type KnowledgeObjectRecord = z.infer<typeof knowledgeObjectRecordSchema>;

export const communityObjectRecordSchema = objectRecordBaseSchema.extend({
  objectType: z.literal('community'),
  type: communityObjectTypeSchema,
});
export type CommunityObjectRecord = z.infer<typeof communityObjectRecordSchema>;

export const objectRecordSchema = z.discriminatedUnion('objectType', [
  knowledgeObjectRecordSchema,
  communityObjectRecordSchema,
]);
export type ObjectRecord = z.infer<typeof objectRecordSchema>;

export const objectListRequestSchema = z
  .object({
    site: siteSchema.optional(),
    objectType: objectTypeSchema.optional(),
    type: objectSubtypeSchema.optional(),
    mine: z.boolean().optional(),
    visibility: visibilitySchema.optional(),
    status: lifecycleStatusSchema.optional(),
    limit: z.number().int().min(1).max(100).optional(),
    cursor: z.string().min(1).optional(),
  })
  .superRefine((value, ctx) => {
    if (!value.objectType || !value.type) {
      return;
    }
    const typeIsKnowledge = knowledgeObjectTypeSchema.safeParse(value.type).success;
    const typeIsCommunity = communityObjectTypeSchema.safeParse(value.type).success;
    if (value.objectType === 'knowledge' && !typeIsKnowledge) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Type must be a knowledge type when objectType is knowledge.',
        path: ['type'],
      });
    }
    if (value.objectType === 'community' && !typeIsCommunity) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Type must be a community type when objectType is community.',
        path: ['type'],
      });
    }
  });
export type ObjectListRequest = z.infer<typeof objectListRequestSchema>;

export const objectListResponseSchema = z.object({
  ok: z.literal(true),
  objects: z.array(objectRecordSchema),
  nextCursor: z.string().nullable().optional(),
});
export type ObjectListResponse = z.infer<typeof objectListResponseSchema>;

export const objectGetRequestSchema = z.object({
  id: z.string().min(1),
});
export type ObjectGetRequest = z.infer<typeof objectGetRequestSchema>;

export const objectGetResponseSchema = z.object({
  ok: z.literal(true),
  object: objectRecordSchema,
});
export type ObjectGetResponse = z.infer<typeof objectGetResponseSchema>;

export const objectWriteInputSchema = z.object({
  objectType: objectTypeSchema,
  type: objectSubtypeSchema,
  site: siteSchema,
  visibility: visibilitySchema,
  title: z.string().trim().min(1).max(240).optional(),
  subject: z.string().trim().min(1).max(240).optional(),
  body: z.string().min(1).max(12000),
  metadata: z.record(z.string(), z.unknown()).optional(),
  sourceContributionId: z.string().nullable().optional(),
  publishedSlug: z.string().nullable().optional(),
});

export const objectCreateRequestSchema = objectWriteInputSchema
  .extend({
    status: lifecycleStatusSchema.optional(),
  })
  .superRefine((value, ctx) => {
    const typeIsKnowledge = knowledgeObjectTypeSchema.safeParse(value.type).success;
    const typeIsCommunity = communityObjectTypeSchema.safeParse(value.type).success;
    if (value.objectType === 'knowledge' && !typeIsKnowledge) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Type must be a knowledge type when objectType is knowledge.',
        path: ['type'],
      });
    }
    if (value.objectType === 'community' && !typeIsCommunity) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Type must be a community type when objectType is community.',
        path: ['type'],
      });
    }
  });
export type ObjectCreateRequest = z.infer<typeof objectCreateRequestSchema>;

export const objectDraftRequestSchema = objectWriteInputSchema
  .extend({
    objectId: z.string().optional(),
    status: z.enum(['draft', 'pending']).optional(),
  })
  .superRefine((value, ctx) => {
    const typeIsKnowledge = knowledgeObjectTypeSchema.safeParse(value.type).success;
    const typeIsCommunity = communityObjectTypeSchema.safeParse(value.type).success;
    if (value.objectType === 'knowledge' && !typeIsKnowledge) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Type must be a knowledge type when objectType is knowledge.',
        path: ['type'],
      });
    }
    if (value.objectType === 'community' && !typeIsCommunity) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Type must be a community type when objectType is community.',
        path: ['type'],
      });
    }
  });
export type ObjectDraftRequest = z.infer<typeof objectDraftRequestSchema>;

export const objectSubmitRequestSchema = z.object({
  objectId: z.string().min(1),
  publishMode: publishModeSchema.optional(),
  visibility: visibilitySchema.optional(),
});
export type ObjectSubmitRequest = z.infer<typeof objectSubmitRequestSchema>;

export const objectWriteResponseSchema = z.object({
  ok: z.literal(true),
  object: objectRecordSchema,
});
export type ObjectWriteResponse = z.infer<typeof objectWriteResponseSchema>;

export const derivedArticleDraftRequestSchema = z.object({
  sourceDiscussionObjectId: z.string().min(1),
  site: z.literal('org'),
  visibility: visibilitySchema.optional(),
});
export type DerivedArticleDraftRequest = z.infer<typeof derivedArticleDraftRequestSchema>;

export const derivedArticleDraftResponseSchema = z.object({
  ok: z.literal(true),
  object: knowledgeObjectRecordSchema.refine((item) => item.type === 'derived_article', {
    message: 'Derived workflow must return a derived_article object.',
  }),
});
export type DerivedArticleDraftResponse = z.infer<typeof derivedArticleDraftResponseSchema>;

export const contributionRecordSchema = z.object({
  id: z.string().min(1),
  site: siteSchema,
  objectType: objectTypeSchema,
  type: objectSubtypeSchema,
  ownerUserId: z.string().nullable(),
  visibility: visibilitySchema,
  title: z.string().trim().min(1).max(240).optional(),
  subject: z.string().trim().min(1).max(240).optional(),
  body: z.string(),
  status: lifecycleStatusSchema,
  metadata: z.record(z.string(), z.unknown()),
  objectId: z.string().nullable().optional(),
  source: z.string().min(1).max(120).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type ContributionRecord = z.infer<typeof contributionRecordSchema>;

export const contributionWriteInputSchema = z.object({
  site: siteSchema,
  objectType: objectTypeSchema,
  type: objectSubtypeSchema,
  visibility: visibilitySchema,
  title: z.string().trim().min(1).max(240).optional(),
  subject: z.string().trim().min(1).max(240).optional(),
  body: z.string().min(1).max(12000),
  metadata: z.record(z.string(), z.unknown()).optional(),
  source: z.string().min(1).max(120).optional(),
});

export const contributionCreateRequestSchema = contributionWriteInputSchema
  .extend({
    status: lifecycleStatusSchema.optional(),
  })
  .superRefine((value, ctx) => {
    const typeIsKnowledge = knowledgeObjectTypeSchema.safeParse(value.type).success;
    const typeIsCommunity = communityObjectTypeSchema.safeParse(value.type).success;
    if (value.objectType === 'knowledge' && !typeIsKnowledge) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Type must be a knowledge type when objectType is knowledge.',
        path: ['type'],
      });
    }
    if (value.objectType === 'community' && !typeIsCommunity) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Type must be a community type when objectType is community.',
        path: ['type'],
      });
    }
  });
export type ContributionCreateRequest = z.infer<typeof contributionCreateRequestSchema>;

export const contributionDraftRequestSchema = contributionWriteInputSchema
  .extend({
    contributionId: z.string().optional(),
    status: z.enum(['draft', 'pending']).optional(),
  })
  .superRefine((value, ctx) => {
    const typeIsKnowledge = knowledgeObjectTypeSchema.safeParse(value.type).success;
    const typeIsCommunity = communityObjectTypeSchema.safeParse(value.type).success;
    if (value.objectType === 'knowledge' && !typeIsKnowledge) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Type must be a knowledge type when objectType is knowledge.',
        path: ['type'],
      });
    }
    if (value.objectType === 'community' && !typeIsCommunity) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Type must be a community type when objectType is community.',
        path: ['type'],
      });
    }
  });
export type ContributionDraftRequest = z.infer<typeof contributionDraftRequestSchema>;

export const contributionSubmitRequestSchema = z.object({
  contributionId: z.string().min(1),
  publishMode: publishModeSchema.optional(),
  visibility: visibilitySchema.optional(),
});
export type ContributionSubmitRequest = z.infer<typeof contributionSubmitRequestSchema>;

export const contributionWriteResponseSchema = z.object({
  ok: z.literal(true),
  contribution: contributionRecordSchema,
});
export type ContributionWriteResponse = z.infer<typeof contributionWriteResponseSchema>;

export const moderationQueueItemSchema = z.object({
  id: z.string().min(1),
  entityType: z.enum(['contribution', 'object']),
  site: siteSchema,
  objectType: objectTypeSchema,
  type: objectSubtypeSchema,
  ownerUserId: z.string().nullable(),
  visibility: visibilitySchema,
  title: z.string().trim().min(1).max(240).optional(),
  subject: z.string().trim().min(1).max(240).optional(),
  body: z.string(),
  status: lifecycleStatusSchema,
  metadata: z.record(z.string(), z.unknown()).optional(),
  sourceContributionId: z.string().nullable().optional(),
  publishedSlug: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type ModerationQueueItem = z.infer<typeof moderationQueueItemSchema>;

export const moderationQueueListRequestSchema = z
  .object({
    site: siteSchema.optional(),
    objectType: objectTypeSchema.optional(),
    type: objectSubtypeSchema.optional(),
    status: lifecycleStatusSchema.optional(),
    visibility: visibilitySchema.optional(),
    limit: z.number().int().min(1).max(100).optional(),
    cursor: z.string().min(1).optional(),
  })
  .superRefine((value, ctx) => {
    if (!value.objectType || !value.type) {
      return;
    }
    const typeIsKnowledge = knowledgeObjectTypeSchema.safeParse(value.type).success;
    const typeIsCommunity = communityObjectTypeSchema.safeParse(value.type).success;
    if (value.objectType === 'knowledge' && !typeIsKnowledge) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Type must be a knowledge type when objectType is knowledge.',
        path: ['type'],
      });
    }
    if (value.objectType === 'community' && !typeIsCommunity) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Type must be a community type when objectType is community.',
        path: ['type'],
      });
    }
  });
export type ModerationQueueListRequest = z.infer<typeof moderationQueueListRequestSchema>;

export const moderationQueueListResponseSchema = z.object({
  ok: z.literal(true),
  items: z.array(moderationQueueItemSchema),
  nextCursor: z.string().nullable().optional(),
});
export type ModerationQueueListResponse = z.infer<typeof moderationQueueListResponseSchema>;

export const moderationTransitionRequestSchema = z.object({
  status: z.enum(['pending', 'published', 'featured', 'archived', 'rejected']),
  visibility: visibilitySchema.optional(),
  publishedSlug: z.string().min(1).max(240).optional(),
});
export type ModerationTransitionRequest = z.infer<typeof moderationTransitionRequestSchema>;

export const moderationTransitionResponseSchema = z.object({
  ok: z.literal(true),
  item: moderationQueueItemSchema,
});
export type ModerationTransitionResponse = z.infer<typeof moderationTransitionResponseSchema>;

export const profileRecordSchema = z.object({
  userId: z.string().min(1),
  profile: onboardingProfileSchema,
  publishPreference: publishPreferenceSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type ProfileRecord = z.infer<typeof profileRecordSchema>;

export const profileGetResponseSchema = z.object({
  ok: z.literal(true),
  profile: profileRecordSchema.nullable(),
});
export type ProfileGetResponse = z.infer<typeof profileGetResponseSchema>;

export const profileSetRequestSchema = z.object({
  profile: onboardingProfileSchema,
  publishPreference: publishPreferenceSchema.optional(),
});
export type ProfileSetRequest = z.infer<typeof profileSetRequestSchema>;

export const profileSetResponseSchema = z.object({
  ok: z.literal(true),
  profile: profileRecordSchema,
});
export type ProfileSetResponse = z.infer<typeof profileSetResponseSchema>;

export const publishPreferenceGetResponseSchema = z.object({
  ok: z.literal(true),
  publishPreference: publishPreferenceSchema,
});
export type PublishPreferenceGetResponse = z.infer<typeof publishPreferenceGetResponseSchema>;

export const publishPreferenceSetRequestSchema = publishPreferenceSchema;
export type PublishPreferenceSetRequest = z.infer<typeof publishPreferenceSetRequestSchema>;

export const publishPreferenceSetResponseSchema = z.object({
  ok: z.literal(true),
  publishPreference: publishPreferenceSchema,
});
export type PublishPreferenceSetResponse = z.infer<typeof publishPreferenceSetResponseSchema>;

export const personalTargetSchema = z.discriminatedUnion('targetType', [
  z.object({
    targetType: z.literal('library_article'),
    targetId: z
      .string()
      .trim()
      .min(1)
      .max(240)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'library_article targetId must be a slug.'),
  }),
  z.object({
    targetType: z.literal('object'),
    targetId: z.string().trim().min(1).max(120),
  }),
]);
export type PersonalTarget = z.infer<typeof personalTargetSchema>;

export const bookmarkSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  site: siteSchema,
  visibility: z.literal('private'),
  target: personalTargetSchema,
  title: z.string().trim().min(1).max(240).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Bookmark = z.infer<typeof bookmarkSchema>;

export const bookmarkCreateRequestSchema = z.object({
  site: siteSchema,
  target: personalTargetSchema,
  title: z.string().trim().min(1).max(240).optional(),
});
export type BookmarkCreateRequest = z.infer<typeof bookmarkCreateRequestSchema>;

export const bookmarkUpdateRequestSchema = z.object({
  title: z.string().trim().min(1).max(240).optional(),
});
export type BookmarkUpdateRequest = z.infer<typeof bookmarkUpdateRequestSchema>;

export const bookmarkWriteResponseSchema = z.object({
  ok: z.literal(true),
  bookmark: bookmarkSchema,
});
export type BookmarkWriteResponse = z.infer<typeof bookmarkWriteResponseSchema>;

export const bookmarkListResponseSchema = z.object({
  ok: z.literal(true),
  bookmarks: z.array(bookmarkSchema),
});
export type BookmarkListResponse = z.infer<typeof bookmarkListResponseSchema>;

export const captureSourceSchema = z.enum(['ask_capture', 'ask_submit', 'manual']);
export type CaptureSource = z.infer<typeof captureSourceSchema>;

export const noteSchema = z
  .object({
    id: z.string().min(1),
    userId: z.string().min(1),
    site: siteSchema,
    visibility: z.literal('private'),
    title: z.string().trim().min(1).max(240).optional(),
    body: z.string().min(1).max(12000),
    isCapture: z.boolean(),
    captureSource: captureSourceSchema.optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .superRefine((value, ctx) => {
    if (value.isCapture && !value.captureSource) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'captureSource is required when isCapture is true.',
        path: ['captureSource'],
      });
    }
  });
export type Note = z.infer<typeof noteSchema>;

export const noteCreateRequestSchema = z.object({
  site: siteSchema,
  title: z.string().trim().min(1).max(240).optional(),
  body: z.string().min(1).max(12000),
  isCapture: z.boolean().optional(),
  captureSource: captureSourceSchema.optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export type NoteCreateRequest = z.infer<typeof noteCreateRequestSchema>;

export const noteUpdateRequestSchema = z.object({
  title: z.string().trim().min(1).max(240).optional(),
  body: z.string().min(1).max(12000).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export type NoteUpdateRequest = z.infer<typeof noteUpdateRequestSchema>;

export const noteWriteResponseSchema = z.object({
  ok: z.literal(true),
  note: noteSchema,
});
export type NoteWriteResponse = z.infer<typeof noteWriteResponseSchema>;

export const noteListResponseSchema = z.object({
  ok: z.literal(true),
  notes: z.array(noteSchema),
});
export type NoteListResponse = z.infer<typeof noteListResponseSchema>;

export const annotationSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  site: siteSchema,
  visibility: z.literal('private'),
  target: personalTargetSchema,
  body: z.string().min(1).max(8000),
  selectedText: z.string().max(2000).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Annotation = z.infer<typeof annotationSchema>;

export const annotationCreateRequestSchema = z.object({
  site: siteSchema,
  target: personalTargetSchema,
  body: z.string().min(1).max(8000),
  selectedText: z.string().max(2000).optional(),
});
export type AnnotationCreateRequest = z.infer<typeof annotationCreateRequestSchema>;

export const annotationUpdateRequestSchema = z.object({
  body: z.string().min(1).max(8000).optional(),
  selectedText: z.string().max(2000).optional(),
});
export type AnnotationUpdateRequest = z.infer<typeof annotationUpdateRequestSchema>;

export const annotationWriteResponseSchema = z.object({
  ok: z.literal(true),
  annotation: annotationSchema,
});
export type AnnotationWriteResponse = z.infer<typeof annotationWriteResponseSchema>;

export const annotationListResponseSchema = z.object({
  ok: z.literal(true),
  annotations: z.array(annotationSchema),
});
export type AnnotationListResponse = z.infer<typeof annotationListResponseSchema>;

export const commentTargetSchema = personalTargetSchema;
export type CommentTarget = z.infer<typeof commentTargetSchema>;

export const commentSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  site: siteSchema,
  visibility: z.literal('public'),
  target: commentTargetSchema,
  body: z.string().min(1).max(8000),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Comment = z.infer<typeof commentSchema>;

export const commentCreateRequestSchema = z.object({
  site: siteSchema,
  target: commentTargetSchema,
  body: z.string().min(1).max(8000),
});
export type CommentCreateRequest = z.infer<typeof commentCreateRequestSchema>;

export const commentUpdateRequestSchema = z.object({
  body: z.string().min(1).max(8000),
});
export type CommentUpdateRequest = z.infer<typeof commentUpdateRequestSchema>;

export const commentWriteResponseSchema = z.object({
  ok: z.literal(true),
  comment: commentSchema,
});
export type CommentWriteResponse = z.infer<typeof commentWriteResponseSchema>;

export const commentListResponseSchema = z.object({
  ok: z.literal(true),
  comments: z.array(commentSchema),
});
export type CommentListResponse = z.infer<typeof commentListResponseSchema>;

export const recentlyViewedEntrySchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  site: siteSchema,
  visibility: z.literal('private'),
  target: personalTargetSchema,
  viewedAt: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type RecentlyViewedEntry = z.infer<typeof recentlyViewedEntrySchema>;

export const recentlyViewedCreateRequestSchema = z.object({
  site: siteSchema,
  target: personalTargetSchema,
  viewedAt: z.string().optional(),
});
export type RecentlyViewedCreateRequest = z.infer<typeof recentlyViewedCreateRequestSchema>;

export const recentlyViewedUpdateRequestSchema = z.object({
  viewedAt: z.string().optional(),
});
export type RecentlyViewedUpdateRequest = z.infer<typeof recentlyViewedUpdateRequestSchema>;

export const recentlyViewedWriteResponseSchema = z.object({
  ok: z.literal(true),
  entry: recentlyViewedEntrySchema,
});
export type RecentlyViewedWriteResponse = z.infer<typeof recentlyViewedWriteResponseSchema>;

export const recentlyViewedListResponseSchema = z.object({
  ok: z.literal(true),
  entries: z.array(recentlyViewedEntrySchema),
});
export type RecentlyViewedListResponse = z.infer<typeof recentlyViewedListResponseSchema>;

export const deleteResponseSchema = z.object({
  ok: z.literal(true),
  id: z.string().min(1),
});
export type DeleteResponse = z.infer<typeof deleteResponseSchema>;
