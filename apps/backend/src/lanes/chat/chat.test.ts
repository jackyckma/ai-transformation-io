import { mkdtempSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const managedEnvKeys = ['SQLITE_PATH', 'DATABASE_URL', 'NODE_ENV', 'CHAT_LLM_API_KEY', 'MINIMAX_API_KEY'] as const;

const originalEnv = Object.fromEntries(
  managedEnvKeys.map((key) => [key, process.env[key]]),
) as Record<(typeof managedEnvKeys)[number], string | undefined>;

let tempDir = '';

beforeEach(() => {
  tempDir = mkdtempSync(path.join(os.tmpdir(), 'atx-chat-'));
  process.env.SQLITE_PATH = path.join(tempDir, 'app.db');
  delete process.env.DATABASE_URL;
  delete process.env.CHAT_LLM_API_KEY;
  delete process.env.MINIMAX_API_KEY;
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
  const backendModule = await import('../../index.js');
  return backendModule.app;
}

function parseSetCookie(header: string | null): Record<string, string> {
  if (!header) return {};
  const cookies: Record<string, string> = {};
  for (const part of header.split(/,(?=\s*[^;]+=)/)) {
    const [pair] = part.split(';');
    const eq = pair?.indexOf('=');
    if (eq && eq > 0) {
      cookies[pair.slice(0, eq).trim()] = pair.slice(eq + 1).trim();
    }
  }
  return cookies;
}

describe('Chat companion backend', () => {
  it('creates a session with welcome message', async () => {
    const app = await loadBackend();
    const response = await app.request('http://localhost/api/chat/session?site=io');
    expect(response.status).toBe(200);
    const body = (await response.json()) as {
      ok: boolean;
      session: { site: string; messages: Array<{ role: string; content: string }> };
    };
    expect(body.ok).toBe(true);
    expect(body.session.site).toBe('io');
    expect(body.session.messages.length).toBeGreaterThanOrEqual(1);
    expect(body.session.messages[0]?.role).toBe('assistant');
  });

  it('accepts a message and returns fallback assistant reply without LLM key', async () => {
    const app = await loadBackend();
    const sessionResponse = await app.request('http://localhost/api/chat/session?site=io');
    const setCookie = sessionResponse.headers.get('set-cookie');
    const cookies = parseSetCookie(setCookie);
    const cookieHeader = Object.entries(cookies)
      .map(([key, value]) => `${key}=${value}`)
      .join('; ');

    const messageResponse = await app.request('http://localhost/api/chat/session/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        cookie: cookieHeader,
      },
      body: JSON.stringify({ content: 'How should we think about AI governance?' }),
    });

    expect(messageResponse.status).toBe(200);
    const body = (await messageResponse.json()) as {
      ok: boolean;
      userMessage: { role: string };
      assistantMessage: { role: string; content: string; links?: Array<{ href: string }> };
      quota: { remaining: number };
    };
    expect(body.ok).toBe(true);
    expect(body.userMessage.role).toBe('user');
    expect(body.assistantMessage.role).toBe('assistant');
    expect(body.assistantMessage.content.length).toBeGreaterThan(0);
    expect(body.quota.remaining).toBeGreaterThanOrEqual(0);
  });

  it('accepts first message without prior GET session', async () => {
    const app = await loadBackend();
    const response = await app.request('http://localhost/api/chat/session/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ content: 'How should we approach AI governance?' }),
    });

    expect(response.status).toBe(200);
    const body = (await response.json()) as {
      ok: boolean;
      assistantMessage: { content: string };
    };
    expect(body.ok).toBe(true);
    expect(body.assistantMessage.content.length).toBeGreaterThan(0);
  });

  it('returns 400 for invalid message body', async () => {
    const app = await loadBackend();
    const sessionResponse = await app.request('http://localhost/api/chat/session?site=org');
    const cookies = parseSetCookie(sessionResponse.headers.get('set-cookie'));
    const cookieHeader = Object.entries(cookies)
      .map(([key, value]) => `${key}=${value}`)
      .join('; ');

    const messageResponse = await app.request('http://localhost/api/chat/session/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        cookie: cookieHeader,
      },
      body: JSON.stringify({ content: '' }),
    });

    expect(messageResponse.status).toBe(400);
  });
});
