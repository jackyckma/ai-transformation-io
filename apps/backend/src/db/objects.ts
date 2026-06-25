import { randomUUID } from 'node:crypto';

import type Database from 'better-sqlite3';
import {
  autoModerationResultSchema,
  communityObjectTypeSchema,
  contributionRecordSchema,
  knowledgeObjectTypeSchema,
  moderationQueueItemSchema,
  objectRecordSchema,
  onboardingProfileSchema,
  profileRecordSchema,
  publishPreferenceSchema,
  type AutoModerationResult,
  type ContributionCreateRequest,
  type ContributionDraftRequest,
  type ContributionRecord,
  type LifecycleStatus,
  type ModerationQueueItem,
  type ModerationQueueListRequest,
  type ModerationTransitionRequest,
  type ObjectCreateRequest,
  type ObjectDraftRequest,
  type ObjectListRequest,
  type ObjectRecord,
  type ObjectSubtype,
  type ObjectType,
  type ProfileRecord,
  type PublishMode,
  type Site,
  type Visibility,
} from '@ai-transformation/shared';

import { getDb } from './index.js';

export type VisibilityQueryContext = {
  site: Site;
  requesterUserId: string | null;
  bearerOwnerUserId: string | null;
  isAuthenticated: boolean;
};

type DbObjectRow = {
  id: string;
  objectType: ObjectType;
  type: ObjectSubtype;
  site: Site;
  ownerUserId: string | null;
  visibility: Visibility;
  title: string | null;
  subject: string | null;
  body: string;
  status: LifecycleStatus;
  metadata: string;
  sourceContributionId: string | null;
  publishedSlug: string | null;
  createdAt: string;
  updatedAt: string;
};

type DbContributionRow = {
  id: string;
  site: Site;
  objectType: string | null;
  type: string | null;
  ownerUserId: string | null;
  visibility: string | null;
  title: string | null;
  subject: string | null;
  body: string;
  status: string;
  metadata: string;
  objectId: string | null;
  source: string | null;
  publishedSlug: string | null;
  createdAt: string;
  updatedAt: string | null;
};

type DbProfileRow = {
  userId: string;
  profileJson: string;
  createdAt: string;
  updatedAt: string;
};

const DEFAULT_PUBLISH_PREFERENCE = { defaultPublishMode: 'review' as const };
const DEFAULT_MODERATION_STATUSES: LifecycleStatus[] = ['draft', 'pending'];
const BANNED_PATTERNS = [
  /buy\s+followers/i,
  /casino\s+bonus/i,
  /seo\s+backlinks/i,
  /viagra/i,
  /crypto\s+pump/i,
];

function hasColumn(db: Database.Database, table: string, column: string): boolean {
  const rows = db.prepare(`PRAGMA table_info(${table})`).all() as Array<{ name: string }>;
  return rows.some((row) => row.name === column);
}

function addColumnIfMissing(
  db: Database.Database,
  table: string,
  column: string,
  definition: string,
): void {
  if (hasColumn(db, table, column)) {
    return;
  }
  db.exec(`ALTER TABLE ${table} ADD COLUMN ${definition}`);
}

function parseMetadata(value: string | null | undefined): Record<string, unknown> {
  if (!value) {
    return {};
  }
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {};
    }
    return parsed as Record<string, unknown>;
  } catch {
    return {};
  }
}

