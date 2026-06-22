import { mkdirSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import type { ContributionSource } from '@ai-transformation/shared';
import Database from 'better-sqlite3';

import { runAgentProtocolMigrations } from './agent-protocol.js';

type InsertContributionInput = {
  id: string;
  source: ContributionSource;
  site?: string | null;
  userId?: string | null;
  email: string;
  name?: string | null;
  subject?: string | null;
  body: string;
  status?: string;
  metadata?: string;
  publishedSlug?: string | null;
  createdAt: string;
  reviewedAt?: string | null;
  reviewedBy?: string | null;
};

type UpsertUserByGoogleInput = {
  googleSub: string;
  email: string;
  name?: string | null;
  picture?: string | null;
};

type UpsertAssessmentSessionInput = {
  userId: string;
  answers: Record<string, number>;
  stepIndex: number;
  lastScore?: unknown | null;
};

export type UserRow = {
  id: string;
  googleSub: string;
  email: string;
  name: string | null;
  picture: string | null;
  createdAt: string;
  lastLoginAt: string | null;
};

export type SessionRow = {
  id: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
};

export type AssessmentSessionRow = {
  userId: string;
  answers: string;
  stepIndex: number;
  lastScore: string | null;
  updatedAt: string;
};

export type ContributionRow = {
  id: string;
  source: string;
  site: string | null;
  userId: string | null;
  email: string;
  name: string | null;
  title: string | null;
  body: string;
  status: string;
  metadata: string;
  publishedSlug: string | null;
  createdAt: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
};

export type PublishedStoryRow = {
  id: string;
  title: string;
  body: string;
  name: string | null;
  publishedSlug: string | null;
  createdAt: string;
  featured: boolean;
};

export type StoryModerationRow = {
  id: string;
  title: string;
  body: string;
  name: string | null;
  email: string;
  status: string;
  publishedSlug: string | null;
  createdAt: string;
};

export type PromptRow = {
  id: string;
  question: string;
  weekOf: string | null;
  status: string;
  createdAt: string;
};

let dbInstance: Database.Database | null = null;

function resolveRepoRoot(): string {
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../../');
}

function assertSupportedDatabaseUrl(): void {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    return;
  }
  const isSqliteUrl = databaseUrl.startsWith('sqlite:') || databaseUrl.startsWith('file:');
  if (!isSqliteUrl) {
    // defer: SQLite-only driver for Wave 4. upgrade: add a Postgres adapter behind DATABASE_URL.
    throw new Error('DATABASE_URL driver not yet supported in Wave 4 (SQLite only)');
  }
}

function resolveDbPath(): string {
  assertSupportedDatabaseUrl();
  const configuredPath = process.env.SQLITE_PATH ?? 'data/app.db';
  if (path.isAbsolute(configuredPath)) {
    return configuredPath;
  }
  return path.resolve(resolveRepoRoot(), configuredPath);
}

