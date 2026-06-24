import {
  apprenticeshipInterestPayloadSchema,
  inquiryPayloadSchema,
  promptReplyPayloadSchema,
  storyPayloadSchema,
} from '@ai-transformation/shared';
import { Hono } from 'hono';

import {
  getContributionById,
  getCurrentPrompt,
  getPromptById,
  insertContribution,
  listPublishedStories,
  listStoriesForModeration,
  type UserRow,
  updateContributionModeration,
} from '../../db/index.js';
import { isAdmin } from '../../lib/admin.js';
import type { SessionVariables } from '../../types/session.js';

const harvestRouter = new Hono<{ Variables: SessionVariables }>();
const allowedStoryModerationStatuses = ['reviewed', 'published', 'featured', 'archived', 'spam'] as const;
type StoryModerationStatus = (typeof allowedStoryModerationStatuses)[number];

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
  const flattenedMessage =
    flattened.formErrors[0] ??
    Object.values(flattened.fieldErrors).flat()[0] ??
    'Invalid request body';
  return flattenedMessage;
}

function toUrlSafeSlug(input: string): string {
  const slug = input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90);
  if (slug.length > 0) {
    return slug;
  }
  return 'story';
}

function createStorySlug(title: string): string {
  const base = toUrlSafeSlug(title);
  const suffix = crypto.randomUUID().replace(/-/g, '').slice(0, 8);
  return `${base}-${suffix}`;
}

function getAuthenticatedUser(c: {
  get: (key: 'user') => UserRow | null;
  json: (body: unknown, status?: number) => Response;
}): UserRow | Response {
  const user = c.get('user');
  if (!user) {
    return c.json({ ok: false, error: 'Not authenticated' }, 401);
  }
  return user;
}

function parseStoryModerationBody(body: unknown):
  | { ok: true; data: { status: StoryModerationStatus; publishedSlug?: string } }
  | { ok: false; error: string } {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, error: 'Invalid request body' };
  }
  const record = body as Record<string, unknown>;
  const status = record.status;
  if (typeof status !== 'string' || !allowedStoryModerationStatuses.includes(status as StoryModerationStatus)) {
    return { ok: false, error: 'Invalid status' };
  }
  const publishedSlug = record.publishedSlug;
  if (publishedSlug !== undefined && (typeof publishedSlug !== 'string' || publishedSlug.trim().length === 0)) {
    return { ok: false, error: 'Invalid publishedSlug' };
  }

  return {
    ok: true,
    data: {
      status: status as StoryModerationStatus,
      publishedSlug: publishedSlug === undefined ? undefined : publishedSlug.trim(),
    },
  };
}

harvestRouter.post('/inquiries', async (c) => {
  const body = await c.req.json();
  const parsed = inquiryPayloadSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ ok: false, error: getValidationErrorMessage(parsed.error) }, 400);
  }

  const id = crypto.randomUUID();
  const user = c.get('user');
  insertContribution({
    id,
    source: 'web_inquiry',
    site: parsed.data.site ?? null,
    userId: user?.id,
    email: parsed.data.email,
    name: parsed.data.name ?? null,
    body: parsed.data.question,
    status: 'new',
    metadata: '{}',
    createdAt: new Date().toISOString(),
  });

  return c.json({ ok: true, id }, 201);
});

harvestRouter.post('/apprenticeship/interest', async (c) => {
  const body = await c.req.json();
  const parsed = apprenticeshipInterestPayloadSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ ok: false, error: getValidationErrorMessage(parsed.error) }, 400);
  }

  const note = parsed.data.note?.trim();
  const id = crypto.randomUUID();
  const user = c.get('user');
  insertContribution({
    id,
    source: 'apprenticeship_interest',
    site: 'org',
    userId: user?.id,
    email: parsed.data.email,
    name: parsed.data.name ?? null,
    subject: 'Apprenticeship interest',
    body: note && note.length > 0 ? note : 'Express interest in apprenticeship program',
    status: 'new',
    metadata: '{}',
    createdAt: new Date().toISOString(),
  });

  return c.json({ ok: true, id }, 201);
});

