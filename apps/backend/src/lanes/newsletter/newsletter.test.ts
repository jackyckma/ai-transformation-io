import { mkdtempSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const managedEnvKeys = [
  'SQLITE_PATH',
  'DATABASE_URL',
  'ADMIN_EMAILS',
  'NODE_ENV',
  'ZSEND_API_KEY',
  'INBOUND_EMAIL_WEBHOOK_SECRET',
  'NEWSLETTER_PILOT_MAX',
] as const;

const originalEnv = Object.fromEntries(
  managedEnvKeys.map((key) => [key, process.env[key]]),
) as Record<(typeof managedEnvKeys)[number], string | undefined>;

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

describe('Wave 17 newsletter + agent jobs', () => {
  it('subscribes and unsubscribes newsletter recipients', async () => {
    const { app } = await loadBackend();
    const subscribeResponse = await app.request('http://localhost/api/newsletter/subscribe', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        email: 'reader@example.com',
        list: 'io_pulse',
      }),
    });

    expect(subscribeResponse.status).toBe(200);
    expect(await subscribeResponse.json()).toEqual({ ok: true, status: 'active' });

    const newsletterDb = await import('../../db/newsletter.js');
    const dbModule = await import('../../db/index.js');
    expect(newsletterDb.listActiveSubscribers('io_pulse')).toContain('reader@example.com');

    const activeRow = dbModule
      .getDb()
      .prepare(
        `SELECT status, unsubscribed_at AS unsubscribedAt
         FROM subscribers
         WHERE email = @email AND list = @list`,
      )
      .get({ email: 'reader@example.com', list: 'io_pulse' }) as
      | { status: string; unsubscribedAt: string | null }
      | undefined;

    expect(activeRow).toBeDefined();
    expect(activeRow?.status).toBe('active');
    expect(activeRow?.unsubscribedAt).toBeNull();

    const unsubscribeResponse = await app.request('http://localhost/api/newsletter/unsubscribe', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        email: 'reader@example.com',
        list: 'io_pulse',
      }),
    });

    expect(unsubscribeResponse.status).toBe(200);
    expect(await unsubscribeResponse.json()).toEqual({ ok: true, status: 'unsubscribed' });
    expect(newsletterDb.listActiveSubscribers('io_pulse')).not.toContain('reader@example.com');

    const unsubscribedRow = dbModule
      .getDb()
      .prepare(
        `SELECT status, unsubscribed_at AS unsubscribedAt
         FROM subscribers
         WHERE email = @email AND list = @list`,
      )
      .get({ email: 'reader@example.com', list: 'io_pulse' }) as
      | { status: string; unsubscribedAt: string | null }
      | undefined;

    expect(unsubscribedRow?.status).toBe('unsubscribed');
    expect(unsubscribedRow?.unsubscribedAt).not.toBeNull();
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

  it('sends issue with pilot cap and admin protections', async () => {
    const { app, db } = await loadBackend();
    process.env.ADMIN_EMAILS = 'admin@example.com';
    process.env.NEWSLETTER_PILOT_MAX = '25';

    const newsletterDb = await import('../../db/newsletter.js');

    const nonAdminUser = db.upsertUserByGoogle({
      googleSub: 'google-sub-non-admin',
      email: 'reader@example.com',
      name: 'Reader',
      picture: null,
    });
    const nonAdminSession = db.createSession(nonAdminUser.id, 60_000);

    const nonAdminResponse = await app.request('http://localhost/api/internal/newsletter/send-issue', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        cookie: `atx_session=${nonAdminSession.id}`,
      },
      body: JSON.stringify({ issueId: 'missing-issue' }),
    });
    expect(nonAdminResponse.status).toBe(403);

    const adminUser = db.upsertUserByGoogle({
      googleSub: 'google-sub-founder',
      email: 'admin@example.com',
      name: 'Admin',
      picture: null,
    });
    const adminSession = db.createSession(adminUser.id, 60_000);

    const missingIssueResponse = await app.request('http://localhost/api/internal/newsletter/send-issue', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        cookie: `atx_session=${adminSession.id}`,
      },
      body: JSON.stringify({ issueId: 'missing-issue' }),
    });
    expect(missingIssueResponse.status).toBe(404);

    for (let index = 0; index < 30; index += 1) {
      newsletterDb.upsertSubscriber({
        email: `pilot-${index}@example.com`,
        list: 'io_pulse',
      });
    }

    const issue = newsletterDb.createIssueDraft({
      site: 'io',
      list: 'io_pulse',
      title: 'Pilot issue',
      draftMd: 'Hello pilot subscribers',
    });

    const response = await app.request('http://localhost/api/internal/newsletter/send-issue', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        cookie: `atx_session=${adminSession.id}`,
      },
      body: JSON.stringify({ issueId: issue.id }),
    });

    expect(response.status).toBe(200);
    const payload = (await response.json()) as { ok: boolean; sent: number; capped: boolean; providerId: string; status: string };
    expect(payload.ok).toBe(true);
    expect(payload.sent).toBe(25);
    expect(payload.capped).toBe(true);
    expect(payload.providerId).toBeTruthy();
    expect(payload.status).toBe('sent');

    const sentIssue = newsletterDb.getIssueById(issue.id);
    expect(sentIssue?.status).toBe('sent');
    expect(sentIssue?.providerId).toBe(payload.providerId);
  });

  it('ingests inbound newsletter replies and enforces secret checks', async () => {
    process.env.INBOUND_EMAIL_WEBHOOK_SECRET = 'inbound-secret';
    const { app, db } = await loadBackend();
    const newsletterDb = await import('../../db/newsletter.js');
    const issue = newsletterDb.createIssueDraft({
      site: 'io',
      list: 'io_pulse',
      title: 'Issue for replies',
      draftMd: 'Draft content',
    });

    const unauthorizedResponse = await app.request('http://localhost/api/webhooks/inbound-email', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        replyToToken: issue.replyToToken,
        from: 'reader@example.com',
        subject: 'Reply',
        text: 'No secret header should fail',
      }),
    });
    expect(unauthorizedResponse.status).toBe(401);

    const wrongSecretResponse = await app.request('http://localhost/api/webhooks/inbound-email', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-inbound-secret': 'wrong-secret',
      },
      body: JSON.stringify({
        replyToToken: issue.replyToToken,
        from: 'reader@example.com',
        subject: 'Reply',
        text: 'Wrong secret should fail',
      }),
    });
    expect(wrongSecretResponse.status).toBe(401);

    const response = await app.request('http://localhost/api/webhooks/inbound-email', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-inbound-secret': 'inbound-secret',
      },
      body: JSON.stringify({
        replyToToken: issue.replyToToken,
        from: 'reader@example.com',
        subject: 'Reply',
        text: 'This is a newsletter reply.',
      }),
    });
    expect(response.status).toBe(200);
    const payload = (await response.json()) as {
      ok: boolean;
      linked: boolean;
      contributionId: string;
    };

    expect(payload.ok).toBe(true);
    expect(payload.linked).toBe(true);
    expect(payload.contributionId).toBeTruthy();

    const contribution = db.getContributionById(payload.contributionId);
    expect(contribution?.source).toBe('newsletter_reply');
    const metadata = JSON.parse(contribution?.metadata ?? '{}') as { issue_id?: string | null };
    expect(metadata.issue_id).toBe(issue.id);

    const linkedRow = db
      .getDb()
      .prepare(
        `SELECT role
         FROM issue_contributions
         WHERE issue_id = @issueId
           AND contribution_id = @contributionId`,
      )
      .get({ issueId: issue.id, contributionId: payload.contributionId }) as { role: string } | undefined;
    expect(linkedRow?.role).toBe('reply');
  });

  it('lists recent issues for admins', async () => {
    const { app, db } = await loadBackend();
    process.env.ADMIN_EMAILS = 'admin@example.com';
    const newsletterDb = await import('../../db/newsletter.js');
    const user = db.upsertUserByGoogle({
      googleSub: 'google-sub-admin-issues',
      email: 'admin@example.com',
      name: 'Admin',
      picture: null,
    });
    const session = db.createSession(user.id, 60_000);

    const draftIssue = newsletterDb.createIssueDraft({
      site: 'io',
      list: 'io_pulse',
      title: 'Issue for admin list',
      draftMd: 'draft',
    });

    const response = await app.request('http://localhost/api/internal/agent/issues?limit=5', {
      headers: { cookie: `atx_session=${session.id}` },
    });

    expect(response.status).toBe(200);
    const payload = (await response.json()) as {
      ok: boolean;
      issues: Array<{ id: string; title: string; status: string }>;
    };
    expect(payload.ok).toBe(true);
    expect(payload.issues.some((issue) => issue.id === draftIssue.id)).toBe(true);
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
