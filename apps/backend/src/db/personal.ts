import { randomUUID } from 'node:crypto';

import type {
  AnnotationCreateRequest,
  AnnotationUpdateRequest,
  BookmarkCreateRequest,
  BookmarkUpdateRequest,
  CommentCreateRequest,
  CommentUpdateRequest,
  NoteCreateRequest,
  NoteUpdateRequest,
  PersonalTarget,
  RecentlyViewedCreateRequest,
  RecentlyViewedUpdateRequest,
} from '@ai-transformation/shared';
import {
  annotationSchema,
  bookmarkSchema,
  commentSchema,
  noteSchema,
  personalTargetSchema,
  profileRecordSchema,
  recentlyViewedEntrySchema,
  type Annotation,
  type Bookmark,
  type Comment,
  type Note,
  type ProfileRecord,
  type RecentlyViewedEntry,
} from '@ai-transformation/shared';
import type Database from 'better-sqlite3';

import { getDb } from './index.js';
import { getPublishPreference, setPublishPreference } from './objects.js';

type PersonalListRequest = {
  site?: 'io' | 'org';
  targetType?: PersonalTarget['targetType'];
  targetId?: string;
};

type BookmarkRow = {
  id: string;
  userId: string;
  site: 'io' | 'org';
  targetType: PersonalTarget['targetType'];
  targetId: string;
  title: string | null;
  visibility: 'private';
  createdAt: string;
  updatedAt: string;
};

type NoteRow = {
  id: string;
  userId: string;
  site: 'io' | 'org';
  title: string | null;
  body: string;
  isCapture: number;
  captureSource: 'ask_capture' | 'ask_submit' | 'manual' | null;
  metadata: string | null;
  visibility: 'private';
  createdAt: string;
  updatedAt: string;
};

type AnnotationRow = {
  id: string;
  userId: string;
  site: 'io' | 'org';
  targetType: PersonalTarget['targetType'];
  targetId: string;
  body: string;
  selectedText: string | null;
  visibility: 'private';
  createdAt: string;
  updatedAt: string;
};

type CommentRow = {
  id: string;
  userId: string;
  site: 'io' | 'org';
  targetType: PersonalTarget['targetType'];
  targetId: string;
  body: string;
  visibility: 'public';
  createdAt: string;
  updatedAt: string;
};

type RecentlyViewedRow = {
  id: string;
  userId: string;
  site: 'io' | 'org';
  targetType: PersonalTarget['targetType'];
  targetId: string;
  viewedAt: string;
  visibility: 'private';
  createdAt: string;
  updatedAt: string;
};

type ProfileRow = {
  userId: string;
  profileJson: string;
  createdAt: string;
  updatedAt: string;
};

function parseMetadata(value: string | null): Record<string, unknown> | undefined {
  if (!value) {
    return undefined;
  }
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return undefined;
    }
    return parsed as Record<string, unknown>;
  } catch {
    return undefined;
  }
}

function buildPersonalFilters(input: PersonalListRequest): {
  sql: string[];
  params: Record<string, string>;
} {
  const sql: string[] = [];
  const params: Record<string, string> = {};
  if (input.site) {
    sql.push('site = @site');
    params.site = input.site;
  }
  if (input.targetType) {
    sql.push('target_type = @targetType');
    params.targetType = input.targetType;
  }
  if (input.targetId) {
    sql.push('target_id = @targetId');
    params.targetId = input.targetId;
  }
  return { sql, params };
}

