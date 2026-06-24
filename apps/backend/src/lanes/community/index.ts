import {
  communityFollowRequestSchema,
  communityGetWithRepliesRequestSchema,
  communityInteractionListRequestSchema,
  communityJoinRequestSchema,
  communityLeaveRequestSchema,
  communityListByTypeRequestSchema,
  matchExperimentRequestSchema,
  matchExperimentResponseSchema,
  matchFeedbackRequestSchema,
  matchFeedbackResponseSchema,
  communityOfferHelpRequestSchema,
  communityReplyRequestSchema,
  communityUnfollowRequestSchema,
  siteSchema,
  toCommunityReplyCommentRequest,
  type CommunityObjectRecord,
} from '@ai-transformation/shared';
import { Hono } from 'hono';

import {
  listInteractionsForUser,
  recordMatchRun,
  removeCommunityInteraction,
  removeFollow,
  upsertCommunityAction,
  upsertCommunityInteraction,
  upsertMatchFeedback,
  upsertFollow,
} from '../../db/community.js';
import { getObjectByIdForRequester, listObjectsForRequester } from '../../db/objects.js';
import { createComment, listComments } from '../../db/personal.js';
import type { SessionVariables } from '../../types/session.js';
import {
  getValidationErrorMessage,
  requireResolvedUser,
  resolveRequester,
  toVisibilityContext,
} from '../objects/index.js';

const communityRouter = new Hono<{ Variables: SessionVariables }>();

function parseBoolean(value: string | undefined): boolean | undefined {
  if (value === 'true') {
    return true;
  }
  if (value === 'false') {
    return false;
  }
  return undefined;
}

function parseInteger(value: string | undefined): number | undefined {
  if (!value) {
    return undefined;
  }
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    return undefined;
  }
  return parsed;
}

function parseListByTypeQuery(c: {
  req: { query: (name: string) => string | undefined };
}): ReturnType<typeof communityListByTypeRequestSchema.parse> {
  return communityListByTypeRequestSchema.parse({
    site: c.req.query('site'),
    type: c.req.query('type'),
    mine: parseBoolean(c.req.query('mine')),
    visibility: c.req.query('visibility'),
    status: c.req.query('status'),
    limit: parseInteger(c.req.query('limit')),
    cursor: c.req.query('cursor'),
  });
}

function parseInteractionListQuery(c: {
  req: { query: (name: string) => string | undefined };
}): ReturnType<typeof communityInteractionListRequestSchema.parse> {
  return communityInteractionListRequestSchema.parse({
    site: c.req.query('site'),
    objectId: c.req.query('objectId'),
    kind: c.req.query('kind'),
    limit: parseInteger(c.req.query('limit')),
    cursor: c.req.query('cursor'),
  });
}

type CommunityActionKind = 'offer_help' | 'request_mentor' | 'ask_for_intro' | 'apply' | 'collaborate';

type CommunityActionRequest = {
  site: 'io' | 'org';
  objectId: string;
  kind: CommunityActionKind;
  body?: string;
};

const communityActionKinds = new Set<CommunityActionKind>([
  'offer_help',
  'request_mentor',
  'ask_for_intro',
  'apply',
  'collaborate',
]);

function parseCommunityActionRequest(body: unknown): {
  data: CommunityActionRequest | null;
  error: string | null;
} {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { data: null, error: 'Invalid request body' };
  }
  const value = body as Record<string, unknown>;
  const parsedSite = siteSchema.safeParse(value.site);
  if (!parsedSite.success) {
    return { data: null, error: 'Invalid site' };
  }
  const objectId = typeof value.objectId === 'string' ? value.objectId.trim() : '';
  if (objectId.length === 0 || objectId.length > 120) {
    return { data: null, error: 'Invalid objectId' };
  }
  const kind = typeof value.kind === 'string' ? (value.kind as CommunityActionKind) : null;
  if (!kind || !communityActionKinds.has(kind)) {
    return { data: null, error: 'Invalid action kind' };
  }
  const bodyValue = value.body;
  if (bodyValue !== undefined && typeof bodyValue !== 'string') {
    return { data: null, error: 'Invalid action body' };
  }
  const normalizedBody = typeof bodyValue === 'string' ? bodyValue.trim() : undefined;
  if (normalizedBody !== undefined && (normalizedBody.length === 0 || normalizedBody.length > 8000)) {
    return { data: null, error: 'Invalid action body' };
  }
  return {
    data: {
      site: parsedSite.data,
      objectId,
      kind,
      ...(normalizedBody ? { body: normalizedBody } : {}),
    },
    error: null,
  };
}