function toObjectRecord(row: DbObjectRow): ObjectRecord {
  const base = {
    id: row.id,
    objectType: row.objectType,
    type: row.type,
    site: row.site,
    ownerUserId: row.ownerUserId,
    visibility: row.visibility,
    title: row.title ?? undefined,
    subject: row.subject ?? undefined,
    body: row.body,
    status: row.status,
    metadata: parseMetadata(row.metadata),
    sourceContributionId: row.sourceContributionId,
    publishedSlug: row.publishedSlug,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
  return objectRecordSchema.parse(base);
}

function inferContributionObjectType(row: DbContributionRow): ObjectType {
  if (row.objectType === 'knowledge' || row.objectType === 'community') {
    return row.objectType;
  }
  if (row.source === 'web_story') {
    return 'knowledge';
  }
  return 'community';
}

function inferContributionType(row: DbContributionRow, objectType: ObjectType): ObjectSubtype {
  if (row.type) {
    const knowledgeParsed = knowledgeObjectTypeSchema.safeParse(row.type);
    if (knowledgeParsed.success) {
      return knowledgeParsed.data;
    }
  }
  if (row.type) {
    const communityParsed = communityObjectTypeSchema.safeParse(row.type);
    if (communityParsed.success) {
      return communityParsed.data;
    }
  }
  if (row.source === 'web_story') {
    return 'article';
  }
  if (row.source === 'web_inquiry') {
    return 'help_request';
  }
  return objectType === 'knowledge' ? 'field_note' : 'discussion';
}

function inferContributionVisibility(row: DbContributionRow): Visibility {
  if (row.visibility === 'public' || row.visibility === 'members-only' || row.visibility === 'private') {
    return row.visibility;
  }
  if (row.source === 'web_story') {
    return 'public';
  }
  return 'members-only';
}

function toContributionRecord(row: DbContributionRow): ContributionRecord {
  const objectType = inferContributionObjectType(row);
  const type = inferContributionType(row, objectType);
  const value = {
    id: row.id,
    site: row.site,
    objectType,
    type,
    ownerUserId: row.ownerUserId,
    visibility: inferContributionVisibility(row),
    title: row.title ?? undefined,
    subject: row.subject ?? undefined,
    body: row.body,
    status: row.status as LifecycleStatus,
    metadata: parseMetadata(row.metadata),
    objectId: row.objectId,
    source: row.source ?? undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt ?? row.createdAt,
  };
  return contributionRecordSchema.parse(value);
}

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

function buildOwnerIds(context: VisibilityQueryContext): string[] {
  return Array.from(new Set([context.requesterUserId, context.bearerOwnerUserId].filter(Boolean) as string[]));
}

export function buildVisibilityFilter(context: VisibilityQueryContext, tableAlias?: string): {
  sql: string;
  params: Record<string, string>;
} {
  const alias = tableAlias ? `${tableAlias}.` : '';
  const ownerIds = buildOwnerIds(context);
  const params: Record<string, string> = {
    visibilityPublic: 'public',
    visibilityMembersOnly: 'members-only',
    visibilityPrivate: 'private',
    requesterSite: context.site,
  };

  const clauses: string[] = [`${alias}visibility = @visibilityPublic`];
  if (context.isAuthenticated) {
    clauses.push(
      `(${alias}visibility = @visibilityMembersOnly AND ${alias}site = @requesterSite)`,
    );
  }
  if (ownerIds.length > 0) {
    const ownerParams: string[] = [];
    ownerIds.forEach((ownerId, index) => {
      const key = `ownerId${index}`;
      params[key] = ownerId;
      ownerParams.push(`@${key}`);
    });
    clauses.push(
      `(${alias}visibility = @visibilityPrivate AND ${alias}owner_user_id IN (${ownerParams.join(', ')}))`,
    );
  }

  return {
    sql: `(${clauses.join(' OR ')})`,
    params,
  };
}

export function runObjectsMigrations(db: Database.Database): void {
  addColumnIfMissing(db, 'contributions', 'object_type', 'object_type TEXT');
  addColumnIfMissing(db, 'contributions', 'type', 'type TEXT');
  addColumnIfMissing(db, 'contributions', 'visibility', "visibility TEXT DEFAULT 'members-only'");
  addColumnIfMissing(db, 'contributions', 'object_id', 'object_id TEXT');
  addColumnIfMissing(db, 'contributions', 'updated_at', 'updated_at TEXT');

  db.exec(`
    UPDATE contributions
    SET object_type = CASE
      WHEN source = 'web_story' THEN 'knowledge'
      ELSE COALESCE(object_type, 'community')
    END
    WHERE object_type IS NULL;
  `);
  db.exec(`
    UPDATE contributions
    SET type = CASE
      WHEN source = 'web_story' THEN 'article'
      WHEN source = 'web_inquiry' THEN 'help_request'
      ELSE COALESCE(type, 'discussion')
    END
    WHERE type IS NULL;
  `);
  db.exec(`
    UPDATE contributions
    SET visibility = CASE
      WHEN source = 'web_story' THEN 'public'
      ELSE COALESCE(visibility, 'members-only')
    END
    WHERE visibility IS NULL;
  `);
  db.exec(`
    UPDATE contributions
    SET updated_at = COALESCE(updated_at, reviewed_at, created_at)
    WHERE updated_at IS NULL;
  `);
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_contributions_status_site
    ON contributions (status, site, created_at);
  `);
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_contributions_owner_user
    ON contributions (user_id, status, created_at);
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS objects (
      id TEXT PRIMARY KEY,
      object_type TEXT NOT NULL,
      type TEXT NOT NULL,
      site TEXT NOT NULL,
      owner_user_id TEXT,
      visibility TEXT NOT NULL,
      title TEXT,
      subject TEXT,
      body TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft',
      metadata TEXT NOT NULL DEFAULT '{}',
      source_contribution_id TEXT,
      published_slug TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_objects_site_type_visibility_status
    ON objects (site, object_type, visibility, status);
  `);
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_objects_owner_user_id
    ON objects (owner_user_id);
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS user_publish_preferences (
      user_id TEXT PRIMARY KEY,
      default_publish_mode TEXT NOT NULL DEFAULT 'review',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
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

export function findUserByEmail(email: string): { id: string; email: string } | null {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT id, email
       FROM users
       WHERE email = @email`,
    )
    .get({ email: email.trim().toLowerCase() }) as { id: string; email: string } | undefined;
  return row ?? null;
}

export function getObjectById(id: string): ObjectRecord | null {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT
        id,
        object_type AS objectType,
        type,
        site,
        owner_user_id AS ownerUserId,
        visibility,
        title,
        subject,
        body,
        status,
        metadata,
        source_contribution_id AS sourceContributionId,
        published_slug AS publishedSlug,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM objects
      WHERE id = @id`,
    )
    .get({ id }) as DbObjectRow | undefined;
  return row ? toObjectRecord(row) : null;
}

export function getObjectByIdForRequester(id: string, context: VisibilityQueryContext): ObjectRecord | null {
  const db = getDb();
  const visibility = buildVisibilityFilter(context);
  const row = db
    .prepare(
      `SELECT
        id,
        object_type AS objectType,
        type,
        site,
        owner_user_id AS ownerUserId,
        visibility,
        title,
        subject,
        body,
        status,
        metadata,
        source_contribution_id AS sourceContributionId,
        published_slug AS publishedSlug,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM objects
      WHERE id = @id
        AND ${visibility.sql}`,
    )
    .get({ id, ...visibility.params }) as DbObjectRow | undefined;
  return row ? toObjectRecord(row) : null;
}

export function listObjectsForRequester(input: {
  request: ObjectListRequest;
  context: VisibilityQueryContext;
}): {
  objects: ObjectRecord[];
  nextCursor: string | null;
} {
  const db = getDb();
  const request = input.request;
  const limit = request.limit ?? 30;
  const visibility = buildVisibilityFilter(input.context, 'o');
  const whereParts: string[] = [visibility.sql];
  const params: Record<string, unknown> = { ...visibility.params, limit: limit + 1 };

  if (request.site) {
    whereParts.push('o.site = @filterSite');
    params.filterSite = request.site;
  }
  if (request.objectType) {
    whereParts.push('o.object_type = @filterObjectType');
    params.filterObjectType = request.objectType;
  }
  if (request.type) {
    whereParts.push('o.type = @filterType');
    params.filterType = request.type;
  }
  if (request.visibility) {
    whereParts.push('o.visibility = @filterVisibility');
    params.filterVisibility = request.visibility;
  }
  if (request.status) {
    whereParts.push('o.status = @filterStatus');
    params.filterStatus = request.status;
  }
  if (request.mine) {
    const ownerIds = buildOwnerIds(input.context);
    if (ownerIds.length === 0) {
      return { objects: [], nextCursor: null };
    }
    const ownerParams: string[] = [];
    ownerIds.forEach((ownerId, index) => {
      const key = `mineOwnerId${index}`;
      params[key] = ownerId;
      ownerParams.push(`@${key}`);
    });
    whereParts.push(`o.owner_user_id IN (${ownerParams.join(', ')})`);
  }

  if (request.cursor) {
    const parsedCursor = parseCursor(request.cursor);
    if (parsedCursor) {
      whereParts.push(
        '(o.created_at < @cursorCreatedAt OR (o.created_at = @cursorCreatedAt AND o.id < @cursorId))',
      );
      params.cursorCreatedAt = parsedCursor.createdAt;
      params.cursorId = parsedCursor.id;
    }
  }

  const rows = db
    .prepare(
      `SELECT
        o.id,
        o.object_type AS objectType,
        o.type,
        o.site,
        o.owner_user_id AS ownerUserId,
        o.visibility,
        o.title,
        o.subject,
        o.body,
        o.status,
        o.metadata,
        o.source_contribution_id AS sourceContributionId,
        o.published_slug AS publishedSlug,
        o.created_at AS createdAt,
        o.updated_at AS updatedAt
      FROM objects o
      WHERE ${whereParts.join(' AND ')}
      ORDER BY o.created_at DESC, o.id DESC
      LIMIT @limit`,
    )
    .all(params) as DbObjectRow[];

  const hasMore = rows.length > limit;
  const pageRows = hasMore ? rows.slice(0, limit) : rows;
  const objects = pageRows.map(toObjectRecord);
  const last = pageRows.at(-1);
  return {
    objects,
    nextCursor: hasMore && last ? makeCursor(last.createdAt, last.id) : null,
  };
}

const OBJECT_SELECT_COLUMNS = `
        id,
        object_type AS objectType,
        type,
        site,
        owner_user_id AS ownerUserId,
        visibility,
        title,
        subject,
        body,
        status,
        metadata,
        source_contribution_id AS sourceContributionId,
        published_slug AS publishedSlug,
        created_at AS createdAt,
        updated_at AS updatedAt`;

export function listEditorialDrafts(input: { site?: Site; limit?: number }): ObjectRecord[] {
  const db = getDb();
  const limit = input.limit ?? 100;
  const params: Record<string, unknown> = { limit };
  const where: string[] = [
    "status IN ('draft', 'pending')",
    "json_extract(metadata, '$.editorial_source') IS NOT NULL",
  ];
  if (input.site) {
    where.push('site = @site');
    params.site = input.site;
  }
  const rows = db
    .prepare(
      `SELECT ${OBJECT_SELECT_COLUMNS}
      FROM objects
      WHERE ${where.join(' AND ')}
      ORDER BY created_at DESC, id DESC
      LIMIT @limit`,
    )
    .all(params) as DbObjectRow[];
  return rows.map(toObjectRecord);
}

export function findEditorialSeedObject(input: { site: Site; seedKey: string }): ObjectRecord | null {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT ${OBJECT_SELECT_COLUMNS}
      FROM objects
      WHERE site = @site
        AND json_extract(metadata, '$.seed_key') = @seedKey
      LIMIT 1`,
    )
    .get({ site: input.site, seedKey: input.seedKey }) as DbObjectRow | undefined;
  return row ? toObjectRecord(row) : null;
}

export function createObject(input: {
  payload: Omit<ObjectCreateRequest, 'status'> & { status: LifecycleStatus };
  ownerUserId: string | null;
}): ObjectRecord {
  const db = getDb();
  const id = randomUUID();
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO objects (
      id,
      object_type,
      type,
      site,
      owner_user_id,
      visibility,
      title,
      subject,
      body,
      status,
      metadata,
      source_contribution_id,
      published_slug,
      created_at,
      updated_at
    ) VALUES (
      @id,
      @objectType,
      @type,
      @site,
      @ownerUserId,
      @visibility,
      @title,
      @subject,
      @body,
      @status,
      @metadata,
      @sourceContributionId,
      @publishedSlug,
      @createdAt,
      @updatedAt
    )`,
  ).run({
    id,
    objectType: input.payload.objectType,
    type: input.payload.type,
    site: input.payload.site,
    ownerUserId: input.ownerUserId,
    visibility: input.payload.visibility,
    title: input.payload.title ?? null,
    subject: input.payload.subject ?? null,
    body: input.payload.body,
    status: input.payload.status,
    metadata: JSON.stringify(input.payload.metadata ?? {}),
    sourceContributionId: input.payload.sourceContributionId ?? null,
    publishedSlug: input.payload.publishedSlug ?? null,
    createdAt: now,
    updatedAt: now,
  });
  const created = getObjectById(id);
  if (!created) {
    throw new Error('Failed to load created object');
  }
  return created;
}

