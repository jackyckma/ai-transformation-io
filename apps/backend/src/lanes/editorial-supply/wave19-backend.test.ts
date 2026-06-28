import { mkdtempSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const managedEnvKeys = [
  'SQLITE_PATH',
  'DATABASE_URL',
  'NODE_ENV',
  'ADMIN_EMAILS',
  'MINIMAX_API_KEY',
  'CHAT_LLM_API_KEY',
  'OPENAI_API_KEY',
  'CHAT_LLM_BASE_URL',
  'OPENAI_BASE_URL',
] as const;

const originalEnv = Object.fromEntries(
  managedEnvKeys.map((key) => [key, process.env[key]]),
) as Record<(typeof managedEnvKeys)[number], string | undefined>;

let tempDir = '';

beforeEach(() => {
  tempDir = mkdtempSync(path.join(os.tmpdir(), 'atx-wave19-'));
  process.env.SQLITE_PATH = path.join(tempDir, 'app.db');
  delete process.env.DATABASE_URL;
  delete process.env.ADMIN_EMAILS;
  delete process.env.MINIMAX_API_KEY;
  delete process.env.CHAT_LLM_API_KEY;
  delete process.env.OPENAI_API_KEY;
  delete process.env.CHAT_LLM_BASE_URL;
  delete process.env.OPENAI_BASE_URL;
  process.env.NODE_ENV = 'test';
});

afterEach(async () => {
  vi.restoreAllMocks();
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
  const objectsDbModule = await import('../../db/objects.js');
  const backendModule = await import('../../index.js');
  return {
    app: backendModule.app,
    db: dbModule,
    objectsDb: objectsDbModule,
  };
}

const ADMIN_EMAIL = 'founder@example.com';

const KNOWLEDGE_DRAFT = {
  objectType: 'knowledge',
  type: 'article',
  site: 'org',
  visibility: 'public',
  title: 'Draft knowledge article',
  body: 'A drafted knowledge article about redesigning workflows around AI before scaling.',
} as const;

async function createAdminDraft(
  app: Awaited<ReturnType<typeof loadBackend>>['app'],
  sessionId: string,
): Promise<{ id: string }> {
  const response = await app.request('http://localhost/api/internal/editorial/drafts', {
    method: 'POST',
    headers: {
      host: 'ai-transformation.org',
      'content-type': 'application/json',
      cookie: `atx_session=${sessionId}`,
    },
    body: JSON.stringify(KNOWLEDGE_DRAFT),
  });
  expect(response.status).toBe(201);
  const json = (await response.json()) as { ok: true; object: { id: string } };
  return { id: json.object.id };
}

function mockChatCompletions(
  message: string | { content?: string | null; reasoning_content?: string | null },
  status = 200,
): void {
  const payload =
    typeof message === 'string'
      ? { content: message }
      : { content: message.content ?? null, reasoning_content: message.reasoning_content ?? null };
  vi.spyOn(globalThis, 'fetch').mockImplementation(async (input: RequestInfo | URL) => {
    const url = typeof input === 'string' ? input : input.toString();
    if (url.includes('/chat/completions')) {
      return new Response(JSON.stringify({ choices: [{ message: payload }] }), {
        status,
        headers: { 'content-type': 'application/json' },
      });
    }
    throw new Error(`Unexpected fetch to ${url}`);
  });
}

describe('Wave 19 editorial-review agent', () => {
  it('skips review with no LLM key, never 500s, and leaves publish state unchanged', async () => {
    const { app, db, objectsDb } = await loadBackend();
    const admin = db.upsertUserByGoogle({
      googleSub: 'wave19-admin-nokey',
      email: ADMIN_EMAIL,
      name: 'Founder',
      picture: null,
    });
    const adminSession = db.createSession(admin.id, 60_000);
    process.env.ADMIN_EMAILS = ADMIN_EMAIL;

    const draft = await createAdminDraft(app, adminSession.id);
    const before = objectsDb.getObjectById(draft.id);

    const response = await app.request('http://localhost/api/internal/editorial/review-pending', {
      method: 'POST',
      headers: { host: 'ai-transformation.org', cookie: `atx_session=${adminSession.id}` },
    });
    expect(response.status).toBe(200);
    const json = (await response.json()) as {
      ok: true;
      reviewed: number;
      results: Array<{ id: string; editorial_agent: { skipped?: boolean } }>;
    };
    expect(json.reviewed).toBeGreaterThanOrEqual(1);
    const result = json.results.find((entry) => entry.id === draft.id);
    expect(result?.editorial_agent.skipped).toBe(true);

    const after = objectsDb.getObjectById(draft.id);
    expect((after?.metadata.editorial_agent as { skipped?: boolean }).skipped).toBe(true);
    expect(after?.status).toBe('draft');
    expect(after?.status).toBe(before?.status);
    expect(after?.visibility).toBe(before?.visibility);
    expect(after?.publishedSlug).toBe(before?.publishedSlug);
  });

  it('writes score/flags/summary from a mocked LLM without changing publish state', async () => {
    const { app, db, objectsDb } = await loadBackend();
    const admin = db.upsertUserByGoogle({
      googleSub: 'wave19-admin-key',
      email: ADMIN_EMAIL,
      name: 'Founder',
      picture: null,
    });
    const adminSession = db.createSession(admin.id, 60_000);
    process.env.ADMIN_EMAILS = ADMIN_EMAIL;

    const draft = await createAdminDraft(app, adminSession.id);

    process.env.MINIMAX_API_KEY = 'fake-key';
    mockChatCompletions(
      JSON.stringify({
        substance_score: 11,
        dimensions: {
          claim_density: 2,
          specificity: 2,
          argument_coherence: 2,
          falsifiable_stance: 2,
          first_hand: 3,
        },
        score: 73,
        flags: ['specificity-gap'],
        summary: 'Solid, on-brand draft.',
      }),
    );

    const response = await app.request('http://localhost/api/internal/editorial/review-pending', {
      method: 'POST',
      headers: { host: 'ai-transformation.org', cookie: `atx_session=${adminSession.id}` },
    });
    expect(response.status).toBe(200);

    const stored = objectsDb.getObjectById(draft.id);
    const review = stored?.metadata.editorial_agent as {
      score?: number;
      flags?: string[];
      summary?: string;
      model?: string;
      skipped?: boolean;
    };
    expect(review.skipped).toBeUndefined();
    expect(review.substance_score).toBe(11);
    expect(review.score).toBe(73);
    expect(review.flags).toEqual(['specificity-gap']);
    expect(review.summary).toBe('Solid, on-brand draft.');
    expect(stored?.status).toBe('draft');
  });

  it('falls back to skip when the LLM returns malformed content, no 500', async () => {
    const { app, db, objectsDb } = await loadBackend();
    const admin = db.upsertUserByGoogle({
      googleSub: 'wave19-admin-malformed',
      email: ADMIN_EMAIL,
      name: 'Founder',
      picture: null,
    });
    const adminSession = db.createSession(admin.id, 60_000);
    process.env.ADMIN_EMAILS = ADMIN_EMAIL;

    const draft = await createAdminDraft(app, adminSession.id);

    process.env.MINIMAX_API_KEY = 'fake-key';
    mockChatCompletions('not json at all');

    const response = await app.request('http://localhost/api/internal/editorial/review-pending', {
      method: 'POST',
      headers: { host: 'ai-transformation.org', cookie: `atx_session=${adminSession.id}` },
    });
    expect(response.status).toBe(200);

    const stored = objectsDb.getObjectById(draft.id);
    expect((stored?.metadata.editorial_agent as { skipped?: boolean }).skipped).toBe(true);
    expect(stored?.status).toBe('draft');
  });

  it('parses review JSON from reasoning_content when content is only thinking tags', async () => {
    const { app, db, objectsDb } = await loadBackend();
    const admin = db.upsertUserByGoogle({
      googleSub: 'wave19-admin-reasoning',
      email: ADMIN_EMAIL,
      name: 'Founder',
      picture: null,
    });
    const adminSession = db.createSession(admin.id, 60_000);
    process.env.ADMIN_EMAILS = ADMIN_EMAIL;

    const draft = await createAdminDraft(app, adminSession.id);

    process.env.MINIMAX_API_KEY = 'fake-key';
    mockChatCompletions({
      content: '<think>Assess tone.</think>',
      reasoning_content: JSON.stringify({
        substance_score: 10,
        dimensions: {
          claim_density: 2,
          specificity: 2,
          argument_coherence: 2,
          falsifiable_stance: 2,
          first_hand: 2,
        },
        score: 67,
        flags: ['consensus-only'],
        summary: 'Mostly on-brand with minor hype risk.',
      }),
    });

    const response = await app.request('http://localhost/api/internal/editorial/review-pending', {
      method: 'POST',
      headers: { host: 'ai-transformation.org', cookie: `atx_session=${adminSession.id}` },
    });
    expect(response.status).toBe(200);

    const stored = objectsDb.getObjectById(draft.id);
    const review = stored?.metadata.editorial_agent as {
      score?: number;
      summary?: string;
      skipped?: boolean;
    };
    expect(review.skipped).toBeUndefined();
    expect(review.substance_score).toBe(10);
    expect(review.score).toBe(67);
    expect(review.summary).toBe('Mostly on-brand with minor hype risk.');
  });

  it('reviews a single draft via /drafts/:id/review without changing publish state', async () => {
    const { app, db, objectsDb } = await loadBackend();
    const admin = db.upsertUserByGoogle({
      googleSub: 'wave19-admin-single',
      email: ADMIN_EMAIL,
      name: 'Founder',
      picture: null,
    });
    const adminSession = db.createSession(admin.id, 60_000);
    process.env.ADMIN_EMAILS = ADMIN_EMAIL;

    const draft = await createAdminDraft(app, adminSession.id);

    process.env.MINIMAX_API_KEY = 'fake-key';
    mockChatCompletions(JSON.stringify({ score: 70, flags: [], summary: 'Readable.' }));

    const response = await app.request(
      `http://localhost/api/internal/editorial/drafts/${draft.id}/review`,
      {
        method: 'POST',
        headers: { host: 'ai-transformation.org', cookie: `atx_session=${adminSession.id}` },
      },
    );
    expect(response.status).toBe(200);
    const json = (await response.json()) as {
      ok: true;
      draft: { status: string; metadata: { editorial_agent: { score?: number } } };
    };
    expect(json.draft.status).toBe('draft');
    expect(json.draft.metadata.editorial_agent.score).toBe(70);
    expect(objectsDb.getObjectById(draft.id)?.status).toBe('draft');
  });

  it('requires an admin gate for review-pending', async () => {
    const { app } = await loadBackend();
    process.env.ADMIN_EMAILS = ADMIN_EMAIL;
    const response = await app.request('http://localhost/api/internal/editorial/review-pending', {
      method: 'POST',
      headers: { host: 'ai-transformation.org' },
    });
    expect(response.status).toBe(401);
  });
});

describe('Wave 19 agent content catalog', () => {
  it('lists published public Wave 12 objects with source wave12_object while legacy content stays knowledge_base', async () => {
    const { app, objectsDb } = await loadBackend();

    const published = objectsDb.createObject({
      payload: {
        objectType: 'knowledge',
        type: 'article',
        site: 'io',
        visibility: 'public',
        title: 'Published knowledge object',
        body: 'A published knowledge object surfaced in the agent catalog.',
        status: 'published',
        metadata: {},
        publishedSlug: 'published-knowledge-object',
      },
      ownerUserId: null,
    });

    const catalogResponse = await app.request('http://localhost/api/v1/objects/catalog?site=io', {
      headers: { host: 'ai-transformation.io' },
    });
    expect(catalogResponse.status).toBe(200);
    const catalog = (await catalogResponse.json()) as {
      ok: true;
      site: string;
      count: number;
      objects: Array<{
        id: string;
        source: string;
        api_url: string;
        human_url: string;
        objectType: string;
      }>;
    };
    expect(catalog.ok).toBe(true);
    const entry = catalog.objects.find((item) => item.id === published.id);
    expect(entry).toBeDefined();
    expect(entry?.source).toBe('wave12_object');
    expect(entry?.api_url).toBe(`https://ai-transformation.io/api/v1/objects/${published.id}`);
    expect(entry?.human_url).toBe('https://ai-transformation.io/library/published-knowledge-object');

    const contentResponse = await app.request('http://localhost/api/v1/content?site=io', {
      headers: { host: 'ai-transformation.io' },
    });
    expect(contentResponse.status).toBe(200);
    const content = (await contentResponse.json()) as {
      ok: true;
      articles: Array<{ slug: string; source: string }>;
    };
    expect(content.articles.length).toBeGreaterThan(0);
    expect(content.articles.every((article) => article.source === 'knowledge_base')).toBe(true);
  });

  it('does not capture catalog as an object id', async () => {
    const { app } = await loadBackend();
    const response = await app.request('http://localhost/api/v1/objects/catalog?site=org', {
      headers: { host: 'ai-transformation.org' },
    });
    expect(response.status).toBe(200);
    const json = (await response.json()) as { ok: true; objects: unknown[] };
    expect(json.ok).toBe(true);
    expect(Array.isArray(json.objects)).toBe(true);
  });
});

describe('Wave 19 community interactions follow-up', () => {
  it('returns request_mentor, ask_for_intro, and apply interactions after /community/actions', async () => {
    const { app, db, objectsDb } = await loadBackend();
    const member = db.upsertUserByGoogle({
      googleSub: 'wave19-actions-member',
      email: 'wave19-member@example.com',
      name: 'Member',
      picture: null,
    });
    const session = db.createSession(member.id, 60_000);

    const mentorship = objectsDb.createObject({
      payload: {
        objectType: 'community',
        type: 'mentorship_request',
        site: 'org',
        visibility: 'public',
        title: 'Need a mentor for governance rollout',
        body: 'Looking for mentors who built AI governance programs at scale.',
        status: 'published',
        metadata: {},
        publishedSlug: 'mentor-governance',
      },
      ownerUserId: null,
    });
    const project = objectsDb.createObject({
      payload: {
        objectType: 'community',
        type: 'project_request',
        site: 'org',
        visibility: 'public',
        title: 'Pilot project needs contributors',
        body: 'Seeking applicants to help ship an internal copilot pilot.',
        status: 'published',
        metadata: {},
        publishedSlug: 'pilot-project',
      },
      ownerUserId: null,
    });

    const actions = [
      { objectId: mentorship.id, kind: 'request_mentor' },
      { objectId: mentorship.id, kind: 'ask_for_intro' },
      { objectId: project.id, kind: 'apply' },
    ] as const;

    for (const action of actions) {
      const response = await app.request('http://localhost/api/community/actions', {
        method: 'POST',
        headers: {
          host: 'ai-transformation.org',
          'content-type': 'application/json',
          cookie: `atx_session=${session.id}`,
        },
        body: JSON.stringify({ site: 'org', objectId: action.objectId, kind: action.kind }),
      });
      expect(response.status).toBe(200);
    }

    const listResponse = await app.request(
      'http://localhost/api/community/interactions?site=org',
      {
        headers: { host: 'ai-transformation.org', cookie: `atx_session=${session.id}` },
      },
    );
    expect(listResponse.status).toBe(200);
    const json = (await listResponse.json()) as {
      ok: true;
      interactions: Array<{ kind: string }>;
    };
    const kinds = new Set(json.interactions.map((interaction) => interaction.kind));
    expect(kinds.has('request_mentor')).toBe(true);
    expect(kinds.has('ask_for_intro')).toBe(true);
    expect(kinds.has('apply')).toBe(true);
  });
});