const matcherCompatibility: Record<string, ReadonlySet<string>> = {
  discussion: new Set(['question', 'mentorship_request', 'project_request', 'collaboration_offer']),
  help_request: new Set(['collaboration_offer', 'project_request', 'mentorship_request']),
  event: new Set(['collaboration_offer', 'apprenticeship_opportunity']),
  community_announcement: new Set(['collaboration_offer']),
  question: new Set(['discussion', 'collaboration_offer', 'mentorship_request']),
  mentorship_request: new Set(['collaboration_offer', 'apprenticeship_opportunity', 'project_request']),
  project_request: new Set(['collaboration_offer', 'apprenticeship_opportunity', 'mentorship_request']),
  collaboration_offer: new Set(['help_request', 'project_request', 'mentorship_request', 'question']),
  apprenticeship_opportunity: new Set(['mentorship_request', 'project_request', 'collaboration_offer']),
};

const stopWords = new Set([
  'and',
  'the',
  'for',
  'with',
  'that',
  'this',
  'from',
  'your',
  'about',
  'into',
  'have',
  'will',
  'are',
  'you',
]);

function normalizeTerm(value: string): string | null {
  const normalized = value.trim().toLowerCase();
  if (normalized.length === 0) {
    return null;
  }
  return normalized.slice(0, 120);
}

function toStringList(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  const normalized = value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => normalizeTerm(item))
    .filter((item): item is string => Boolean(item));
  return Array.from(new Set(normalized));
}

function tokenize(value: string): string[] {
  return value
    .toLowerCase()
    .split(/[^a-z0-9]+/g)
    .map((token) => token.trim())
    .filter((token) => token.length >= 3 && !stopWords.has(token))
    .slice(0, 120);
}

function collectTermsFromMetadata(metadata: Record<string, unknown>): {
  tags: Set<string>;
  skills: Set<string>;
  keywords: Set<string>;
} {
  const tags = new Set<string>(toStringList(metadata.tags));
  const skills = new Set<string>([
    ...toStringList(metadata.skillsNeeded),
    ...toStringList(metadata.offering),
    ...toStringList(metadata.seeking),
  ]);
  const keywordFields = ['summary', 'focusArea', 'commitment', 'seniority', 'timeline', 'cohort', 'questionBody'];
  const keywordValues = keywordFields
    .map((field) => metadata[field])
    .filter((value): value is string => typeof value === 'string');
  const keywords = new Set<string>(tokenize(keywordValues.join(' ')));
  return { tags, skills, keywords };
}

function buildMatchProfile(item: CommunityObjectRecord): {
  tags: Set<string>;
  skills: Set<string>;
  keywords: Set<string>;
} {
  const metadata = item.metadata ?? {};
  const metadataTerms = collectTermsFromMetadata(metadata);
  const textTerms = tokenize([item.title ?? '', item.subject ?? '', item.body].join(' '));
  return {
    tags: metadataTerms.tags,
    skills: metadataTerms.skills,
    keywords: new Set<string>([...metadataTerms.keywords, ...textTerms]),
  };
}

function getObjectTitle(item: CommunityObjectRecord): string {
  const title = item.title?.trim() ?? item.subject?.trim() ?? '';
  if (title.length > 0) {
    return title.slice(0, 240);
  }
  return item.type.replace(/_/g, ' ').slice(0, 240);
}

function getOverlap(left: Set<string>, right: Set<string>): string[] {
  const overlap: string[] = [];
  for (const value of left) {
    if (right.has(value)) {
      overlap.push(value);
    }
  }
  return overlap;
}