export function saveObjectDraft(input: {
  payload: ObjectDraftRequest;
  ownerUserId: string | null;
}): ObjectRecord | null {
  const db = getDb();
  const status = input.payload.status ?? 'draft';
  const now = new Date().toISOString();
  const objectId = input.payload.objectId?.trim();

  if (objectId) {
    const existing = getObjectById(objectId);
    if (!existing) {
      return null;
    }
    if (existing.ownerUserId && existing.ownerUserId !== input.ownerUserId) {
      return null;
    }
    db.prepare(
      `UPDATE objects
      SET object_type = @objectType,
          type = @type,
          site = @site,
          owner_user_id = @ownerUserId,
          visibility = @visibility,
          title = @title,
          subject = @subject,
          body = @body,
          status = @status,
          metadata = @metadata,
          source_contribution_id = @sourceContributionId,
          published_slug = @publishedSlug,
          updated_at = @updatedAt
      WHERE id = @id`,
    ).run({
      id: existing.id,
      objectType: input.payload.objectType,
      type: input.payload.type,
      site: input.payload.site,
      ownerUserId: existing.ownerUserId ?? input.ownerUserId,
      visibility: input.payload.visibility,
      title: input.payload.title ?? null,
      subject: input.payload.subject ?? null,
      body: input.payload.body,
      status,
      metadata: JSON.stringify(input.payload.metadata ?? {}),
      sourceContributionId: input.payload.sourceContributionId ?? null,
      publishedSlug: input.payload.publishedSlug ?? null,
      updatedAt: now,
    });
    return getObjectById(existing.id);
  }

  return createObject({
    payload: {
      ...input.payload,
      status,
    },
    ownerUserId: input.ownerUserId,
  });
}

