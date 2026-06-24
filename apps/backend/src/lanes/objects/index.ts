import { randomUUID } from 'node:crypto';

import {
  agentContributionWriteSchema,
  contributionCreateRequestSchema,
  contributionDraftRequestSchema,
  contributionSubmitRequestSchema,
  derivedArticleDraftRequestSchema,
  moderationQueueListRequestSchema,
  moderationTransitionRequestSchema,
  objectCreateRequestSchema,
  objectDraftRequestSchema,
  objectGetRequestSchema,
  objectListRequestSchema,
  objectSubmitRequestSchema,
  profileSetRequestSchema,
  publishPreferenceSetRequestSchema,
  type Site,
} from '@ai-transformation/shared';
import { Hono } from 'hono';

import { verifyWriteToken } from '../../db/agent-protocol.js';
import { getCurrentPrompt, getUserByEmail, insertContribution, type UserRow } from '../../db/index.js';
import {
  createContribution,
  createDerivedArticleFromDiscussion,
  createObject,
  getContributionByIdForObjectsLane,
  getObjectByIdForRequester,
  getProfile,
  getPublishPreference,
  listModerationQueue,
  listObjectsForRequester,
  saveContributionDraft,
  saveObjectDraft,
  setProfile,
  setPublishPreference,
  submitContribution,
  submitObject,
  transitionModerationItem,
  type VisibilityQueryContext,
} from '../../db/objects.js';
import { isAdmin } from '../../lib/admin.js';
import type { SessionVariables } from '../../types/session.js';

const objectsRouter = new Hono<{ Variables: SessionVariables }>();

function resolveSite(c: { req: { header: (name: string) => string | undefined; query: (name: string) => string | undefined } }): Site {
  const querySite = c.req.query('site');
  if (querySite === 'io' || querySite === 'org') {
    return querySite;
  }
  const host = c.req.header('x-forwarded-host') ?? c.req.header('host') ?? '';
  const normalized = host.split(',')[0]?.trim().split(':')[0]?.toLowerCase() ?? '';
  return normalized.includes('ai-transformation.org') ? 'org' : 'io';
}

function parseBearer(authHeader: string | undefined): string | null {
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.slice('Bearer '.length).trim();
  return token.length > 0 ? token : null;
}

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

function getValidationErrorMessage(error: {
  issues: Array<{ message: string }>;
  flatten: () => {
    formErrors: string[];
    fieldErrors: Record<string, string[] | undefined>;
  };
}): string {
  const firstIssue = error.issues[0]?.message;
  if (firstIssue) {
    return firstIssue;
  }
  const flattened = error.flatten();
  return flattened.formErrors[0] ?? Object.values(flattened.fieldErrors).flat()[0] ?? 'Invalid request body';
}

function getSessionUser(c: { get: (key: 'user') => UserRow | null | undefined }): UserRow | null {
  const user = c.get('user');
  return user ?? null;
}

type Requester = {
  site: Site;
  sessionUser: UserRow | null;
  bearerEmail: string | null;
  bearerOwnerUser: UserRow | null;
  isBearerAuthenticated: boolean;
};

function resolveRequester(c: {
  req: {
    header: (name: string) => string | undefined;
    query: (name: string) => string | undefined;
  };
  get: (key: 'user') => UserRow | null | undefined;
}): Requester {
  const site = resolveSite(c);
  const sessionUser = getSessionUser(c);
  const bearer = parseBearer(c.req.header('authorization'));
  const token = bearer ? verifyWriteToken(bearer) : null;
  const bearerEmail = token?.email ?? null;
  const bearerOwnerUser = bearerEmail ? getUserByEmail(bearerEmail) : null;
  return {
    site,
    sessionUser,
    bearerEmail,
    bearerOwnerUser,
    isBearerAuthenticated: Boolean(token),
  };
}