function getCompatibilityScore(sourceType: string, candidateType: string): { score: number; reason: string | null } {
  const compatible = matcherCompatibility[sourceType];
  if (compatible?.has(candidateType)) {
    return {
      score: 0.35,
      reason: `Compatible type pairing: ${sourceType} -> ${candidateType}.`,
    };
  }
  if (sourceType === candidateType) {
    return {
      score: 0.15,
      reason: `Same type pairing: ${sourceType}.`,
    };
  }
  return { score: 0, reason: null };
}

function scoreMatchCandidate(
  source: CommunityObjectRecord,
  candidate: CommunityObjectRecord,
): {
  objectId: string;
  type: CommunityObjectRecord['type'];
  title: string;
  score: number;
  reasons: string[];
} | null {
  if (source.id === candidate.id) {
    return null;
  }
  const sourceProfile = buildMatchProfile(source);
  const candidateProfile = buildMatchProfile(candidate);
  const compatibility = getCompatibilityScore(source.type, candidate.type);
  const sharedTags = getOverlap(sourceProfile.tags, candidateProfile.tags);
  const sharedSkills = getOverlap(sourceProfile.skills, candidateProfile.skills);
  const sharedKeywords = getOverlap(sourceProfile.keywords, candidateProfile.keywords).slice(0, 6);
  const tagScore = sharedTags.length > 0 ? Math.min(sharedTags.length / Math.max(sourceProfile.tags.size, 1), 1) : 0;
  const skillScore =
    sharedSkills.length > 0 ? Math.min(sharedSkills.length / Math.max(sourceProfile.skills.size, 1), 1) : 0;
  const keywordScore =
    sharedKeywords.length > 0
      ? Math.min(sharedKeywords.length / Math.max(Math.min(sourceProfile.keywords.size, 6), 1), 1)
      : 0;
  const rawScore = compatibility.score + tagScore * 0.35 + skillScore * 0.2 + keywordScore * 0.15;
  const score = Math.max(0, Math.min(rawScore, 1));
  const reasons: string[] = [];
  if (compatibility.reason) {
    reasons.push(compatibility.reason);
  }
  if (sharedTags.length > 0) {
    reasons.push(`Shared tags: ${sharedTags.slice(0, 4).join(', ')}.`);
  }
  if (sharedSkills.length > 0) {
    reasons.push(`Shared skills: ${sharedSkills.slice(0, 4).join(', ')}.`);
  }
  if (sharedKeywords.length > 0) {
    reasons.push(`Shared keywords: ${sharedKeywords.slice(0, 4).join(', ')}.`);
  }
  if (score <= 0 || reasons.length === 0) {
    return null;
  }
  return {
    objectId: candidate.id,
    type: candidate.type,
    title: getObjectTitle(candidate),
    score: Number(score.toFixed(4)),
    reasons: reasons.map((reason) => reason.slice(0, 240)),
  };
}

function listVisibleCommunityObjects(input: {
  requester: ReturnType<typeof resolveRequester>;
  site: 'io' | 'org';
  maxItems?: number;
}): CommunityObjectRecord[] {
  const maxItems = input.maxItems ?? 400;
  const objects: CommunityObjectRecord[] = [];
  let cursor: string | undefined;
  while (objects.length < maxItems) {
    const listed = listObjectsForRequester({
      request: {
        site: input.site,
        objectType: 'community',
        limit: 100,
        cursor,
      },
      context: toVisibilityContext(input.requester),
    });
    objects.push(...listed.objects.filter((item): item is CommunityObjectRecord => item.objectType === 'community'));
    if (!listed.nextCursor) {
      break;
    }
    cursor = listed.nextCursor;
  }
  return objects.slice(0, maxItems);
}

function getCommunityObjectForRequester(input: {
  objectId: string;
  expectedSite?: 'io' | 'org';
  requester: ReturnType<typeof resolveRequester>;
}): { object: CommunityObjectRecord } | { error: string; status: 400 | 404 } {
  const object = getObjectByIdForRequester(input.objectId, toVisibilityContext(input.requester));
  if (!object || object.objectType !== 'community') {
    return { error: 'Community object not found', status: 404 };
  }
  if (input.expectedSite && object.site !== input.expectedSite) {
    return { error: 'Object site does not match request site', status: 400 };
  }
  return { object };
}