export function updateObjectLifecycle(input: {
  id: string;
  status: LifecycleStatus;
  visibility?: Visibility;
  publishedSlug?: string | null;
  metadata?: Record<string, unknown>;
}): ObjectRecord | null {
  const db = getDb();
  const existing = getObjectById(input.id);
  if (!existing) {
    return null;
  }
  const nextMetadata = input.metadata ?? existing.metadata;
  const nextVisibility = input.visibility ?? existing.visibility;
  const nextPublishedSlug = input.publishedSlug === undefined ? existing.publishedSlug : input.publishedSlug;
  const updatedAt = new Date().toISOString();

  db.prepare(
    `UPDATE objects
    SET status = @status,
        visibility = @visibility,
        published_slug = @publishedSlug,
        metadata = @metadata,
        updated_at = @updatedAt
    WHERE id = @id`,
  ).run({
    id: existing.id,
    status: input.status,
    visibility: nextVisibility,
    publishedSlug: nextPublishedSlug,
    metadata: JSON.stringify(nextMetadata),
    updatedAt,
  });
  return getObjectById(existing.id);
}

export function evaluateAutoModeration(input: { title?: string; body: string }): AutoModerationResult {
  const reasons: string[] = [];
  const body = input.body.trim();
  const title = input.title?.trim() ?? '';
  if (body.length < 20) {
    reasons.push('Body is too short.');
  }
  if (body.length > 12000) {
    reasons.push('Body is too long.');
  }
  const combined = `${title}\n${body}`;
  for (const pattern of BANNED_PATTERNS) {
    if (pattern.test(combined)) {
      reasons.push(`Blocked by content policy pattern: ${pattern.source}`);
    }
  }
  return autoModerationResultSchema.parse({
    allowed: reasons.length === 0,
    reasons: reasons.length > 0 ? reasons : undefined,
  });
}

