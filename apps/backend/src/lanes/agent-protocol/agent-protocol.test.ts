import { mkdtempSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const managedEnvKeys = ['SQLITE_PATH', 'DATABASE_URL', 'NODE_ENV', 'ZSEND_API_KEY'] as const;

const originalEnv = Object.fromEntries(
  managedEnvKeys.map((key) => [key, process.env[key]]),
) as Record<(typeof managedEnvKeys)[number], string | undefined>;

let tempDir = '';

beforeEach(() => {
  tempDir = mkdtempSync(path.join(os.tmpdir(), 'atx-wave7-agent-'));
  process.env.SQLITE_PATH = path.join(tempDir, 'app.db');
  delete process.env.DATABASE_URL;
  delete process.env.ZSEND_API_KEY;
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

describe('Wave 7 agent protocol', () => {
  it('returns agent entry text for org host', async () => {
    const app = await loadBackend();
    const response = await app.request('http://localhost/api/agent', {
      headers: { host: 'ai-transformation.org' },
    });
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('text/plain');
    const text = await response.text();
    expect(text).toContain('Harvest Hub');
    expect(text).toContain('/api/v1/capabilities');
  });

  it('returns agent entry JSON when Accept application/json', async () => {
    const app = await loadBackend();
    const response = await app.request('http://localhost/api/v1/agent', {
      headers: { host: 'ai-transformation.io', accept: 'application/json' },
    });
    expect(response.status).toBe(200);
    const payload = (await response.json()) as { ok: boolean; entry: string; text: string };
    expect(payload.ok).toBe(true);
    expect(payload.entry).toContain('/api/agent');
    expect(payload.text).toContain('AI Transformation');
  });

  it('returns capabilities v1', async () => {
    const app = await loadBackend();
    const response = await app.request('http://localhost/api/v1/capabilities', {
      headers: { host: 'ai-transformation.io' },
    });
    expect(response.status).toBe(200);
    const payload = (await response.json()) as {
      ok: boolean;
      api_version: string;
      site: string;
      implementation_status: string;
      content_index_example: string;
      client_id: { header: string };
      errors: { shape: { ok: boolean } };
      endpoints: { read_content: { status: string } };
    };
    expect(payload.ok).toBe(true);
    expect(payload.api_version).toBe('1.0.0');
    expect(payload.site).toBe('ai-transformation.io');
    expect(payload.implementation_status).toBe('wave7_v1');
    expect(payload.endpoints.read_content.status).toBe('available');
    expect(payload.content_index_example).toContain('site=io');
    expect(payload.client_id.header).toBe('X-Agent-Client-Id');
    expect(payload.errors.shape.ok).toBe(false);
  });

  it('resolves org site from host header', async () => {
    const app = await loadBackend();
    const response = await app.request('http://localhost/api/v1/capabilities', {
      headers: { host: 'ai-transformation.org' },
    });
    expect(response.status).toBe(200);
    const payload = (await response.json()) as {
      site: string;
      documentation: { human: string };
      write_payloads: { inquiry: { scope: string } };
    };
    expect(payload.site).toBe('ai-transformation.org');
    expect(payload.documentation.human).toBe('https://ai-transformation.org/for-agents');
    expect(payload.write_payloads.inquiry.scope).toBe('write:inquiry');
  });

  it('resolves org site from x-forwarded-host when host is internal', async () => {
    const app = await loadBackend();
    const response = await app.request('http://localhost/api/v1/capabilities', {
      headers: {
        host: '127.0.0.1:3001',
        'x-forwarded-host': 'ai-transformation.org',
      },
    });
    expect(response.status).toBe(200);
    const payload = (await response.json()) as { site: string; content_index_example: string };
    expect(payload.site).toBe('ai-transformation.org');
    expect(payload.content_index_example).toContain('site=org');
  });

  it('lists and fetches content with read quota headers', async () => {
    const app = await loadBackend();
    const listResponse = await app.request('http://localhost/api/v1/content?site=io');
    expect(listResponse.status).toBe(200);
    const listPayload = (await listResponse.json()) as {
      ok: boolean;
      count: number;
      origin: string;
      articles: Array<{ slug: string; api_url: string; human_url: string }>;
    };
    expect(listPayload.ok).toBe(true);
    expect(listPayload.count).toBeGreaterThan(0);
    expect(listPayload.origin).toBe('https://ai-transformation.io');
    expect(listPayload.articles[0]?.api_url).toContain('/api/v1/content/');
    expect(listPayload.articles[0]?.api_url).toContain('site=io');
    expect(listPayload.articles[0]?.human_url).toContain('https://ai-transformation.io');

    const readResponse = await app.request(
      'http://localhost/api/v1/content/what-is-ai-transformation?site=io',
      { headers: { 'X-Agent-Client-Id': 'test-agent/1.0' } },
    );
    expect(readResponse.status).toBe(200);
    expect(readResponse.headers.get('X-RateLimit-Limit')).toBe('3');
    const readPayload = (await readResponse.json()) as {
      ok: boolean;
      article: { slug: string; markdown: string; api_url: string };
    };
    expect(readPayload.article.slug).toBe('what-is-ai-transformation');
    expect(readPayload.article.api_url).toContain('what-is-ai-transformation');
    expect(readPayload.article.markdown.length).toBeGreaterThan(100);
  });

  it('lists org content index with org api_url values', async () => {
    const app = await loadBackend();
    const listResponse = await app.request('http://localhost/api/v1/content?site=org', {
      headers: { host: 'ai-transformation.org' },
    });
    expect(listResponse.status).toBe(200);
    const listPayload = (await listResponse.json()) as {
      site_domain: string;
      articles: Array<{ api_url: string; human_url: string }>;
    };
    expect(listPayload.site_domain).toBe('ai-transformation.org');
    expect(listPayload.articles[0]?.api_url).toContain('ai-transformation.org');
    expect(listPayload.articles[0]?.api_url).toContain('site=org');
    expect(listPayload.articles[0]?.human_url).toContain('/learn/');
  });

  it('issues write token after authorize confirm', async () => {
    const app = await loadBackend();

    const authorizeResponse = await app.request('http://localhost/api/v1/agent/authorize', {
      method: 'POST',
      headers: { 'content-type': 'application/json', host: 'ai-transformation.io' },
      body: JSON.stringify({
        email: 'agent-human@example.com',
        client_id: 'pytest-agent/1.0',
      }),
    });
    expect(authorizeResponse.status).toBe(200);
    const authorizePayload = (await authorizeResponse.json()) as { ok: boolean; confirm_url?: string };
    expect(authorizePayload.ok).toBe(true);
    expect(authorizePayload.confirm_url).toBeDefined();

    const confirmUrl = new URL(authorizePayload.confirm_url!);
    const confirmResponse = await app.request(confirmUrl.toString());
    expect(confirmResponse.status).toBe(200);
    const tokenPayload = (await confirmResponse.json()) as { ok: boolean; token: string };
    expect(tokenPayload.ok).toBe(true);
    expect(tokenPayload.token).toContain('.');

    const writeResponse = await app.request('http://localhost/api/v1/contributions', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        host: 'ai-transformation.io',
        authorization: `Bearer ${tokenPayload.token}`,
      },
      body: JSON.stringify({
        type: 'inquiry',
        site: 'io',
        body: 'How should we sequence governance before workflow pilots?',
      }),
    });
    expect(writeResponse.status).toBe(201);
    const writePayload = (await writeResponse.json()) as { ok: boolean; id: string; status: string };
    expect(writePayload.ok).toBe(true);
    expect(writePayload.status).toBe('new');
  });

  it('returns curated feed for io and org', async () => {
    const app = await loadBackend();
    const ioResponse = await app.request('http://localhost/api/v1/curated?site=io');
    expect(ioResponse.status).toBe(200);
    const ioPayload = (await ioResponse.json()) as { ok: boolean; site: string };
    expect(ioPayload.site).toBe('io');

    const orgResponse = await app.request('http://localhost/api/v1/curated?site=org');
    const orgPayload = (await orgResponse.json()) as { ok: boolean; site: string };
    expect(orgPayload.site).toBe('org');

    const orgHostResponse = await app.request('http://localhost/api/v1/curated', {
      headers: { host: 'ai-transformation.org' },
    });
    const orgHostPayload = (await orgHostResponse.json()) as { ok: boolean; site: string };
    expect(orgHostPayload.site).toBe('org');
  });
});
