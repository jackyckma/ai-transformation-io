import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import type { ContributionSource } from '@ai-transformation/shared';
import Database from 'better-sqlite3';

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

let dbInstance: Database.Database | null = null;

function resolveRepoRoot(): string {
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../../');
}

function resolveDbPath(): string {
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

getDb();