function toVisibilityContext(requester: Requester): VisibilityQueryContext {
  return {
    site: requester.site,
    requesterUserId: requester.sessionUser?.id ?? null,
    bearerOwnerUserId: requester.bearerOwnerUser?.id ?? null,
    isAuthenticated: Boolean(requester.sessionUser) || requester.isBearerAuthenticated,
  };
}

function requireAuthenticated(requester: Requester): { userId: string | null; email: string | null; name: string | null } | null {
  if (requester.sessionUser) {
    return {
      userId: requester.sessionUser.id,
      email: requester.sessionUser.email,
      name: requester.sessionUser.name,
    };
  }
  if (requester.isBearerAuthenticated && requester.bearerEmail) {
    return {
      userId: requester.bearerOwnerUser?.id ?? null,
      email: requester.bearerEmail,
      name: requester.bearerOwnerUser?.name ?? null,
    };
  }
  return null;
}

function requireResolvedUser(requester: Requester): UserRow | null {
  if (requester.sessionUser) {
    return requester.sessionUser;
  }
  return requester.bearerOwnerUser ?? null;
}

function parseObjectListQuery(c: {
  req: { query: (name: string) => string | undefined };
}): ReturnType<typeof objectListRequestSchema.parse> {
  return objectListRequestSchema.parse({
    site: c.req.query('site'),
    objectType: c.req.query('objectType'),
    type: c.req.query('type'),
    mine: parseBoolean(c.req.query('mine')),
    visibility: c.req.query('visibility'),
    status: c.req.query('status'),
    limit: parseInteger(c.req.query('limit')),
    cursor: c.req.query('cursor'),
  });
}

function parseModerationListQuery(c: {
  req: { query: (name: string) => string | undefined };
}): ReturnType<typeof moderationQueueListRequestSchema.parse> {
  return moderationQueueListRequestSchema.parse({
    site: c.req.query('site'),
    objectType: c.req.query('objectType'),
    type: c.req.query('type'),
    status: c.req.query('status'),
    visibility: c.req.query('visibility'),
    limit: parseInteger(c.req.query('limit')),
    cursor: c.req.query('cursor'),
  });
}

objectsRouter.get('/objects', (c) => {
  const requester = resolveRequester(c);
  let query: ReturnType<typeof objectListRequestSchema.parse>;
  try {
    query = parseObjectListQuery(c);
  } catch {
    return c.json({ ok: false, error: 'Invalid query params' }, 400);
  }
  const listed = listObjectsForRequester({
    request: query,
    context: toVisibilityContext(requester),
  });
  return c.json({
    ok: true,
    objects: listed.objects,
    nextCursor: listed.nextCursor,
  });
});

objectsRouter.get('/objects/:id', (c) => {
  const requester = resolveRequester(c);
  const parsed = objectGetRequestSchema.safeParse({
    id: c.req.param('id'),
  });
  if (!parsed.success) {
    return c.json({ ok: false, error: getValidationErrorMessage(parsed.error) }, 400);
  }
  const object = getObjectByIdForRequester(parsed.data.id, toVisibilityContext(requester));
  if (!object) {
    return c.json({ ok: false, error: 'Object not found' }, 404);
  }
  return c.json({
    ok: true,
    object,
  });
});

objectsRouter.post('/objects', async (c) => {
  const requester = resolveRequester(c);
  const authenticated = requireAuthenticated(requester);
  if (!authenticated) {
    return c.json({ ok: false, error: 'Not authenticated' }, 401);
  }
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ ok: false, error: 'Invalid request body' }, 400);
  }
  const parsed = objectCreateRequestSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ ok: false, error: getValidationErrorMessage(parsed.error) }, 400);
  }
  if (parsed.data.visibility === 'private' && !authenticated.userId) {
    return c.json({ ok: false, error: 'Private visibility requires a mapped owner.' }, 403);
  }
  const object = createObject({
    payload: {
      ...parsed.data,
      status: parsed.data.status ?? 'draft',
    },
    ownerUserId: authenticated.userId,
  });
  return c.json({ ok: true, object }, 201);
});