function toUrlSafeSlug(input: string): string {
  const slug = input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96);
  if (slug.length > 0) {
    return slug;
  }
  return 'item';
}

export function createPublishedSlug(seed: string): string {
  const base = toUrlSafeSlug(seed);
  const suffix = randomUUID().replace(/-/g, '').slice(0, 8);
  return `${base}-${suffix}`;
}

export function getPublishPreference(userId: string) {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT default_publish_mode AS defaultPublishMode
      FROM user_publish_preferences
      WHERE user_id = @userId`,
    )
    .get({ userId }) as { defaultPublishMode: string } | undefined;
  if (!row) {
    return publishPreferenceSchema.parse(DEFAULT_PUBLISH_PREFERENCE);
  }
  return publishPreferenceSchema.parse({
    defaultPublishMode: row.defaultPublishMode,
  });
}

export function setPublishPreference(userId: string, publishMode: PublishMode) {
  const db = getDb();
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO user_publish_preferences (
      user_id,
      default_publish_mode,
      created_at,
      updated_at
    ) VALUES (
      @userId,
      @defaultPublishMode,
      @createdAt,
      @updatedAt
    )
    ON CONFLICT(user_id) DO UPDATE SET
      default_publish_mode = excluded.default_publish_mode,
      updated_at = excluded.updated_at`,
  ).run({
    userId,
    defaultPublishMode: publishMode,
    createdAt: now,
    updatedAt: now,
  });
  return getPublishPreference(userId);
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
    .get({ userId }) as DbProfileRow | undefined;
  if (!row) {
    return null;
  }
  const publishPreference = getPublishPreference(userId);
  let parsedProfile: unknown = {};
  try {
    parsedProfile = JSON.parse(row.profileJson);
  } catch {
    return null;
  }
  return profileRecordSchema.parse({
    userId: row.userId,
    profile: onboardingProfileSchema.parse(parsedProfile),
    publishPreference,
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
  publishMode?: PublishMode;
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
  const record = getProfile(input.userId);
  if (!record) {
    throw new Error('Failed to load profile');
  }
  return record;
}

function getContributionRowById(id: string): DbContributionRow | null {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT
        id,
        site,
        object_type AS objectType,
        type,
        user_id AS ownerUserId,
        visibility,
        subject AS title,
        subject,
        body,
        status,
        metadata,
        object_id AS objectId,
        source,
        published_slug AS publishedSlug,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM contributions
      WHERE id = @id`,
    )
    .get({ id }) as DbContributionRow | undefined;
  return row ?? null;
}

export function getContributionByIdForObjectsLane(id: string): ContributionRecord | null {
  const row = getContributionRowById(id);
  if (!row) {
    return null;
  }
  return toContributionRecord(row);
}

function getContributionWithRow(id: string): { row: DbContributionRow; record: ContributionRecord } | null {
  const row = getContributionRowById(id);
  if (!row) {
    return null;
  }
  return {
    row,
    record: toContributionRecord(row),
  };
}

export function createContribution(input: {
  payload: Omit<ContributionCreateRequest, 'status'> & { status: LifecycleStatus };
  ownerUserId: string | null;
  ownerEmail: string;
  ownerName?: string | null;
  source?: string;
}): ContributionRecord {
  const db = getDb();
  const id = randomUUID();
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO contributions (
      id,
      source,
      site,
      user_id,
      email,
      name,
      subject,
      body,
      status,
      metadata,
      published_slug,
      created_at,
      updated_at,
      object_type,
      type,
      visibility,
      object_id
    ) VALUES (
      @id,
      @source,
      @site,
      @ownerUserId,
      @email,
      @name,
      @subject,
      @body,
      @status,
      @metadata,
      @publishedSlug,
      @createdAt,
      @updatedAt,
      @objectType,
      @type,
      @visibility,
      NULL
    )`,
  ).run({
    id,
    source: input.source ?? input.payload.source ?? 'object_contribution',
    site: input.payload.site,
    ownerUserId: input.ownerUserId,
    email: input.ownerEmail.trim().toLowerCase(),
    name: input.ownerName ?? null,
    subject: input.payload.subject ?? input.payload.title ?? null,
    body: input.payload.body,
    status: input.payload.status,
    metadata: JSON.stringify(input.payload.metadata ?? {}),
    publishedSlug: null,
    createdAt: now,
    updatedAt: now,
    objectType: input.payload.objectType,
    type: input.payload.type,
    visibility: input.payload.visibility,
  });

  const created = getContributionByIdForObjectsLane(id);
  if (!created) {
    throw new Error('Failed to load created contribution');
  }
  return created;
}

