import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  AGENT_READ_QUOTA_ANONYMOUS,
  AGENT_READ_QUOTA_VERIFIED,
  agentAuthorizeRequestSchema,
  agentContributionWriteSchema,
} from '@ai-transformation/shared';
import { Hono } from 'hono';

import {
  confirmAuthorizeRequest,
  countAgentReadsToday,
  createAuthorizeRequest,
  hasAgentReadToday,
  issueWriteToken,
  recordAgentRead,
  verifyWriteToken,
} from '../../db/agent-protocol.js';
import { getCurrentPrompt, insertContribution } from '../../db/index.js';
import { getContent, listContent } from './content-loader.js';
import { sendAuthorizeEmail } from './email.js';

const moduleDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(moduleDir, '../../../../../');
const curatedDir = path.join(repoRoot, 'data/curated');

const WRITE_SCOPES = ['write:inquiry', 'write:story', 'write:prompt_reply'] as const;
const API_VERSION = '1.0.0';

function loadCuratedFeed(site: 'io' | 'org') {
  const filePath = path.join(curatedDir, `${site}-home.json`);
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function resolveSite(host: string | undefined): 'io' | 'org' {
  return host?.includes('ai-transformation.org') ? 'org' : 'io';
}

function resolveOrigin(site: 'io' | 'org'): string {
  return site === 'org' ? 'https://ai-transformation.org' : 'https://ai-transformation.io';
}

function getClientId(headerValue: string | undefined): string {
  const trimmed = headerValue?.trim();
  if (trimmed && trimmed.length > 0 && trimmed.length <= 120) {
    return trimmed;
  }
  return 'anonymous';
}

function parseBearer(authHeader: string | undefined): string | null {
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.slice('Bearer '.length).trim();
  return token.length > 0 ? token : null;
}

function rateLimitHeaders(limit: number, remaining: number, resetIso: string): Record<string, string> {
  return {
    'X-RateLimit-Limit': String(limit),
    'X-RateLimit-Remaining': String(Math.max(0, remaining)),
    'X-RateLimit-Reset': resetIso,
  };
}

function endOfUtcDayIso(): string {
  const now = new Date();
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
  return end.toISOString();
}

function buildCapabilities(site: 'io' | 'org') {
  const origin = resolveOrigin(site);
  return {
    ok: true,
    api_version: API_VERSION,
    min_client_version: '1.0.0',
    site: site === 'org' ? 'ai-transformation.org' : 'ai-transformation.io',
    implementation_status: 'wave7_v1',
    documentation: {
      human: `${origin}/for-agents`,
      spec: `${origin}/for-agents#protocol`,
    },
    endpoints: {
      read_curated: {
        status: 'available',
        path: '/api/v1/curated',
        auth: 'none',
        query: { site: 'io | org' },
      },
      read_content_index: {
        status: 'available',
        path: '/api/v1/content',
        auth: 'none',
        notes: 'Listing does not consume read quota.',
      },
      read_content: {
        status: 'available',
        path: '/api/v1/content/{slug}',
        auth: 'optional',
        headers: { 'X-Agent-Client-Id': 'recommended' },
        free_reads_per_day: {
          anonymous_client_id: AGENT_READ_QUOTA_ANONYMOUS,
          verified_email: AGENT_READ_QUOTA_VERIFIED,
        },
      },
      write_contribution: {
        status: 'available',
        path: '/api/v1/contributions',
        auth: 'write_token_required',
        scopes:
          site === 'org'
            ? ['write:story', 'write:prompt_reply', 'write:inquiry']
            : ['write:inquiry'],
      },
      agent_authorize: {
        status: 'available',
        path: '/api/v1/agent/authorize',
        confirm_path: '/api/v1/agent/authorize/confirm',
      },
      agent_changelog: {
        status: 'available',
        path: '/api/v1/agent/changelog',
      },
    },
    identity: {
      primary: 'email',
      write_authorization: 'one_time_email_confirm_then_bearer_token',
      token_ttl_days: 180,
      token_sites: ['io', 'org'],
    },
    changelog_url: '/api/v1/agent/changelog',
  };
}

const agentProtocolRouter = new Hono();

agentProtocolRouter.get('/capabilities', (c) => {
  const site = resolveSite(c.req.header('host'));
  return c.json(buildCapabilities(site));
});

agentProtocolRouter.get('/agent/changelog', (c) =>
  c.json({
    ok: true,
    api_version: API_VERSION,
    entries: [
      {
        version: API_VERSION,
        date: '2026-06-22',
        summary: 'Agent API v1: read content with quotas, authorize write token, post contributions.',
        agent_action: 'Call GET /api/v1/capabilities before other API use.',
      },
    ],
  }),
);

agentProtocolRouter.get('/curated', (c) => {
  const siteParam = c.req.query('site');
  const site = siteParam === 'org' ? 'org' : 'io';
  const feed = loadCuratedFeed(site);
  return c.json({ ok: true, ...feed });
});

agentProtocolRouter.get('/content', (c) => {
  const siteParam = c.req.query('site');
  const site = siteParam === 'org' ? 'org' : resolveSite(c.req.header('host'));
  const articles = listContent(site);
  return c.json({ ok: true, site, count: articles.length, articles });
});

agentProtocolRouter.get('/content/:slug', (c) => {
  const slug = c.req.param('slug');
  const siteParam = c.req.query('site');
  const site = siteParam === 'org' ? 'org' : resolveSite(c.req.header('host'));
  const document = getContent(slug, site);

  if (!document) {
    return c.json({ ok: false, error: 'not_found', message: 'Content slug not found for this site.' }, 404);
  }

  const clientId = getClientId(c.req.header('X-Agent-Client-Id'));
  const bearer = parseBearer(c.req.header('Authorization'));
  const tokenRow = bearer ? verifyWriteToken(bearer) : null;
  const verifiedEmail = tokenRow?.email ?? null;
  const quota = verifiedEmail ? AGENT_READ_QUOTA_VERIFIED : AGENT_READ_QUOTA_ANONYMOUS;
  const alreadyRead = hasAgentReadToday({ clientId, email: verifiedEmail, slug });

  if (!alreadyRead) {
    const used = countAgentReadsToday({ clientId, email: verifiedEmail });
    if (used >= quota) {
      const origin = resolveOrigin(site);
      return c.json(
        {
          ok: false,
          error: 'read_quota_exceeded',
          message: verifiedEmail
            ? 'Daily free reads exhausted for this email.'
            : 'Daily free reads exhausted for this client_id. Authorize a write token for higher quota.',
          capabilities_url: `${origin}/for-agents`,
        },
        429,
        rateLimitHeaders(quota, 0, endOfUtcDayIso()),
      );
    }
    recordAgentRead({ clientId, email: verifiedEmail, slug });
  }

  const usedAfter = countAgentReadsToday({ clientId, email: verifiedEmail });
  const remaining = Math.max(0, quota - usedAfter);

  return c.json(
    { ok: true, site, article: document },
    200,
    rateLimitHeaders(quota, remaining, endOfUtcDayIso()),
  );
});

agentProtocolRouter.post('/agent/authorize', async (c) => {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ ok: false, error: 'invalid_body' }, 400);
  }

  const parsed = agentAuthorizeRequestSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ ok: false, error: 'validation_error', message: parsed.error.issues[0]?.message }, 400);
  }

  const site = resolveSite(c.req.header('host'));
  const origin = resolveOrigin(site);
  const { confirmCode } = createAuthorizeRequest({
    email: parsed.data.email,
    clientId: parsed.data.client_id,
    agentName: parsed.data.agent_name,
  });

  const confirmUrl = `${origin}/api/v1/agent/authorize/confirm?code=${encodeURIComponent(confirmCode)}`;
  const emailResult = await sendAuthorizeEmail({
    to: parsed.data.email,
    confirmUrl,
    clientId: parsed.data.client_id,
  });

  return c.json({
    ok: true,
    message: emailResult.sent
      ? 'Confirmation email sent. Human must click the link to issue a write token.'
      : 'Authorize request recorded. Use confirm_url in dev when email is not configured.',
    confirm_url: emailResult.confirmUrl,
  });
});

