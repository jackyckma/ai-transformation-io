import { objectDraftRequestSchema, type EditorialAgentReview } from '@ai-transformation/shared';
import { Hono } from 'hono';

import {
  createPublishedSlug,
  findEditorialSeedObject,
  getObjectById,
  listEditorialDrafts,
  saveObjectDraft,
  updateObjectLifecycle,
} from '../../db/objects.js';
import { isAdmin } from '../../lib/admin.js';
import {
  getValidationErrorMessage,
  normalizeCommunityMetadata,
  requireResolvedUser,
  resolveRequester,
  type Requester,
} from '../objects/index.js';
import type { SessionVariables } from '../../types/session.js';
import { reviewDraft } from './review.js';

const editorialRouter = new Hono<{ Variables: SessionVariables }>();

function isAdminSession(requester: Requester): boolean {
  return Boolean(requester.sessionUser) && isAdmin(requester.sessionUser);
}

function requireAdmin(requester: Requester):
  | { ok: true }
  | { ok: false; status: 401 | 403; error: string } {
  const user = requireResolvedUser(requester);
  if (!user) {
    return { ok: false, status: 401, error: 'Not authenticated' };
  }
  if (!isAdmin(user)) {
    return { ok: false, status: 403, error: 'Forbidden' };
  }
  return { ok: true };
}

function bodyExcerpt(body: string, max = 280): string {
  const trimmed = body.replace(/\s+/g, ' ').trim();
  if (trimmed.length <= max) {
    return trimmed;
  }
  return `${trimmed.slice(0, max - 1)}…`;
}

function draftListItem(draft: NonNullable<ReturnType<typeof getObjectById>>) {
  return {
    id: draft.id,
    objectType: draft.objectType,
    type: draft.type,
    site: draft.site,
    title: draft.title ?? draft.subject ?? null,
    bodyExcerpt: bodyExcerpt(draft.body),
    status: draft.status,
    visibility: draft.visibility,
    publishedSlug: draft.publishedSlug,
    createdAt: draft.createdAt,
    metadata: draft.metadata,
  };
}

function draftDetail(draft: NonNullable<ReturnType<typeof getObjectById>>) {
  return {
    ...draftListItem(draft),
    body: draft.body,
    updatedAt: draft.updatedAt,
  };
}

function isEditorialDraft(draft: NonNullable<ReturnType<typeof getObjectById>>): boolean {
  const source = draft.metadata?.editorial_source;
  return typeof source === 'string' && source.length > 0;
}

editorialRouter.post('/drafts', async (c) => {
  const requester = resolveRequester(c);
  const adminSession = isAdminSession(requester);
  if (!adminSession && !requester.isBearerAuthenticated) {
    if (requester.sessionUser) {
      return c.json({ ok: false, error: 'Forbidden' }, 403);
    }
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

  const normalizedMetadata = normalizeCommunityMetadata(
    parsed.data.objectType,
    parsed.data.type,
    parsed.data.metadata,
  );
  if (normalizedMetadata.error) {
    return c.json({ ok: false, error: normalizedMetadata.error }, 400);
  }

  const ownerUserId = adminSession
    ? requester.sessionUser?.id ?? null
    : requester.bearerOwnerUser?.id ?? null;

  const editorialMetadata: Record<string, unknown> = {
    ...(normalizedMetadata.metadata ?? {}),
    editorial_source: adminSession ? 'admin_session' : 'bearer',
  };
  if (!adminSession && requester.bearerEmail) {
    editorialMetadata.editorial_author_email = requester.bearerEmail;
  }

  const object = saveObjectDraft({
    payload: {
      ...parsed.data,
      status: 'draft',
      metadata: editorialMetadata,
    },
    ownerUserId,
  });
  if (!object) {
    return c.json({ ok: false, error: 'Object not found' }, 404);
  }
  return c.json({ ok: true, object }, 201);
});

editorialRouter.get('/drafts', (c) => {
  const requester = resolveRequester(c);
  const gate = requireAdmin(requester);
  if (!gate.ok) {
    return c.json({ ok: false, error: gate.error }, gate.status);
  }

  const siteQuery = c.req.query('site');
  const site = siteQuery === 'io' || siteQuery === 'org' ? siteQuery : undefined;
  const drafts = listEditorialDrafts({ site });

  return c.json({
    ok: true,
    drafts: drafts.map((draft) => draftListItem(draft)),
  });
});

editorialRouter.get('/drafts/:id', (c) => {
  const requester = resolveRequester(c);
  const gate = requireAdmin(requester);
  if (!gate.ok) {
    return c.json({ ok: false, error: gate.error }, gate.status);
  }

  const id = c.req.param('id');
  const draft = getObjectById(id);
  if (!draft || !isEditorialDraft(draft)) {
    return c.json({ ok: false, error: 'Draft not found' }, 404);
  }
  if (draft.status !== 'draft' && draft.status !== 'pending') {
    return c.json({ ok: false, error: 'Draft not found' }, 404);
  }

  return c.json({ ok: true, draft: draftDetail(draft) });
});

editorialRouter.post('/review-pending', async (c) => {
  const requester = resolveRequester(c);
  const gate = requireAdmin(requester);
  if (!gate.ok) {
    return c.json({ ok: false, error: gate.error }, gate.status);
  }

  const scope: { site?: 'io' | 'org'; limit?: number } = {};
  try {
    const raw = await c.req.json();
    if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
      const value = raw as Record<string, unknown>;
      if (value.site === 'io' || value.site === 'org') {
        scope.site = value.site;
      }
      if (typeof value.limit === 'number' && Number.isFinite(value.limit)) {
        scope.limit = value.limit;
      }
    }
  } catch {
    // Body is optional — default to all pending/draft editorial drafts.
  }

  const drafts = listEditorialDrafts({ site: scope.site, limit: scope.limit });
  const results: Array<{ id: string; editorial_agent: EditorialAgentReview }> = [];
  for (const draft of drafts) {
    const review = await reviewDraft({
      title: draft.title ?? draft.subject ?? null,
      body: draft.body,
      objectType: draft.objectType,
      type: draft.type,
    });
    updateObjectLifecycle({
      id: draft.id,
      status: draft.status,
      metadata: { ...draft.metadata, editorial_agent: review },
    });
    results.push({ id: draft.id, editorial_agent: review });
  }

  return c.json({ ok: true, reviewed: results.length, results });
});

