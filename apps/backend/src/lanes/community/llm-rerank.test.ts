import { mkdtempSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const managedEnvKeys = [
  'SQLITE_PATH',
  'DATABASE_URL',
  'NODE_ENV',
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
  tempDir = mkdtempSync(path.join(os.tmpdir(), 'atx-wave18-rerank-'));
  process.env.SQLITE_PATH = path.join(tempDir, 'app.db');
  delete process.env.DATABASE_URL;
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
  const agentProtocolDbModule = await import('../../db/agent-protocol.js');
  const backendModule = await import('../../index.js');
  return {
    app: backendModule.app,
    db: dbModule,
    objectsDb: objectsDbModule,
    agentDb: agentProtocolDbModule,
  };
}

function mockLlmFetch(makeContent: (requestBody: string) => string): void {
  const realFetch = globalThis.fetch;
  vi.spyOn(globalThis, 'fetch').mockImplementation(async (input: any, init?: any) => {
    const url = typeof input === 'string' ? input : input?.url ?? '';
    if (typeof url === 'string' && url.includes('/chat/completions')) {
      const body = typeof init?.body === 'string' ? init.body : '';
      const content = makeContent(body);
      return new Response(JSON.stringify({ choices: [{ message: { content } }] }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    }
    return realFetch(input, init);
  });
}

type MatchResponse = {
  experimental: true;
  candidates: Array<{ objectId: string; reasons: string[] }>;
  llmAssisted: boolean;
  rerankModel?: string;
};

async function seedMatchFixtures() {
  const ctx = await loadBackend();
  const owner = ctx.db.upsertUserByGoogle({
    googleSub: 'wave18-rerank-owner',
    email: 'wave18-rerank-owner@example.com',
    name: 'Owner',
    picture: null,
  });
  const other = ctx.db.upsertUserByGoogle({
    googleSub: 'wave18-rerank-other',
    email: 'wave18-rerank-other@example.com',
    name: 'Other',
    picture: null,
  });
  const session = ctx.db.createSession(owner.id, 60_000);

  const source = ctx.objectsDb.createObject({
    payload: {
      objectType: 'community',
      type: 'help_request',
      site: 'org',
      visibility: 'public',
      title: 'Need governance rollout support',
      body: 'Looking for support with governance rituals and operating cadence.',
      status: 'published',
      metadata: { tags: ['governance', 'rituals', 'cadence'] },
    },
    ownerUserId: owner.id,
  });
  const strongOffer = ctx.objectsDb.createObject({
    payload: {
      objectType: 'community',
      type: 'collaboration_offer',
      site: 'org',
      visibility: 'public',
      title: 'Offer governance cadence collaboration',
      body: 'I can collaborate on governance rituals and cadence implementation.',
      status: 'published',
      metadata: { offering: ['governance', 'cadence', 'rituals'], tags: ['governance', 'cadence', 'rituals'] },
    },
    ownerUserId: other.id,
  });
  const weakOffer = ctx.objectsDb.createObject({
    payload: {
      objectType: 'community',
      type: 'collaboration_offer',
      site: 'org',
      visibility: 'public',
      title: 'Offer general governance help',
      body: 'I can collaborate on governance topics.',
      status: 'published',
      metadata: { offering: ['governance'], tags: ['governance'] },
    },
    ownerUserId: other.id,
  });

  return { ...ctx, session, source, strongOffer, weakOffer };
}

async function requestMatch(
  app: { request: (url: string, init?: RequestInit) => Promise<Response> },
  cookie: string,
  objectId: string,
  useLlmRerank: boolean,
): Promise<MatchResponse> {
  const res = await app.request('http://localhost/api/community/match', {
    method: 'POST',
    headers: {
      host: 'ai-transformation.org',
      cookie,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ site: 'org', objectId, limit: 5, useLlmRerank }),
  });
  expect(res.status).toBe(200);
  return (await res.json()) as MatchResponse;
}

describe('Wave 18 community match LLM re-rank', () => {
  it('falls back to deterministic order with llmAssisted:false when no LLM key is configured', async () => {
    const { app, session, source } = await seedMatchFixtures();
    const cookie = `atx_session=${session.id}`;

    const baseline = await requestMatch(app, cookie, source.id, false);
    const withRerank = await requestMatch(app, cookie, source.id, true);

    expect(baseline.llmAssisted).toBe(false);
    expect(withRerank.llmAssisted).toBe(false);
    expect(withRerank.rerankModel).toBeUndefined();
    expect(withRerank.candidates.map((c) => c.objectId)).toEqual(
      baseline.candidates.map((c) => c.objectId),
    );
  });

  it('applies LLM re-ranking (reorder + refreshed reasons) while preserving the candidate id set', async () => {
    const { app, session, source } = await seedMatchFixtures();
    const cookie = `atx_session=${session.id}`;

    const baseline = await requestMatch(app, cookie, source.id, false);
    expect(baseline.candidates.length).toBeGreaterThanOrEqual(2);
    const baselineIds = baseline.candidates.map((c) => c.objectId);

    process.env.MINIMAX_API_KEY = 'test-key';
    mockLlmFetch(() =>
      JSON.stringify(
        [...baselineIds].reverse().map((objectId) => ({
          objectId,
          reasons: [`LLM refreshed reason for ${objectId}`],
        })),
      ),
    );

    const reranked = await requestMatch(app, cookie, source.id, true);
    expect(reranked.llmAssisted).toBe(true);
    expect(reranked.rerankModel).toBeTruthy();
    expect(reranked.candidates.map((c) => c.objectId)).toEqual([...baselineIds].reverse());
    expect(new Set(reranked.candidates.map((c) => c.objectId))).toEqual(new Set(baselineIds));
    expect(reranked.candidates[0]?.reasons[0]).toContain('LLM refreshed reason');
  });

  it('falls back deterministically (no 500) when the LLM returns malformed output', async () => {
    const { app, session, source } = await seedMatchFixtures();
    const cookie = `atx_session=${session.id}`;

    const baseline = await requestMatch(app, cookie, source.id, false);

    process.env.MINIMAX_API_KEY = 'test-key';
    mockLlmFetch(() => 'this is not valid json {{{ ');

    const reranked = await requestMatch(app, cookie, source.id, true);
    expect(reranked.llmAssisted).toBe(false);
    expect(reranked.candidates.map((c) => c.objectId)).toEqual(
      baseline.candidates.map((c) => c.objectId),
    );
  });

  it('falls back deterministically when the LLM returns ids outside the candidate set', async () => {
    const { app, session, source } = await seedMatchFixtures();
    const cookie = `atx_session=${session.id}`;

    const baseline = await requestMatch(app, cookie, source.id, false);

    process.env.MINIMAX_API_KEY = 'test-key';
    mockLlmFetch(() => JSON.stringify([{ objectId: 'totally-made-up', reasons: ['nope'] }]));

    const reranked = await requestMatch(app, cookie, source.id, true);
    expect(reranked.llmAssisted).toBe(false);
    expect(reranked.candidates.map((c) => c.objectId)).toEqual(
      baseline.candidates.map((c) => c.objectId),
    );
  });
});

type RankResponse = {
  experimental: true;
  site: string;
  llmAssisted: boolean;
  rerankModel?: string;
  ranked: Array<{ id: string; reason: string }>;
};

describe('Wave 18 personal rank-suggestions', () => {
  const candidates = [
    { id: 'lib-1', title: 'AI governance playbook', summary: 'How to govern AI rollouts.' },
    { id: 'lib-2', title: 'Value measurement guide', summary: 'Measuring AI value.' },
    { id: 'lib-3', title: 'Work redesign patterns', summary: 'Redesigning work around AI.' },
  ];

  it('returns input-order ranking with llmAssisted:false when no LLM key (v1 bearer)', async () => {
    const { app, db, agentDb } = await loadBackend();
    const user = db.upsertUserByGoogle({
      googleSub: 'wave18-rank-bearer',
      email: 'wave18-rank-bearer@example.com',
      name: 'Rank Bearer',
      picture: null,
    });
    const token = agentDb.issueWriteToken({
      email: user.email,
      clientId: 'wave18-rank-agent',
      scopes: ['write:inquiry'],
    });

    const res = await app.request('http://localhost/api/v1/personal/rank-suggestions', {
      method: 'POST',
      headers: {
        host: 'ai-transformation.io',
        authorization: `Bearer ${token.bearerToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ site: 'io', candidates, useLlmRerank: true }),
    });
    expect(res.status).toBe(200);
    const json = (await res.json()) as RankResponse;
    expect(json.experimental).toBe(true);
    expect(json.llmAssisted).toBe(false);
    expect(json.rerankModel).toBeUndefined();
    expect(json.ranked.map((r) => r.id)).toEqual(candidates.map((c) => c.id));
    expect(json.ranked.every((r) => r.reason.length > 0)).toBe(true);
  });

  it('returns LLM ordering + reasons with llmAssisted:true when key + mocked LLM (session)', async () => {
    const { app, db } = await loadBackend();
    const user = db.upsertUserByGoogle({
      googleSub: 'wave18-rank-session',
      email: 'wave18-rank-session@example.com',
      name: 'Rank Session',
      picture: null,
    });
    const session = db.createSession(user.id, 60_000);

    process.env.MINIMAX_API_KEY = 'test-key';
    mockLlmFetch(() =>
      JSON.stringify([
        { id: 'lib-3', reason: 'Most aligned to your recent interests.' },
        { id: 'lib-1', reason: 'Foundational governance reading.' },
        { id: 'lib-2', reason: 'Helps quantify outcomes.' },
      ]),
    );

    const res = await app.request('http://localhost/api/personal/rank-suggestions', {
      method: 'POST',
      headers: {
        host: 'ai-transformation.io',
        cookie: `atx_session=${session.id}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        site: 'io',
        candidates,
        context: { followedTopics: ['governance'], recentInterests: ['work redesign'] },
        useLlmRerank: true,
      }),
    });
    expect(res.status).toBe(200);
    const json = (await res.json()) as RankResponse;
    expect(json.llmAssisted).toBe(true);
    expect(json.rerankModel).toBeTruthy();
    expect(json.ranked.map((r) => r.id)).toEqual(['lib-3', 'lib-1', 'lib-2']);
    expect(new Set(json.ranked.map((r) => r.id))).toEqual(new Set(candidates.map((c) => c.id)));
    expect(json.ranked[0]?.reason).toContain('recent interests');
  });

  it('requires authentication', async () => {
    const { app } = await loadBackend();
    const res = await app.request('http://localhost/api/personal/rank-suggestions', {
      method: 'POST',
      headers: { host: 'ai-transformation.io', 'content-type': 'application/json' },
      body: JSON.stringify({ site: 'io', candidates }),
    });
    expect(res.status).toBe(401);
  });
});
