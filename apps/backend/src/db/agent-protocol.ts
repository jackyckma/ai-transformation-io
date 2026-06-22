import { createHash, randomBytes, randomUUID } from 'node:crypto';

import { AGENT_WRITE_TOKEN_TTL_DAYS } from '@ai-transformation/shared';

import { getDb } from './index.js';

export type AgentWriteTokenRow = {
  id: string;
  email: string;
  clientId: string;
  tokenSecretHash: string;
  scopes: string;
  expiresAt: string;
  revokedAt: string | null;
  createdAt: string;
};

function hashSecret(secret: string): string {
  return createHash('sha256').update(secret).digest('hex');
}

function hashConfirmCode(code: string): string {
  return hashSecret(code);
}

export function runAgentProtocolMigrations(db: ReturnType<typeof getDb>): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS agent_authorize_requests (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      client_id TEXT NOT NULL,
      agent_name TEXT,
      confirm_code_hash TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      confirmed_at TEXT,
      created_at TEXT NOT NULL
    );
  `);
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_agent_authorize_email_client
    ON agent_authorize_requests (email, client_id, created_at);
  `);
  db.exec(`
    CREATE TABLE IF NOT EXISTS agent_write_tokens (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      client_id TEXT NOT NULL,
      token_secret_hash TEXT NOT NULL,
      scopes TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      revoked_at TEXT,
      created_at TEXT NOT NULL
    );
  `);
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_agent_write_tokens_email_client
    ON agent_write_tokens (email, client_id);
  `);
  db.exec(`
    CREATE TABLE IF NOT EXISTS agent_read_usage (
      id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL,
      email TEXT,
      slug TEXT NOT NULL,
      usage_day TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);
  db.exec(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_agent_read_usage_client_slug_day
    ON agent_read_usage (client_id, slug, usage_day);
  `);
  db.exec(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_agent_read_usage_email_slug_day
    ON agent_read_usage (email, slug, usage_day)
    WHERE email IS NOT NULL;
  `);
  db.exec(`
    CREATE TABLE IF NOT EXISTS credit_accounts (
      email TEXT PRIMARY KEY,
      balance_credits INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL
    );
  `);
}

export function createAuthorizeRequest(input: {
  email: string;
  clientId: string;
  agentName?: string | null;
  ttlMs?: number;
}): { id: string; confirmCode: string; expiresAt: string } {
  const db = getDb();
  const id = randomUUID();
  const confirmCode = randomBytes(32).toString('base64url');
  const createdAt = new Date().toISOString();
  const expiresAt = new Date(Date.now() + (input.ttlMs ?? 24 * 60 * 60 * 1000)).toISOString();

  db.prepare(
    `INSERT INTO agent_authorize_requests (
      id, email, client_id, agent_name, confirm_code_hash, expires_at, created_at
    ) VALUES (
      @id, @email, @clientId, @agentName, @confirmCodeHash, @expiresAt, @createdAt
    )`,
  ).run({
    id,
    email: input.email.trim().toLowerCase(),
    clientId: input.clientId,
    agentName: input.agentName ?? null,
    confirmCodeHash: hashConfirmCode(confirmCode),
    expiresAt,
    createdAt,
  });

  return { id, confirmCode, expiresAt };
}

export function confirmAuthorizeRequest(confirmCode: string): {
  email: string;
  clientId: string;
} | null {
  const db = getDb();
  const now = new Date().toISOString();
  const codeHash = hashConfirmCode(confirmCode);

  const row = db
    .prepare(
      `SELECT id, email, client_id AS clientId
      FROM agent_authorize_requests
      WHERE confirm_code_hash = @codeHash
        AND confirmed_at IS NULL
        AND expires_at > @now`,
    )
    .get({ codeHash, now }) as { id: string; email: string; clientId: string } | undefined;

  if (!row) {
    return null;
  }

  db.prepare(
    `UPDATE agent_authorize_requests SET confirmed_at = @now WHERE id = @id`,
  ).run({ id: row.id, now });

  return { email: row.email, clientId: row.clientId };
}

export function revokeWriteTokensForPair(email: string, clientId: string): void {
  const db = getDb();
  const now = new Date().toISOString();
  db.prepare(
    `UPDATE agent_write_tokens
    SET revoked_at = @now
    WHERE email = @email
      AND client_id = @clientId
      AND revoked_at IS NULL`,
  ).run({
    email: email.trim().toLowerCase(),
    clientId,
    now,
  });
}

