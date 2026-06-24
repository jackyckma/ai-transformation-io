import {
  communityFollowRequestSchema,
  communityGetWithRepliesRequestSchema,
  communityInteractionListRequestSchema,
  communityJoinRequestSchema,
  communityLeaveRequestSchema,
  communityListByTypeRequestSchema,
  communityMatchRequestSchema,
  communityOfferHelpRequestSchema,
  communityReplyRequestSchema,
  communityUnfollowRequestSchema,
  isCommunityPhase2ReservedType,
  toCommunityReplyCommentRequest,
  type CommunityObjectRecord,
} from '@ai-transformation/shared';
import { Hono } from 'hono';

import {
  listInteractionsForUser,
  removeCommunityInteraction,
  removeFollow,
  upsertCommunityInteraction,
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
  const parsed = communityMatchRequestSchema.safeParse(body);
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

  if (
    parsed.data.type &&
    isCommunityPhase2ReservedType(loaded.object.type) &&
    loaded.object.type !== parsed.data.type
  ) {
    return c.json({ ok: false, error: 'Requested type does not match object type' }, 400);
  }

  const reservedType = parsed.data.type ?? (isCommunityPhase2ReservedType(loaded.object.type) ? loaded.object.type : undefined);
  if (!reservedType) {
    return c.json({ ok: false, error: 'Match is reserved for Phase 2 community types' }, 400);
  }

  return c.json({
    ok: true,
    reserved: true,
    message: 'Match is reserved for Phase 2 community types. No matching workflow runs yet.',
    objectId: loaded.object.id,
    action: 'match',
    type: reservedType,
  });
});

export default communityRouter;
