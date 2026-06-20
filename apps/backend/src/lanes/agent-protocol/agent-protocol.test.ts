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
  tempDir = mkdtempSync(path.join(os.tmpdir(), 'atx-wave6-agent-'));
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
  const backendModule = await import('../../index.js');
  return backendModule.app;
}

describe('Wave 6 agent protocol stub', () => {
  it('returns capabilities stub', async () => {
    const app = await loadBackend();
    const response = await app.request('http://localhost/api/v1/capabilities', {
      headers: { host: 'ai-transformation.io' },
    });
    expect(response.status).toBe(200);
    const payload = (await response.json()) as { ok: boolean; api_version: string };
    expect(payload.ok).toBe(true);
    expect(payload.api_version).toContain('1.0.0');
  });

  it('returns curated feed for io and org', async () => {
    const app = await loadBackend();
    const ioResponse = await app.request('http://localhost/api/v1/curated?site=io');
    expect(ioResponse.status).toBe(200);
    const ioPayload = (await ioResponse.json()) as { ok: boolean; site: string };
    expect(ioPayload.ok).toBe(true);
    expect(ioPayload.site).toBe('io');

    const orgResponse = await app.request('http://localhost/api/v1/curated?site=org');
    const orgPayload = (await orgResponse.json()) as { ok: boolean; site: string };
    expect(orgPayload.site).toBe('org');
  });
});