export function issueWriteToken(input: {
  email: string;
  clientId: string;
  scopes: string[];
}): { tokenId: string; bearerToken: string; expiresAt: string } {
  const db = getDb();
  const email = input.email.trim().toLowerCase();
  revokeWriteTokensForPair(email, input.clientId);

  const tokenId = randomUUID();
  const tokenSecret = randomBytes(32).toString('base64url');
  const bearerToken = `${tokenId}.${tokenSecret}`;
  const createdAt = new Date().toISOString();
  const expiresAt = new Date(
    Date.now() + AGENT_WRITE_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
  ).toISOString();

  db.prepare(
    `INSERT INTO agent_write_tokens (
      id, email, client_id, token_secret_hash, scopes, expires_at, created_at
    ) VALUES (
      @id, @email, @clientId, @tokenSecretHash, @scopes, @expiresAt, @createdAt
    )`,
  ).run({
    id: tokenId,
    email,
    clientId: input.clientId,
    tokenSecretHash: hashSecret(tokenSecret),
    scopes: JSON.stringify(input.scopes),
    expiresAt,
    createdAt,
  });

  db.prepare(
    `INSERT INTO credit_accounts (email, balance_credits, updated_at)
    VALUES (@email, 0, @updatedAt)
    ON CONFLICT(email) DO NOTHING`,
  ).run({ email, updatedAt: createdAt });

  return { tokenId, bearerToken, expiresAt };
}

export function verifyWriteToken(bearerToken: string): AgentWriteTokenRow | null {
  const [tokenId, tokenSecret] = bearerToken.split('.', 2);
  if (!tokenId || !tokenSecret) {
    return null;
  }

  const db = getDb();
  const now = new Date().toISOString();
  const row = db
    .prepare(
      `SELECT
        id,
        email,
        client_id AS clientId,
        token_secret_hash AS tokenSecretHash,
        scopes,
        expires_at AS expiresAt,
        revoked_at AS revokedAt,
        created_at AS createdAt
      FROM agent_write_tokens
      WHERE id = @tokenId
        AND revoked_at IS NULL
        AND expires_at > @now`,
    )
    .get({ tokenId, now }) as AgentWriteTokenRow | undefined;

  if (!row) {
    return null;
  }

  if (row.tokenSecretHash !== hashSecret(tokenSecret)) {
    return null;
  }

  return row;
}

function usageDayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

export function countAgentReadsToday(input: {
  clientId: string;
  email?: string | null;
}): number {
  const db = getDb();
  const day = usageDayUtc();

  if (input.email) {
    const row = db
      .prepare(
        `SELECT COUNT(*) AS count
        FROM agent_read_usage
        WHERE email = @email AND usage_day = @day`,
      )
      .get({ email: input.email.trim().toLowerCase(), day }) as { count: number };
    return row.count;
  }

  const row = db
    .prepare(
      `SELECT COUNT(*) AS count
      FROM agent_read_usage
      WHERE client_id = @clientId AND usage_day = @day`,
    )
    .get({ clientId: input.clientId, day }) as { count: number };
  return row.count;
}

export function recordAgentRead(input: {
  clientId: string;
  email?: string | null;
  slug: string;
}): boolean {
  const db = getDb();
  const day = usageDayUtc();
  const id = randomUUID();
  const createdAt = new Date().toISOString();

  try {
    db.prepare(
      `INSERT INTO agent_read_usage (id, client_id, email, slug, usage_day, created_at)
      VALUES (@id, @clientId, @email, @slug, @day, @createdAt)`,
    ).run({
      id,
      clientId: input.clientId,
      email: input.email?.trim().toLowerCase() ?? null,
      slug: input.slug,
      day,
      createdAt,
    });
    return true;
  } catch {
    return false;
  }
}

export function hasAgentReadToday(input: {
  clientId: string;
  email?: string | null;
  slug: string;
}): boolean {
  const db = getDb();
  const day = usageDayUtc();

  if (input.email) {
    const row = db
      .prepare(
        `SELECT 1 AS found FROM agent_read_usage
        WHERE email = @email AND slug = @slug AND usage_day = @day`,
      )
      .get({ email: input.email.trim().toLowerCase(), slug: input.slug, day });
    return Boolean(row);
  }

  const row = db
    .prepare(
      `SELECT 1 AS found FROM agent_read_usage
      WHERE client_id = @clientId AND slug = @slug AND usage_day = @day`,
    )
    .get({ clientId: input.clientId, slug: input.slug, day });
  return Boolean(row);
}