export function saveContributionDraft(input: {
  payload: ContributionDraftRequest;
  ownerUserId: string | null;
  ownerEmail: string;
  ownerName?: string | null;
  source?: string;
}): ContributionRecord | null {
  const db = getDb();
  const status = input.payload.status ?? 'draft';
  const now = new Date().toISOString();
  const contributionId = input.payload.contributionId?.trim();

  if (contributionId) {
    const existing = getContributionByIdForObjectsLane(contributionId);
    if (!existing) {
      return null;
    }
    if (existing.ownerUserId && existing.ownerUserId !== input.ownerUserId) {
      return null;
    }
    db.prepare(
      `UPDATE contributions
      SET source = @source,
          site = @site,
          user_id = @ownerUserId,
          email = @email,
          name = @name,
          subject = @subject,
          body = @body,
          status = @status,
          metadata = @metadata,
          object_type = @objectType,
          type = @type,
          visibility = @visibility,
          updated_at = @updatedAt
      WHERE id = @id`,
    ).run({
      id: existing.id,
      source: input.source ?? input.payload.source ?? existing.source ?? 'object_contribution',
      site: input.payload.site,
      ownerUserId: existing.ownerUserId ?? input.ownerUserId,
      email: input.ownerEmail.trim().toLowerCase(),
      name: input.ownerName ?? null,
      subject: input.payload.subject ?? input.payload.title ?? null,
      body: input.payload.body,
      status,
      metadata: JSON.stringify(input.payload.metadata ?? {}),
      objectType: input.payload.objectType,
      type: input.payload.type,
      visibility: input.payload.visibility,
      updatedAt: now,
    });
    return getContributionByIdForObjectsLane(existing.id);
  }

  return createContribution({
    payload: {
      ...input.payload,
      status,
    },
    ownerUserId: input.ownerUserId,
    ownerEmail: input.ownerEmail,
    ownerName: input.ownerName,
    source: input.source,
  });
}

function ensureObjectForContribution(input: {
  contribution: ContributionRecord;
  status: LifecycleStatus;
  visibility: Visibility;
  publishedSlug: string | null;
}): ObjectRecord {
  const db = getDb();
  if (input.contribution.objectId) {
    const existingObject = getObjectById(input.contribution.objectId);
    if (existingObject) {
      const updated = updateObjectLifecycle({
        id: existingObject.id,
        status: input.status,
        visibility: input.visibility,
        publishedSlug: input.publishedSlug,
      });
      if (!updated) {
        throw new Error('Failed to update linked object');
      }
      return updated;
    }
  }

  const created = createObject({
    payload: {
      objectType: input.contribution.objectType,
      type: input.contribution.type,
      site: input.contribution.site,
      visibility: input.visibility,
      title: input.contribution.title,
      subject: input.contribution.subject,
      body: input.contribution.body,
      status: input.status,
      metadata: input.contribution.metadata,
      sourceContributionId: input.contribution.id,
      publishedSlug: input.publishedSlug,
    },
    ownerUserId: input.contribution.ownerUserId,
  });

  db.prepare(
    `UPDATE contributions
    SET object_id = @objectId,
        updated_at = @updatedAt
    WHERE id = @id`,
  ).run({
    id: input.contribution.id,
    objectId: created.id,
    updatedAt: new Date().toISOString(),
  });

  return created;
}

export function submitContribution(input: {
  contributionId: string;
  publishMode: PublishMode;
  visibilityOverride?: Visibility;
  requesterUserId: string | null;
  bearerOwnerUserId: string | null;
}): {
  contribution: ContributionRecord;
  moderation: AutoModerationResult;
} | null {
  const db = getDb();
  const existing = getContributionWithRow(input.contributionId);
  if (!existing) {
    return null;
  }
  const contribution = existing.record;
  const ownerIds = new Set(buildOwnerIds({
    site: contribution.site,
    requesterUserId: input.requesterUserId,
    bearerOwnerUserId: input.bearerOwnerUserId,
    isAuthenticated: true,
  }));
  if (contribution.ownerUserId && !ownerIds.has(contribution.ownerUserId)) {
    return null;
  }

  const visibility = input.visibilityOverride ?? contribution.visibility;
  if (visibility === 'private' && !contribution.ownerUserId) {
    return null;
  }

  const moderation = evaluateAutoModeration({
    title: contribution.title ?? contribution.subject,
    body: contribution.body,
  });
  const nextStatus: LifecycleStatus =
    input.publishMode === 'auto' && moderation.allowed ? 'published' : 'pending';
  const publishedSlug =
    nextStatus === 'published'
      ? existing.row.publishedSlug ??
        createPublishedSlug(contribution.subject ?? contribution.title ?? contribution.type)
      : existing.row.publishedSlug ?? null;
  const updatedAt = new Date().toISOString();
  const nextMetadata = {
    ...contribution.metadata,
    autoModeration: moderation,
  };

  db.prepare(
    `UPDATE contributions
    SET status = @status,
        visibility = @visibility,
        metadata = @metadata,
        published_slug = @publishedSlug,
        updated_at = @updatedAt
    WHERE id = @id`,
  ).run({
    id: contribution.id,
    status: nextStatus,
    visibility,
    metadata: JSON.stringify(nextMetadata),
    publishedSlug,
    updatedAt,
  });

  const updatedContribution = getContributionByIdForObjectsLane(contribution.id);
  if (!updatedContribution) {
    throw new Error('Failed to load submitted contribution');
  }
  ensureObjectForContribution({
    contribution: updatedContribution,
    status: nextStatus,
    visibility,
    publishedSlug,
  });
  return {
    contribution: getContributionByIdForObjectsLane(contribution.id) ?? updatedContribution,
    moderation,
  };
}

