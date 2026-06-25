import { mkdtempSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const managedEnvKeys = ['SQLITE_PATH', 'DATABASE_URL', 'ADMIN_EMAILS', 'NODE_ENV', 'ZSEND_API_KEY'] as const;

const originalEnv = Object.fromEntries(
  managedEnvKeys.map((key) => [key, process.env[key]]),
) as Record<(typeof managedEnvKeys)[number], string | undefined>;

const STORY_BODY =
  'This story describes how the team standardized AI operating reviews across security, legal, and delivery with measurable checkpoints.';

let tempDir = '';

beforeEach(() => {
  tempDir = mkdtempSync(path.join(os.tmpdir(), 'atx-wave8-newsletter-'));
  process.env.SQLITE_PATH = path.join(tempDir, 'app.db');
  delete process.env.DATABASE_URL;
  delete process.env.ZSEND_API_KEY;
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
  return { app: backendModule.app, db: dbModule };
}

describe('Wave 8 newsletter + agent jobs', () => {
  it('returns 501 for inbound-email webhook', async () => {
    const { app } = await loadBackend();
    const response = await app.request('http://localhost/api/webhooks/inbound-email', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({}),
    });
    expect(response.status).toBe(501);
  });

  it('accepts zsend webhook stub', async () => {
    const { app } = await loadBackend();
    const response = await app.request('http://localhost/api/webhooks/zsend', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ event: 'delivery' }),
    });
    expect(response.status).toBe(200);
    const payload = (await response.json()) as { ok: boolean };
    expect(payload.ok).toBe(true);
  });

  it('returns 501 for public subscribe', async () => {
    const { app } = await loadBackend();
    const response = await app.request('http://localhost/api/newsletter/subscribe', {
      method: 'POST',
    });
    expect(response.status).toBe(501);
  });

  it('compiles issue draft for admin with contributions', async () => {
    const { app, db } = await loadBackend();
    const user = db.upsertUserByGoogle({
      googleSub: 'google-sub-founder',
      email: 'founder@example.com',
      name: 'Founder',
      picture: null,
    });
    const session = db.createSession(user.id, 60_000);
    process.env.ADMIN_EMAILS = 'founder@example.com';

    db.insertContribution({
      id: crypto.randomUUID(),
      source: 'web_inquiry',
      site: 'io',
      email: 'reader@example.com',
      body: 'How do we measure ROI on agent copilots beyond pilot metrics?',
      status: 'new',
      metadata: '{}',
      createdAt: new Date().toISOString(),
    });

    db.insertContribution({
      id: crypto.randomUUID(),
      source: 'web_story',
      site: 'org',
      email: 'author@example.com',
      subject: 'Governance first',
      body: STORY_BODY,
      status: 'new',
      metadata: '{}',
      createdAt: new Date().toISOString(),
    });

    const response = await app.request('http://localhost/api/internal/agent/compile-draft', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        cookie: `atx_session=${session.id}`,
      },
      body: JSON.stringify({ site: 'io', limit: 10 }),
    });

    expect(response.status).toBe(200);
    const payload = (await response.json()) as {
      ok: boolean;
      job: string;
      issue: { draftMd: string; status: string; replyToToken: string };
      contributionCount: number;
    };
    expect(payload.ok).toBe(true);
    expect(payload.job).toBe('compile_issue_draft');
    expect(payload.issue.status).toBe('draft');
    expect(payload.issue.draftMd).toContain('Transformation Pulse');
    expect(payload.contributionCount).toBeGreaterThan(0);
  });

  it('includes published knowledge + community highlights and curated links in the draft', async () => {
    const { app, db } = await loadBackend();
    const objectsDb = await import('../../db/objects.js');
    const user = db.upsertUserByGoogle({
      googleSub: 'google-sub-founder-knowledge',
      email: 'founder@example.com',
      name: 'Founder',
      picture: null,
    });
    const session = db.createSession(user.id, 60_000);
    process.env.ADMIN_EMAILS = 'founder@example.com';

    objectsDb.createObject({
      payload: {
        objectType: 'knowledge',
        type: 'article',
        site: 'org',
        visibility: 'public',
        title: 'Seeded knowledge article',
        body: 'Published knowledge body describing the AI transformation roadmap in detail.',
        status: 'published',
        publishedSlug: 'transformation-roadmap',
      },
      ownerUserId: null,
    });
    objectsDb.createObject({
      payload: {
        objectType: 'community',
        type: 'discussion',
        site: 'org',
        visibility: 'public',
        title: 'Seeded community discussion',
        body: 'Published community discussion about escaping pilot purgatory in practice.',
        status: 'published',
      },
      ownerUserId: null,
    });

    const response = await app.request('http://localhost/api/internal/agent/compile-draft', {
      method: 'POST',
      headers: {
        host: 'ai-transformation.org',
        'content-type': 'application/json',
        cookie: `atx_session=${session.id}`,
      },
      body: JSON.stringify({ site: 'org', limit: 10 }),
    });

    expect(response.status).toBe(200);
    const payload = (await response.json()) as { ok: boolean; issue: { draftMd: string } };
    const draft = payload.issue.draftMd;
    expect(draft).toContain('Featured knowledge');
    expect(draft).toContain('Community highlights');
    expect(draft).toContain('/knowledge/transformation-roadmap');
    expect(draft).toContain('/community');
  });

  it('clusters newsletter replies for admin', async () => {
    const { app, db } = await loadBackend();
    const user = db.upsertUserByGoogle({
      googleSub: 'google-sub-founder-2',
      email: 'admin@example.com',
      name: 'Admin',
      picture: null,
    });
    const session = db.createSession(user.id, 60_000);
    process.env.ADMIN_EMAILS = 'admin@example.com';

    db.insertContribution({
      id: crypto.randomUUID(),
      source: 'newsletter_reply',
      site: 'io',
      email: 'sub@example.com',
      body: 'Our governance council finally approved a pilot workflow policy last week.',
      status: 'new',
      metadata: JSON.stringify({ issue_id: 'test-issue' }),
      createdAt: new Date().toISOString(),
    });

    const response = await app.request('http://localhost/api/internal/agent/cluster-replies', {
      method: 'POST',
      headers: { cookie: `atx_session=${session.id}` },
    });

    expect(response.status).toBe(200);
    const payload = (await response.json()) as { ok: boolean; job: string; total: number };
    expect(payload.job).toBe('cluster_replies');
    expect(payload.total).toBeGreaterThan(0);
  });
});