function runMigrations(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS contributions (
      id TEXT PRIMARY KEY,
      source TEXT NOT NULL,
      site TEXT,
      user_id TEXT,
      email TEXT NOT NULL,
      name TEXT,
      subject TEXT,
      body TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'new',
      metadata TEXT NOT NULL DEFAULT '{}',
      published_slug TEXT,
      created_at TEXT NOT NULL,
      reviewed_at TEXT,
      reviewed_by TEXT
    );
  `);
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_contributions_source_created_at
    ON contributions (source, created_at);
  `);
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      google_sub TEXT UNIQUE,
      email TEXT NOT NULL,
      name TEXT,
      picture TEXT,
      created_at TEXT NOT NULL,
      last_login_at TEXT
    );
  `);
  db.exec(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_unique
    ON users (email);
  `);
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL
    );
  `);
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_sessions_user_id
    ON sessions (user_id);
  `);
  db.exec(`
    CREATE TABLE IF NOT EXISTS assessment_sessions (
      user_id TEXT PRIMARY KEY,
      answers TEXT NOT NULL DEFAULT '{}',
      step_index INTEGER NOT NULL DEFAULT 0,
      last_score TEXT,
      updated_at TEXT NOT NULL
    );
  `);
  db.exec(`
    CREATE TABLE IF NOT EXISTS prompts (
      id TEXT PRIMARY KEY,
      question TEXT NOT NULL,
      week_of TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL
    );
  `);
  db.prepare(
    `INSERT OR IGNORE INTO prompts (
      id,
      question,
      week_of,
      status,
      created_at
    ) VALUES (
      @id,
      @question,
      @weekOf,
      @status,
      @createdAt
    )`,
  ).run({
    id: 'prompt-2026-w24',
    question:
      'What is the hardest blocker in your organization when moving one AI pilot into a repeatable operating model?',
    weekOf: '2026-06-08',
    status: 'active',
    createdAt: '2026-06-08T00:00:00.000Z',
  });
  db.prepare(
    `INSERT OR IGNORE INTO prompts (
      id,
      question,
      week_of,
      status,
      created_at
    ) VALUES (
      @id,
      @question,
      @weekOf,
      @status,
      @createdAt
    )`,
  ).run({
    id: 'prompt-2026-w25',
    question:
      'If you had 90 days to improve AI governance without slowing delivery, which one policy or ritual would you start first and why?',
    weekOf: '2026-06-15',
    status: 'active',
    createdAt: '2026-06-15T00:00:00.000Z',
  });
  runAgentProtocolMigrations(db);
}

export function getDb(): Database.Database {
  if (dbInstance) {
    return dbInstance;
  }

  const dbPath = resolveDbPath();
  mkdirSync(path.dirname(dbPath), { recursive: true });

  const db = new Database(dbPath);
  runMigrations(db);
  dbInstance = db;
  return dbInstance;
}

function getUserById(db: Database.Database, id: string): UserRow | null {
  const row = db
    .prepare(
      `SELECT
        id,
        google_sub AS googleSub,
        email,
        name,
        picture,
        created_at AS createdAt,
        last_login_at AS lastLoginAt
      FROM users
      WHERE id = @id`,
    )
    .get({ id }) as UserRow | undefined;
  return row ?? null;
}

export function upsertUserByGoogle(input: UpsertUserByGoogleInput): UserRow {
  const db = getDb();
  const now = new Date().toISOString();

  const tx = db.transaction((data: UpsertUserByGoogleInput) => {
    const existingByGoogle = db
      .prepare(
        `SELECT
          id,
          google_sub AS googleSub,
          email,
          name,
          picture,
          created_at AS createdAt,
          last_login_at AS lastLoginAt
        FROM users
        WHERE google_sub = @googleSub`,
      )
      .get({ googleSub: data.googleSub }) as UserRow | undefined;

    if (existingByGoogle) {
      db.prepare(
        `UPDATE users
        SET email = @email,
            name = @name,
            picture = @picture,
            last_login_at = @lastLoginAt
        WHERE id = @id`,
      ).run({
        id: existingByGoogle.id,
        email: data.email,
        name: data.name ?? null,
        picture: data.picture ?? null,
        lastLoginAt: now,
      });
      const updated = getUserById(db, existingByGoogle.id);
      if (!updated) {
        throw new Error('Failed to load updated user');
      }
      return updated;
    }

    const existingByEmail = db
      .prepare(
        `SELECT
          id,
          google_sub AS googleSub,
          email,
          name,
          picture,
          created_at AS createdAt,
          last_login_at AS lastLoginAt
        FROM users
        WHERE email = @email`,
      )
      .get({ email: data.email }) as UserRow | undefined;

    if (existingByEmail) {
      db.prepare(
        `UPDATE users
        SET google_sub = @googleSub,
            email = @email,
            name = @name,
            picture = @picture,
            last_login_at = @lastLoginAt
        WHERE id = @id`,
      ).run({
        id: existingByEmail.id,
        googleSub: data.googleSub,
        email: data.email,
        name: data.name ?? null,
        picture: data.picture ?? null,
        lastLoginAt: now,
      });
      const updated = getUserById(db, existingByEmail.id);
      if (!updated) {
        throw new Error('Failed to load updated user');
      }
      return updated;
    }

    const id = randomUUID();
    db.prepare(
      `INSERT INTO users (
        id,
        google_sub,
        email,
        name,
        picture,
        created_at,
        last_login_at
      ) VALUES (
        @id,
        @googleSub,
        @email,
        @name,
        @picture,
        @createdAt,
        @lastLoginAt
      )`,
    ).run({
      id,
      googleSub: data.googleSub,
      email: data.email,
      name: data.name ?? null,
      picture: data.picture ?? null,
      createdAt: now,
      lastLoginAt: now,
    });
    const created = getUserById(db, id);
    if (!created) {
      throw new Error('Failed to load created user');
    }
    return created;
  });

  return tx(input);
}