harvestRouter.post('/stories', async (c) => {
  const authenticated = getAuthenticatedUser(c);
  if (authenticated instanceof Response) {
    return authenticated;
  }

  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ ok: false, error: 'Invalid request body' }, 400);
  }

  const parsed = storyPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ ok: false, error: getValidationErrorMessage(parsed.error) }, 400);
  }

  const id = crypto.randomUUID();
  insertContribution({
    id,
    source: 'web_story',
    status: 'new',
    subject: parsed.data.title,
    body: parsed.data.body,
    site: 'org',
    email: authenticated.email,
    name: parsed.data.name ?? authenticated.name ?? null,
    userId: authenticated.id,
    metadata: '{}',
    createdAt: new Date().toISOString(),
  });

  return c.json({ ok: true, id }, 201);
});

harvestRouter.get('/stories', (c) => {
  const stories = listPublishedStories().map((story) => ({
    id: story.id,
    title: story.title,
    body: story.body,
    name: story.name,
    publishedSlug: story.publishedSlug,
    createdAt: story.createdAt,
    featured: story.featured,
  }));
  return c.json({ ok: true, stories }, 200);
});

harvestRouter.get('/stories/moderation', (c) => {
  const user = c.get('user');
  if (!user) {
    return c.json({ ok: false, error: 'Not authenticated' }, 401);
  }
  if (!isAdmin(user)) {
    return c.json({ ok: false, error: 'Forbidden' }, 403);
  }
  const stories = listStoriesForModeration().map((story) => ({
    id: story.id,
    title: story.title,
    body: story.body,
    name: story.name,
    email: story.email,
    status: story.status,
    publishedSlug: story.publishedSlug,
    createdAt: story.createdAt,
  }));
  return c.json({ ok: true, stories }, 200);
});

harvestRouter.patch('/stories/:id', async (c) => {
  const user = c.get('user');
  if (!user) {
    return c.json({ ok: false, error: 'Not authenticated' }, 401);
  }
  if (!isAdmin(user)) {
    return c.json({ ok: false, error: 'Forbidden' }, 403);
  }

  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ ok: false, error: 'Invalid request body' }, 400);
  }

  const parsed = parseStoryModerationBody(body);
  if (!parsed.ok) {
    return c.json({ ok: false, error: parsed.error }, 400);
  }

  const id = c.req.param('id');
  const existing = getContributionById(id);
  if (!existing || existing.source !== 'web_story') {
    return c.json({ ok: false, error: 'Story not found' }, 404);
  }

  let publishedSlug = parsed.data.publishedSlug ?? existing.publishedSlug;
  if ((parsed.data.status === 'published' || parsed.data.status === 'featured') && !publishedSlug) {
    publishedSlug = createStorySlug(existing.title ?? 'story');
  }

  const reviewedAt = new Date().toISOString();
  updateContributionModeration({
    id: existing.id,
    status: parsed.data.status,
    publishedSlug,
    reviewedBy: user.id,
    reviewedAt,
  });

  const updated = getContributionById(existing.id);
  if (!updated || updated.source !== 'web_story') {
    return c.json({ ok: false, error: 'Story not found' }, 404);
  }

  return c.json(
    {
      ok: true,
      story: {
        id: updated.id,
        title: updated.title ?? '',
        body: updated.body,
        name: updated.name,
        email: updated.email,
        status: updated.status,
        publishedSlug: updated.publishedSlug,
        createdAt: updated.createdAt,
      },
    },
    200,
  );
});

harvestRouter.get('/prompts/current', (c) => {
  const prompt = getCurrentPrompt();
  if (!prompt) {
    return c.json({ ok: true, prompt: null }, 200);
  }
  return c.json(
    {
      ok: true,
      prompt: {
        id: prompt.id,
        question: prompt.question,
        weekOf: prompt.weekOf,
      },
    },
    200,
  );
});

harvestRouter.post('/prompts/:id/replies', async (c) => {
  const authenticated = getAuthenticatedUser(c);
  if (authenticated instanceof Response) {
    return authenticated;
  }

  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ ok: false, error: 'Invalid request body' }, 400);
  }

  const parsed = promptReplyPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ ok: false, error: getValidationErrorMessage(parsed.error) }, 400);
  }

  const promptId = c.req.param('id');
  const prompt = getPromptById(promptId);
  if (!prompt) {
    return c.json({ ok: false, error: 'Prompt not found' }, 404);
  }

  const id = crypto.randomUUID();
  insertContribution({
    id,
    source: 'web_prompt_reply',
    status: 'new',
    body: parsed.data.body,
    site: 'org',
    email: authenticated.email,
    name: authenticated.name ?? null,
    userId: authenticated.id,
    metadata: JSON.stringify({ promptId }),
    createdAt: new Date().toISOString(),
  });

  return c.json({ ok: true, id }, 201);
});

export default harvestRouter;
