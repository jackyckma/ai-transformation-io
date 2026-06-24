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
  tempDir = mkdtempSync(path.join(os.tmpdir(), 'atx-wave12-personal-'));
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
  const backendModule = await import('../../index.js');
  return {
    app: backendModule.app,
    db: dbModule,
    objectsDb: objectsDbModule,
  };
}

describe('Wave 12 personal layer', () => {
  it('enforces owner-only private personal data reads and deletes', async () => {
    const { app, db, objectsDb } = await loadBackend();
    const userA = db.upsertUserByGoogle({
      googleSub: 'google-sub-personal-a',
      email: 'personal-a@example.com',
      name: 'User A',
      picture: null,
    });
    const userB = db.upsertUserByGoogle({
      googleSub: 'google-sub-personal-b',
      email: 'personal-b@example.com',
      name: 'User B',
      picture: null,
    });
    const sessionA = db.createSession(userA.id, 60_000);
    const sessionB = db.createSession(userB.id, 60_000);

    const targetObject = objectsDb.createObject({
      payload: {
        objectType: 'knowledge',
        type: 'article',
        site: 'io',
        visibility: 'public',
        title: 'Shared object',
        body: 'Object for personal layer tests.',
        status: 'published',
      },
      ownerUserId: userA.id,
    });

    const bookmarkResponse = await app.request('http://localhost/api/personal/bookmarks', {
      method: 'POST',
      headers: {
        host: 'ai-transformation.io',
        'content-type': 'application/json',
        cookie: `atx_session=${sessionA.id}`,
      },
      body: JSON.stringify({
        site: 'io',
        target: {
          targetType: 'object',
          targetId: targetObject.id,
        },
        title: 'Bookmark A',
      }),
    });
    expect(bookmarkResponse.status).toBe(201);
    const bookmarkJson = (await bookmarkResponse.json()) as { ok: true; bookmark: { id: string } };

    const noteResponse = await app.request('http://localhost/api/personal/notes', {
      method: 'POST',
      headers: {
        host: 'ai-transformation.io',
        'content-type': 'application/json',
        cookie: `atx_session=${sessionA.id}`,
      },
      body: JSON.stringify({
        site: 'io',
        title: 'Private note',
        body: 'This note is private to user A.',
      }),
    });
    expect(noteResponse.status).toBe(201);
    const noteJson = (await noteResponse.json()) as { ok: true; note: { id: string } };

    const annotationResponse = await app.request('http://localhost/api/personal/annotations', {
      method: 'POST',
      headers: {
        host: 'ai-transformation.io',
        'content-type': 'application/json',
        cookie: `atx_session=${sessionA.id}`,
      },
      body: JSON.stringify({
        site: 'io',
        target: {
          targetType: 'object',
          targetId: targetObject.id,
        },
        body: 'Annotation body',
        selectedText: 'Object for personal layer tests.',
      }),
    });
    expect(annotationResponse.status).toBe(201);
    const annotationJson = (await annotationResponse.json()) as { ok: true; annotation: { id: string } };

    const recentlyViewedResponse = await app.request('http://localhost/api/personal/recently-viewed', {
      method: 'POST',
      headers: {
        host: 'ai-transformation.io',
        'content-type': 'application/json',
        cookie: `atx_session=${sessionA.id}`,
      },
      body: JSON.stringify({
        site: 'io',
        target: {
          targetType: 'object',
          targetId: targetObject.id,
        },
      }),
    });
    expect(recentlyViewedResponse.status).toBe(201);
    const recentlyViewedJson = (await recentlyViewedResponse.json()) as { ok: true; entry: { id: string } };

    const userAListBookmarks = await app.request('http://localhost/api/personal/bookmarks', {
      headers: {
        host: 'ai-transformation.io',
        cookie: `atx_session=${sessionA.id}`,
      },
    });
    expect(userAListBookmarks.status).toBe(200);
    expect(((await userAListBookmarks.json()) as { bookmarks: unknown[] }).bookmarks).toHaveLength(1);

    const userAListNotes = await app.request('http://localhost/api/personal/notes', {
      headers: {
        host: 'ai-transformation.io',
        cookie: `atx_session=${sessionA.id}`,
      },
    });
    expect(userAListNotes.status).toBe(200);
    expect(((await userAListNotes.json()) as { notes: unknown[] }).notes).toHaveLength(1);

    const userAListAnnotations = await app.request('http://localhost/api/personal/annotations', {
      headers: {
        host: 'ai-transformation.io',
        cookie: `atx_session=${sessionA.id}`,
      },
    });
    expect(userAListAnnotations.status).toBe(200);
    expect(((await userAListAnnotations.json()) as { annotations: unknown[] }).annotations).toHaveLength(1);

    const userAListRecentlyViewed = await app.request('http://localhost/api/personal/recently-viewed', {
      headers: {
        host: 'ai-transformation.io',
        cookie: `atx_session=${sessionA.id}`,
      },
    });
    expect(userAListRecentlyViewed.status).toBe(200);
    expect(((await userAListRecentlyViewed.json()) as { entries: unknown[] }).entries).toHaveLength(1);

    const userBListBookmarks = await app.request('http://localhost/api/personal/bookmarks', {
      headers: {
        host: 'ai-transformation.io',
        cookie: `atx_session=${sessionB.id}`,
      },
    });
    expect(userBListBookmarks.status).toBe(200);
    expect(((await userBListBookmarks.json()) as { bookmarks: unknown[] }).bookmarks).toHaveLength(0);

    const userBListNotes = await app.request('http://localhost/api/personal/notes', {
      headers: {
        host: 'ai-transformation.io',
        cookie: `atx_session=${sessionB.id}`,
      },
    });
    expect(userBListNotes.status).toBe(200);
    expect(((await userBListNotes.json()) as { notes: unknown[] }).notes).toHaveLength(0);

    const userBListAnnotations = await app.request('http://localhost/api/personal/annotations', {
      headers: {
        host: 'ai-transformation.io',
        cookie: `atx_session=${sessionB.id}`,
      },
    });
    expect(userBListAnnotations.status).toBe(200);
    expect(((await userBListAnnotations.json()) as { annotations: unknown[] }).annotations).toHaveLength(0);

    const userBListRecentlyViewed = await app.request('http://localhost/api/personal/recently-viewed', {
      headers: {
        host: 'ai-transformation.io',
        cookie: `atx_session=${sessionB.id}`,
      },
    });
    expect(userBListRecentlyViewed.status).toBe(200);
    expect(((await userBListRecentlyViewed.json()) as { entries: unknown[] }).entries).toHaveLength(0);

    const userBDeleteBookmark = await app.request(
      `http://localhost/api/personal/bookmarks/${bookmarkJson.bookmark.id}`,
      {
        method: 'DELETE',
        headers: {
          host: 'ai-transformation.io',
          cookie: `atx_session=${sessionB.id}`,
        },
      },
    );
    expect(userBDeleteBookmark.status).toBe(404);

    const userBDeleteNote = await app.request(`http://localhost/api/personal/notes/${noteJson.note.id}`, {
      method: 'DELETE',
      headers: {
        host: 'ai-transformation.io',
        cookie: `atx_session=${sessionB.id}`,
      },
    });
    expect(userBDeleteNote.status).toBe(404);

    const userBDeleteAnnotation = await app.request(
      `http://localhost/api/personal/annotations/${annotationJson.annotation.id}`,
      {
        method: 'DELETE',
        headers: {
          host: 'ai-transformation.io',
          cookie: `atx_session=${sessionB.id}`,
        },
      },
    );
    expect(userBDeleteAnnotation.status).toBe(404);

    const userBDeleteRecentlyViewed = await app.request(
      `http://localhost/api/personal/recently-viewed/${recentlyViewedJson.entry.id}`,
      {
        method: 'DELETE',
        headers: {
          host: 'ai-transformation.io',
          cookie: `atx_session=${sessionB.id}`,
        },
      },
    );
    expect(userBDeleteRecentlyViewed.status).toBe(404);
  });

  it('keeps comments public by target and restricts delete to the author', async () => {
    const { app, db, objectsDb } = await loadBackend();
    const author = db.upsertUserByGoogle({
      googleSub: 'google-sub-comment-author',
      email: 'comment-author@example.com',
      name: 'Comment Author',
      picture: null,
    });
    const otherUser = db.upsertUserByGoogle({
      googleSub: 'google-sub-comment-other',
      email: 'comment-other@example.com',
      name: 'Comment Other',
      picture: null,
    });
    const authorSession = db.createSession(author.id, 60_000);
    const otherSession = db.createSession(otherUser.id, 60_000);

    const publicObject = objectsDb.createObject({
      payload: {
        objectType: 'knowledge',
        type: 'article',
        site: 'org',
        visibility: 'public',
        title: 'Public object for comments',
        body: 'Everyone can read this object.',
        status: 'published',
      },
      ownerUserId: author.id,
    });

    const commentCreate = await app.request('http://localhost/api/personal/comments', {
      method: 'POST',
      headers: {
        host: 'ai-transformation.org',
        'content-type': 'application/json',
        cookie: `atx_session=${authorSession.id}`,
      },
      body: JSON.stringify({
        site: 'org',
        target: {
          targetType: 'object',
          targetId: publicObject.id,
        },
        body: 'Public comment by author.',
      }),
    });
    expect(commentCreate.status).toBe(201);
    const commentJson = (await commentCreate.json()) as { ok: true; comment: { id: string } };

    const anonymousList = await app.request(
      `http://localhost/api/personal/comments?site=org&targetType=object&targetId=${encodeURIComponent(publicObject.id)}`,
      {
        headers: {
          host: 'ai-transformation.org',
        },
      },
    );
    expect(anonymousList.status).toBe(200);
    expect(((await anonymousList.json()) as { comments: Array<{ id: string }> }).comments).toHaveLength(1);

    const memberList = await app.request(
      `http://localhost/api/personal/comments?site=org&targetType=object&targetId=${encodeURIComponent(publicObject.id)}`,
      {
        headers: {
          host: 'ai-transformation.org',
          cookie: `atx_session=${otherSession.id}`,
        },
      },
    );
    expect(memberList.status).toBe(200);
    expect(((await memberList.json()) as { comments: Array<{ id: string }> }).comments).toHaveLength(1);

    const deleteByOther = await app.request(`http://localhost/api/personal/comments/${commentJson.comment.id}`, {
      method: 'DELETE',
      headers: {
        host: 'ai-transformation.org',
        cookie: `atx_session=${otherSession.id}`,
      },
    });
    expect(deleteByOther.status).toBe(404);

    const deleteByAuthor = await app.request(`http://localhost/api/personal/comments/${commentJson.comment.id}`, {
      method: 'DELETE',
      headers: {
        host: 'ai-transformation.org',
        cookie: `atx_session=${authorSession.id}`,
      },
    });
    expect(deleteByAuthor.status).toBe(200);

    const afterDeleteList = await app.request(
      `http://localhost/api/personal/comments?site=org&targetType=object&targetId=${encodeURIComponent(publicObject.id)}`,
      {
        headers: {
          host: 'ai-transformation.org',
        },
      },
    );
    expect(afterDeleteList.status).toBe(200);
    expect(((await afterDeleteList.json()) as { comments: Array<{ id: string }> }).comments).toHaveLength(0);
  });

  it('round-trips profile and stores capture notes as private entries', async () => {
    const { app, db } = await loadBackend();
    const userA = db.upsertUserByGoogle({
      googleSub: 'google-sub-profile-a',
      email: 'profile-a@example.com',
      name: 'Profile A',
      picture: null,
    });
    const userB = db.upsertUserByGoogle({
      googleSub: 'google-sub-profile-b',
      email: 'profile-b@example.com',
      name: 'Profile B',
      picture: null,
    });
    const sessionA = db.createSession(userA.id, 60_000);
    const sessionB = db.createSession(userB.id, 60_000);

    const getBeforeSet = await app.request('http://localhost/api/profile', {
      headers: {
        host: 'ai-transformation.io',
        cookie: `atx_session=${sessionA.id}`,
      },
    });
    expect(getBeforeSet.status).toBe(200);
    expect((await getBeforeSet.json()) as { ok: true; profile: null }).toEqual({ ok: true, profile: null });

    const setProfileResponse = await app.request('http://localhost/api/profile', {
      method: 'PUT',
      headers: {
        host: 'ai-transformation.io',
        'content-type': 'application/json',
        cookie: `atx_session=${sessionA.id}`,
      },
      body: JSON.stringify({
        profile: {
          role: 'Transformation lead',
          industry: 'Manufacturing',
          projectFocus: 'AI operating model',
        },
        publishPreference: {
          defaultPublishMode: 'auto',
        },
      }),
    });
    expect(setProfileResponse.status).toBe(200);
    const setProfileJson = (await setProfileResponse.json()) as {
      ok: true;
      profile: {
        profile: { role: string; industry: string; projectFocus?: string };
        publishPreference: { defaultPublishMode: 'auto' | 'review' };
      };
    };
    expect(setProfileJson.profile.profile.role).toBe('Transformation lead');
    expect(setProfileJson.profile.profile.industry).toBe('Manufacturing');
    expect(setProfileJson.profile.profile.projectFocus).toBe('AI operating model');
    expect(setProfileJson.profile.publishPreference.defaultPublishMode).toBe('auto');

    const getAfterSet = await app.request('http://localhost/api/profile', {
      headers: {
        host: 'ai-transformation.io',
        cookie: `atx_session=${sessionA.id}`,
      },
    });
    expect(getAfterSet.status).toBe(200);
    const getAfterSetJson = (await getAfterSet.json()) as {
      ok: true;
      profile: {
        profile: { role: string; industry: string; projectFocus?: string };
        publishPreference: { defaultPublishMode: 'auto' | 'review' };
      } | null;
    };
    expect(getAfterSetJson.profile?.profile.role).toBe('Transformation lead');
    expect(getAfterSetJson.profile?.profile.industry).toBe('Manufacturing');
    expect(getAfterSetJson.profile?.profile.projectFocus).toBe('AI operating model');
    expect(getAfterSetJson.profile?.publishPreference.defaultPublishMode).toBe('auto');

    const captureNoteResponse = await app.request('http://localhost/api/personal/notes', {
      method: 'POST',
      headers: {
        host: 'ai-transformation.io',
        'content-type': 'application/json',
        cookie: `atx_session=${sessionA.id}`,
      },
      body: JSON.stringify({
        site: 'io',
        body: 'Captured from Ask mode.',
        isCapture: true,
        captureSource: 'ask_capture',
      }),
    });
    expect(captureNoteResponse.status).toBe(201);
    const captureNoteJson = (await captureNoteResponse.json()) as {
      ok: true;
      note: { visibility: 'private'; isCapture: boolean; captureSource?: string };
    };
    expect(captureNoteJson.note.visibility).toBe('private');
    expect(captureNoteJson.note.isCapture).toBe(true);
    expect(captureNoteJson.note.captureSource).toBe('ask_capture');

    const userBNotes = await app.request('http://localhost/api/personal/notes', {
      headers: {
        host: 'ai-transformation.io',
        cookie: `atx_session=${sessionB.id}`,
      },
    });
    expect(userBNotes.status).toBe(200);
    expect(((await userBNotes.json()) as { notes: unknown[] }).notes).toHaveLength(0);
  });
});
