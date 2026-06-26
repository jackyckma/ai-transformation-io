import { randomUUID } from 'node:crypto';

import type Database from 'better-sqlite3';
import {
  communityInteractionKindSchema,
  communityInteractionListRequestSchema,
  communityInteractionRecordSchema,
  type CommunityInteractionKind,
  type CommunityInteractionListRequest,
  type CommunityInteractionRecord,
  type Site,
} from '@ai-transformation/shared';

import { getDb } from './index.js';

type DbFollowRow = {
  id: string;
  userId: string;
  site: Site;
  objectId: string;
  createdAt: string;
  updatedAt: string;
};

type DbInteractionRow = {
  id: string;
  userId: string;
  site: Site;
  objectId: string;
  kind: Exclude<CommunityInteractionKind, 'follow'>;
  body: string | null;
  createdAt: string;
  updatedAt: string;
};

type DbUnifiedInteractionRow = {
  id: string;
  userId: string;
  site: Site;
  objectId: string;
  kind: CommunityInteractionKind;
  body: string | null;
  createdAt: string;
  updatedAt: string;
};

type ExtendedCommunityInteractionKind =
  | Exclude<CommunityInteractionKind, 'follow'>
  | 'request_mentor'
  | 'ask_for_intro'
  | 'apply'
  | 'collaborate';

type DbExtendedInteractionRow = {
  id: string;
  userId: string;
  site: Site;
  objectId: string;
  kind: ExtendedCommunityInteractionKind;
  body: string | null;
  createdAt: string;
  updatedAt: string;
};

type DbMatchFeedbackRow = {
  id: string;
  userId: string;
  site: Site;
  objectId: string;
  candidateObjectId: string;
  verdict: 'up' | 'down';
  createdAt: string;
  updatedAt: string;
};

function makeCursor(createdAt: string, id: string): string {
  return `${createdAt}|${id}`;
}

function parseCursor(cursor: string): { createdAt: string; id: string } | null {
  const [createdAt, id] = cursor.split('|', 2);
  if (!createdAt || !id) {
    return null;
  }
  return { createdAt, id };
}

