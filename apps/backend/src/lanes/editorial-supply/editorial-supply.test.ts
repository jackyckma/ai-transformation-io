import { mkdtempSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const managedEnvKeys = ['SQLITE_PATH', 'DATABASE_URL', 'NODE_ENV', 'ADMIN_EMAILS'] as const;

const originalEnv = Object.fromEntries(
  managedEnvKeys.map((key) => [key, process.env[key]]),
) as Record<(typeof managedEnvKeys)[number], string | undefined>;

let tempDir = '';

beforeEach(() => {
  tempDir = mkdtempSync(path.join(os.tmpdir(), 'atx-wave16-editorial-'));
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

const ADMIN_EMAIL = 'founder@example.com';

const KNOWLEDGE_DRAFT = {
  objectType: 'knowledge',
  type: 'article',
  site: 'org',
  visibility: 'public',
  title: 'Draft knowledge article',
  body: 'A drafted knowledge article about redesigning workflows around AI before scaling.',
} as const;

const COMMUNITY_DRAFT = {
  objectType: 'community',
  type: 'discussion',
  site: 'org',
  visibility: 'public',
  title: 'Draft community discussion',
  body: 'A drafted discussion asking how teams escaped pilot purgatory in their organizations.',
} as const;

describe('Wave 16 editorial supply lane', () => {
  it('lets an admin session create, list, and approve a draft into a published object', async () => {
    const { app, db, objectsDb } = await loadBackend();
    const admin = db.upsertUserByGoogle({
      googleSub: 'google-sub-editorial-admin',
      email: ADMIN_EMAIL,
      name: 'Founder',
      picture: null,
    });
    const adminSession = db.createSession(admin.id, 60_000);
    process.env.ADMIN_EMAILS = ADMIN_EMAIL;

    const createResponse = await app.request('http://localhost/api/internal/editorial/drafts', {
      method: 'POST',
      headers: {
        host: 'ai-transformation.org',
        'content-type': 'application/json',
        cookie: `atx_session=${adminSession.id}`,
      },
      body: JSON.stringify(KNOWLEDGE_DRAFT),
    });
    expect(createResponse.status).toBe(201);
    const createJson = (await createResponse.json()) as {
      ok: true;
      object: { id: string; status: string; metadata: Record<string, unknown> };
    };
    expect(createJson.object.status).toBe('draft');
    expect(createJson.object.metadata.editorial_source).toBe('admin_session');

    const listResponse = await app.request('http://localhost/api/internal/editorial/drafts', {
      headers: {
        host: 'ai-transformation.org',
        cookie: `atx_session=${adminSession.id}`,
      },
    });
    expect(listResponse.status).toBe(200);
    const listJson = (await listResponse.json()) as {
      ok: true;
      drafts: Array<{ id: string; status: string }>;
    };
    expect(listJson.drafts.some((draft) => draft.id === createJson.object.id)).toBe(true);

    const detailResponse = await app.request(
      `http://localhost/api/internal/editorial/drafts/${createJson.object.id}`,
      {
        headers: {
          host: 'ai-transformation.org',
          cookie: `atx_session=${adminSession.id}`,
        },
      },
    );
    expect(detailResponse.status).toBe(200);
    const detailJson = (await detailResponse.json()) as {
      ok: true;
      draft: { body: string; bodyExcerpt: string };
    };
    expect(detailJson.draft.body).toBe(KNOWLEDGE_DRAFT.body);
    expect(detailJson.draft.body.length).toBeGreaterThan(0);

    const approveResponse = await app.request(
      `http://localhost/api/internal/editorial/drafts/${createJson.object.id}/approve`,
      {
        method: 'POST',
        headers: {
          host: 'ai-transformation.org',
          cookie: `atx_session=${adminSession.id}`,
        },
      },
    );
    expect(approveResponse.status).toBe(200);
    const approveJson = (await approveResponse.json()) as {
      ok: true;
      object: { status: string; publishedSlug: string | null };
    };
    expect(approveJson.object.status).toBe('published');
    expect(approveJson.object.publishedSlug).toBeTruthy();

    const published = objectsDb.listObjectsForRequester({
      request: { site: 'org', objectType: 'knowledge', status: 'published', limit: 50 },
      context: { site: 'org', requesterUserId: null, bearerOwnerUserId: null, isAuthenticated: false },
    });
    expect(published.objects.some((obj) => obj.id === createJson.object.id)).toBe(true);
  });

  it('rejects a draft into an archived object', async () => {
    const { app, db, objectsDb } = await loadBackend();
    const admin = db.upsertUserByGoogle({
      googleSub: 'google-sub-editorial-admin-reject',
      email: ADMIN_EMAIL,
      name: 'Founder',
      picture: null,
    });
    const adminSession = db.createSession(admin.id, 60_000);
    process.env.ADMIN_EMAILS = ADMIN_EMAIL;

    const createResponse = await app.request('http://localhost/api/internal/editorial/drafts', {
      method: 'POST',
      headers: {
        host: 'ai-transformation.org',
        'content-type': 'application/json',
        cookie: `atx_session=${adminSession.id}`,
      },
      body: JSON.stringify(COMMUNITY_DRAFT),
    });
    expect(createResponse.status).toBe(201);
    const createJson = (await createResponse.json()) as { ok: true; object: { id: string } };

    const rejectResponse = await app.request(
      `http://localhost/api/internal/editorial/drafts/${createJson.object.id}/reject`,
      {
        method: 'POST',
        headers: {
          host: 'ai-transformation.org',
          cookie: `atx_session=${adminSession.id}`,
        },
      },
    );
    expect(rejectResponse.status).toBe(200);
    const rejectJson = (await rejectResponse.json()) as { ok: true; object: { status: string } };
    expect(rejectJson.object.status).toBe('archived');

    const stored = objectsDb.getObjectById(createJson.object.id);
    expect(stored?.status).toBe('archived');
    expect(stored?.metadata.editorial_review).toBe('rejected');
  });

  it('accepts an L11 bearer write token on create-draft', async () => {
    const { app, db, agentDb } = await loadBackend();
    const author = db.upsertUserByGoogle({
      googleSub: 'google-sub-editorial-bearer',
      email: 'agent-author@example.com',
      name: 'Agent Author',
      picture: null,
    });
    const token = agentDb.issueWriteToken({
      email: author.email,
      clientId: 'content-ai-transformation-org',
      scopes: ['write:story'],
    });

    const createResponse = await app.request('http://localhost/api/internal/editorial/drafts', {
      method: 'POST',
      headers: {
        host: 'ai-transformation.org',
        'content-type': 'application/json',
        authorization: `Bearer ${token.bearerToken}`,
      },
      body: JSON.stringify(KNOWLEDGE_DRAFT),
    });
    expect(createResponse.status).toBe(201);
    const createJson = (await createResponse.json()) as {
      ok: true;
      object: { status: string; ownerUserId: string | null; metadata: Record<string, unknown> };
    };
    expect(createJson.object.status).toBe('draft');
    expect(createJson.object.metadata.editorial_source).toBe('bearer');
    expect(createJson.object.ownerUserId).toBe(author.id);
  });

  it('keeps the existing bearer create-draft route at /api/v1/objects/drafts working', async () => {
    const { app, db, agentDb } = await loadBackend();
    const author = db.upsertUserByGoogle({
      googleSub: 'google-sub-objects-bearer',
      email: 'objects-author@example.com',
      name: 'Objects Author',
      picture: null,
    });
    const token = agentDb.issueWriteToken({
      email: author.email,
      clientId: 'content-ai-transformation-org',
      scopes: ['write:story'],
    });

    const response = await app.request('http://localhost/api/v1/objects/drafts', {
      method: 'POST',
      headers: {
        host: 'ai-transformation.org',
        'content-type': 'application/json',
        authorization: `Bearer ${token.bearerToken}`,
      },
      body: JSON.stringify(KNOWLEDGE_DRAFT),
    });
    expect(response.status).toBe(200);
    const json = (await response.json()) as { ok: true; object: { status: string } };
    expect(json.object.status).toBe('draft');
  });

  it('forbids non-admin sessions from create/list/approve and blocks anonymous', async () => {
    const { app, db } = await loadBackend();
    const member = db.upsertUserByGoogle({
      googleSub: 'google-sub-editorial-member',
      email: 'member@example.com',
      name: 'Member',
      picture: null,
    });
    const memberSession = db.createSession(member.id, 60_000);
    process.env.ADMIN_EMAILS = ADMIN_EMAIL;

    const memberCreate = await app.request('http://localhost/api/internal/editorial/drafts', {
      method: 'POST',
      headers: {
        host: 'ai-transformation.org',
        'content-type': 'application/json',
        cookie: `atx_session=${memberSession.id}`,
      },
      body: JSON.stringify(KNOWLEDGE_DRAFT),
    });
    expect(memberCreate.status).toBe(403);

    const memberList = await app.request('http://localhost/api/internal/editorial/drafts', {
      headers: {
        host: 'ai-transformation.org',
        cookie: `atx_session=${memberSession.id}`,
      },
    });
    expect(memberList.status).toBe(403);

    const anonList = await app.request('http://localhost/api/internal/editorial/drafts', {
      headers: { host: 'ai-transformation.org' },
    });
    expect(anonList.status).toBe(401);

    const anonCreate = await app.request('http://localhost/api/internal/editorial/drafts', {
      method: 'POST',
      headers: { host: 'ai-transformation.org', 'content-type': 'application/json' },
      body: JSON.stringify(KNOWLEDGE_DRAFT),
    });
    expect(anonCreate.status).toBe(401);
  });
});