export function submitObject(input: {
  objectId: string;
  publishMode: PublishMode;
  visibilityOverride?: Visibility;
  requesterUserId: string | null;
  bearerOwnerUserId: string | null;
}): { object: ObjectRecord; moderation: AutoModerationResult } | null {
  const object = getObjectById(input.objectId);
  if (!object) {
    return null;
  }
  const ownerIds = new Set(buildOwnerIds({
    site: object.site,
    requesterUserId: input.requesterUserId,
    bearerOwnerUserId: input.bearerOwnerUserId,
    isAuthenticated: true,
  }));
  if (object.ownerUserId && !ownerIds.has(object.ownerUserId)) {
    return null;
  }

  const visibility = input.visibilityOverride ?? object.visibility;
  if (visibility === 'private' && !object.ownerUserId) {
    return null;
  }

  const moderation = evaluateAutoModeration({
    title: object.title ?? object.subject,
    body: object.body,
  });
  const nextStatus: LifecycleStatus =
    input.publishMode === 'auto' && moderation.allowed ? 'published' : 'pending';
  const metadata = {
    ...object.metadata,
    autoModeration: moderation,
  };
  const publishedSlug =
    nextStatus === 'published'
      ? object.publishedSlug ?? createPublishedSlug(object.subject ?? object.title ?? object.type)
      : object.publishedSlug;
  const updated = updateObjectLifecycle({
    id: object.id,
    status: nextStatus,
    visibility,
    publishedSlug,
    metadata,
  });
  if (!updated) {
    throw new Error('Failed to submit object');
  }
  return {
    object: updated,
    moderation,
  };
}

function contributionToQueueItem(
  contribution: ContributionRecord,
  sourceContribution: { publishedSlug: string | null } | null,
): ModerationQueueItem {
  return moderationQueueItemSchema.parse({
    id: contribution.id,
    entityType: 'contribution',
    site: contribution.site,
    objectType: contribution.objectType,
    type: contribution.type,
    ownerUserId: contribution.ownerUserId,
    visibility: contribution.visibility,
    title: contribution.title,
    subject: contribution.subject,
    body: contribution.body,
    status: contribution.status,
    metadata: contribution.metadata,
    sourceContributionId: null,
    publishedSlug: sourceContribution?.publishedSlug ?? null,
    createdAt: contribution.createdAt,
    updatedAt: contribution.updatedAt,
  });
}

function objectToQueueItem(object: ObjectRecord): ModerationQueueItem {
  return moderationQueueItemSchema.parse({
    id: object.id,
    entityType: 'object',
    site: object.site,
    objectType: object.objectType,
    type: object.type,
    ownerUserId: object.ownerUserId,
    visibility: object.visibility,
    title: object.title,
    subject: object.subject,
    body: object.body,
    status: object.status,
    metadata: object.metadata,
    sourceContributionId: object.sourceContributionId,
    publishedSlug: object.publishedSlug,
    createdAt: object.createdAt,
    updatedAt: object.updatedAt,
  });
}

export function listModerationQueue(request: ModerationQueueListRequest): {
  items: ModerationQueueItem[];
  nextCursor: string | null;
} {
  const db = getDb();
  const limit = request.limit ?? 50;
  const statuses = request.status ? [request.status] : DEFAULT_MODERATION_STATUSES;
  const statusParams = statuses.map((_, index) => `@status${index}`).join(', ');
  const params: Record<string, unknown> = {};
  statuses.forEach((status, index) => {
    params[`status${index}`] = status;
  });

  const objectWhere: string[] = [`status IN (${statusParams})`];
  const contributionWhere: string[] = [`status IN (${statusParams})`];

  if (request.site) {
    objectWhere.push('site = @site');
    contributionWhere.push('site = @site');
    params.site = request.site;
  }
  if (request.objectType) {
    objectWhere.push('object_type = @objectType');
    contributionWhere.push('object_type = @objectType');
    params.objectType = request.objectType;
  }
  if (request.type) {
    objectWhere.push('type = @type');
    contributionWhere.push('type = @type');
    params.type = request.type;
  }
  if (request.visibility) {
    objectWhere.push('visibility = @visibility');
    contributionWhere.push('visibility = @visibility');
    params.visibility = request.visibility;
  }
  if (request.cursor) {
    const parsedCursor = parseCursor(request.cursor);
    if (parsedCursor) {
      objectWhere.push('(created_at < @cursorCreatedAt OR (created_at = @cursorCreatedAt AND id < @cursorId))');
      contributionWhere.push(
        '(created_at < @cursorCreatedAt OR (created_at = @cursorCreatedAt AND id < @cursorId))',
      );
      params.cursorCreatedAt = parsedCursor.createdAt;
      params.cursorId = parsedCursor.id;
    }
  }

  const objectRows = db
    .prepare(
      `SELECT
        id,
        object_type AS objectType,
        type,
        site,
        owner_user_id AS ownerUserId,
        visibility,
        title,
        subject,
        body,
        status,
        metadata,
        source_contribution_id AS sourceContributionId,
        published_slug AS publishedSlug,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM objects
      WHERE ${objectWhere.join(' AND ')}`,
    )
    .all(params) as DbObjectRow[];

  const contributionRows = db
    .prepare(
      `SELECT
        id,
        site,
        object_type AS objectType,
        type,
        user_id AS ownerUserId,
        visibility,
        subject AS title,
        subject,
        body,
        status,
        metadata,
        object_id AS objectId,
        source,
        published_slug AS publishedSlug,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM contributions
      WHERE ${contributionWhere.join(' AND ')}`,
    )
    .all(params) as DbContributionRow[];

  const combined = [
    ...objectRows.map((row) => objectToQueueItem(toObjectRecord(row))),
    ...contributionRows.map((row) => contributionToQueueItem(toContributionRecord(row), row)),
  ].sort((a, b) => {
    if (a.createdAt === b.createdAt) {
      return a.id < b.id ? 1 : -1;
    }
    return a.createdAt < b.createdAt ? 1 : -1;
  });

  const hasMore = combined.length > limit;
  const pageItems = hasMore ? combined.slice(0, limit) : combined;
  const last = pageItems.at(-1);
  return {
    items: pageItems,
    nextCursor: hasMore && last ? makeCursor(last.createdAt, last.id) : null,
  };
}