objectsRouter.post('/objects/drafts', async (c) => {
  const requester = resolveRequester(c);
  const authenticated = requireAuthenticated(requester);
  if (!authenticated) {
    return c.json({ ok: false, error: 'Not authenticated' }, 401);
  }
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ ok: false, error: 'Invalid request body' }, 400);
  }
  const parsed = objectDraftRequestSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ ok: false, error: getValidationErrorMessage(parsed.error) }, 400);
  }
  if (parsed.data.visibility === 'private' && !authenticated.userId) {
    return c.json({ ok: false, error: 'Private visibility requires a mapped owner.' }, 403);
  }
  const object = saveObjectDraft({
    payload: parsed.data,
    ownerUserId: authenticated.userId,
  });
  if (!object) {
    return c.json({ ok: false, error: 'Object not found' }, 404);
  }
  return c.json({ ok: true, object });
});

objectsRouter.post('/objects/submit', async (c) => {
  const requester = resolveRequester(c);
  const authenticated = requireAuthenticated(requester);
  if (!authenticated) {
    return c.json({ ok: false, error: 'Not authenticated' }, 401);
  }
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ ok: false, error: 'Invalid request body' }, 400);
  }
  const parsed = objectSubmitRequestSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ ok: false, error: getValidationErrorMessage(parsed.error) }, 400);
  }
  const resolvedUser = requireResolvedUser(requester);
  const publishMode = parsed.data.publishMode ?? (resolvedUser ? getPublishPreference(resolvedUser.id).defaultPublishMode : 'review');
  const submitted = submitObject({
    objectId: parsed.data.objectId,
    publishMode,
    visibilityOverride: parsed.data.visibility,
    requesterUserId: requester.sessionUser?.id ?? null,
    bearerOwnerUserId: requester.bearerOwnerUser?.id ?? null,
  });
  if (!submitted) {
    return c.json({ ok: false, error: 'Object not found' }, 404);
  }
  return c.json({ ok: true, object: submitted.object });
});

objectsRouter.post('/objects/derive-article', async (c) => {
  const requester = resolveRequester(c);
  const authenticated = requireAuthenticated(requester);
  if (!authenticated) {
    return c.json({ ok: false, error: 'Not authenticated' }, 401);
  }
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ ok: false, error: 'Invalid request body' }, 400);
  }
  const parsed = derivedArticleDraftRequestSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ ok: false, error: getValidationErrorMessage(parsed.error) }, 400);
  }
  const visibility = parsed.data.visibility ?? 'members-only';
  const object = createDerivedArticleFromDiscussion({
    sourceDiscussionObjectId: parsed.data.sourceDiscussionObjectId,
    visibility,
    requesterUserId: requester.sessionUser?.id ?? null,
    bearerOwnerUserId: requester.bearerOwnerUser?.id ?? null,
  });
  if (!object) {
    return c.json({ ok: false, error: 'Source discussion not found' }, 404);
  }
  return c.json({ ok: true, object }, 201);
});

