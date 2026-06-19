import { mkdtempSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const managedEnvKeys = [
  'SQLITE_PATH',
  'DATABASE_URL',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'SESSION_SECRET',
] as const;

const originalEnv = Object.fromEntries(
  managedEnvKeys.map((key) => [key, process.env[key]]),
) as Record<(typeof managedEnvKeys)[number], string | undefined>;

let tempDir = '';
let sqlitePath = '';

beforeEach(() => {
  tempDir = mkdtempSync(path.join(os.tmpdir(), 'atx-wave4-auth-'));
  sqlitePath = path.join(tempDir, 'app.db');
  process.env.SQLITE_PATH = sqlitePath;
  delete process.env.DATABASE_URL;
  delete process.env.GOOGLE_CLIENT_ID;
  delete process.env.GOOGLE_CLIENT_SECRET;
  delete process.env.SESSION_SECRET;
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

describe('Wave 4 auth + session backend', () => {
  it('returns /api/auth/me user with session cookie and null without cookie', async () => {
    const { app, db } = await loadBackend();
    const user = db.upsertUserByGoogle({
      googleSub: 'google-sub-001',
      email: 'person@example.com',
      name: 'Person One',
      picture: 'https://example.com/person.png',
    });
    const session = db.createSession(user.id, 60_000);

    const withCookie = await app.request('http://localhost/api/auth/me', {
      headers: {
        cookie: `atx_session=${session.id}`,
      },
    });
    expect(withCookie.status).toBe(200);
    expect(await withCookie.json()).toEqual({
      ok: true,
      user: {
        id: user.id,
        email: 'person@example.com',
        name: 'Person One',
        picture: 'https://example.com/person.png',
        createdAt: user.createdAt,
      },
    });

    const withoutCookie = await app.request('http://localhost/api/auth/me');
    expect(withoutCookie.status).toBe(200);
    expect(await withoutCookie.json()).toEqual({
      ok: true,
      user: null,
    });
  });

  it('deduplicates users by google_sub upsert', async () => {
    const { db } = await loadBackend();

    const first = db.upsertUserByGoogle({
      googleSub: 'google-sub-dedup',
      email: 'dedup@example.com',
      name: 'Initial Name',
      picture: 'https://example.com/a.png',
    });
    const second = db.upsertUserByGoogle({
      googleSub: 'google-sub-dedup',
      email: 'dedup@example.com',
      name: 'Updated Name',
      picture: 'https://example.com/b.png',
    });

    const countRow = db
      .getDb()
      .prepare('SELECT COUNT(*) AS count FROM users WHERE google_sub = ?')
      .get('google-sub-dedup') as { count: number };

    expect(first.id).toBe(second.id);
    expect(countRow.count).toBe(1);
  });

  it('supports assessment session save/resume and rejects unauthenticated access', async () => {
    const { app, db } = await loadBackend();
    const user = db.upsertUserByGoogle({
      googleSub: 'google-sub-assessment',
      email: 'assessment@example.com',
      name: 'Assessment User',
      picture: null,
    });
    const session = db.createSession(user.id, 60_000);

    const unauthenticatedGet = await app.request('http://localhost/api/assessment/session');
    expect(unauthenticatedGet.status).toBe(401);

    const unauthenticatedPost = await app.request('http://localhost/api/assessment/session', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ answers: { q1: 3 }, stepIndex: 1 }),
    });
    expect(unauthenticatedPost.status).toBe(401);

    const saveResponse = await app.request('http://localhost/api/assessment/session', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        cookie: `atx_session=${session.id}`,
      },
      body: JSON.stringify({
        answers: { q1: 2, q2: 4 },
        stepIndex: 7,
      }),
    });
    expect(saveResponse.status).toBe(200);

    const getResponse = await app.request('http://localhost/api/assessment/session', {
      headers: {
        cookie: `atx_session=${session.id}`,
      },
    });
    expect(getResponse.status).toBe(200);
    const getJson = (await getResponse.json()) as {
      ok: true;
      session: { answers: Record<string, number>; stepIndex: number; updatedAt: string } | null;
    };
    expect(getJson.ok).toBe(true);
    expect(getJson.session).not.toBeNull();
    expect(getJson.session?.answers).toEqual({ q1: 2, q2: 4 });
    expect(getJson.session?.stepIndex).toBe(7);
    expect(typeof getJson.session?.updatedAt).toBe('string');
  });

  it('attaches inquiry user_id when authenticated and keeps anonymous inquiries working', async () => {
    const { app, db } = await loadBackend();
    const user = db.upsertUserByGoogle({
      googleSub: 'google-sub-harvest',
      email: 'harvest@example.com',
      name: 'Harvest User',
      picture: null,
    });
    const session = db.createSession(user.id, 60_000);

    const attributedResponse = await app.request('http://localhost/api/inquiries', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        cookie: `atx_session=${session.id}`,
      },
      body: JSON.stringify({
        email: 'writer@example.com',
        question: 'How do we operationalize AI governance in Q3?',
        site: 'io',
      }),
    });
    expect(attributedResponse.status).toBe(201);
    const attributedJson = (await attributedResponse.json()) as { ok: true; id: string };
    const attributedRow = db
      .getDb()
      .prepare('SELECT user_id AS userId FROM contributions WHERE id = ?')
      .get(attributedJson.id) as { userId: string | null };
    expect(attributedRow.userId).toBe(user.id);

    const anonymousResponse = await app.request('http://localhost/api/inquiries', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        email: 'anon@example.com',
        question: 'How should a small team begin AI workflow redesign?',
        site: 'org',
      }),
    });
    expect(anonymousResponse.status).toBe(201);
    const anonymousJson = (await anonymousResponse.json()) as { ok: true; id: string };
    const anonymousRow = db
      .getDb()
      .prepare('SELECT user_id AS userId FROM contributions WHERE id = ?')
      .get(anonymousJson.id) as { userId: string | null };
    expect(anonymousRow.userId).toBeNull();
  });

  it('returns 501 for /api/auth/google when Google env is not configured', async () => {
    const { app } = await loadBackend();
    const response = await app.request('http://localhost/api/auth/google');
    expect(response.status).toBe(501);
    expect(await response.json()).toEqual({
      ok: false,
      error: 'Google sign-in is not configured',
    });
  });
});
