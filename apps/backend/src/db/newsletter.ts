import { randomUUID } from 'node:crypto';

import type { ContributionSource } from '@ai-transformation/shared';

import { getDb } from './index.js';

export type NewsletterList = 'io_pulse' | 'org_harvest';
export type IssueStatus = 'draft' | 'scheduled' | 'sent' | 'archived';
export type SubscriberStatus = 'pending' | 'active' | 'unsubscribed';

export type IssueRow = {
  id: string;
  site: 'io' | 'org';
  list: NewsletterList;
  slug: string;
  title: string;
  draftMd: string;
  status: IssueStatus;
  replyToToken: string;
  providerId: string | null;
  sentAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ContributionForCompile = {
  id: string;
  source: string;
  site: string | null;
  email: string;
  name: string | null;
  title: string | null;
  body: string;
  createdAt: string;
};

export function runNewsletterMigrations(db: ReturnType<typeof getDb>): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS issues (
      id TEXT PRIMARY KEY,
      site TEXT NOT NULL,
      list TEXT NOT NULL,
      slug TEXT NOT NULL,
      title TEXT NOT NULL,
      draft_md TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'draft',
      reply_to_token TEXT NOT NULL,
      provider_id TEXT,
      sent_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);
  db.exec(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_issues_site_slug
    ON issues (site, slug);
  `);
  db.exec(`
    CREATE TABLE IF NOT EXISTS issue_contributions (
      issue_id TEXT NOT NULL,
      contribution_id TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'featured',
      PRIMARY KEY (issue_id, contribution_id)
    );
  `);
  db.exec(`
    CREATE TABLE IF NOT EXISTS subscribers (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      list TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      user_id TEXT,
      subscribed_at TEXT NOT NULL,
      unsubscribed_at TEXT
    );
  `);
  db.exec(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_subscribers_email_list
    ON subscribers (email, list);
  `);
}

function toUrlSafeSlug(input: string): string {
  const slug = input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  return slug.length > 0 ? slug : 'issue';
}

export function listContributionsSince(input: {
  since?: string;
  site?: 'io' | 'org';
  sources?: ContributionSource[];
  limit?: number;
}): ContributionForCompile[] {
  const db = getDb();
  const sources = input.sources ?? [
    'web_story',
    'web_inquiry',
    'web_prompt_reply',
    'newsletter_reply',
    'agent',
  ];
  const placeholders = sources.map((_, index) => `@source${index}`).join(', ');
  const params: Record<string, string | number> = {
    limit: input.limit ?? 50,
  };
  sources.forEach((source, index) => {
    params[`source${index}`] = source;
  });

  let sql = `
    SELECT
      id,
      source,
      site,
      email,
      name,
      subject AS title,
      body,
      created_at AS createdAt
    FROM contributions
    WHERE source IN (${placeholders})
  `;

  if (input.since) {
    sql += ' AND created_at >= @since';
    params.since = input.since;
  }
  if (input.site) {
    sql += ' AND (site = @site OR site IS NULL)';
    params.site = input.site;
  }

  sql += ' ORDER BY created_at DESC LIMIT @limit';

  return db.prepare(sql).all(params) as ContributionForCompile[];
}

export function listNewsletterReplyContributions(limit = 30): ContributionForCompile[] {
  return listContributionsSince({
    sources: ['newsletter_reply'],
    limit,
  });
}

export function createIssueDraft(input: {
  site: 'io' | 'org';
  list: NewsletterList;
  title: string;
  draftMd: string;
  contributionIds?: string[];
}): IssueRow {
  const db = getDb();
  const id = randomUUID();
  const createdAt = new Date().toISOString();
  const slugBase = toUrlSafeSlug(input.title);
  const slug = `${slugBase}-${createdAt.slice(0, 10)}`;
  const replyToToken = `issue-${id.replace(/-/g, '').slice(0, 12)}`;

  const tx = db.transaction(() => {
    db.prepare(
      `INSERT INTO issues (
        id, site, list, slug, title, draft_md, status, reply_to_token,
        provider_id, sent_at, created_at, updated_at
      ) VALUES (
        @id, @site, @list, @slug, @title, @draftMd, 'draft', @replyToToken,
        NULL, NULL, @createdAt, @updatedAt
      )`,
    ).run({
      id,
      site: input.site,
      list: input.list,
      slug,
      title: input.title,
      draftMd: input.draftMd,
      replyToToken,
      createdAt,
      updatedAt: createdAt,
    });

    for (const contributionId of input.contributionIds ?? []) {
      db.prepare(
        `INSERT INTO issue_contributions (issue_id, contribution_id, role)
        VALUES (@issueId, @contributionId, 'featured')`,
      ).run({ issueId: id, contributionId });
    }
  });
  tx();

  const row = getIssueById(id);
  if (!row) {
    throw new Error('Failed to load created issue');
  }
  return row;
}

export function getIssueById(id: string): IssueRow | null {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT
        id,
        site,
        list,
        slug,
        title,
        draft_md AS draftMd,
        status,
        reply_to_token AS replyToToken,
        provider_id AS providerId,
        sent_at AS sentAt,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM issues
      WHERE id = @id`,
    )
    .get({ id }) as IssueRow | undefined;
  return row ?? null;
}

export function updateIssueDraft(id: string, draftMd: string): IssueRow | null {
  const db = getDb();
  const updatedAt = new Date().toISOString();
  db.prepare(
    `UPDATE issues SET draft_md = @draftMd, updated_at = @updatedAt WHERE id = @id`,
  ).run({ id, draftMd, updatedAt });
  return getIssueById(id);
}