function toBookmark(row: BookmarkRow): Bookmark {
  return bookmarkSchema.parse({
    id: row.id,
    userId: row.userId,
    site: row.site,
    visibility: row.visibility,
    target: personalTargetSchema.parse({
      targetType: row.targetType,
      targetId: row.targetId,
    }),
    title: row.title ?? undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}

function toNote(row: NoteRow): Note {
  return noteSchema.parse({
    id: row.id,
    userId: row.userId,
    site: row.site,
    visibility: row.visibility,
    title: row.title ?? undefined,
    body: row.body,
    isCapture: row.isCapture === 1,
    captureSource: row.captureSource ?? undefined,
    metadata: parseMetadata(row.metadata),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}

function toAnnotation(row: AnnotationRow): Annotation {
  return annotationSchema.parse({
    id: row.id,
    userId: row.userId,
    site: row.site,
    visibility: row.visibility,
    target: personalTargetSchema.parse({
      targetType: row.targetType,
      targetId: row.targetId,
    }),
    body: row.body,
    selectedText: row.selectedText ?? undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}

function toComment(row: CommentRow): Comment {
  return commentSchema.parse({
    id: row.id,
    userId: row.userId,
    site: row.site,
    visibility: row.visibility,
    target: personalTargetSchema.parse({
      targetType: row.targetType,
      targetId: row.targetId,
    }),
    body: row.body,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}

function toRecentlyViewedEntry(row: RecentlyViewedRow): RecentlyViewedEntry {
  return recentlyViewedEntrySchema.parse({
    id: row.id,
    userId: row.userId,
    site: row.site,
    visibility: row.visibility,
    target: personalTargetSchema.parse({
      targetType: row.targetType,
      targetId: row.targetId,
    }),
    viewedAt: row.viewedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}

function getBookmarkById(db: Database.Database, id: string, userId: string): Bookmark | null {
  const row = db
    .prepare(
      `SELECT
        id,
        user_id AS userId,
        site,
        target_type AS targetType,
        target_id AS targetId,
        title,
        visibility,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM personal_bookmarks
      WHERE id = @id
        AND user_id = @userId`,
    )
    .get({ id, userId }) as BookmarkRow | undefined;
  return row ? toBookmark(row) : null;
}

function getNoteById(db: Database.Database, id: string, userId: string): Note | null {
  const row = db
    .prepare(
      `SELECT
        id,
        user_id AS userId,
        site,
        title,
        body,
        is_capture AS isCapture,
        capture_source AS captureSource,
        metadata,
        visibility,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM personal_notes
      WHERE id = @id
        AND user_id = @userId`,
    )
    .get({ id, userId }) as NoteRow | undefined;
  return row ? toNote(row) : null;
}

function getAnnotationById(db: Database.Database, id: string, userId: string): Annotation | null {
  const row = db
    .prepare(
      `SELECT
        id,
        user_id AS userId,
        site,
        target_type AS targetType,
        target_id AS targetId,
        body,
        selected_text AS selectedText,
        visibility,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM personal_annotations
      WHERE id = @id
        AND user_id = @userId`,
    )
    .get({ id, userId }) as AnnotationRow | undefined;
  return row ? toAnnotation(row) : null;
}

function getCommentById(db: Database.Database, id: string): Comment | null {
  const row = db
    .prepare(
      `SELECT
        id,
        user_id AS userId,
        site,
        target_type AS targetType,
        target_id AS targetId,
        body,
        visibility,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM personal_comments
      WHERE id = @id`,
    )
    .get({ id }) as CommentRow | undefined;
  return row ? toComment(row) : null;
}

function getRecentlyViewedById(db: Database.Database, id: string, userId: string): RecentlyViewedEntry | null {
  const row = db
    .prepare(
      `SELECT
        id,
        user_id AS userId,
        site,
        target_type AS targetType,
        target_id AS targetId,
        viewed_at AS viewedAt,
        visibility,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM personal_recently_viewed
      WHERE id = @id
        AND user_id = @userId`,
    )
    .get({ id, userId }) as RecentlyViewedRow | undefined;
  return row ? toRecentlyViewedEntry(row) : null;
}

export function runPersonalMigrations(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS personal_bookmarks (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      site TEXT NOT NULL,
      target_type TEXT NOT NULL,
      target_id TEXT NOT NULL,
      title TEXT,
      visibility TEXT NOT NULL DEFAULT 'private',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);
  db.exec(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_personal_bookmarks_user_target
    ON personal_bookmarks (user_id, site, target_type, target_id);
  `);
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_personal_bookmarks_user_created
    ON personal_bookmarks (user_id, created_at DESC);
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS personal_notes (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      site TEXT NOT NULL,
      title TEXT,
      body TEXT NOT NULL,
      is_capture INTEGER NOT NULL DEFAULT 0,
      capture_source TEXT,
      metadata TEXT NOT NULL DEFAULT '{}',
      visibility TEXT NOT NULL DEFAULT 'private',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_personal_notes_user_updated
    ON personal_notes (user_id, updated_at DESC);
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS personal_annotations (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      site TEXT NOT NULL,
      target_type TEXT NOT NULL,
      target_id TEXT NOT NULL,
      body TEXT NOT NULL,
      selected_text TEXT,
      visibility TEXT NOT NULL DEFAULT 'private',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_personal_annotations_user_target
    ON personal_annotations (user_id, site, target_type, target_id);
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS personal_comments (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      site TEXT NOT NULL,
      target_type TEXT NOT NULL,
      target_id TEXT NOT NULL,
      body TEXT NOT NULL,
      visibility TEXT NOT NULL DEFAULT 'public',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_personal_comments_target_created
    ON personal_comments (site, target_type, target_id, created_at DESC);
  `);
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_personal_comments_user_created
    ON personal_comments (user_id, created_at DESC);
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS personal_recently_viewed (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      site TEXT NOT NULL,
      target_type TEXT NOT NULL,
      target_id TEXT NOT NULL,
      viewed_at TEXT NOT NULL,
      visibility TEXT NOT NULL DEFAULT 'private',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);
  db.exec(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_personal_recently_viewed_user_target
    ON personal_recently_viewed (user_id, site, target_type, target_id);
  `);
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_personal_recently_viewed_user_viewed
    ON personal_recently_viewed (user_id, viewed_at DESC);
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS user_profiles (
      user_id TEXT PRIMARY KEY,
      profile_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);
}

export function listBookmarks(input: { userId: string; request: PersonalListRequest }): Bookmark[] {
  const db = getDb();
  const filters = buildPersonalFilters(input.request);
  const where = ['user_id = @userId', ...filters.sql];
  const rows = db
    .prepare(
      `SELECT
        id,
        user_id AS userId,
        site,
        target_type AS targetType,
        target_id AS targetId,
        title,
        visibility,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM personal_bookmarks
      WHERE ${where.join(' AND ')}
      ORDER BY created_at DESC, id DESC`,
    )
    .all({ userId: input.userId, ...filters.params }) as BookmarkRow[];
  return rows.map(toBookmark);
}

export function upsertBookmark(input: { userId: string; payload: BookmarkCreateRequest }): Bookmark {
  const db = getDb();
  const now = new Date().toISOString();
  const tx = db.transaction(() => {
    const existing = db
      .prepare(
        `SELECT id
        FROM personal_bookmarks
        WHERE user_id = @userId
          AND site = @site
          AND target_type = @targetType
          AND target_id = @targetId`,
      )
      .get({
        userId: input.userId,
        site: input.payload.site,
        targetType: input.payload.target.targetType,
        targetId: input.payload.target.targetId,
      }) as { id: string } | undefined;
    if (existing) {
      db.prepare(
        `UPDATE personal_bookmarks
        SET title = @title,
            updated_at = @updatedAt
        WHERE id = @id`,
      ).run({
        id: existing.id,
        title: input.payload.title ?? null,
        updatedAt: now,
      });
      return existing.id;
    }
    const id = randomUUID();
    db.prepare(
      `INSERT INTO personal_bookmarks (
        id,
        user_id,
        site,
        target_type,
        target_id,
        title,
        visibility,
        created_at,
        updated_at
      ) VALUES (
        @id,
        @userId,
        @site,
        @targetType,
        @targetId,
        @title,
        'private',
        @createdAt,
        @updatedAt
      )`,
    ).run({
      id,
      userId: input.userId,
      site: input.payload.site,
      targetType: input.payload.target.targetType,
      targetId: input.payload.target.targetId,
      title: input.payload.title ?? null,
      createdAt: now,
      updatedAt: now,
    });
    return id;
  });
  const id = tx();
  const bookmark = getBookmarkById(db, id, input.userId);
  if (!bookmark) {
    throw new Error('Failed to load bookmark');
  }
  return bookmark;
}

export function updateBookmark(input: {
  userId: string;
  id: string;
  payload: BookmarkUpdateRequest;
}): Bookmark | null {
  const db = getDb();
  const existing = getBookmarkById(db, input.id, input.userId);
  if (!existing) {
    return null;
  }
  db.prepare(
    `UPDATE personal_bookmarks
    SET title = @title,
        updated_at = @updatedAt
    WHERE id = @id
      AND user_id = @userId`,
  ).run({
    id: input.id,
    userId: input.userId,
    title: input.payload.title ?? existing.title ?? null,
    updatedAt: new Date().toISOString(),
  });
  return getBookmarkById(db, input.id, input.userId);
}

export function deleteBookmark(input: { userId: string; id: string }): boolean {
  const db = getDb();
  const result = db
    .prepare(
      `DELETE FROM personal_bookmarks
      WHERE id = @id
        AND user_id = @userId`,
    )
    .run({
      id: input.id,
      userId: input.userId,
    });
  return result.changes > 0;
}

export function listNotes(input: { userId: string; request: PersonalListRequest }): Note[] {
  const db = getDb();
  const filters = buildPersonalFilters(input.request);
  const where = ['user_id = @userId'];
  if (filters.params.site) {
    where.push('site = @site');
  }
  const rows = db
    .prepare(
      `SELECT
        id,
        user_id AS userId,
        site,
        title,
        body,
        is_capture AS isCapture,
        capture_source AS captureSource,
        metadata,
        visibility,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM personal_notes
      WHERE ${where.join(' AND ')}
      ORDER BY updated_at DESC, id DESC`,
    )
    .all({ userId: input.userId, site: filters.params.site }) as NoteRow[];
  return rows.map(toNote);
}

export function createNote(input: { userId: string; payload: NoteCreateRequest }): Note {
  const db = getDb();
  const now = new Date().toISOString();
  const id = randomUUID();
  const isCapture = input.payload.isCapture ?? false;
  db.prepare(
    `INSERT INTO personal_notes (
      id,
      user_id,
      site,
      title,
      body,
      is_capture,
      capture_source,
      metadata,
      visibility,
      created_at,
      updated_at
    ) VALUES (
      @id,
      @userId,
      @site,
      @title,
      @body,
      @isCapture,
      @captureSource,
      @metadata,
      'private',
      @createdAt,
      @updatedAt
    )`,
  ).run({
    id,
    userId: input.userId,
    site: input.payload.site,
    title: input.payload.title ?? null,
    body: input.payload.body,
    isCapture: isCapture ? 1 : 0,
    captureSource: isCapture ? (input.payload.captureSource ?? null) : null,
    metadata: JSON.stringify(input.payload.metadata ?? {}),
    createdAt: now,
    updatedAt: now,
  });
  const note = getNoteById(db, id, input.userId);
  if (!note) {
    throw new Error('Failed to load note');
  }
  return note;
}

export function updateNote(input: { userId: string; id: string; payload: NoteUpdateRequest }): Note | null {
  const db = getDb();
  const existing = getNoteById(db, input.id, input.userId);
  if (!existing) {
    return null;
  }
  const metadata = input.payload.metadata === undefined ? existing.metadata : input.payload.metadata;
  db.prepare(
    `UPDATE personal_notes
    SET title = @title,
        body = @body,
        metadata = @metadata,
        updated_at = @updatedAt
    WHERE id = @id
      AND user_id = @userId`,
  ).run({
    id: input.id,
    userId: input.userId,
    title: input.payload.title ?? existing.title ?? null,
    body: input.payload.body ?? existing.body,
    metadata: JSON.stringify(metadata ?? {}),
    updatedAt: new Date().toISOString(),
  });
  return getNoteById(db, input.id, input.userId);
}

export function deleteNote(input: { userId: string; id: string }): boolean {
  const db = getDb();
  const result = db
    .prepare(
      `DELETE FROM personal_notes
      WHERE id = @id
        AND user_id = @userId`,
    )
    .run({
      id: input.id,
      userId: input.userId,
    });
  return result.changes > 0;
}

export function listAnnotations(input: { userId: string; request: PersonalListRequest }): Annotation[] {
  const db = getDb();
  const filters = buildPersonalFilters(input.request);
  const where = ['user_id = @userId', ...filters.sql];
  const rows = db
    .prepare(
      `SELECT
        id,
        user_id AS userId,
        site,
        target_type AS targetType,
        target_id AS targetId,
        body,
        selected_text AS selectedText,
        visibility,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM personal_annotations
      WHERE ${where.join(' AND ')}
      ORDER BY updated_at DESC, id DESC`,
    )
    .all({ userId: input.userId, ...filters.params }) as AnnotationRow[];
  return rows.map(toAnnotation);
}

export function createAnnotation(input: { userId: string; payload: AnnotationCreateRequest }): Annotation {
  const db = getDb();
  const now = new Date().toISOString();
  const id = randomUUID();
  db.prepare(
    `INSERT INTO personal_annotations (
      id,
      user_id,
      site,
      target_type,
      target_id,
      body,
      selected_text,
      visibility,
      created_at,
      updated_at
    ) VALUES (
      @id,
      @userId,
      @site,
      @targetType,
      @targetId,
      @body,
      @selectedText,
      'private',
      @createdAt,
      @updatedAt
    )`,
  ).run({
    id,
    userId: input.userId,
    site: input.payload.site,
    targetType: input.payload.target.targetType,
    targetId: input.payload.target.targetId,
    body: input.payload.body,
    selectedText: input.payload.selectedText ?? null,
    createdAt: now,
    updatedAt: now,
  });
  const annotation = getAnnotationById(db, id, input.userId);
  if (!annotation) {
    throw new Error('Failed to load annotation');
  }
  return annotation;
}

export function updateAnnotation(input: {
  userId: string;
  id: string;
  payload: AnnotationUpdateRequest;
}): Annotation | null {
  const db = getDb();
  const existing = getAnnotationById(db, input.id, input.userId);
  if (!existing) {
    return null;
  }
  db.prepare(
    `UPDATE personal_annotations
    SET body = @body,
        selected_text = @selectedText,
        updated_at = @updatedAt
    WHERE id = @id
      AND user_id = @userId`,
  ).run({
    id: input.id,
    userId: input.userId,
    body: input.payload.body ?? existing.body,
    selectedText: input.payload.selectedText ?? existing.selectedText ?? null,
    updatedAt: new Date().toISOString(),
  });
  return getAnnotationById(db, input.id, input.userId);
}

export function deleteAnnotation(input: { userId: string; id: string }): boolean {
  const db = getDb();
  const result = db
    .prepare(
      `DELETE FROM personal_annotations
      WHERE id = @id
        AND user_id = @userId`,
    )
    .run({
      id: input.id,
      userId: input.userId,
    });
  return result.changes > 0;
}

export function listComments(input: {
  request: PersonalListRequest;
  userId?: string | null;
  mine?: boolean;
}): Comment[] {
  const db = getDb();
  const filters = buildPersonalFilters(input.request);
  const where = ['visibility = @visibility', ...filters.sql];
  const params: Record<string, unknown> = {
    visibility: 'public',
    ...filters.params,
  };
  if (input.mine) {
    where.push('user_id = @userId');
    params.userId = input.userId ?? '';
  }
  const rows = db
    .prepare(
      `SELECT
        id,
        user_id AS userId,
        site,
        target_type AS targetType,
        target_id AS targetId,
        body,
        visibility,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM personal_comments
      WHERE ${where.join(' AND ')}
      ORDER BY created_at DESC, id DESC`,
    )
    .all(params) as CommentRow[];
  return rows.map(toComment);
}

export function createComment(input: { userId: string; payload: CommentCreateRequest }): Comment {
  const db = getDb();
  const now = new Date().toISOString();
  const id = randomUUID();
  db.prepare(
    `INSERT INTO personal_comments (
      id,
      user_id,
      site,
      target_type,
      target_id,
      body,
      visibility,
      created_at,
      updated_at
    ) VALUES (
      @id,
      @userId,
      @site,
      @targetType,
      @targetId,
      @body,
      'public',
      @createdAt,
      @updatedAt
    )`,
  ).run({
    id,
    userId: input.userId,
    site: input.payload.site,
    targetType: input.payload.target.targetType,
    targetId: input.payload.target.targetId,
    body: input.payload.body,
    createdAt: now,
    updatedAt: now,
  });
  const comment = getCommentById(db, id);
  if (!comment) {
    throw new Error('Failed to load comment');
  }
  return comment;
}

export function updateComment(input: { userId: string; id: string; payload: CommentUpdateRequest }): Comment | null {
  const db = getDb();
  const existing = getCommentById(db, input.id);
  if (!existing || existing.userId !== input.userId) {
    return null;
  }
  db.prepare(
    `UPDATE personal_comments
    SET body = @body,
        updated_at = @updatedAt
    WHERE id = @id
      AND user_id = @userId`,
  ).run({
    id: input.id,
    userId: input.userId,
    body: input.payload.body,
    updatedAt: new Date().toISOString(),
  });
  return getCommentById(db, input.id);
}

export function deleteComment(input: { userId: string; id: string }): boolean {
  const db = getDb();
  const result = db
    .prepare(
      `DELETE FROM personal_comments
      WHERE id = @id
        AND user_id = @userId`,
    )
    .run({
      id: input.id,
      userId: input.userId,
    });
  return result.changes > 0;
}

export function listRecentlyViewed(input: { userId: string; request: PersonalListRequest }): RecentlyViewedEntry[] {
  const db = getDb();
  const filters = buildPersonalFilters(input.request);
  const where = ['user_id = @userId', ...filters.sql];
  const rows = db
    .prepare(
      `SELECT
        id,
        user_id AS userId,
        site,
        target_type AS targetType,
        target_id AS targetId,
        viewed_at AS viewedAt,
        visibility,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM personal_recently_viewed
      WHERE ${where.join(' AND ')}
      ORDER BY viewed_at DESC, id DESC`,
    )
    .all({ userId: input.userId, ...filters.params }) as RecentlyViewedRow[];
  return rows.map(toRecentlyViewedEntry);
}

export function upsertRecentlyViewed(input: {
  userId: string;
  payload: RecentlyViewedCreateRequest;
}): RecentlyViewedEntry {
  const db = getDb();
  const now = new Date().toISOString();
  const viewedAt = input.payload.viewedAt ?? now;
  const tx = db.transaction(() => {
    const existing = db
      .prepare(
        `SELECT id, created_at AS createdAt
        FROM personal_recently_viewed
        WHERE user_id = @userId
          AND site = @site
          AND target_type = @targetType
          AND target_id = @targetId`,
      )
      .get({
        userId: input.userId,
        site: input.payload.site,
        targetType: input.payload.target.targetType,
        targetId: input.payload.target.targetId,
      }) as { id: string; createdAt: string } | undefined;
    if (existing) {
      db.prepare(
        `UPDATE personal_recently_viewed
        SET viewed_at = @viewedAt,
            updated_at = @updatedAt
        WHERE id = @id`,
      ).run({
        id: existing.id,
        viewedAt,
        updatedAt: now,
      });
      return existing.id;
    }
    const id = randomUUID();
    db.prepare(
      `INSERT INTO personal_recently_viewed (
        id,
        user_id,
        site,
        target_type,
        target_id,
        viewed_at,
        visibility,
        created_at,
        updated_at
      ) VALUES (
        @id,
        @userId,
        @site,
        @targetType,
        @targetId,
        @viewedAt,
        'private',
        @createdAt,
        @updatedAt
      )`,
    ).run({
      id,
      userId: input.userId,
      site: input.payload.site,
      targetType: input.payload.target.targetType,
      targetId: input.payload.target.targetId,
      viewedAt,
      createdAt: now,
      updatedAt: now,
    });
    return id;
  });
  const id = tx();
  const entry = getRecentlyViewedById(db, id, input.userId);
  if (!entry) {
    throw new Error('Failed to load recently viewed entry');
  }
  return entry;
}

export function updateRecentlyViewed(input: {
  userId: string;
  id: string;
  payload: RecentlyViewedUpdateRequest;
}): RecentlyViewedEntry | null {
  const db = getDb();
  const existing = getRecentlyViewedById(db, input.id, input.userId);
  if (!existing) {
    return null;
  }
  db.prepare(
    `UPDATE personal_recently_viewed
    SET viewed_at = @viewedAt,
        updated_at = @updatedAt
    WHERE id = @id
      AND user_id = @userId`,
  ).run({
    id: input.id,
    userId: input.userId,
    viewedAt: input.payload.viewedAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  return getRecentlyViewedById(db, input.id, input.userId);
}

export function deleteRecentlyViewed(input: { userId: string; id: string }): boolean {
  const db = getDb();
  const result = db
    .prepare(
      `DELETE FROM personal_recently_viewed
      WHERE id = @id
        AND user_id = @userId`,
    )
    .run({
      id: input.id,
      userId: input.userId,
    });
  return result.changes > 0;
}

export function getProfile(userId: string): ProfileRecord | null {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT
        user_id AS userId,
        profile_json AS profileJson,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM user_profiles
      WHERE user_id = @userId`,
    )
    .get({ userId }) as ProfileRow | undefined;
  if (!row) {
    return null;
  }
  let parsedProfile: unknown = {};
  try {
    parsedProfile = JSON.parse(row.profileJson);
  } catch {
    return null;
  }
  return profileRecordSchema.parse({
    userId: row.userId,
    profile: parsedProfile,
    publishPreference: getPublishPreference(userId),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}

export function setProfile(input: {
  userId: string;
  profile: {
    role: string;
    industry: string;
    projectFocus?: string | undefined;
  };
  publishMode?: 'auto' | 'review';
}): ProfileRecord {
  const db = getDb();
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO user_profiles (
      user_id,
      profile_json,
      created_at,
      updated_at
    ) VALUES (
      @userId,
      @profileJson,
      @createdAt,
      @updatedAt
    )
    ON CONFLICT(user_id) DO UPDATE SET
      profile_json = excluded.profile_json,
      updated_at = excluded.updated_at`,
  ).run({
    userId: input.userId,
    profileJson: JSON.stringify(input.profile),
    createdAt: now,
    updatedAt: now,
  });
  if (input.publishMode) {
    setPublishPreference(input.userId, input.publishMode);
  }
  const profile = getProfile(input.userId);
  if (!profile) {
    throw new Error('Failed to load profile');
  }
  return profile;
}