export function createSession(userId: string, ttlMs: number): { id: string; expiresAt: string } {
  const db = getDb();
  const id = randomUUID();
  const createdAt = new Date().toISOString();
  const expiresAt = new Date(Date.now() + ttlMs).toISOString();
  db.prepare(
    `INSERT INTO sessions (
      id,
      user_id,
      created_at,
      expires_at
    ) VALUES (
      @id,
      @userId,
      @createdAt,
      @expiresAt
    )`,
  ).run({
    id,
    userId,
    createdAt,
    expiresAt,
  });
  return { id, expiresAt };
}

export function getSessionWithUser(sessionId: string): { user: UserRow; session: SessionRow } | null {
  const db = getDb();
  const now = new Date().toISOString();
  const row = db
    .prepare(
      `SELECT
        s.id AS sessionId,
        s.user_id AS sessionUserId,
        s.created_at AS sessionCreatedAt,
        s.expires_at AS sessionExpiresAt,
        u.id AS userId,
        u.google_sub AS userGoogleSub,
        u.email AS userEmail,
        u.name AS userName,
        u.picture AS userPicture,
        u.created_at AS userCreatedAt,
        u.last_login_at AS userLastLoginAt
      FROM sessions s
      JOIN users u ON u.id = s.user_id
      WHERE s.id = @sessionId
        AND s.expires_at > @now`,
    )
    .get({ sessionId, now }) as
    | {
        sessionId: string;
        sessionUserId: string;
        sessionCreatedAt: string;
        sessionExpiresAt: string;
        userId: string;
        userGoogleSub: string;
        userEmail: string;
        userName: string | null;
        userPicture: string | null;
        userCreatedAt: string;
        userLastLoginAt: string | null;
      }
    | undefined;

  if (!row) {
    return null;
  }

  return {
    user: {
      id: row.userId,
      googleSub: row.userGoogleSub,
      email: row.userEmail,
      name: row.userName,
      picture: row.userPicture,
      createdAt: row.userCreatedAt,
      lastLoginAt: row.userLastLoginAt,
    },
    session: {
      id: row.sessionId,
      userId: row.sessionUserId,
      createdAt: row.sessionCreatedAt,
      expiresAt: row.sessionExpiresAt,
    },
  };
}

export function deleteSession(sessionId: string): void {
  const db = getDb();
  db.prepare('DELETE FROM sessions WHERE id = @sessionId').run({ sessionId });
}

export function getAssessmentSession(userId: string): AssessmentSessionRow | null {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT
        user_id AS userId,
        answers,
        step_index AS stepIndex,
        last_score AS lastScore,
        updated_at AS updatedAt
      FROM assessment_sessions
      WHERE user_id = @userId`,
    )
    .get({ userId }) as AssessmentSessionRow | undefined;
  return row ?? null;
}

export function upsertAssessmentSession(input: UpsertAssessmentSessionInput): { updatedAt: string } {
  const db = getDb();
  const updatedAt = new Date().toISOString();
  db.prepare(
    `INSERT INTO assessment_sessions (
      user_id,
      answers,
      step_index,
      last_score,
      updated_at
    ) VALUES (
      @userId,
      @answers,
      @stepIndex,
      @lastScore,
      @updatedAt
    )
    ON CONFLICT(user_id) DO UPDATE SET
      answers = excluded.answers,
      step_index = excluded.step_index,
      last_score = excluded.last_score,
      updated_at = excluded.updated_at`,
  ).run({
    userId: input.userId,
    answers: JSON.stringify(input.answers),
    stepIndex: input.stepIndex,
    lastScore: input.lastScore == null ? null : JSON.stringify(input.lastScore),
    updatedAt,
  });
  return { updatedAt };
}

export function insertContribution(input: InsertContributionInput): void {
  const db = getDb();
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
      reviewed_at,
      reviewed_by
    ) VALUES (
      @id,
      @source,
      @site,
      @userId,
      @email,
      @name,
      @subject,
      @body,
      @status,
      @metadata,
      @publishedSlug,
      @createdAt,
      @reviewedAt,
      @reviewedBy
    )`,
  ).run({
    id: input.id,
    source: input.source,
    site: input.site ?? null,
    userId: input.userId ?? null,
    email: input.email,
    name: input.name ?? null,
    subject: input.subject ?? null,
    body: input.body,
    status: input.status ?? 'new',
    metadata: input.metadata ?? '{}',
    publishedSlug: input.publishedSlug ?? null,
    createdAt: input.createdAt,
    reviewedAt: input.reviewedAt ?? null,
    reviewedBy: input.reviewedBy ?? null,
  });
}