export function transitionModerationItem(input: {
  id: string;
  request: ModerationTransitionRequest;
}): ModerationQueueItem | null {
  const db = getDb();
  const object = getObjectById(input.id);
  if (object) {
    const publishedSlug =
      input.request.status === 'published' || input.request.status === 'featured'
        ? input.request.publishedSlug ??
          object.publishedSlug ??
          createPublishedSlug(object.subject ?? object.title ?? object.type)
        : object.publishedSlug;
    const updated = updateObjectLifecycle({
      id: object.id,
      status: input.request.status,
      visibility: input.request.visibility,
      publishedSlug,
    });
    return updated ? objectToQueueItem(updated) : null;
  }

  const existingContribution = getContributionWithRow(input.id);
  if (!existingContribution) {
    return null;
  }
  const contribution = existingContribution.record;
  const publishedSlug =
    input.request.status === 'published' || input.request.status === 'featured'
      ? input.request.publishedSlug ??
        existingContribution.row.publishedSlug ??
        createPublishedSlug(contribution.subject ?? contribution.title ?? contribution.type)
      : existingContribution.row.publishedSlug;
  const visibility = input.request.visibility ?? contribution.visibility;
  const updatedAt = new Date().toISOString();
  db.prepare(
    `UPDATE contributions
    SET status = @status,
        visibility = @visibility,
        published_slug = @publishedSlug,
        updated_at = @updatedAt
    WHERE id = @id`,
  ).run({
    id: contribution.id,
    status: input.request.status,
    visibility,
    publishedSlug,
    updatedAt,
  });
  const updatedContribution = getContributionByIdForObjectsLane(contribution.id);
  if (!updatedContribution) {
    return null;
  }

  ensureObjectForContribution({
    contribution: updatedContribution,
    status: input.request.status,
    visibility,
    publishedSlug: publishedSlug ?? null,
  });
  const refreshed = getContributionByIdForObjectsLane(contribution.id);
  if (refreshed) {
    return contributionToQueueItem(refreshed, { publishedSlug });
  }
  return contributionToQueueItem(updatedContribution, { publishedSlug });
}

export function createDerivedArticleFromDiscussion(input: {
  sourceDiscussionObjectId: string;
  visibility: Visibility;
  requesterUserId: string | null;
  bearerOwnerUserId: string | null;
}): ObjectRecord | null {
  const source = getObjectById(input.sourceDiscussionObjectId);
  if (!source) {
    return null;
  }
  if (source.objectType !== 'community' || source.type !== 'discussion' || source.site !== 'org') {
    return null;
  }

  const ownerUserId = input.requesterUserId ?? input.bearerOwnerUserId ?? source.ownerUserId;
  const derived = createObject({
    payload: {
      objectType: 'knowledge',
      type: 'derived_article',
      site: 'org',
      visibility: input.visibility,
      title: source.title ?? source.subject ?? 'Derived article',
      body: source.body,
      status: 'draft',
      metadata: {
        derivedFromObjectId: source.id,
      },
      sourceContributionId: source.sourceContributionId,
      publishedSlug: null,
    },
    ownerUserId,
  });

  const sourceMetadata = parseMetadata(JSON.stringify(source.metadata));
  const linked = Array.isArray(sourceMetadata.derivedArticleObjectIds)
    ? sourceMetadata.derivedArticleObjectIds.filter((value): value is string => typeof value === 'string')
    : [];
  if (!linked.includes(derived.id)) {
    linked.push(derived.id);
  }
  updateObjectLifecycle({
    id: source.id,
    status: source.status,
    metadata: {
      ...sourceMetadata,
      derivedArticleObjectIds: linked,
    },
  });
  return derived;
}

export function parseQueueItemOrNull(item: ModerationQueueItem | null): ModerationQueueItem | null {
  if (!item) {
    return null;
  }
  return moderationQueueItemSchema.parse(item);
}
