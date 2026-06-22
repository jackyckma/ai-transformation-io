import type Database from 'better-sqlite3';
import { randomUUID } from 'node:crypto';

import { CHAT_QUOTA_ANONYMOUS, CHAT_QUOTA_REGISTERED } from '@ai-transformation/shared';

export type ChatSessionRow = {
  id: string;
  site: 'io' | 'org';
  visitorId: string;
  userId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ChatMessageRow = {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  metadata: string;
  createdAt: string;
};

export type ChatLink = {
  label: string;
  href: string;
};

function utcDateKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function endOfUtcDayIso(): string {
  const now = new Date();
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
  return end.toISOString();
}

export function runChatMigrations(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS chat_sessions (
      id TEXT PRIMARY KEY,
      site TEXT NOT NULL,
      visitor_id TEXT NOT NULL,
      user_id TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_chat_sessions_visitor_site
    ON chat_sessions (visitor_id, site);
  `);
  db.exec(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      metadata TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL
    );
  `);
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_chat_messages_session_created
    ON chat_messages (session_id, created_at);
  `);
  db.exec(`
    CREATE TABLE IF NOT EXISTS chat_usage (
      quota_key TEXT NOT NULL,
      usage_date TEXT NOT NULL,
      message_count INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (quota_key, usage_date)
    );
  `);
}

export function createChatDbHelpers(db: Database.Database) {
  function getSessionById(id: string): ChatSessionRow | null {
    const row = db
      .prepare(
        `SELECT
          id,
          site,
          visitor_id AS visitorId,
          user_id AS userId,
          created_at AS createdAt,
          updated_at AS updatedAt
        FROM chat_sessions
        WHERE id = @id`,
      )
      .get({ id }) as ChatSessionRow | undefined;
    return row ?? null;
  }

  function getLatestSessionForVisitor(input: {
    visitorId: string;
    site: 'io' | 'org';
  }): ChatSessionRow | null {
    const row = db
      .prepare(
        `SELECT
          id,
          site,
          visitor_id AS visitorId,
          user_id AS userId,
          created_at AS createdAt,
          updated_at AS updatedAt
        FROM chat_sessions
        WHERE visitor_id = @visitorId AND site = @site
        ORDER BY updated_at DESC
        LIMIT 1`,
      )
      .get(input) as ChatSessionRow | undefined;
    return row ?? null;
  }

  function createChatSession(input: {
    site: 'io' | 'org';
    visitorId: string;
    userId?: string | null;
  }): ChatSessionRow {
    const now = new Date().toISOString();
    const row: ChatSessionRow = {
      id: randomUUID(),
      site: input.site,
      visitorId: input.visitorId,
      userId: input.userId ?? null,
      createdAt: now,
      updatedAt: now,
    };
    db.prepare(
      `INSERT INTO chat_sessions (
        id,
        site,
        visitor_id,
        user_id,
        created_at,
        updated_at
      ) VALUES (
        @id,
        @site,
        @visitorId,
        @userId,
        @createdAt,
        @updatedAt
      )`,
    ).run(row);
    return row;
  }

  function attachUserToSession(sessionId: string, userId: string): void {
    db.prepare(
      `UPDATE chat_sessions
       SET user_id = @userId, updated_at = @updatedAt
       WHERE id = @sessionId`,
    ).run({
      sessionId,
      userId,
      updatedAt: new Date().toISOString(),
    });
  }

  function listMessagesForSession(sessionId: string): ChatMessageRow[] {
    return db
      .prepare(
        `SELECT
          id,
          session_id AS sessionId,
          role,
          content,
          metadata,
          created_at AS createdAt
        FROM chat_messages
        WHERE session_id = @sessionId
        ORDER BY created_at ASC`,
      )
      .all({ sessionId }) as ChatMessageRow[];
  }

  function insertChatMessage(input: {
    sessionId: string;
    role: 'user' | 'assistant';
    content: string;
    metadata?: Record<string, unknown>;
  }): ChatMessageRow {
    const now = new Date().toISOString();
    const row: ChatMessageRow = {
      id: randomUUID(),
      sessionId: input.sessionId,
      role: input.role,
      content: input.content,
      metadata: JSON.stringify(input.metadata ?? {}),
      createdAt: now,
    };
    db.prepare(
      `INSERT INTO chat_messages (
        id,
        session_id,
        role,
        content,
        metadata,
        created_at
      ) VALUES (
        @id,
        @sessionId,
        @role,
        @content,
        @metadata,
        @createdAt
      )`,
    ).run(row);
    db.prepare(`UPDATE chat_sessions SET updated_at = @updatedAt WHERE id = @sessionId`).run({
      sessionId: input.sessionId,
      updatedAt: now,
    });
    return row;
  }

  function getQuotaKey(session: ChatSessionRow): string {
    return session.userId ? `user:${session.userId}` : `visitor:${session.visitorId}`;
  }

  function getMessageCountToday(quotaKey: string): number {
    const row = db
      .prepare(
        `SELECT message_count AS messageCount
         FROM chat_usage
         WHERE quota_key = @quotaKey AND usage_date = @usageDate`,
      )
      .get({ quotaKey, usageDate: utcDateKey() }) as { messageCount: number } | undefined;
    return row?.messageCount ?? 0;
  }

  function incrementMessageCount(quotaKey: string): number {
    const usageDate = utcDateKey();
    db.prepare(
      `INSERT INTO chat_usage (quota_key, usage_date, message_count)
       VALUES (@quotaKey, @usageDate, 1)
       ON CONFLICT(quota_key, usage_date)
       DO UPDATE SET message_count = message_count + 1`,
    ).run({ quotaKey, usageDate });
    return getMessageCountToday(quotaKey);
  }

  function getQuotaForSession(session: ChatSessionRow) {
    const limit = session.userId ? CHAT_QUOTA_REGISTERED : CHAT_QUOTA_ANONYMOUS;
    const used = getMessageCountToday(getQuotaKey(session));
    return {
      limit,
      remaining: Math.max(0, limit - used),
      reset: endOfUtcDayIso(),
    };
  }

  function parseMessageLinks(metadataJson: string): ChatLink[] | undefined {
    try {
      const parsed = JSON.parse(metadataJson) as { links?: ChatLink[] };
      if (Array.isArray(parsed.links) && parsed.links.length > 0) {
        return parsed.links;
      }
    } catch {
      // ignore malformed metadata
    }
    return undefined;
  }

  return {
    getSessionById,
    getLatestSessionForVisitor,
    createChatSession,
    attachUserToSession,
    listMessagesForSession,
    insertChatMessage,
    getQuotaForSession,
    getMessageCountToday,
    incrementMessageCount,
    getQuotaKey,
    parseMessageLinks,
  };
}

export type ChatDbHelpers = ReturnType<typeof createChatDbHelpers>;