export function listPublishedStories(): PublishedStoryRow[] {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT
        id,
        COALESCE(subject, '') AS title,
        body,
        name,
        published_slug AS publishedSlug,
        created_at AS createdAt,
        status
      FROM contributions
      WHERE source = @source
        AND status IN ('published', 'featured')
      ORDER BY created_at DESC`,
    )
    .all({
      source: 'web_story',
    }) as Array<{
    id: string;
    title: string;
    body: string;
    name: string | null;
    publishedSlug: string | null;
    createdAt: string;
    status: string;
  }>;

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    body: row.body,
    name: row.name,
    publishedSlug: row.publishedSlug,
    createdAt: row.createdAt,
    featured: row.status === 'featured',
  }));
}

export function listStoriesForModeration(): StoryModerationRow[] {
  const db = getDb();
  return db
    .prepare(
      `SELECT
        id,
        COALESCE(subject, '') AS title,
        body,
        name,
        email,
        status,
        published_slug AS publishedSlug,
        created_at AS createdAt
      FROM contributions
      WHERE source = @source
      ORDER BY created_at DESC`,
    )
    .all({
      source: 'web_story',
    }) as StoryModerationRow[];
}

export function getContributionById(id: string): ContributionRow | null {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT
        id,
        source,
        site,
        user_id AS userId,
        email,
        name,
        subject AS title,
        body,
        status,
        metadata,
        published_slug AS publishedSlug,
        created_at AS createdAt,
        reviewed_at AS reviewedAt,
        reviewed_by AS reviewedBy
      FROM contributions
      WHERE id = @id`,
    )
    .get({ id }) as ContributionRow | undefined;
  return row ?? null;
}

export function updateContributionModeration(input: {
  id: string;
  status: string;
  publishedSlug: string | null;
  reviewedBy: string;
  reviewedAt: string;
}): void {
  const db = getDb();
  db.prepare(
    `UPDATE contributions
    SET status = @status,
        published_slug = @publishedSlug,
        reviewed_at = @reviewedAt,
        reviewed_by = @reviewedBy
    WHERE id = @id`,
  ).run({
    id: input.id,
    status: input.status,
    publishedSlug: input.publishedSlug,
    reviewedAt: input.reviewedAt,
    reviewedBy: input.reviewedBy,
  });
}

export function getCurrentPrompt(): PromptRow | null {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT
        id,
        question,
        week_of AS weekOf,
        status,
        created_at AS createdAt
      FROM prompts
      WHERE status = @status
      ORDER BY week_of DESC, created_at DESC
      LIMIT 1`,
    )
    .get({
      status: 'active',
    }) as PromptRow | undefined;
  return row ?? null;
}

export function getPromptById(id: string): PromptRow | null {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT
        id,
        question,
        week_of AS weekOf,
        status,
        created_at AS createdAt
      FROM prompts
      WHERE id = @id`,
    )
    .get({ id }) as PromptRow | undefined;
  return row ?? null;
}

export function closeDbForTests(): void {
  if (!dbInstance) {
    return;
  }
  dbInstance.close();
  dbInstance = null;
}

getDb();
