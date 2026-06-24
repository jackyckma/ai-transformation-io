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
  tempDir = mkdtempSync(path.join(os.tmpdir(), 'atx-wave12-objects-'));
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

function collectObjectIds(payload: { objects: Array<{ id: string }> }) {
  return new Set(payload.objects.map((item) => item.id));
}

describe('Wave 12 objects + moderation', () => {
  it('enforces visibility matrix for anonymous, members, owner, and bearer owner', async () => {
    const { app, db, objectsDb, agentDb } = await loadBackend();

    const ioMember = db.upsertUserByGoogle({
      googleSub: 'google-sub-io-member',
      email: 'io-member@example.com',
      name: 'IO Member',
      picture: null,
    });
    const orgMember = db.upsertUserByGoogle({
      googleSub: 'google-sub-org-member',
      email: 'org-member@example.com',
      name: 'ORG Member',
      picture: null,
    });
    const owner = db.upsertUserByGoogle({
      googleSub: 'google-sub-owner',
      email: 'owner@example.com',
      name: 'Owner',
      picture: null,
    });
    const other = db.upsertUserByGoogle({
      googleSub: 'google-sub-other',
      email: 'other@example.com',
      name: 'Other',
      picture: null,
    });

    const ioSession = db.createSession(ioMember.id, 60_000);
    const orgSession = db.createSession(orgMember.id, 60_000);
    const ownerSession = db.createSession(owner.id, 60_000);
    const token = agentDb.issueWriteToken({
      email: owner.email,
      clientId: 'test-agent-owner',
      scopes: ['write:inquiry'],
    });

    const publicIo = objectsDb.createObject({
      payload: {
        objectType: 'knowledge',
        type: 'article',
        site: 'io',
        visibility: 'public',
        title: 'Public IO',
        body: 'Public article on io.',
        status: 'published',
      },
      ownerUserId: null,
    });
    const publicOrg = objectsDb.createObject({
      payload: {
        objectType: 'knowledge',
        type: 'article',
        site: 'org',
        visibility: 'public',
        title: 'Public ORG',
        body: 'Public article on org.',
        status: 'published',
      },
      ownerUserId: null,
    });
    const membersIo = objectsDb.createObject({
      payload: {
        objectType: 'community',
        type: 'discussion',
        site: 'io',
        visibility: 'members-only',
        title: 'Members IO',
        body: 'Members-only discussion on io.',
        status: 'published',
      },
      ownerUserId: ioMember.id,
    });
    const membersOrg = objectsDb.createObject({
      payload: {
        objectType: 'community',
        type: 'discussion',
        site: 'org',
        visibility: 'members-only',
        title: 'Members ORG',
        body: 'Members-only discussion on org.',
        status: 'published',
      },
      ownerUserId: orgMember.id,
    });
    const privateOwner = objectsDb.createObject({
      payload: {
        objectType: 'knowledge',
        type: 'field_note',
        site: 'io',
        visibility: 'private',
        title: 'Owner Private',
        body: 'Owner private note.',
        status: 'draft',
      },
      ownerUserId: owner.id,
    });
    const privateOther = objectsDb.createObject({
      payload: {
        objectType: 'knowledge',
        type: 'field_note',
        site: 'org',
        visibility: 'private',
        title: 'Other Private',
        body: 'Other private note.',
        status: 'draft',
      },
      ownerUserId: other.id,
    });

    const anonymousResponse = await app.request('http://localhost/api/objects?limit=100', {
      headers: { host: 'ai-transformation.io' },
    });
    expect(anonymousResponse.status).toBe(200);
    const anonymousJson = (await anonymousResponse.json()) as { ok: true; objects: Array<{ id: string }> };
    expect(collectObjectIds(anonymousJson)).toEqual(new Set([publicIo.id, publicOrg.id]));

    const ioMemberResponse = await app.request('http://localhost/api/objects?limit=100', {
      headers: {
        host: 'ai-transformation.io',
        cookie: `atx_session=${ioSession.id}`,
      },
    });
    expect(ioMemberResponse.status).toBe(200);
    const ioMemberJson = (await ioMemberResponse.json()) as { ok: true; objects: Array<{ id: string }> };
    expect(collectObjectIds(ioMemberJson)).toEqual(new Set([publicIo.id, publicOrg.id, membersIo.id]));

    const orgMemberResponse = await app.request('http://localhost/api/objects?limit=100', {
      headers: {
        host: 'ai-transformation.org',
        cookie: `atx_session=${orgSession.id}`,
      },
    });
    expect(orgMemberResponse.status).toBe(200);
    const orgMemberJson = (await orgMemberResponse.json()) as { ok: true; objects: Array<{ id: string }> };
    expect(collectObjectIds(orgMemberJson)).toEqual(new Set([publicIo.id, publicOrg.id, membersOrg.id]));

    const ownerResponse = await app.request('http://localhost/api/objects?limit=100', {
      headers: {
        host: 'ai-transformation.io',
        cookie: `atx_session=${ownerSession.id}`,
      },
    });
    expect(ownerResponse.status).toBe(200);
    const ownerJson = (await ownerResponse.json()) as { ok: true; objects: Array<{ id: string }> };
    expect(collectObjectIds(ownerJson)).toEqual(new Set([publicIo.id, publicOrg.id, membersIo.id, privateOwner.id]));
    expect(collectObjectIds(ownerJson).has(privateOther.id)).toBe(false);

    const bearerResponse = await app.request('http://localhost/api/v1/objects?limit=100', {
      headers: {
        host: 'ai-transformation.io',
        authorization: `Bearer ${token.bearerToken}`,
      },
    });
    expect(bearerResponse.status).toBe(200);
    const bearerJson = (await bearerResponse.json()) as { ok: true; objects: Array<{ id: string }> };
    expect(collectObjectIds(bearerJson)).toEqual(new Set([publicIo.id, publicOrg.id, membersIo.id, privateOwner.id]));
    expect(collectObjectIds(bearerJson).has(privateOther.id)).toBe(false);

    const privateAnonymous = await app.request(`http://localhost/api/objects/${privateOwner.id}`, {
      headers: { host: 'ai-transformation.io' },
    });
    expect(privateAnonymous.status).toBe(404);

    const privateBearerOwner = await app.request(`http://localhost/api/v1/objects/${privateOwner.id}`, {
      headers: {
        host: 'ai-transformation.io',
        authorization: `Bearer ${token.bearerToken}`,
      },
    });
    expect(privateBearerOwner.status).toBe(200);
  });

  it('applies auto moderation for submit with auto and review publish modes', async () => {
    const { app, db } = await loadBackend();
    const user = db.upsertUserByGoogle({
      googleSub: 'google-sub-auto-moderation',
      email: 'auto-moderation@example.com',
      name: 'Auto Moderation User',
      picture: null,
    });
    const session = db.createSession(user.id, 60_000);

    const setAutoPreference = await app.request('http://localhost/api/settings/publish-preference', {
      method: 'PUT',
      headers: {
        host: 'ai-transformation.org',
        'content-type': 'application/json',
        cookie: `atx_session=${session.id}`,
      },
      body: JSON.stringify({
        defaultPublishMode: 'auto',
      }),
    });
    expect(setAutoPreference.status).toBe(200);

    const createAllowed = await app.request('http://localhost/api/objects', {
      method: 'POST',
      headers: {
        host: 'ai-transformation.org',
        'content-type': 'application/json',
        cookie: `atx_session=${session.id}`,
      },
      body: JSON.stringify({
        objectType: 'community',
        type: 'discussion',
        site: 'org',
        visibility: 'members-only',
        title: 'Allowed moderation object',
        body: 'We run a cross-functional review every week to track AI delivery and governance.',
      }),
    });
    expect(createAllowed.status).toBe(201);
    const allowedJson = (await createAllowed.json()) as { ok: true; object: { id: string } };

    const submitAllowed = await app.request('http://localhost/api/objects/submit', {
      method: 'POST',
      headers: {
        host: 'ai-transformation.org',
        'content-type': 'application/json',
        cookie: `atx_session=${session.id}`,
      },
      body: JSON.stringify({
        objectId: allowedJson.object.id,
      }),
    });
    expect(submitAllowed.status).toBe(200);
    const submitAllowedJson = (await submitAllowed.json()) as {
      ok: true;
      object: { status: string; visibility: string };
    };
    expect(submitAllowedJson.object.status).toBe('published');
    expect(submitAllowedJson.object.visibility).toBe('members-only');

    const createBlocked = await app.request('http://localhost/api/objects', {
      method: 'POST',
      headers: {
        host: 'ai-transformation.org',
        'content-type': 'application/json',
        cookie: `atx_session=${session.id}`,
      },
      body: JSON.stringify({
        objectType: 'community',
        type: 'discussion',
        site: 'org',
        visibility: 'private',
        title: 'Blocked moderation object',
        body: 'This is a buy followers campaign that violates policy and should be blocked.',
      }),
    });
    expect(createBlocked.status).toBe(201);
    const blockedJson = (await createBlocked.json()) as { ok: true; object: { id: string } };

    const submitBlocked = await app.request('http://localhost/api/objects/submit', {
      method: 'POST',
      headers: {
        host: 'ai-transformation.org',
        'content-type': 'application/json',
        cookie: `atx_session=${session.id}`,
      },
      body: JSON.stringify({
        objectId: blockedJson.object.id,
      }),
    });
    expect(submitBlocked.status).toBe(200);
    const submitBlockedJson = (await submitBlocked.json()) as {
      ok: true;
      object: { status: string; visibility: string };
    };
    expect(submitBlockedJson.object.status).toBe('pending');
    expect(submitBlockedJson.object.visibility).toBe('private');

    const submitReviewMode = await app.request('http://localhost/api/objects/submit', {
      method: 'POST',
      headers: {
        host: 'ai-transformation.org',
        'content-type': 'application/json',
        cookie: `atx_session=${session.id}`,
      },
      body: JSON.stringify({
        objectId: allowedJson.object.id,
        publishMode: 'review',
      }),
    });
    expect(submitReviewMode.status).toBe(200);
    const submitReviewJson = (await submitReviewMode.json()) as { ok: true; object: { status: string } };
    expect(submitReviewJson.object.status).toBe('pending');
  });

  it('exposes generic moderation queue and transition for admins', async () => {
    const { app, db } = await loadBackend();
    const admin = db.upsertUserByGoogle({
      googleSub: 'google-sub-admin-moderation',
      email: 'admin@example.com',
      name: 'Admin',
      picture: null,
    });
    const member = db.upsertUserByGoogle({
      googleSub: 'google-sub-member-moderation',
      email: 'member@example.com',
      name: 'Member',
      picture: null,
    });
    const adminSession = db.createSession(admin.id, 60_000);
    const memberSession = db.createSession(member.id, 60_000);
    process.env.ADMIN_EMAILS = 'admin@example.com';

    const contributionDraft = await app.request('http://localhost/api/contributions/drafts', {
      method: 'POST',
      headers: {
        host: 'ai-transformation.org',
        'content-type': 'application/json',
        cookie: `atx_session=${memberSession.id}`,
      },
      body: JSON.stringify({
        site: 'org',
        objectType: 'community',
        type: 'discussion',
        visibility: 'members-only',
        title: 'Contribution draft',
        body: 'Draft contribution for moderation queue.',
      }),
    });
    expect(contributionDraft.status).toBe(200);
    const contributionDraftJson = (await contributionDraft.json()) as { ok: true; contribution: { id: string } };

    const queueResponse = await app.request('http://localhost/api/moderation/queue?limit=100', {
      headers: {
        host: 'ai-transformation.org',
        cookie: `atx_session=${adminSession.id}`,
      },
    });
    expect(queueResponse.status).toBe(200);
    const queueJson = (await queueResponse.json()) as {
      ok: true;
      items: Array<{ id: string; entityType: string; status: string }>;
    };
    expect(
      queueJson.items.some(
        (item) =>
          item.id === contributionDraftJson.contribution.id &&
          item.entityType === 'contribution' &&
          item.status === 'draft',
      ),
    ).toBe(true);

    const transitionResponse = await app.request(
      `http://localhost/api/moderation/queue/${contributionDraftJson.contribution.id}`,
      {
        method: 'PATCH',
        headers: {
          host: 'ai-transformation.org',
          'content-type': 'application/json',
          cookie: `atx_session=${adminSession.id}`,
        },
        body: JSON.stringify({
          status: 'published',
        }),
      },
    );
    expect(transitionResponse.status).toBe(200);
    const transitionJson = (await transitionResponse.json()) as {
      ok: true;
      item: { id: string; status: string };
    };
    expect(transitionJson.item.id).toBe(contributionDraftJson.contribution.id);
    expect(transitionJson.item.status).toBe('published');
  });
});
