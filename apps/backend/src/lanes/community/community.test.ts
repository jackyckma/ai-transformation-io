import { mkdtempSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const managedEnvKeys = ['SQLITE_PATH', 'DATABASE_URL', 'NODE_ENV'] as const;

const originalEnv = Object.fromEntries(
  managedEnvKeys.map((key) => [key, process.env[key]]),
) as Record<(typeof managedEnvKeys)[number], string | undefined>;

let tempDir = '';

beforeEach(() => {
  tempDir = mkdtempSync(path.join(os.tmpdir(), 'atx-wave13-community-'));
  process.env.SQLITE_PATH = path.join(tempDir, 'app.db');
  delete process.env.DATABASE_URL;
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
  const personalDbModule = await import('../../db/personal.js');
  const agentProtocolDbModule = await import('../../db/agent-protocol.js');
  const backendModule = await import('../../index.js');
  return {
    app: backendModule.app,
    db: dbModule,
    objectsDb: objectsDbModule,
    personalDb: personalDbModule,
    agentDb: agentProtocolDbModule,
  };
}

function collectIds(payload: { objects: Array<{ id: string }> }): Set<string> {
  return new Set(payload.objects.map((item) => item.id));
}

describe('Wave 14 community routes + personalization parity', () => {
  it('activates phase2 publish pipeline and enforces visibility matrix for session and bearer', async () => {
    const { app, db, agentDb } = await loadBackend();
    const ioMember = db.upsertUserByGoogle({
      googleSub: 'wave14-phase2-io-member',
      email: 'wave14-phase2-io-member@example.com',
      name: 'IO Member',
      picture: null,
    });
    const orgMember = db.upsertUserByGoogle({
      googleSub: 'wave14-phase2-org-member',
      email: 'wave14-phase2-org-member@example.com',
      name: 'ORG Member',
      picture: null,
    });
    const owner = db.upsertUserByGoogle({
      googleSub: 'wave14-phase2-owner',
      email: 'wave14-phase2-owner@example.com',
      name: 'Owner',
      picture: null,
    });

    const ioSession = db.createSession(ioMember.id, 60_000);
    const orgSession = db.createSession(orgMember.id, 60_000);
    const ownerSession = db.createSession(owner.id, 60_000);
    const ownerToken = agentDb.issueWriteToken({
      email: owner.email,
      clientId: 'wave14-phase2-owner-agent',
      scopes: ['write:inquiry'],
    });

    const setAutoPreference = await app.request('http://localhost/api/settings/publish-preference', {
      method: 'PUT',
      headers: {
        host: 'ai-transformation.org',
        cookie: `atx_session=${ownerSession.id}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        defaultPublishMode: 'auto',
      }),
    });
    expect(setAutoPreference.status).toBe(200);

    const createMentorship = await app.request('http://localhost/api/objects', {
      method: 'POST',
      headers: {
        host: 'ai-transformation.org',
        cookie: `atx_session=${ownerSession.id}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        objectType: 'community',
        type: 'mentorship_request',
        site: 'org',
        visibility: 'members-only',
        title: 'Need mentorship for governance rollout',
        body: 'Looking for mentors who built AI governance programs at scale.',
        metadata: {
          focusArea: 'AI governance',
          tags: ['governance', 'mentorship'],
          source: 'test',
        },
      }),
    });
    expect(createMentorship.status).toBe(201);
    const createMentorshipJson = (await createMentorship.json()) as {
      ok: true;
      object: { id: string; status: string; metadata: Record<string, unknown> };
    };
    expect(createMentorshipJson.object.status).toBe('draft');
    expect(createMentorshipJson.object.metadata.reserved).toBeUndefined();
    expect(createMentorshipJson.object.metadata.focusArea).toBe('AI governance');

    const submitMentorship = await app.request('http://localhost/api/objects/submit', {
      method: 'POST',
      headers: {
        host: 'ai-transformation.org',
        cookie: `atx_session=${ownerSession.id}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        objectId: createMentorshipJson.object.id,
      }),
    });
    expect(submitMentorship.status).toBe(200);
    const submitMentorshipJson = (await submitMentorship.json()) as {
      ok: true;
      object: { id: string; status: string; visibility: string };
    };
    expect(submitMentorshipJson.object.status).toBe('published');
    expect(submitMentorshipJson.object.visibility).toBe('members-only');

    const createPrivateProject = await app.request('http://localhost/api/v1/objects', {
      method: 'POST',
      headers: {
        host: 'ai-transformation.org',
        authorization: `Bearer ${ownerToken.bearerToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        objectType: 'community',
        type: 'project_request',
        site: 'org',
        visibility: 'private',
        title: 'Private project request',
        body: 'Need one reviewer for private project planning.',
        metadata: {
          summary: 'Private project planning support request',
          skillsNeeded: ['facilitation', 'governance'],
          tags: ['private-track'],
        },
      }),
    });
    expect(createPrivateProject.status).toBe(201);
    const createPrivateProjectJson = (await createPrivateProject.json()) as { ok: true; object: { id: string } };

    const submitPrivateProject = await app.request('http://localhost/api/v1/objects/submit', {
      method: 'POST',
      headers: {
        host: 'ai-transformation.org',
        authorization: `Bearer ${ownerToken.bearerToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        objectId: createPrivateProjectJson.object.id,
        publishMode: 'auto',
      }),
    });
    expect(submitPrivateProject.status).toBe(200);
    const submitPrivateProjectJson = (await submitPrivateProject.json()) as {
      ok: true;
      object: { status: string; visibility: string };
    };
    expect(submitPrivateProjectJson.object.status).toBe('published');
    expect(submitPrivateProjectJson.object.visibility).toBe('private');

    const anonymousMentorshipList = await app.request(
      'http://localhost/api/community/objects?type=mentorship_request&limit=20',
      {
        headers: {
          host: 'ai-transformation.org',
        },
      },
    );
    expect(anonymousMentorshipList.status).toBe(200);
    const anonymousMentorshipListJson = (await anonymousMentorshipList.json()) as {
      ok: true;
      objects: Array<{ id: string }>;
    };
    expect(collectIds(anonymousMentorshipListJson).has(createMentorshipJson.object.id)).toBe(false);

    const ioMentorshipList = await app.request(
      'http://localhost/api/community/objects?type=mentorship_request&limit=20',
      {
        headers: {
          host: 'ai-transformation.io',
          cookie: `atx_session=${ioSession.id}`,
        },
      },
    );
    expect(ioMentorshipList.status).toBe(200);
    const ioMentorshipListJson = (await ioMentorshipList.json()) as {
      ok: true;
      objects: Array<{ id: string }>;
    };
    expect(collectIds(ioMentorshipListJson).has(createMentorshipJson.object.id)).toBe(false);

    const orgMentorshipList = await app.request(
      'http://localhost/api/community/objects?type=mentorship_request&limit=20',
      {
        headers: {
          host: 'ai-transformation.org',
          cookie: `atx_session=${orgSession.id}`,
        },
      },
    );
    expect(orgMentorshipList.status).toBe(200);
    const orgMentorshipListJson = (await orgMentorshipList.json()) as {
      ok: true;
      objects: Array<{ id: string }>;
    };
    expect(collectIds(orgMentorshipListJson).has(createMentorshipJson.object.id)).toBe(true);

    const orgPrivateProjectList = await app.request(
      'http://localhost/api/community/objects?type=project_request&limit=20',
      {
        headers: {
          host: 'ai-transformation.org',
          cookie: `atx_session=${orgSession.id}`,
        },
      },
    );
    expect(orgPrivateProjectList.status).toBe(200);
    const orgPrivateProjectListJson = (await orgPrivateProjectList.json()) as {
      ok: true;
      objects: Array<{ id: string }>;
    };
    expect(collectIds(orgPrivateProjectListJson).has(createPrivateProjectJson.object.id)).toBe(false);

    const ownerPrivateProjectList = await app.request(
      'http://localhost/api/v1/community/objects?type=project_request&limit=20',
      {
        headers: {
          host: 'ai-transformation.org',
          authorization: `Bearer ${ownerToken.bearerToken}`,
        },
      },
    );
    expect(ownerPrivateProjectList.status).toBe(200);
    const ownerPrivateProjectListJson = (await ownerPrivateProjectList.json()) as {
      ok: true;
      objects: Array<{ id: string }>;
    };
    expect(collectIds(ownerPrivateProjectListJson).has(createPrivateProjectJson.object.id)).toBe(true);

    const orgGetMentorship = await app.request(
      `http://localhost/api/community/objects/${createMentorshipJson.object.id}/replies`,
      {
        headers: {
          host: 'ai-transformation.org',
          cookie: `atx_session=${orgSession.id}`,
        },
      },
    );
    expect(orgGetMentorship.status).toBe(200);

    const anonymousGetMentorship = await app.request(
      `http://localhost/api/community/objects/${createMentorshipJson.object.id}/replies`,
      {
        headers: {
          host: 'ai-transformation.org',
        },
      },
    );
    expect(anonymousGetMentorship.status).toBe(404);

    const ownerGetPrivateProject = await app.request(
      `http://localhost/api/v1/community/objects/${createPrivateProjectJson.object.id}/replies`,
      {
        headers: {
          host: 'ai-transformation.org',
          authorization: `Bearer ${ownerToken.bearerToken}`,
        },
      },
    );
    expect(ownerGetPrivateProject.status).toBe(200);

    const orgGetPrivateProject = await app.request(
      `http://localhost/api/community/objects/${createPrivateProjectJson.object.id}/replies`,
      {
        headers: {
          host: 'ai-transformation.org',
          cookie: `atx_session=${orgSession.id}`,
        },
      },
    );
    expect(orgGetPrivateProject.status).toBe(404);
  });

  it('supports phase2 action verbs plus reply/follow/save on phase2 community objects', async () => {
    const { app, db, objectsDb } = await loadBackend();
    const member = db.upsertUserByGoogle({
      googleSub: 'wave14-phase2-actions-member',
      email: 'wave14-phase2-actions@example.com',
      name: 'Phase2 Actions Member',
      picture: null,
    });
    const session = db.createSession(member.id, 60_000);

    const mentorshipRequest = objectsDb.createObject({
      payload: {
        objectType: 'community',
        type: 'mentorship_request',
        site: 'org',
        visibility: 'public',
        title: 'Mentorship request object',
        body: 'Need a mentor to improve delivery rituals.',
        status: 'published',
        metadata: {
          focusArea: 'Delivery',
          tags: ['delivery', 'mentorship'],
        },
      },
      ownerUserId: member.id,
    });
    const apprenticeshipOpportunity = objectsDb.createObject({
      payload: {
        objectType: 'community',
        type: 'apprenticeship_opportunity',
        site: 'org',
        visibility: 'public',
        title: 'Apprenticeship opportunity',
        body: 'Open apprenticeship slot for systems-level contributors.',
        status: 'published',
        metadata: {
          tags: ['apprenticeship', 'systems'],
        },
      },
      ownerUserId: member.id,
    });

    const replyResponse = await app.request('http://localhost/api/community/replies', {
      method: 'POST',
      headers: {
        host: 'ai-transformation.org',
        cookie: `atx_session=${session.id}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        site: 'org',
        objectId: mentorshipRequest.id,
        body: 'Happy to share experience on this.',
      }),
    });
    expect(replyResponse.status).toBe(201);

    const followOnce = await app.request('http://localhost/api/community/follows', {
      method: 'POST',
      headers: {
        host: 'ai-transformation.org',
        cookie: `atx_session=${session.id}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        site: 'org',
        objectId: mentorshipRequest.id,
        kind: 'follow',
      }),
    });
    expect(followOnce.status).toBe(200);
    const followOnceJson = (await followOnce.json()) as { ok: true; interaction: { id: string } };

    const followTwice = await app.request('http://localhost/api/community/follows', {
      method: 'POST',
      headers: {
        host: 'ai-transformation.org',
        cookie: `atx_session=${session.id}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        site: 'org',
        objectId: mentorshipRequest.id,
        kind: 'follow',
      }),
    });
    expect(followTwice.status).toBe(200);
    const followTwiceJson = (await followTwice.json()) as { ok: true; interaction: { id: string } };
    expect(followTwiceJson.interaction.id).toBe(followOnceJson.interaction.id);

    const requestMentorOnce = await app.request('http://localhost/api/community/actions', {
      method: 'POST',
      headers: {
        host: 'ai-transformation.org',
        cookie: `atx_session=${session.id}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        site: 'org',
        objectId: mentorshipRequest.id,
        kind: 'request_mentor',
        body: 'Can we connect this week?',
      }),
    });
    expect(requestMentorOnce.status).toBe(200);
    const requestMentorOnceJson = (await requestMentorOnce.json()) as {
      ok: true;
      interaction: { id: string; kind: string };
    };
    expect(requestMentorOnceJson.interaction.kind).toBe('request_mentor');

    const requestMentorTwice = await app.request('http://localhost/api/community/actions', {
      method: 'POST',
      headers: {
        host: 'ai-transformation.org',
        cookie: `atx_session=${session.id}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        site: 'org',
        objectId: mentorshipRequest.id,
        kind: 'request_mentor',
      }),
    });
    expect(requestMentorTwice.status).toBe(200);
    const requestMentorTwiceJson = (await requestMentorTwice.json()) as {
      ok: true;
      interaction: { id: string };
    };
    expect(requestMentorTwiceJson.interaction.id).toBe(requestMentorOnceJson.interaction.id);

    const applyAction = await app.request('http://localhost/api/community/actions', {
      method: 'POST',
      headers: {
        host: 'ai-transformation.org',
        cookie: `atx_session=${session.id}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        site: 'org',
        objectId: apprenticeshipOpportunity.id,
        kind: 'apply',
        body: 'Interested in applying and available this quarter.',
      }),
    });
    expect(applyAction.status).toBe(200);
    const applyActionJson = (await applyAction.json()) as { ok: true; interaction: { kind: string } };
    expect(applyActionJson.interaction.kind).toBe('apply');

    const saveBookmark = await app.request('http://localhost/api/personal/bookmarks', {
      method: 'POST',
      headers: {
        host: 'ai-transformation.org',
        cookie: `atx_session=${session.id}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        site: 'org',
        target: {
          targetType: 'object',
          targetId: mentorshipRequest.id,
        },
        title: 'Saved mentorship request',
      }),
    });
    expect(saveBookmark.status).toBe(201);

    const listInteractions = await app.request('http://localhost/api/community/interactions?site=org&limit=20', {
      headers: {
        host: 'ai-transformation.org',
        cookie: `atx_session=${session.id}`,
      },
    });
    expect(listInteractions.status).toBe(200);
    const listInteractionsJson = (await listInteractions.json()) as {
      ok: true;
      interactions: Array<{ kind: string; objectId: string }>;
    };
    expect(
      listInteractionsJson.interactions.some(
        (item) => item.kind === 'follow' && item.objectId === mentorshipRequest.id,
      ),
    ).toBe(true);
  });

  it('returns deterministic experimental matches with visibility enforcement and session/bearer parity', async () => {
    const { app, db, objectsDb, agentDb } = await loadBackend();
    const owner = db.upsertUserByGoogle({
      googleSub: 'wave14-matcher-owner',
      email: 'wave14-matcher-owner@example.com',
      name: 'Matcher Owner',
      picture: null,
    });
    const other = db.upsertUserByGoogle({
      googleSub: 'wave14-matcher-other',
      email: 'wave14-matcher-other@example.com',
      name: 'Matcher Other',
      picture: null,
    });
    const session = db.createSession(owner.id, 60_000);
    const token = agentDb.issueWriteToken({
      email: owner.email,
      clientId: 'wave14-matcher-owner-agent',
      scopes: ['write:inquiry'],
    });

    const helpRequest = objectsDb.createObject({
      payload: {
        objectType: 'community',
        type: 'help_request',
        site: 'org',
        visibility: 'public',
        title: 'Need peer support on governance rollout',
        body: 'Looking for support with governance rituals and operating cadence.',
        status: 'published',
        metadata: {
          tags: ['governance', 'rituals'],
        },
      },
      ownerUserId: owner.id,
    });
    const bestCollaborationOffer = objectsDb.createObject({
      payload: {
        objectType: 'community',
        type: 'collaboration_offer',
        site: 'org',
        visibility: 'public',
        title: 'Offer help for governance cadence',
        body: 'I can collaborate on governance rituals and implementation plans.',
        status: 'published',
        metadata: {
          offering: ['governance', 'cadence'],
          tags: ['governance', 'implementation'],
        },
      },
      ownerUserId: other.id,
    });
    const hiddenPrivateOffer = objectsDb.createObject({
      payload: {
        objectType: 'community',
        type: 'collaboration_offer',
        site: 'org',
        visibility: 'private',
        title: 'Hidden private offer',
        body: 'Private collaboration context.',
        status: 'published',
        metadata: {
          tags: ['governance'],
        },
      },
      ownerUserId: other.id,
    });

    const helpMatchSession = await app.request('http://localhost/api/community/match', {
      method: 'POST',
      headers: {
        host: 'ai-transformation.org',
        cookie: `atx_session=${session.id}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        site: 'org',
        objectId: helpRequest.id,
        limit: 5,
      }),
    });
    expect(helpMatchSession.status).toBe(200);
    const helpMatchSessionJson = (await helpMatchSession.json()) as {
      experimental: true;
      objectId: string;
      type: string;
      candidates: Array<{ objectId: string; score: number; reasons: string[] }>;
    };
    expect(helpMatchSessionJson.experimental).toBe(true);
    expect(helpMatchSessionJson.objectId).toBe(helpRequest.id);
    expect(helpMatchSessionJson.type).toBe('help_request');
    expect(helpMatchSessionJson.candidates.length).toBeGreaterThan(0);
    expect(helpMatchSessionJson.candidates[0]?.objectId).toBe(bestCollaborationOffer.id);
    expect(helpMatchSessionJson.candidates[0]?.reasons.length).toBeGreaterThan(0);
    expect(helpMatchSessionJson.candidates.some((item) => item.objectId === hiddenPrivateOffer.id)).toBe(false);

    const helpMatchBearer = await app.request('http://localhost/api/v1/community/match', {
      method: 'POST',
      headers: {
        host: 'ai-transformation.org',
        authorization: `Bearer ${token.bearerToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        site: 'org',
        objectId: helpRequest.id,
        limit: 5,
      }),
    });
    expect(helpMatchBearer.status).toBe(200);
    const helpMatchBearerJson = (await helpMatchBearer.json()) as {
      experimental: true;
      candidates: Array<{ objectId: string }>;
    };
    expect(helpMatchBearerJson.candidates.map((item) => item.objectId)).toEqual(
      helpMatchSessionJson.candidates.map((item) => item.objectId),
    );

    const mentorshipRequest = objectsDb.createObject({
      payload: {
        objectType: 'community',
        type: 'mentorship_request',
        site: 'org',
        visibility: 'public',
        title: 'Need mentor for delivery systems',
        body: 'Looking for delivery system mentorship with strong governance context.',
        status: 'published',
        metadata: {
          focusArea: 'Delivery systems',
          tags: ['delivery', 'governance'],
        },
      },
      ownerUserId: owner.id,
    });
    const apprenticeshipCandidate = objectsDb.createObject({
      payload: {
        objectType: 'community',
        type: 'apprenticeship_opportunity',
        site: 'org',
        visibility: 'public',
        title: 'Apprenticeship in delivery systems',
        body: 'Offering apprenticeship support in delivery and governance systems.',
        status: 'published',
        metadata: {
          focusArea: 'Delivery systems',
          tags: ['delivery', 'governance'],
        },
      },
      ownerUserId: other.id,
    });

    const mentorshipMatch = await app.request('http://localhost/api/community/match', {
      method: 'POST',
      headers: {
        host: 'ai-transformation.org',
        cookie: `atx_session=${session.id}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        site: 'org',
        objectId: mentorshipRequest.id,
        type: 'mentorship_request',
        limit: 5,
      }),
    });
    expect(mentorshipMatch.status).toBe(200);
    const mentorshipMatchJson = (await mentorshipMatch.json()) as {
      experimental: true;
      candidates: Array<{ objectId: string; reasons: string[] }>;
    };
    expect(mentorshipMatchJson.candidates.length).toBeGreaterThan(0);
    expect(mentorshipMatchJson.candidates.some((item) => item.objectId === apprenticeshipCandidate.id)).toBe(true);
    expect(mentorshipMatchJson.candidates[0]?.reasons.length).toBeGreaterThan(0);
  });

  it('persists match feedback and returns real activity summary with anonymous zero fallback', async () => {
    const { app, db, objectsDb, agentDb } = await loadBackend();
    const communityDb = await import('../../db/community.js');
    const member = db.upsertUserByGoogle({
      googleSub: 'wave14-summary-member',
      email: 'wave14-summary-member@example.com',
      name: 'Summary Member',
      picture: null,
    });
    const session = db.createSession(member.id, 60_000);
    const token = agentDb.issueWriteToken({
      email: member.email,
      clientId: 'wave14-summary-member-agent',
      scopes: ['write:inquiry'],
    });

    const source = objectsDb.createObject({
      payload: {
        objectType: 'community',
        type: 'help_request',
        site: 'org',
        visibility: 'public',
        title: 'Source object',
        body: 'Need practical help for governance launch.',
        status: 'published',
        metadata: {
          tags: ['governance', 'launch'],
        },
      },
      ownerUserId: member.id,
    });
    const candidate = objectsDb.createObject({
      payload: {
        objectType: 'community',
        type: 'collaboration_offer',
        site: 'org',
        visibility: 'public',
        title: 'Candidate collaboration offer',
        body: 'Can collaborate on governance launch planning.',
        status: 'published',
        metadata: {
          tags: ['governance', 'planning'],
          offering: ['governance'],
        },
      },
      ownerUserId: member.id,
    });

    const follow = await app.request('http://localhost/api/community/follows', {
      method: 'POST',
      headers: {
        host: 'ai-transformation.org',
        cookie: `atx_session=${session.id}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        site: 'org',
        objectId: source.id,
        kind: 'follow',
      }),
    });
    expect(follow.status).toBe(200);

    const collaborate = await app.request('http://localhost/api/community/actions', {
      method: 'POST',
      headers: {
        host: 'ai-transformation.org',
        cookie: `atx_session=${session.id}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        site: 'org',
        objectId: candidate.id,
        kind: 'collaborate',
        body: 'I can collaborate immediately.',
      }),
    });
    expect(collaborate.status).toBe(200);

    const createContribution = await app.request('http://localhost/api/contributions', {
      method: 'POST',
      headers: {
        host: 'ai-transformation.org',
        cookie: `atx_session=${session.id}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        site: 'org',
        objectType: 'community',
        type: 'question',
        visibility: 'members-only',
        title: 'Contribution for activity summary',
        body: 'Collecting feedback on how teams run governance routines.',
      }),
    });
    expect(createContribution.status).toBe(201);

    const bookmark = await app.request('http://localhost/api/personal/bookmarks', {
      method: 'POST',
      headers: {
        host: 'ai-transformation.org',
        cookie: `atx_session=${session.id}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        site: 'org',
        target: {
          targetType: 'object',
          targetId: candidate.id,
        },
        title: 'Saved candidate',
      }),
    });
    expect(bookmark.status).toBe(201);

    const recentlyViewed = await app.request('http://localhost/api/personal/recently-viewed', {
      method: 'POST',
      headers: {
        host: 'ai-transformation.org',
        cookie: `atx_session=${session.id}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        site: 'org',
        target: {
          targetType: 'object',
          targetId: source.id,
        },
      }),
    });
    expect(recentlyViewed.status).toBe(201);

    const feedbackUp = await app.request('http://localhost/api/community/match/feedback', {
      method: 'POST',
      headers: {
        host: 'ai-transformation.org',
        cookie: `atx_session=${session.id}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        site: 'org',
        objectId: source.id,
        candidateObjectId: candidate.id,
        verdict: 'up',
      }),
    });
    expect(feedbackUp.status).toBe(200);

    const feedbackDown = await app.request('http://localhost/api/community/match/feedback', {
      method: 'POST',
      headers: {
        host: 'ai-transformation.org',
        cookie: `atx_session=${session.id}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        site: 'org',
        objectId: source.id,
        candidateObjectId: candidate.id,
        verdict: 'down',
      }),
    });
    expect(feedbackDown.status).toBe(200);
    const storedFeedback = communityDb.getMatchFeedback({
      userId: member.id,
      objectId: source.id,
      candidateObjectId: candidate.id,
    });
    expect(storedFeedback?.verdict).toBe('down');

    const summarySession = await app.request('http://localhost/api/personal/activity-summary?site=org', {
      headers: {
        host: 'ai-transformation.org',
        cookie: `atx_session=${session.id}`,
      },
    });
    expect(summarySession.status).toBe(200);
    const summarySessionJson = (await summarySession.json()) as {
      ok: true;
      summary: {
        followedTopics: Array<{ topic: string; count: number }>;
        contributionsCount: number;
        interactionsCount: number;
        bookmarksCount: number;
        recentObjectTypes: Array<{ type: string; count: number }>;
      };
    };
    expect(summarySessionJson.summary.contributionsCount).toBeGreaterThan(0);
    expect(summarySessionJson.summary.interactionsCount).toBeGreaterThan(0);
    expect(summarySessionJson.summary.bookmarksCount).toBeGreaterThan(0);
    expect(summarySessionJson.summary.followedTopics.length).toBeGreaterThan(0);
    expect(summarySessionJson.summary.recentObjectTypes.length).toBeGreaterThan(0);

    const summaryBearer = await app.request('http://localhost/api/v1/personal/activity-summary?site=org', {
      headers: {
        host: 'ai-transformation.org',
        authorization: `Bearer ${token.bearerToken}`,
      },
    });
    expect(summaryBearer.status).toBe(200);
    const summaryBearerJson = (await summaryBearer.json()) as {
      ok: true;
      summary: {
        followedTopics: Array<{ topic: string; count: number }>;
        contributionsCount: number;
        interactionsCount: number;
        bookmarksCount: number;
        recentObjectTypes: Array<{ type: string; count: number }>;
      };
    };
    expect(summaryBearerJson.summary.contributionsCount).toBe(summarySessionJson.summary.contributionsCount);
    expect(summaryBearerJson.summary.interactionsCount).toBe(summarySessionJson.summary.interactionsCount);
    expect(summaryBearerJson.summary.bookmarksCount).toBe(summarySessionJson.summary.bookmarksCount);
    expect(summaryBearerJson.summary.followedTopics).toEqual(summarySessionJson.summary.followedTopics);
    expect(summaryBearerJson.summary.recentObjectTypes).toEqual(summarySessionJson.summary.recentObjectTypes);

    const summaryAnonymous = await app.request('http://localhost/api/personal/activity-summary?site=org', {
      headers: {
        host: 'ai-transformation.org',
      },
    });
    expect(summaryAnonymous.status).toBe(200);
    const summaryAnonymousJson = (await summaryAnonymous.json()) as {
      ok: true;
      summary: {
        followedTopics: Array<unknown>;
        contributionsCount: number;
        interactionsCount: number;
        bookmarksCount: number;
        recentObjectTypes: Array<unknown>;
      };
    };
    expect(summaryAnonymousJson.summary.followedTopics).toEqual([]);
    expect(summaryAnonymousJson.summary.recentObjectTypes).toEqual([]);
    expect(summaryAnonymousJson.summary.contributionsCount).toBe(0);
    expect(summaryAnonymousJson.summary.interactionsCount).toBe(0);
    expect(summaryAnonymousJson.summary.bookmarksCount).toBe(0);
  });
});