function isActionAllowedForType(
  type: CommunityObjectRecord['type'],
  kind: CommunityActionRequest['kind'],
): boolean {
  if (kind === 'offer_help') {
    return type === 'help_request' || type === 'project_request' || type === 'question';
  }
  if (kind === 'request_mentor') {
    return type === 'mentorship_request' || type === 'apprenticeship_opportunity';
  }
  if (kind === 'ask_for_intro') {
    return (
      type === 'mentorship_request' ||
      type === 'project_request' ||
      type === 'collaboration_offer' ||
      type === 'apprenticeship_opportunity'
    );
  }
  if (kind === 'apply') {
    return type === 'project_request' || type === 'collaboration_offer' || type === 'apprenticeship_opportunity';
  }
  if (kind === 'collaborate') {
    return type === 'collaboration_offer' || type === 'project_request' || type === 'help_request';
  }
  return false;
}

communityRouter.get('/community/objects', (c) => {
  const requester = resolveRequester(c);
  let query: ReturnType<typeof communityListByTypeRequestSchema.parse>;
  try {
    query = parseListByTypeQuery(c);
  } catch {
    return c.json({ ok: false, error: 'Invalid query params' }, 400);
  }

  const listed = listObjectsForRequester({
    request: {
      ...query,
      objectType: 'community',
    },
    context: toVisibilityContext(requester),
  });
  const objects = listed.objects.filter(
    (item): item is CommunityObjectRecord => item.objectType === 'community',
  );
  return c.json({
    ok: true,
    objects,
    nextCursor: listed.nextCursor,
  });
});

communityRouter.get('/community/objects/:id/replies', (c) => {
  const requester = resolveRequester(c);
  const parsed = communityGetWithRepliesRequestSchema.safeParse({
    id: c.req.param('id'),
  });
  if (!parsed.success) {
    return c.json({ ok: false, error: getValidationErrorMessage(parsed.error) }, 400);
  }
  const loaded = getCommunityObjectForRequester({
    objectId: parsed.data.id,
    requester,
  });
  if ('error' in loaded) {
    return c.json({ ok: false, error: loaded.error }, loaded.status);
  }
  const replies = listComments({
    request: {
      site: loaded.object.site,
      targetType: 'object',
      targetId: loaded.object.id,
    },
  });
  return c.json({
    ok: true,
    object: loaded.object,
    replies,
  });
});

communityRouter.post('/community/replies', async (c) => {
  const requester = resolveRequester(c);
  const user = requireResolvedUser(requester);
  if (!user) {
    return c.json({ ok: false, error: 'Not authenticated' }, 401);
  }

  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ ok: false, error: 'Invalid request body' }, 400);
  }
  const parsed = communityReplyRequestSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ ok: false, error: getValidationErrorMessage(parsed.error) }, 400);
  }

  const loaded = getCommunityObjectForRequester({
    objectId: parsed.data.objectId,
    expectedSite: parsed.data.site,
    requester,
  });
  if ('error' in loaded) {
    return c.json({ ok: false, error: loaded.error }, loaded.status);
  }

  const comment = createComment({
    userId: user.id,
    payload: toCommunityReplyCommentRequest(parsed.data),
  });
  return c.json({ ok: true, comment }, 201);
});

communityRouter.post('/community/follows', async (c) => {
  const requester = resolveRequester(c);
  const user = requireResolvedUser(requester);
  if (!user) {
    return c.json({ ok: false, error: 'Not authenticated' }, 401);
  }

  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ ok: false, error: 'Invalid request body' }, 400);
  }
  const parsed = communityFollowRequestSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ ok: false, error: getValidationErrorMessage(parsed.error) }, 400);
  }

  const loaded = getCommunityObjectForRequester({
    objectId: parsed.data.objectId,
    expectedSite: parsed.data.site,
    requester,
  });
  if ('error' in loaded) {
    return c.json({ ok: false, error: loaded.error }, loaded.status);
  }

  const interaction = upsertFollow({
    userId: user.id,
    site: loaded.object.site,
    objectId: loaded.object.id,
  });
  return c.json({ ok: true, interaction });
});