agentProtocolRouter.get('/agent/authorize/confirm', (c) => {
  const code = c.req.query('code');
  if (!code) {
    return c.json({ ok: false, error: 'missing_code' }, 400);
  }

  const confirmed = confirmAuthorizeRequest(code);
  if (!confirmed) {
    return c.json({ ok: false, error: 'invalid_or_expired_code' }, 400);
  }

  const issued = issueWriteToken({
    email: confirmed.email,
    clientId: confirmed.clientId,
    scopes: [...WRITE_SCOPES],
  });

  return c.json({
    ok: true,
    token: issued.bearerToken,
    token_id: issued.tokenId,
    expires_at: issued.expiresAt,
    email: confirmed.email,
    client_id: confirmed.clientId,
    scopes: [...WRITE_SCOPES],
    message: 'Copy this token into your agent Authorization header as Bearer <token>.',
  });
});

agentProtocolRouter.post('/contributions', async (c) => {
  const bearer = parseBearer(c.req.header('Authorization'));
  if (!bearer) {
    return c.json({ ok: false, error: 'missing_token' }, 401);
  }

  const tokenRow = verifyWriteToken(bearer);
  if (!tokenRow) {
    return c.json({ ok: false, error: 'invalid_token' }, 401);
  }

  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ ok: false, error: 'invalid_body' }, 400);
  }

  const parsed = agentContributionWriteSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ ok: false, error: 'validation_error', message: parsed.error.issues[0]?.message }, 400);
  }

  const hostSite = resolveSite(c.req.header('host'));
  const site = parsed.data.site ?? hostSite;

  if (parsed.data.type === 'story' || parsed.data.type === 'prompt_reply') {
    if (site !== 'org') {
      return c.json({ ok: false, error: 'site_restriction', message: 'Stories and prompt replies are .org only.' }, 403);
    }
  }

  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const metadata = JSON.stringify({
    agent_client_id: tokenRow.clientId,
    write_type: parsed.data.type,
    prompt_id: parsed.data.prompt_id ?? null,
  });

  if (parsed.data.type === 'inquiry') {
    insertContribution({
      id,
      source: 'agent',
      site,
      email: tokenRow.email,
      name: parsed.data.name ?? null,
      body: parsed.data.body,
      status: 'new',
      metadata,
      createdAt,
    });
  } else if (parsed.data.type === 'story') {
    if (!parsed.data.title) {
      return c.json({ ok: false, error: 'validation_error', message: 'title is required for story' }, 400);
    }
    insertContribution({
      id,
      source: 'agent',
      site: 'org',
      email: tokenRow.email,
      name: parsed.data.name ?? null,
      subject: parsed.data.title,
      body: parsed.data.body,
      status: 'new',
      metadata,
      createdAt,
    });
  } else {
    const promptId = parsed.data.prompt_id ?? getCurrentPrompt()?.id;
    if (!promptId) {
      return c.json({ ok: false, error: 'no_active_prompt' }, 400);
    }
    insertContribution({
      id,
      source: 'agent',
      site: 'org',
      email: tokenRow.email,
      name: parsed.data.name ?? null,
      subject: `Prompt reply: ${promptId}`,
      body: parsed.data.body,
      status: 'new',
      metadata: JSON.stringify({
        ...JSON.parse(metadata),
        prompt_id: promptId,
      }),
      createdAt,
    });
  }

  return c.json({ ok: true, id, status: 'new' }, 201);
});

export default agentProtocolRouter;