function toFollowRecord(row: DbFollowRow): CommunityInteractionRecord {
  return communityInteractionRecordSchema.parse({
    id: row.id,
    objectId: row.objectId,
    userId: row.userId,
    site: row.site,
    kind: 'follow',
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}

function toInteractionRecord(row: DbInteractionRow): CommunityInteractionRecord {
  return communityInteractionRecordSchema.parse({
    id: row.id,
    objectId: row.objectId,
    userId: row.userId,
    site: row.site,
    kind: row.kind,
    body: row.body ?? undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}

function toUnifiedInteractionRecord(row: DbUnifiedInteractionRow): CommunityInteractionRecord {
  return communityInteractionRecordSchema.parse({
    id: row.id,
    objectId: row.objectId,
    userId: row.userId,
    site: row.site,
    kind: row.kind,
    body: row.body ?? undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}

function toExtendedInteractionRecord(row: DbExtendedInteractionRow): {
  id: string;
  objectId: string;
  userId: string;
  site: Site;
  kind: ExtendedCommunityInteractionKind;
  body?: string;
  createdAt: string;
  updatedAt: string;
} {
  return {
    id: row.id,
    objectId: row.objectId,
    userId: row.userId,
    site: row.site,
    kind: row.kind,
    body: row.body ?? undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function getFollowById(db: Database.Database, id: string): CommunityInteractionRecord | null {
  const row = db
    .prepare(
      `SELECT
        id,
        user_id AS userId,
        site,
        object_id AS objectId,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM community_follows
      WHERE id = @id`,
    )
    .get({ id }) as DbFollowRow | undefined;
  return row ? toFollowRecord(row) : null;
}

function getInteractionById(db: Database.Database, id: string): CommunityInteractionRecord | null {
  const row = db
    .prepare(
      `SELECT
        id,
        user_id AS userId,
        site,
        object_id AS objectId,
        kind,
        body,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM community_interactions
      WHERE id = @id`,
    )
    .get({ id }) as DbInteractionRow | undefined;
  return row ? toInteractionRecord(row) : null;
}

export function runCommunityMigrations(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS community_follows (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      site TEXT NOT NULL,
      object_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);
  db.exec(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_community_follows_user_object
    ON community_follows (user_id, object_id);
  `);
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_community_follows_site_object
    ON community_follows (site, object_id);
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS community_interactions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      site TEXT NOT NULL,
      object_id TEXT NOT NULL,
      kind TEXT NOT NULL,
      body TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);
  db.exec(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_community_interactions_user_object_kind
    ON community_interactions (user_id, object_id, kind);
  `);
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_community_interactions_site_object_kind
    ON community_interactions (site, object_id, kind);
  `);
  db.exec(`
    CREATE TABLE IF NOT EXISTS community_match_feedback (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      site TEXT NOT NULL,
      object_id TEXT NOT NULL,
      candidate_object_id TEXT NOT NULL,
      verdict TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);
  db.exec(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_community_match_feedback_user_pair
    ON community_match_feedback (user_id, object_id, candidate_object_id);
  `);
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_community_match_feedback_site_object
    ON community_match_feedback (site, object_id, candidate_object_id);
  `);
  db.exec(`
    CREATE TABLE IF NOT EXISTS community_match_runs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      site TEXT NOT NULL,
      object_id TEXT NOT NULL,
      candidate_count INTEGER NOT NULL,
      metadata TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL
    );
  `);
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_community_match_runs_user_object
    ON community_match_runs (user_id, object_id, created_at DESC);
  `);
}

export function upsertFollow(input: {
  userId: string;
  site: Site;
  objectId: string;
}): CommunityInteractionRecord {
  const db = getDb();
  const now = new Date().toISOString();
  const id = db.transaction(() => {
    const existing = db
      .prepare(
        `SELECT id
        FROM community_follows
        WHERE user_id = @userId
          AND object_id = @objectId`,
      )
      .get({
        userId: input.userId,
        objectId: input.objectId,
      }) as { id: string } | undefined;

    if (existing) {
      db.prepare(
        `UPDATE community_follows
        SET site = @site,
            updated_at = @updatedAt
        WHERE id = @id`,
      ).run({
        id: existing.id,
        site: input.site,
        updatedAt: now,
      });
      return existing.id;
    }

    const createdId = randomUUID();
    db.prepare(
      `INSERT INTO community_follows (
        id,
        user_id,
        site,
        object_id,
        created_at,
        updated_at
      ) VALUES (
        @id,
        @userId,
        @site,
        @objectId,
        @createdAt,
        @updatedAt
      )`,
    ).run({
      id: createdId,
      userId: input.userId,
      site: input.site,
      objectId: input.objectId,
      createdAt: now,
      updatedAt: now,
    });
    return createdId;
  })();

  const follow = getFollowById(db, id);
  if (!follow) {
    throw new Error('Failed to load follow interaction');
  }
  return follow;
}

export function removeFollow(input: {
  userId: string;
  objectId: string;
}): { id: string | null } {
  const db = getDb();
  const existing = db
    .prepare(
      `SELECT id
      FROM community_follows
      WHERE user_id = @userId
        AND object_id = @objectId`,
    )
    .get({
      userId: input.userId,
      objectId: input.objectId,
    }) as { id: string } | undefined;
  if (!existing) {
    return { id: null };
  }
  db.prepare(
    `DELETE FROM community_follows
    WHERE id = @id`,
  ).run({ id: existing.id });
  return { id: existing.id };
}

export function upsertCommunityInteraction(input: {
  userId: string;
  site: Site;
  objectId: string;
  kind: Exclude<CommunityInteractionKind, 'follow'>;
  body?: string;
}): CommunityInteractionRecord {
  const db = getDb();
  const now = new Date().toISOString();
  const id = db.transaction(() => {
    const existing = db
      .prepare(
        `SELECT id, body
        FROM community_interactions
        WHERE user_id = @userId
          AND object_id = @objectId
          AND kind = @kind`,
      )
      .get({
        userId: input.userId,
        objectId: input.objectId,
        kind: input.kind,
      }) as { id: string; body: string | null } | undefined;

    if (existing) {
      db.prepare(
        `UPDATE community_interactions
        SET site = @site,
            body = @body,
            updated_at = @updatedAt
        WHERE id = @id`,
      ).run({
        id: existing.id,
        site: input.site,
        body: input.body ?? existing.body ?? null,
        updatedAt: now,
      });
      return existing.id;
    }

    const createdId = randomUUID();
    db.prepare(
      `INSERT INTO community_interactions (
        id,
        user_id,
        site,
        object_id,
        kind,
        body,
        created_at,
        updated_at
      ) VALUES (
        @id,
        @userId,
        @site,
        @objectId,
        @kind,
        @body,
        @createdAt,
        @updatedAt
      )`,
    ).run({
      id: createdId,
      userId: input.userId,
      site: input.site,
      objectId: input.objectId,
      kind: input.kind,
      body: input.body ?? null,
      createdAt: now,
      updatedAt: now,
    });
    return createdId;
  })();

  const interaction = getInteractionById(db, id);
  if (!interaction) {
    throw new Error('Failed to load community interaction');
  }
  return interaction;
}

function getExtendedInteractionById(
  db: Database.Database,
  id: string,
): {
  id: string;
  objectId: string;
  userId: string;
  site: Site;
  kind: ExtendedCommunityInteractionKind;
  body?: string;
  createdAt: string;
  updatedAt: string;
} | null {
  const row = db
    .prepare(
      `SELECT
        id,
        user_id AS userId,
        site,
        object_id AS objectId,
        kind,
        body,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM community_interactions
      WHERE id = @id`,
    )
    .get({ id }) as DbExtendedInteractionRow | undefined;
  return row ? toExtendedInteractionRecord(row) : null;
}

export function upsertCommunityAction(input: {
  userId: string;
  site: Site;
  objectId: string;
  kind: Exclude<ExtendedCommunityInteractionKind, 'follow'>;
  body?: string;
}): {
  id: string;
  objectId: string;
  userId: string;
  site: Site;
  kind: Exclude<ExtendedCommunityInteractionKind, 'follow'>;
  body?: string;
  createdAt: string;
  updatedAt: string;
} {
  const db = getDb();
  const now = new Date().toISOString();
  const id = db.transaction(() => {
    const existing = db
      .prepare(
        `SELECT id, body
        FROM community_interactions
        WHERE user_id = @userId
          AND object_id = @objectId
          AND kind = @kind`,
      )
      .get({
        userId: input.userId,
        objectId: input.objectId,
        kind: input.kind,
      }) as { id: string; body: string | null } | undefined;

    if (existing) {
      db.prepare(
        `UPDATE community_interactions
        SET site = @site,
            body = @body,
            updated_at = @updatedAt
        WHERE id = @id`,
      ).run({
        id: existing.id,
        site: input.site,
        body: input.body ?? existing.body ?? null,
        updatedAt: now,
      });
      return existing.id;
    }

    const createdId = randomUUID();
    db.prepare(
      `INSERT INTO community_interactions (
        id,
        user_id,
        site,
        object_id,
        kind,
        body,
        created_at,
        updated_at
      ) VALUES (
        @id,
        @userId,
        @site,
        @objectId,
        @kind,
        @body,
        @createdAt,
        @updatedAt
      )`,
    ).run({
      id: createdId,
      userId: input.userId,
      site: input.site,
      objectId: input.objectId,
      kind: input.kind,
      body: input.body ?? null,
      createdAt: now,
      updatedAt: now,
    });
    return createdId;
  })();

  const interaction = getExtendedInteractionById(db, id);
  if (!interaction) {
    throw new Error('Failed to load community action interaction');
  }
  return interaction as {
    id: string;
    objectId: string;
    userId: string;
    site: Site;
    kind: Exclude<ExtendedCommunityInteractionKind, 'follow'>;
    body?: string;
    createdAt: string;
    updatedAt: string;
  };
}

export function removeCommunityInteraction(input: {
  userId: string;
  objectId: string;
  kind: Exclude<CommunityInteractionKind, 'follow'>;
}): { id: string | null } {
  const db = getDb();
  const existing = db
    .prepare(
      `SELECT id
      FROM community_interactions
      WHERE user_id = @userId
        AND object_id = @objectId
        AND kind = @kind`,
    )
    .get({
      userId: input.userId,
      objectId: input.objectId,
      kind: input.kind,
    }) as { id: string } | undefined;
  if (!existing) {
    return { id: null };
  }
  db.prepare(
    `DELETE FROM community_interactions
    WHERE id = @id`,
  ).run({ id: existing.id });
  return { id: existing.id };
}

export function listInteractionsForUser(input: {
  userId: string;
  request: CommunityInteractionListRequest;
}): {
  interactions: CommunityInteractionRecord[];
  nextCursor: string | null;
} {
  const db = getDb();
  const request = communityInteractionListRequestSchema.parse(input.request);
  const limit = request.limit ?? 30;
  const followWhere: string[] = ['f.user_id = @userId'];
  const interactionWhere: string[] = [
    'i.user_id = @userId',
    `i.kind IN ('offer_help', 'join', 'request_mentor', 'ask_for_intro', 'apply')`,
  ];
  const outerWhere: string[] = [];
  const params: Record<string, unknown> = {
    userId: input.userId,
    limit: limit + 1,
  };

  if (request.site) {
    followWhere.push('f.site = @site');
    interactionWhere.push('i.site = @site');
    params.site = request.site;
  }
  if (request.objectId) {
    followWhere.push('f.object_id = @objectId');
    interactionWhere.push('i.object_id = @objectId');
    params.objectId = request.objectId;
  }
  if (request.kind) {
    const parsedKind = communityInteractionKindSchema.parse(request.kind);
    if (parsedKind === 'follow') {
      interactionWhere.push('1 = 0');
    } else {
      followWhere.push('1 = 0');
      interactionWhere.push('i.kind = @kind');
      params.kind = parsedKind;
    }
  }
  if (request.cursor) {
    const parsedCursor = parseCursor(request.cursor);
    if (parsedCursor) {
      outerWhere.push('(u.createdAt < @cursorCreatedAt OR (u.createdAt = @cursorCreatedAt AND u.id < @cursorId))');
      params.cursorCreatedAt = parsedCursor.createdAt;
      params.cursorId = parsedCursor.id;
    }
  }

  const rows = db
    .prepare(
      `SELECT
        u.id,
        u.userId,
        u.site,
        u.objectId,
        u.kind,
        u.body,
        u.createdAt,
        u.updatedAt
      FROM (
        SELECT
          f.id AS id,
          f.user_id AS userId,
          f.site AS site,
          f.object_id AS objectId,
          'follow' AS kind,
          NULL AS body,
          f.created_at AS createdAt,
          f.updated_at AS updatedAt
        FROM community_follows f
        WHERE ${followWhere.join(' AND ')}
        UNION ALL
        SELECT
          i.id AS id,
          i.user_id AS userId,
          i.site AS site,
          i.object_id AS objectId,
          i.kind AS kind,
          i.body AS body,
          i.created_at AS createdAt,
          i.updated_at AS updatedAt
        FROM community_interactions i
        WHERE ${interactionWhere.join(' AND ')}
      ) u
      ${outerWhere.length > 0 ? `WHERE ${outerWhere.join(' AND ')}` : ''}
      ORDER BY u.createdAt DESC, u.id DESC
      LIMIT @limit`,
    )
    .all(params) as DbUnifiedInteractionRow[];

  const hasMore = rows.length > limit;
  const pageRows = hasMore ? rows.slice(0, limit) : rows;
  const interactions = pageRows.map(toUnifiedInteractionRecord);
  const last = pageRows.at(-1);
  return {
    interactions,
    nextCursor: hasMore && last ? makeCursor(last.createdAt, last.id) : null,
  };
}

export function recordMatchRun(input: {
  userId: string;
  site: Site;
  objectId: string;
  candidateCount: number;
  metadata?: Record<string, unknown>;
}): void {
  const db = getDb();
  db.prepare(
    `INSERT INTO community_match_runs (
      id,
      user_id,
      site,
      object_id,
      candidate_count,
      metadata,
      created_at
    ) VALUES (
      @id,
      @userId,
      @site,
      @objectId,
      @candidateCount,
      @metadata,
      @createdAt
    )`,
  ).run({
    id: randomUUID(),
    userId: input.userId,
    site: input.site,
    objectId: input.objectId,
    candidateCount: input.candidateCount,
    metadata: JSON.stringify(input.metadata ?? {}),
    createdAt: new Date().toISOString(),
  });
}

export function upsertMatchFeedback(input: {
  userId: string;
  site: Site;
  objectId: string;
  candidateObjectId: string;
  verdict: 'up' | 'down';
}): void {
  const db = getDb();
  const now = new Date().toISOString();
  const existing = db
    .prepare(
      `SELECT id
      FROM community_match_feedback
      WHERE user_id = @userId
        AND object_id = @objectId
        AND candidate_object_id = @candidateObjectId`,
    )
    .get({
      userId: input.userId,
      objectId: input.objectId,
      candidateObjectId: input.candidateObjectId,
    }) as { id: string } | undefined;

  if (existing) {
    db.prepare(
      `UPDATE community_match_feedback
      SET site = @site,
          verdict = @verdict,
          updated_at = @updatedAt
      WHERE id = @id`,
    ).run({
      id: existing.id,
      site: input.site,
      verdict: input.verdict,
      updatedAt: now,
    });
    return;
  }

  db.prepare(
    `INSERT INTO community_match_feedback (
      id,
      user_id,
      site,
      object_id,
      candidate_object_id,
      verdict,
      created_at,
      updated_at
    ) VALUES (
      @id,
      @userId,
      @site,
      @objectId,
      @candidateObjectId,
      @verdict,
      @createdAt,
      @updatedAt
    )`,
  ).run({
    id: randomUUID(),
    userId: input.userId,
    site: input.site,
    objectId: input.objectId,
    candidateObjectId: input.candidateObjectId,
    verdict: input.verdict,
    createdAt: now,
    updatedAt: now,
  });
}

export function getMatchFeedback(input: {
  userId: string;
  objectId: string;
  candidateObjectId: string;
}): {
  id: string;
  userId: string;
  objectId: string;
  candidateObjectId: string;
  verdict: 'up' | 'down';
} | null {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT
        id,
        user_id AS userId,
        object_id AS objectId,
        candidate_object_id AS candidateObjectId,
        verdict
      FROM community_match_feedback
      WHERE user_id = @userId
        AND object_id = @objectId
        AND candidate_object_id = @candidateObjectId`,
    )
    .get({
      userId: input.userId,
      objectId: input.objectId,
      candidateObjectId: input.candidateObjectId,
    }) as DbMatchFeedbackRow | undefined;
  if (!row) {
    return null;
  }
  return {
    id: row.id,
    userId: row.userId,
    objectId: row.objectId,
    candidateObjectId: row.candidateObjectId,
    verdict: row.verdict,
  };
}