communityRouter.delete('/community/follows', async (c) => {
  const requester = resolveRequester(c);
  const user = requireResolvedUser(requester);
  if (!user) {
    return c.json({ ok: false, error: 'Not authenticated' }, 401);
  }

  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ ok: false, error: 'Invalid request body' }, 400);
  }
  const parsed = communityUnfollowRequestSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ ok: false, error: getValidationErrorMessage(parsed.error) }, 400);
  }

  const removed = removeFollow({
    userId: user.id,
    objectId: parsed.data.objectId,
  });
  return c.json({
    ok: true,
    objectId: parsed.data.objectId,
    kind: 'follow',
    undone: true,
    id: removed.id,
  });
});

communityRouter.post('/community/offers', async (c) => {
  const requester = resolveRequester(c);
  const user = requireResolvedUser(requester);
  if (!user) {
    return c.json({ ok: false, error: 'Not authenticated' }, 401);
  }

  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ ok: false, error: 'Invalid request body' }, 400);
  }
  const parsed = communityOfferHelpRequestSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ ok: false, error: getValidationErrorMessage(parsed.error) }, 400);
  }

  const loaded = getCommunityObjectForRequester({
    objectId: parsed.data.objectId,
    expectedSite: parsed.data.site,
    requester,
  });
  if ('error' in loaded) {
    return c.json({ ok: false, error: loaded.error }, loaded.status);
  }

  const interaction = upsertCommunityInteraction({
    userId: user.id,
    site: loaded.object.site,
    objectId: loaded.object.id,
    kind: 'offer_help',
    body: parsed.data.body,
  });
  return c.json({ ok: true, interaction });
});

communityRouter.post('/community/actions', async (c) => {
  const requester = resolveRequester(c);
  const user = requireResolvedUser(requester);
  if (!user) {
    return c.json({ ok: false, error: 'Not authenticated' }, 401);
  }

  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ ok: false, error: 'Invalid request body' }, 400);
  }
  const parsed = parseCommunityActionRequest(body);
  if (!parsed.data) {
    return c.json({ ok: false, error: parsed.error ?? 'Invalid request body' }, 400);
  }

  const loaded = getCommunityObjectForRequester({
    objectId: parsed.data.objectId,
    expectedSite: parsed.data.site,
    requester,
  });
  if ('error' in loaded) {
    return c.json({ ok: false, error: loaded.error }, loaded.status);
  }
  if (!isActionAllowedForType(loaded.object.type, parsed.data.kind)) {
    return c.json({ ok: false, error: 'Action is not allowed for this community type' }, 400);
  }

  const interaction = upsertCommunityAction({
    userId: user.id,
    site: loaded.object.site,
    objectId: loaded.object.id,
    kind: parsed.data.kind,
    body: parsed.data.body,
  });
  return c.json({ ok: true, interaction });
});

communityRouter.post('/community/joins', async (c) => {
  const requester = resolveRequester(c);
  const user = requireResolvedUser(requester);
  if (!user) {
    return c.json({ ok: false, error: 'Not authenticated' }, 401);
  }

  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ ok: false, error: 'Invalid request body' }, 400);
  }
  const parsed = communityJoinRequestSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ ok: false, error: getValidationErrorMessage(parsed.error) }, 400);
  }

  const loaded = getCommunityObjectForRequester({
    objectId: parsed.data.objectId,
    expectedSite: parsed.data.site,
    requester,
  });
  if ('error' in loaded) {
    return c.json({ ok: false, error: loaded.error }, loaded.status);
  }

  const interaction = upsertCommunityInteraction({
    userId: user.id,
    site: loaded.object.site,
    objectId: loaded.object.id,
    kind: 'join',
    body: parsed.data.body,
  });
  return c.json({ ok: true, interaction });
});

communityRouter.delete('/community/joins', async (c) => {
  const requester = resolveRequester(c);
  const user = requireResolvedUser(requester);
  if (!user) {
    return c.json({ ok: false, error: 'Not authenticated' }, 401);
  }

  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ ok: false, error: 'Invalid request body' }, 400);
  }
  const parsed = communityLeaveRequestSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ ok: false, error: getValidationErrorMessage(parsed.error) }, 400);
  }

  const removed = removeCommunityInteraction({
    userId: user.id,
    objectId: parsed.data.objectId,
    kind: 'join',
  });
  return c.json({
    ok: true,
    objectId: parsed.data.objectId,
    kind: 'join',
    undone: true,
    id: removed.id,
  });
});