editorialRouter.post('/drafts/:id/review', async (c) => {
  const requester = resolveRequester(c);
  const gate = requireAdmin(requester);
  if (!gate.ok) {
    return c.json({ ok: false, error: gate.error }, gate.status);
  }

  const id = c.req.param('id');
  const draft = getObjectById(id);
  if (!draft || !isEditorialDraft(draft)) {
    return c.json({ ok: false, error: 'Draft not found' }, 404);
  }
  if (draft.status !== 'draft' && draft.status !== 'pending') {
    return c.json({ ok: false, error: 'Draft not found' }, 404);
  }

  const review = await reviewDraft({
    title: draft.title ?? draft.subject ?? null,
    body: draft.body,
    objectType: draft.objectType,
    type: draft.type,
  });
  const updated = updateObjectLifecycle({
    id: draft.id,
    status: draft.status,
    metadata: { ...draft.metadata, editorial_agent: review },
  });
  if (!updated) {
    return c.json({ ok: false, error: 'Draft not found' }, 404);
  }
  return c.json({ ok: true, draft: draftDetail(updated) });
});

editorialRouter.post('/drafts/:id/approve', (c) => {
  const requester = resolveRequester(c);
  const gate = requireAdmin(requester);
  if (!gate.ok) {
    return c.json({ ok: false, error: gate.error }, gate.status);
  }

  const id = c.req.param('id');
  const existing = getObjectById(id);
  if (!existing) {
    return c.json({ ok: false, error: 'Draft not found' }, 404);
  }

  const publishedSlug =
    existing.publishedSlug ?? createPublishedSlug(existing.subject ?? existing.title ?? existing.type);
  const published = updateObjectLifecycle({
    id: existing.id,
    status: 'published',
    publishedSlug,
    metadata: {
      ...existing.metadata,
      editorial_review: 'approved',
    },
  });
  if (!published) {
    return c.json({ ok: false, error: 'Draft not found' }, 404);
  }
  return c.json({ ok: true, object: published });
});

editorialRouter.post('/drafts/:id/reject', (c) => {
  const requester = resolveRequester(c);
  const gate = requireAdmin(requester);
  if (!gate.ok) {
    return c.json({ ok: false, error: gate.error }, gate.status);
  }

  const id = c.req.param('id');
  const existing = getObjectById(id);
  if (!existing) {
    return c.json({ ok: false, error: 'Draft not found' }, 404);
  }

  const rejected = updateObjectLifecycle({
    id: existing.id,
    status: 'archived',
    metadata: {
      ...existing.metadata,
      editorial_review: 'rejected',
    },
  });
  if (!rejected) {
    return c.json({ ok: false, error: 'Draft not found' }, 404);
  }
  return c.json({ ok: true, object: rejected });
});

export default editorialRouter;
