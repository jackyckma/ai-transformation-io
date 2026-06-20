import { mkdtempSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const managedEnvKeys = ['SQLITE_PATH', 'DATABASE_URL', 'ADMIN_EMAILS', 'NODE_ENV'] as const;

const originalEnv = Object.fromEntries(
  managedEnvKeys.map((key) => [key, process.env[key]]),
) as Record<(typeof managedEnvKeys)[number], string | undefined>;

const STORY_BODY =
  'This story describes how the team standardized AI operating reviews across security, legal, and delivery with measurable checkpoints.';

let tempDir = '';

beforeEach(() => {
  tempDir = mkdtempSync(path.join(os.tmpdir(), 'atx-wave5-harvest-'));
  process.env.SQLITE_PATH = path.join(tempDir, 'app.db');
  delete process.env.DATABASE_URL;
  delete process.env.ADMIN_EMAILS;
  process.env.NODE_ENV = 'test';
});

afterEach(async () => {
  try {
    const dbModule = await import('../../db/index.js');
    dbModule.closeDbForTests();
  } catch {
    // no-op
  }
  rmSync(tempDir, { recursive: true, force: true });
  for (const key of managedEnvKeys) {
    if (originalEnv[key] === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = originalEnv[key];
    }
  }
});

async function loadBackend() {
  vi.resetModules();
  const dbModule = await import('../../db/index.js');
  const backendModule = await import('../../index.js');
  return {
    app: backendModule.app,
    db: dbModule,
  };
}

describe('Wave 5 harvest backend', () => {
  it('returns 401 for anonymous POST /api/stories', async () => {
    const { app } = await loadBackend();
    const response = await app.request('http://localhost/api/stories', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        title: 'Story title',
        body: STORY_BODY,
      }),
    });
    expect(response.status).toBe(401);
  });

  it('creates story for authenticated user and exposes it in moderation for admin', async () => {
    const { app, db } = await loadBackend();
    const user = db.upsertUserByGoogle({
      googleSub: 'google-sub-story-author',
      email: 'author@example.com',
      name: 'Author Name',
      picture: null,
    });
    const session = db.createSession(user.id, 60_000);
    process.env.ADMIN_EMAILS = '  AUTHOR@example.com ';

    const createResponse = await app.request('http://localhost/api/stories', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        cookie: `atx_session=${session.id}`,
      },
      body: JSON.stringify({
        title: 'My AI rollout journal',
        body: STORY_BODY,
      }),
    });
    expect(createResponse.status).toBe(201);
    const createJson = (await createResponse.json()) as { ok: true; id: string };
    expect(createJson.ok).toBe(true);

    const createdRow = db.getContributionById(createJson.id);
    expect(createdRow?.source).toBe('web_story');
    expect(createdRow?.status).toBe('new');
    expect(createdRow?.email).toBe('author@example.com');
    expect(createdRow?.title).toBe('My AI rollout journal');

    const moderationResponse = await app.request('http://localhost/api/stories/moderation', {
      headers: {
        cookie: `atx_session=${session.id}`,
      },
    });
    expect(moderationResponse.status).toBe(200);
    const moderationJson = (await moderationResponse.json()) as {
      ok: true;
      stories: Array<{ id: string; status: string }>;
    };
    expect(moderationJson.stories.some((story) => story.id === createJson.id && story.status === 'new')).toBe(
      true,
    );
  });

  it('returns 403 for non-admin moderation access', async () => {
    const { app, db } = await loadBackend();
    const user = db.upsertUserByGoogle({
      googleSub: 'google-sub-story-non-admin',
      email: 'member@example.com',
      name: 'Member',
      picture: null,
    });
    const session = db.createSession(user.id, 60_000);
    process.env.ADMIN_EMAILS = 'admin@example.com';

    const response = await app.request('http://localhost/api/stories/moderation', {
      headers: {
        cookie: `atx_session=${session.id}`,
      },
    });
    expect(response.status).toBe(403);
  });

  it('returns only published/featured stories from GET /api/stories', async () => {
    const { app, db } = await loadBackend();

    db.insertContribution({
      id: crypto.randomUUID(),
      source: 'web_story',
      email: 'writer1@example.com',
      name: 'Writer 1',
      subject: 'Draft story',
      body: STORY_BODY,
      status: 'new',
      metadata: '{}',
      createdAt: '2026-06-19T01:00:00.000Z',
      site: 'org',
      userId: null,
    });
    db.insertContribution({
      id: 'story-featured',
      source: 'web_story',
      email: 'writer2@example.com',
      name: 'Writer 2',
      subject: 'Featured story',
      body: STORY_BODY,
      status: 'featured',
      metadata: '{}',
      publishedSlug: 'featured-story',
      createdAt: '2026-06-19T03:00:00.000Z',
      site: 'org',
      userId: null,
    });
    db.insertContribution({
      id: 'story-published',
      source: 'web_story',
      email: 'writer3@example.com',
      name: 'Writer 3',
      subject: 'Published story',
      body: STORY_BODY,
      status: 'published',
      metadata: '{}',
      publishedSlug: 'published-story',
      createdAt: '2026-06-19T02:00:00.000Z',
      site: 'org',
      userId: null,
    });
    db.insertContribution({
      id: crypto.randomUUID(),
      source: 'web_inquiry',
      email: 'other@example.com',
      name: 'Other',
      body: 'irrelevant inquiry body text',
      status: 'published',
      metadata: '{}',
      createdAt: '2026-06-19T04:00:00.000Z',
      site: 'org',
      userId: null,
    });

    const response = await app.request('http://localhost/api/stories');
    expect(response.status).toBe(200);
    const json = (await response.json()) as {
      ok: true;
      stories: Array<{ id: string; featured: boolean }>;
    };
    expect(json.stories.map((story) => story.id)).toEqual(['story-featured', 'story-published']);
    expect(json.stories[0]?.featured).toBe(true);
    expect(json.stories[1]?.featured).toBe(false);
  });

  it('publishes a story via PATCH and makes it visible in GET /api/stories', async () => {
    const { app, db } = await loadBackend();
    const admin = db.upsertUserByGoogle({
      googleSub: 'google-sub-admin-story',
      email: 'admin@example.com',
      name: 'Admin',
      picture: null,
    });
    const adminSession = db.createSession(admin.id, 60_000);
    process.env.ADMIN_EMAILS = 'admin@example.com';

    const createResponse = await app.request('http://localhost/api/stories', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        cookie: `atx_session=${adminSession.id}`,
      },
      body: JSON.stringify({
        title: 'AI playbook from pilot to operations',
        body: STORY_BODY,
      }),
    });
    const createJson = (await createResponse.json()) as { id: string };

    const patchResponse = await app.request(`http://localhost/api/stories/${createJson.id}`, {
      method: 'PATCH',
      headers: {
        'content-type': 'application/json',
        cookie: `atx_session=${adminSession.id}`,
      },
      body: JSON.stringify({
        status: 'published',
      }),
    });
    expect(patchResponse.status).toBe(200);
    const patchJson = (await patchResponse.json()) as {
      ok: true;
      story: { id: string; status: string; publishedSlug: string | null };
    };
    expect(patchJson.story.status).toBe('published');
    expect(patchJson.story.publishedSlug).toMatch(/^ai-playbook-from-pilot-to-operations-/);

    const storiesResponse = await app.request('http://localhost/api/stories');
    const storiesJson = (await storiesResponse.json()) as {
      ok: true;
      stories: Array<{ id: string; title: string }>;
    };
    expect(storiesJson.stories.some((story) => story.id === createJson.id)).toBe(true);
  });

  it('returns seeded current prompt and handles prompt replies', async () => {
    const { app, db } = await loadBackend();
    const user = db.upsertUserByGoogle({
      googleSub: 'google-sub-prompt-reply',
      email: 'replier@example.com',
      name: 'Replier',
      picture: null,
    });
    const session = db.createSession(user.id, 60_000);

    const currentResponse = await app.request('http://localhost/api/prompts/current');
    expect(currentResponse.status).toBe(200);
    const currentJson = (await currentResponse.json()) as {
      ok: true;
      prompt: { id: string; question: string; weekOf: string | null } | null;
    };
    expect(currentJson.prompt).not.toBeNull();
    expect(currentJson.prompt?.id).toBe('prompt-2026-w25');

    const replyResponse = await app.request(`http://localhost/api/prompts/${currentJson.prompt?.id}/replies`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        cookie: `atx_session=${session.id}`,
      },
      body: JSON.stringify({
        body: 'We now review model lifecycle responsibilities every month with cross-functional leads.',
      }),
    });
    expect(replyResponse.status).toBe(201);
    const replyJson = (await replyResponse.json()) as { ok: true; id: string };

    const replyRow = db.getContributionById(replyJson.id);
    expect(replyRow?.source).toBe('web_prompt_reply');
    expect(replyRow?.status).toBe('new');
    expect(JSON.parse(replyRow?.metadata ?? '{}')).toEqual({ promptId: currentJson.prompt?.id });

    const unknownPromptResponse = await app.request('http://localhost/api/prompts/prompt-missing/replies', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        cookie: `atx_session=${session.id}`,
      },
      body: JSON.stringify({
        body: 'This body is valid but prompt id does not exist.',
      }),
    });
    expect(unknownPromptResponse.status).toBe(404);
  });

  it('returns 400 for invalid bodies on story and prompt reply endpoints', async () => {
    const { app, db } = await loadBackend();
    const user = db.upsertUserByGoogle({
      googleSub: 'google-sub-invalid-body',
      email: 'invalid@example.com',
      name: 'Invalid Case',
      picture: null,
    });
    const session = db.createSession(user.id, 60_000);

    const invalidStory = await app.request('http://localhost/api/stories', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        cookie: `atx_session=${session.id}`,
      },
      body: JSON.stringify({
        title: 'Bad',
        body: 'too short',
      }),
    });
    expect(invalidStory.status).toBe(400);

    const invalidReply = await app.request('http://localhost/api/prompts/prompt-2026-w24/replies', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        cookie: `atx_session=${session.id}`,
      },
      body: JSON.stringify({
        body: 'short',
      }),
    });
    expect(invalidReply.status).toBe(400);
  });
});