communityRouter.get('/community/interactions', (c) => {
  const requester = resolveRequester(c);
  const user = requireResolvedUser(requester);
  if (!user) {
    return c.json({ ok: false, error: 'Not authenticated' }, 401);
  }

  let query: ReturnType<typeof communityInteractionListRequestSchema.parse>;
  try {
    query = parseInteractionListQuery(c);
  } catch {
    return c.json({ ok: false, error: 'Invalid query params' }, 400);
  }

  const listed = listInteractionsForUser({
    userId: user.id,
    request: query,
  });
  return c.json({
    ok: true,
    interactions: listed.interactions,
    nextCursor: listed.nextCursor,
  });
});

communityRouter.post('/community/match', async (c) => {
  const requester = resolveRequester(c);
  const user = requireResolvedUser(requester);
  if (!user) {
    return c.json({ ok: false, error: 'Not authenticated' }, 401);
  }

  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ ok: false, error: 'Invalid request body' }, 400);
  }
  const parsed = matchExperimentRequestSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ ok: false, error: getValidationErrorMessage(parsed.error) }, 400);
  }

  const loaded = getCommunityObjectForRequester({
    objectId: parsed.data.objectId,
    expectedSite: parsed.data.site,
    requester,
  });
  if ('error' in loaded) {
    return c.json({ ok: false, error: loaded.error }, loaded.status);
  }

  if (parsed.data.type && loaded.object.type !== parsed.data.type) {
    return c.json({ ok: false, error: 'Requested type does not match object type' }, 400);
  }

  const candidates = listVisibleCommunityObjects({
    requester,
    site: parsed.data.site,
  })
    .map((item) => scoreMatchCandidate(loaded.object, item))
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .sort((left, right) => right.score - left.score || left.objectId.localeCompare(right.objectId))
    .slice(0, parsed.data.limit);

  recordMatchRun({
    userId: user.id,
    site: parsed.data.site,
    objectId: loaded.object.id,
    candidateCount: candidates.length,
    metadata: {
      sourceType: loaded.object.type,
      limit: parsed.data.limit,
    },
  });

  const response = matchExperimentResponseSchema.parse({
    experimental: true,
    objectId: loaded.object.id,
    type: loaded.object.type,
    generatedAt: new Date().toISOString(),
    candidates,
    note: 'Experimental deterministic matcher using type compatibility and overlap signals.',
  });
  return c.json(response);
});

communityRouter.post('/community/match/feedback', async (c) => {
  const requester = resolveRequester(c);
  const user = requireResolvedUser(requester);
  if (!user) {
    return c.json({ ok: false, error: 'Not authenticated' }, 401);
  }

  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ ok: false, error: 'Invalid request body' }, 400);
  }
  const parsed = matchFeedbackRequestSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ ok: false, error: getValidationErrorMessage(parsed.error) }, 400);
  }
  if (parsed.data.objectId === parsed.data.candidateObjectId) {
    return c.json({ ok: false, error: 'candidateObjectId must differ from objectId' }, 400);
  }

  const source = getCommunityObjectForRequester({
    objectId: parsed.data.objectId,
    expectedSite: parsed.data.site,
    requester,
  });
  if ('error' in source) {
    return c.json({ ok: false, error: source.error }, source.status);
  }
  const candidate = getCommunityObjectForRequester({
    objectId: parsed.data.candidateObjectId,
    expectedSite: parsed.data.site,
    requester,
  });
  if ('error' in candidate) {
    return c.json({ ok: false, error: candidate.error }, candidate.status);
  }

  upsertMatchFeedback({
    userId: user.id,
    site: parsed.data.site,
    objectId: parsed.data.objectId,
    candidateObjectId: parsed.data.candidateObjectId,
    verdict: parsed.data.verdict,
  });
  return c.json(matchFeedbackResponseSchema.parse({ ok: true, recorded: true }));
});

export default communityRouter;
