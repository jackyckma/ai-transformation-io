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

describe('Wave 13 community routes + agent parity', () => {
  it('enforces visibility for listByType and getWithReplies across session and bearer owner contexts', async () => {
    const { app, db, objectsDb, personalDb, agentDb } = await loadBackend();
    const ioMember = db.upsertUserByGoogle({
      googleSub: 'wave13-community-io-member',
      email: 'wave13-io-member@example.com',
      name: 'IO Member',
      picture: null,
    });
    const orgMember = db.upsertUserByGoogle({
      googleSub: 'wave13-community-org-member',
      email: 'wave13-org-member@example.com',
      name: 'ORG Member',
      picture: null,
    });
    const owner = db.upsertUserByGoogle({
      googleSub: 'wave13-community-owner',
      email: 'wave13-owner@example.com',
      name: 'Owner',
      picture: null,
    });
    const other = db.upsertUserByGoogle({
      googleSub: 'wave13-community-other',
      email: 'wave13-other@example.com',
      name: 'Other',
      picture: null,
    });

    const ioSession = db.createSession(ioMember.id, 60_000);
    const orgSession = db.createSession(orgMember.id, 60_000);
    const ownerSession = db.createSession(owner.id, 60_000);
    const ownerToken = agentDb.issueWriteToken({
      email: owner.email,
      clientId: 'wave13-community-owner-agent',
      scopes: ['write:inquiry'],
    });

    const publicIoDiscussion = objectsDb.createObject({
      payload: {
        objectType: 'community',
        type: 'discussion',
        site: 'io',
        visibility: 'public',
        title: 'Public IO discussion',
        body: 'Public community discussion for visibility tests.',
        status: 'published',
      },
      ownerUserId: ioMember.id,
    });
    const publicOrgEvent = objectsDb.createObject({
      payload: {
        objectType: 'community',
        type: 'event',
        site: 'org',
        visibility: 'public',
        title: 'Public ORG event',
        body: 'Public event details for the community route tests.',
        status: 'published',
      },
      ownerUserId: orgMember.id,
    });
    const membersIo = objectsDb.createObject({
      payload: {
        objectType: 'community',
        type: 'discussion',
        site: 'io',
        visibility: 'members-only',
        title: 'Members IO discussion',
        body: 'Members-only IO discussion.',
        status: 'published',
      },
      ownerUserId: ioMember.id,
    });
    const membersOrg = objectsDb.createObject({
      payload: {
        objectType: 'community',
        type: 'help_request',
        site: 'org',
        visibility: 'members-only',
        title: 'Members ORG request',
        body: 'Members-only ORG help request.',
        status: 'published',
      },
      ownerUserId: orgMember.id,
    });
    const privateOwner = objectsDb.createObject({
      payload: {
        objectType: 'community',
        type: 'discussion',
        site: 'io',
        visibility: 'private',
        title: 'Owner private thread',
        body: 'Private owner-only thread.',
        status: 'draft',
      },
      ownerUserId: owner.id,
    });
    objectsDb.createObject({
      payload: {
        objectType: 'community',
        type: 'discussion',
        site: 'io',
        visibility: 'private',
        title: 'Other private thread',
        body: 'Another private thread.',
        status: 'draft',
      },
      ownerUserId: other.id,
    });
    objectsDb.createObject({
      payload: {
        objectType: 'knowledge',
        type: 'article',
        site: 'org',
        visibility: 'public',
        title: 'Knowledge object should not appear',
        body: 'Knowledge content hidden from community list.',
        status: 'published',
      },
      ownerUserId: null,
    });

    personalDb.createComment({
      userId: ioMember.id,
      payload: {
        site: 'io',
        target: {
          targetType: 'object',
          targetId: publicIoDiscussion.id,
        },
        body: 'Public reply on the discussion.',
      },
    });

    const anonymousList = await app.request('http://localhost/api/community/objects?limit=100', {
      headers: {
        host: 'ai-transformation.io',
      },
    });
    expect(anonymousList.status).toBe(200);
    const anonymousJson = (await anonymousList.json()) as { ok: true; objects: Array<{ id: string }> };
    expect(collectIds(anonymousJson)).toEqual(new Set([publicIoDiscussion.id, publicOrgEvent.id]));

    const ioMemberList = await app.request('http://localhost/api/community/objects?limit=100', {
      headers: {
        host: 'ai-transformation.io',
        cookie: `atx_session=${ioSession.id}`,
      },
    });
    expect(ioMemberList.status).toBe(200);
    const ioMemberJson = (await ioMemberList.json()) as { ok: true; objects: Array<{ id: string }> };
    expect(collectIds(ioMemberJson)).toEqual(new Set([publicIoDiscussion.id, publicOrgEvent.id, membersIo.id]));

    const orgMemberList = await app.request('http://localhost/api/community/objects?limit=100', {
      headers: {
        host: 'ai-transformation.org',
        cookie: `atx_session=${orgSession.id}`,
      },
    });
    expect(orgMemberList.status).toBe(200);
    const orgMemberJson = (await orgMemberList.json()) as { ok: true; objects: Array<{ id: string }> };
    expect(collectIds(orgMemberJson)).toEqual(new Set([publicIoDiscussion.id, publicOrgEvent.id, membersOrg.id]));

    const ownerList = await app.request('http://localhost/api/community/objects?limit=100', {
      headers: {
        host: 'ai-transformation.io',
        cookie: `atx_session=${ownerSession.id}`,
      },
    });
    expect(ownerList.status).toBe(200);
    const ownerJson = (await ownerList.json()) as { ok: true; objects: Array<{ id: string }> };
    expect(collectIds(ownerJson)).toEqual(
      new Set([publicIoDiscussion.id, publicOrgEvent.id, membersIo.id, privateOwner.id]),
    );

    const bearerOwnerList = await app.request('http://localhost/api/v1/community/objects?limit=100', {
      headers: {
        host: 'ai-transformation.io',
        authorization: `Bearer ${ownerToken.bearerToken}`,
      },
    });
    expect(bearerOwnerList.status).toBe(200);
    const bearerOwnerJson = (await bearerOwnerList.json()) as { ok: true; objects: Array<{ id: string }> };
    expect(collectIds(bearerOwnerJson)).toEqual(
      new Set([publicIoDiscussion.id, publicOrgEvent.id, membersIo.id, privateOwner.id]),
    );

    const publicWithReplies = await app.request(
      `http://localhost/api/community/objects/${publicIoDiscussion.id}/replies`,
      {
        headers: {
          host: 'ai-transformation.io',
        },
      },
    );
    expect(publicWithReplies.status).toBe(200);
    const publicWithRepliesJson = (await publicWithReplies.json()) as {
      ok: true;
      object: { id: string };
      replies: Array<{ target: { targetId: string } }>;
    };
    expect(publicWithRepliesJson.object.id).toBe(publicIoDiscussion.id);
    expect(publicWithRepliesJson.replies).toHaveLength(1);
    expect(publicWithRepliesJson.replies[0]?.target.targetId).toBe(publicIoDiscussion.id);

    const privateAnonymous = await app.request(
      `http://localhost/api/community/objects/${privateOwner.id}/replies`,
      {
        headers: {
          host: 'ai-transformation.io',
        },
      },
    );
    expect(privateAnonymous.status).toBe(404);

    const privateBearerOwner = await app.request(
      `http://localhost/api/v1/community/objects/${privateOwner.id}/replies`,
      {
        headers: {
          host: 'ai-transformation.io',
          authorization: `Bearer ${ownerToken.bearerToken}`,
        },
      },
    );
    expect(privateBearerOwner.status).toBe(200);
  });

  it('supports reply/follow/offer_help/join flows and keeps interactions idempotent', async () => {
    const { app, db, objectsDb } = await loadBackend();
    const member = db.upsertUserByGoogle({
      googleSub: 'wave13-community-actions-member',
      email: 'wave13-actions@example.com',
      name: 'Community Member',
      picture: null,
    });
    const session = db.createSession(member.id, 60_000);

    const discussion = objectsDb.createObject({
      payload: {
        objectType: 'community',
        type: 'discussion',
        site: 'org',
        visibility: 'public',
        title: 'Discussion item',
        body: 'Discussion body for reply/follow tests.',
        status: 'published',
      },
      ownerUserId: member.id,
    });
    const helpRequest = objectsDb.createObject({
      payload: {
        objectType: 'community',
        type: 'help_request',
        site: 'org',
        visibility: 'public',
        title: 'Help needed',
        body: 'Help request body for offer tests.',
        status: 'published',
      },
      ownerUserId: member.id,
    });
    const event = objectsDb.createObject({
      payload: {
        objectType: 'community',
        type: 'event',
        site: 'org',
        visibility: 'public',
        title: 'Event listing',
        body: 'Event body for join tests.',
        status: 'published',
      },
      ownerUserId: member.id,
    });

    const replyResponse = await app.request('http://localhost/api/community/replies', {
      method: 'POST',
      headers: {
        host: 'ai-transformation.org',
        'content-type': 'application/json',
        cookie: `atx_session=${session.id}`,
      },
      body: JSON.stringify({
        site: 'org',
        objectId: discussion.id,
        body: 'Reply from member.',
      }),
    });
    expect(replyResponse.status).toBe(201);
    const replyJson = (await replyResponse.json()) as {
      ok: true;
      comment: { target: { targetId: string } };
    };
    expect(replyJson.comment.target.targetId).toBe(discussion.id);

    const followOnce = await app.request('http://localhost/api/community/follows', {
      method: 'POST',
      headers: {
        host: 'ai-transformation.org',
        'content-type': 'application/json',
        cookie: `atx_session=${session.id}`,
      },
      body: JSON.stringify({
        site: 'org',
        objectId: discussion.id,
        kind: 'follow',
      }),
    });
    expect(followOnce.status).toBe(200);
    const followOnceJson = (await followOnce.json()) as { ok: true; interaction: { id: string } };

    const followTwice = await app.request('http://localhost/api/community/follows', {
      method: 'POST',
      headers: {
        host: 'ai-transformation.org',
        'content-type': 'application/json',
        cookie: `atx_session=${session.id}`,
      },
      body: JSON.stringify({
        site: 'org',
        objectId: discussion.id,
        kind: 'follow',
      }),
    });
    expect(followTwice.status).toBe(200);
    const followTwiceJson = (await followTwice.json()) as { ok: true; interaction: { id: string } };
    expect(followTwiceJson.interaction.id).toBe(followOnceJson.interaction.id);

    const offerHelp = await app.request('http://localhost/api/community/offers', {
      method: 'POST',
      headers: {
        host: 'ai-transformation.org',
        'content-type': 'application/json',
        cookie: `atx_session=${session.id}`,
      },
      body: JSON.stringify({
        site: 'org',
        objectId: helpRequest.id,
        kind: 'offer_help',
        body: 'I can help with this request.',
      }),
    });
    expect(offerHelp.status).toBe(200);
    const offerHelpJson = (await offerHelp.json()) as { ok: true; interaction: { kind: string } };
    expect(offerHelpJson.interaction.kind).toBe('offer_help');

    const joinOnce = await app.request('http://localhost/api/community/joins', {
      method: 'POST',
      headers: {
        host: 'ai-transformation.org',
        'content-type': 'application/json',
        cookie: `atx_session=${session.id}`,
      },
      body: JSON.stringify({
        site: 'org',
        objectId: event.id,
        kind: 'join',
      }),
    });
    expect(joinOnce.status).toBe(200);
    const joinOnceJson = (await joinOnce.json()) as { ok: true; interaction: { id: string } };

    const joinTwice = await app.request('http://localhost/api/community/joins', {
      method: 'POST',
      headers: {
        host: 'ai-transformation.org',
        'content-type': 'application/json',
        cookie: `atx_session=${session.id}`,
      },
      body: JSON.stringify({
        site: 'org',
        objectId: event.id,
        kind: 'join',
      }),
    });
    expect(joinTwice.status).toBe(200);
    const joinTwiceJson = (await joinTwice.json()) as { ok: true; interaction: { id: string } };
    expect(joinTwiceJson.interaction.id).toBe(joinOnceJson.interaction.id);

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
    expect(listInteractionsJson.interactions.some((item) => item.kind === 'follow' && item.objectId === discussion.id)).toBe(
      true,
    );
    expect(
      listInteractionsJson.interactions.some((item) => item.kind === 'offer_help' && item.objectId === helpRequest.id),
    ).toBe(true);
    expect(listInteractionsJson.interactions.some((item) => item.kind === 'join' && item.objectId === event.id)).toBe(
      true,
    );

    const unfollow = await app.request('http://localhost/api/community/follows', {
      method: 'DELETE',
      headers: {
        host: 'ai-transformation.org',
        'content-type': 'application/json',
        cookie: `atx_session=${session.id}`,
      },
      body: JSON.stringify({
        site: 'org',
        objectId: discussion.id,
        kind: 'follow',
      }),
    });
    expect(unfollow.status).toBe(200);
    const unfollowJson = (await unfollow.json()) as { ok: true; undone: true; id: string | null };
    expect(unfollowJson.undone).toBe(true);
    expect(unfollowJson.id).not.toBeNull();

    const unfollowAgain = await app.request('http://localhost/api/community/follows', {
      method: 'DELETE',
      headers: {
        host: 'ai-transformation.org',
        'content-type': 'application/json',
        cookie: `atx_session=${session.id}`,
      },
      body: JSON.stringify({
        site: 'org',
        objectId: discussion.id,
        kind: 'follow',
      }),
    });
    expect(unfollowAgain.status).toBe(200);
    const unfollowAgainJson = (await unfollowAgain.json()) as { ok: true; id: string | null };
    expect(unfollowAgainJson.id).toBeNull();

    const leave = await app.request('http://localhost/api/community/joins', {
      method: 'DELETE',
      headers: {
        host: 'ai-transformation.org',
        'content-type': 'application/json',
        cookie: `atx_session=${session.id}`,
      },
      body: JSON.stringify({
        site: 'org',
        objectId: event.id,
        kind: 'join',
      }),
    });
    expect(leave.status).toBe(200);
    const leaveJson = (await leave.json()) as { ok: true; undone: true; id: string | null };
    expect(leaveJson.undone).toBe(true);
    expect(leaveJson.id).not.toBeNull();
  });

  it('supports bearer parity for help_request submit flow and community actions', async () => {
    const { app, db, agentDb } = await loadBackend();
    const owner = db.upsertUserByGoogle({
      googleSub: 'wave13-community-bearer-owner',
      email: 'wave13-bearer-owner@example.com',
      name: 'Bearer Owner',
      picture: null,
    });
    const ownerSession = db.createSession(owner.id, 60_000);
    const token = agentDb.issueWriteToken({
      email: owner.email,
      clientId: 'wave13-community-bearer-client',
      scopes: ['write:inquiry'],
    });

    const createContribution = await app.request('http://localhost/api/v1/contributions', {
      method: 'POST',
      headers: {
        host: 'ai-transformation.org',
        authorization: `Bearer ${token.bearerToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        site: 'org',
        objectType: 'community',
        type: 'help_request',
        visibility: 'members-only',
        title: 'Need implementation review',
        body: 'Need implementation review on this workflow and can share context today.',
      }),
    });
    expect(createContribution.status).toBe(201);
    const createContributionJson = (await createContribution.json()) as {
      ok: true;
      contribution: { id: string };
    };

    const submitContribution = await app.request('http://localhost/api/v1/contributions/submit', {
      method: 'POST',
      headers: {
        host: 'ai-transformation.org',
        authorization: `Bearer ${token.bearerToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        contributionId: createContributionJson.contribution.id,
        publishMode: 'auto',
      }),
    });
    expect(submitContribution.status).toBe(200);
    const submitContributionJson = (await submitContribution.json()) as {
      ok: true;
      contribution: { objectId?: string; status: string; visibility: string };
    };
    expect(submitContributionJson.contribution.status).toBe('published');
    expect(submitContributionJson.contribution.visibility).toBe('members-only');
    expect(typeof submitContributionJson.contribution.objectId).toBe('string');

    const helpRequestObjectId = submitContributionJson.contribution.objectId as string;

    const bearerList = await app.request(
      'http://localhost/api/v1/community/objects?type=help_request&mine=true&limit=50',
      {
        headers: {
          host: 'ai-transformation.org',
          authorization: `Bearer ${token.bearerToken}`,
        },
      },
    );
    expect(bearerList.status).toBe(200);
    const bearerListJson = (await bearerList.json()) as { ok: true; objects: Array<{ id: string }> };
    expect(collectIds(bearerListJson).has(helpRequestObjectId)).toBe(true);

    const bearerFollow = await app.request('http://localhost/api/v1/community/follows', {
      method: 'POST',
      headers: {
        host: 'ai-transformation.org',
        authorization: `Bearer ${token.bearerToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        site: 'org',
        objectId: helpRequestObjectId,
        kind: 'follow',
      }),
    });
    expect(bearerFollow.status).toBe(200);
    const bearerFollowJson = (await bearerFollow.json()) as {
      ok: true;
      interaction: { objectId: string; userId: string | null };
    };
    expect(bearerFollowJson.interaction.objectId).toBe(helpRequestObjectId);
    expect(bearerFollowJson.interaction.userId).toBe(owner.id);

    const sessionInteractionList = await app.request('http://localhost/api/community/interactions?kind=follow&limit=20', {
      headers: {
        host: 'ai-transformation.org',
        cookie: `atx_session=${ownerSession.id}`,
      },
    });
    expect(sessionInteractionList.status).toBe(200);
    const sessionInteractionListJson = (await sessionInteractionList.json()) as {
      ok: true;
      interactions: Array<{ objectId: string }>;
    };
    expect(sessionInteractionListJson.interactions.some((item) => item.objectId === helpRequestObjectId)).toBe(true);
  });

  it('accepts reserved phase2 types as flagged drafts and exposes match stub', async () => {
    const { app, db } = await loadBackend();
    const member = db.upsertUserByGoogle({
      googleSub: 'wave13-community-reserved-member',
      email: 'wave13-reserved@example.com',
      name: 'Reserved Member',
      picture: null,
    });
    const session = db.createSession(member.id, 60_000);

    const createReservedObject = await app.request('http://localhost/api/objects', {
      method: 'POST',
      headers: {
        host: 'ai-transformation.org',
        'content-type': 'application/json',
        cookie: `atx_session=${session.id}`,
      },
      body: JSON.stringify({
        objectType: 'community',
        type: 'question',
        site: 'org',
        visibility: 'members-only',
        title: 'Reserved question type',
        body: 'Reserved question body for phase2 stub coverage.',
        status: 'published',
        metadata: {
          source: 'test',
        },
      }),
    });
    expect(createReservedObject.status).toBe(201);
    const createReservedObjectJson = (await createReservedObject.json()) as {
      ok: true;
      object: {
        id: string;
        status: string;
        metadata: Record<string, unknown>;
      };
    };
    expect(createReservedObjectJson.object.status).toBe('draft');
    expect(createReservedObjectJson.object.metadata.reserved).toBe(true);
    expect(createReservedObjectJson.object.metadata.reservedType).toBe('question');

    const listReserved = await app.request(
      'http://localhost/api/community/objects?mine=true&type=question&status=draft&limit=20',
      {
        headers: {
          host: 'ai-transformation.org',
          cookie: `atx_session=${session.id}`,
        },
      },
    );
    expect(listReserved.status).toBe(200);
    const listReservedJson = (await listReserved.json()) as {
      ok: true;
      objects: Array<{ id: string; metadata: Record<string, unknown> }>;
    };
    expect(listReservedJson.objects.some((item) => item.id === createReservedObjectJson.object.id)).toBe(true);
    const listedReserved = listReservedJson.objects.find((item) => item.id === createReservedObjectJson.object.id);
    expect(listedReserved?.metadata.reserved).toBe(true);

    const matchStub = await app.request('http://localhost/api/community/match', {
      method: 'POST',
      headers: {
        host: 'ai-transformation.org',
        'content-type': 'application/json',
        cookie: `atx_session=${session.id}`,
      },
      body: JSON.stringify({
        site: 'org',
        objectId: createReservedObjectJson.object.id,
      }),
    });
    expect(matchStub.status).toBe(200);
    const matchStubJson = (await matchStub.json()) as {
      ok: true;
      reserved: true;
      objectId: string;
      action: 'match';
      type?: string;
    };
    expect(matchStubJson.reserved).toBe(true);
    expect(matchStubJson.objectId).toBe(createReservedObjectJson.object.id);
    expect(matchStubJson.action).toBe('match');
    expect(matchStubJson.type).toBe('question');
  });
});