objectsRouter.post('/contributions', async (c) => {
  const requester = resolveRequester(c);
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ ok: false, error: 'invalid_body' }, 400);
  }

  const legacyParsed = agentContributionWriteSchema.safeParse(body);
  if (legacyParsed.success) {
    const bearer = parseBearer(c.req.header('authorization'));
    if (!bearer) {
      return c.json({ ok: false, error: 'missing_token' }, 401);
    }
    const tokenRow = verifyWriteToken(bearer);
    if (!tokenRow) {
      return c.json({ ok: false, error: 'invalid_token' }, 401);
    }
    const hostSite = requester.site;
    const site = legacyParsed.data.site ?? hostSite;
    if ((legacyParsed.data.type === 'story' || legacyParsed.data.type === 'prompt_reply') && site !== 'org') {
      return c.json(
        { ok: false, error: 'site_restriction', message: 'Stories and prompt replies are .org only.' },
        403,
      );
    }
    const id = randomUUID();
    const createdAt = new Date().toISOString();
    const metadata = JSON.stringify({
      agent_client_id: tokenRow.clientId,
      write_type: legacyParsed.data.type,
      prompt_id: legacyParsed.data.prompt_id ?? null,
    });

    if (legacyParsed.data.type === 'inquiry') {
      insertContribution({
        id,
        source: 'agent',
        site,
        email: tokenRow.email,
        name: legacyParsed.data.name ?? null,
        body: legacyParsed.data.body,
        status: 'new',
        metadata,
        createdAt,
        objectType: 'community',
        type: 'help_request',
        visibility: 'members-only',
      });
    } else if (legacyParsed.data.type === 'story') {
      if (!legacyParsed.data.title) {
        return c.json({ ok: false, error: 'validation_error', message: 'title is required for story' }, 400);
      }
      insertContribution({
        id,
        source: 'agent',
        site: 'org',
        email: tokenRow.email,
        name: legacyParsed.data.name ?? null,
        subject: legacyParsed.data.title,
        body: legacyParsed.data.body,
        status: 'new',
        metadata,
        createdAt,
        objectType: 'knowledge',
        type: 'article',
        visibility: 'public',
      });
    } else {
      const promptId = legacyParsed.data.prompt_id ?? getCurrentPrompt()?.id;
      if (!promptId) {
        return c.json({ ok: false, error: 'no_active_prompt' }, 400);
      }
      insertContribution({
        id,
        source: 'agent',
        site: 'org',
        email: tokenRow.email,
        name: legacyParsed.data.name ?? null,
        subject: `Prompt reply: ${promptId}`,
        body: legacyParsed.data.body,
        status: 'new',
        metadata: JSON.stringify({
          ...JSON.parse(metadata),
          prompt_id: promptId,
        }),
        createdAt,
        objectType: 'community',
        type: 'discussion',
        visibility: 'members-only',
      });
    }

    return c.json({ ok: true, id, status: 'new' }, 201);
  }

  const authenticated = requireAuthenticated(requester);
  if (!authenticated || !authenticated.email) {
    return c.json({ ok: false, error: 'Not authenticated' }, 401);
  }
  const parsed = contributionCreateRequestSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ ok: false, error: getValidationErrorMessage(parsed.error) }, 400);
  }
  if (parsed.data.visibility === 'private' && !authenticated.userId) {
    return c.json({ ok: false, error: 'Private visibility requires a mapped owner.' }, 403);
  }
  const contribution = createContribution({
    payload: {
      ...parsed.data,
      status: parsed.data.status ?? 'draft',
    },
    ownerUserId: authenticated.userId,
    ownerEmail: authenticated.email,
    ownerName: authenticated.name,
    source: parsed.data.source,
  });
  return c.json({ ok: true, contribution }, 201);
});

objectsRouter.post('/contributions/drafts', async (c) => {
  const requester = resolveRequester(c);
  const authenticated = requireAuthenticated(requester);
  if (!authenticated || !authenticated.email) {
    return c.json({ ok: false, error: 'Not authenticated' }, 401);
  }
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ ok: false, error: 'Invalid request body' }, 400);
  }
  const parsed = contributionDraftRequestSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ ok: false, error: getValidationErrorMessage(parsed.error) }, 400);
  }
  if (parsed.data.visibility === 'private' && !authenticated.userId) {
    return c.json({ ok: false, error: 'Private visibility requires a mapped owner.' }, 403);
  }
  const contribution = saveContributionDraft({
    payload: parsed.data,
    ownerUserId: authenticated.userId,
    ownerEmail: authenticated.email,
    ownerName: authenticated.name,
    source: parsed.data.source,
  });
  if (!contribution) {
    return c.json({ ok: false, error: 'Contribution not found' }, 404);
  }
  return c.json({ ok: true, contribution });
});

objectsRouter.post('/contributions/submit', async (c) => {
  const requester = resolveRequester(c);
  const authenticated = requireAuthenticated(requester);
  if (!authenticated) {
    return c.json({ ok: false, error: 'Not authenticated' }, 401);
  }
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ ok: false, error: 'Invalid request body' }, 400);
  }
  const parsed = contributionSubmitRequestSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ ok: false, error: getValidationErrorMessage(parsed.error) }, 400);
  }
  const resolvedUser = requireResolvedUser(requester);
  const publishMode = parsed.data.publishMode ?? (resolvedUser ? getPublishPreference(resolvedUser.id).defaultPublishMode : 'review');
  const submitted = submitContribution({
    contributionId: parsed.data.contributionId,
    publishMode,
    visibilityOverride: parsed.data.visibility,
    requesterUserId: requester.sessionUser?.id ?? null,
    bearerOwnerUserId: requester.bearerOwnerUser?.id ?? null,
  });
  if (!submitted) {
    return c.json({ ok: false, error: 'Contribution not found' }, 404);
  }
  const refreshed = getContributionByIdForObjectsLane(submitted.contribution.id) ?? submitted.contribution;
  return c.json({ ok: true, contribution: refreshed });
});

objectsRouter.get('/moderation/queue', (c) => {
  const requester = resolveRequester(c);
  const adminUser = requireResolvedUser(requester);
  if (!adminUser) {
    return c.json({ ok: false, error: 'Not authenticated' }, 401);
  }
  if (!isAdmin(adminUser)) {
    return c.json({ ok: false, error: 'Forbidden' }, 403);
  }
  let query: ReturnType<typeof moderationQueueListRequestSchema.parse>;
  try {
    query = parseModerationListQuery(c);
  } catch {
    return c.json({ ok: false, error: 'Invalid query params' }, 400);
  }
  const result = listModerationQueue(query);
  return c.json({
    ok: true,
    items: result.items,
    nextCursor: result.nextCursor,
  });
});

objectsRouter.patch('/moderation/queue/:id', async (c) => {
  const requester = resolveRequester(c);
  const adminUser = requireResolvedUser(requester);
  if (!adminUser) {
    return c.json({ ok: false, error: 'Not authenticated' }, 401);
  }
  if (!isAdmin(adminUser)) {
    return c.json({ ok: false, error: 'Forbidden' }, 403);
  }
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ ok: false, error: 'Invalid request body' }, 400);
  }
  const parsed = moderationTransitionRequestSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ ok: false, error: getValidationErrorMessage(parsed.error) }, 400);
  }
  const id = c.req.param('id');
  const item = transitionModerationItem({
    id,
    request: parsed.data,
  });
  if (!item) {
    return c.json({ ok: false, error: 'Item not found' }, 404);
  }
  return c.json({ ok: true, item });
});

objectsRouter.get('/settings/publish-preference', (c) => {
  const requester = resolveRequester(c);
  const user = requireResolvedUser(requester);
  if (!user) {
    return c.json({ ok: false, error: 'Not authenticated' }, 401);
  }
  return c.json({
    ok: true,
    publishPreference: getPublishPreference(user.id),
  });
});

objectsRouter.put('/settings/publish-preference', async (c) => {
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
  const parsed = publishPreferenceSetRequestSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ ok: false, error: getValidationErrorMessage(parsed.error) }, 400);
  }
  const publishPreference = setPublishPreference(user.id, parsed.data.defaultPublishMode);
  return c.json({ ok: true, publishPreference });
});

objectsRouter.get('/profile', (c) => {
  const requester = resolveRequester(c);
  const user = requireResolvedUser(requester);
  if (!user) {
    return c.json({ ok: false, error: 'Not authenticated' }, 401);
  }
  return c.json({
    ok: true,
    profile: getProfile(user.id),
  });
});

objectsRouter.put('/profile', async (c) => {
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
  const parsed = profileSetRequestSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ ok: false, error: getValidationErrorMessage(parsed.error) }, 400);
  }
  const profile = setProfile({
    userId: user.id,
    profile: parsed.data.profile,
    publishMode: parsed.data.publishPreference?.defaultPublishMode,
  });
  return c.json({ ok: true, profile });
});

export default objectsRouter;
