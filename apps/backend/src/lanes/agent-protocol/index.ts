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
import { handleAgentEntry } from './entry.js';
import { sendAuthorizeEmail } from './email.js';
import { resolveRequestSite } from './request-site.js';

const moduleDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(moduleDir, '../../../../../');
const curatedDir = path.join(repoRoot, 'data/curated');

const WRITE_SCOPES = ['write:inquiry', 'write:story', 'write:prompt_reply'] as const;
const API_VERSION = '1.0.0';

function loadCuratedFeed(site: 'io' | 'org') {
  const filePath = path.join(curatedDir, `${site}-home.json`);
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function resolveSite(c: { req: { header: (name: string) => string | undefined; query: (name: string) => string | undefined } }): 'io' | 'org' {
  return resolveRequestSite(
    c.req.header('host'),
    c.req.header('x-forwarded-host'),
    c.req.query('site'),
  );
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
      agent_entry: `${origin}/api/agent`,
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
        notes:
          'Listing does not consume read quota. Each entry includes api_url (use for reads) and human_url.',
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
    write_payloads: {
      inquiry: {
        scope: 'write:inquiry',
        sites: ['io', 'org'],
        method: 'POST',
        path: '/api/v1/contributions',
        auth: 'Authorization: Bearer <write_token>',
        body: {
          type: { required: true, value: 'inquiry' },
          site: { required: false, type: 'io | org', default: 'request host site' },
          body: { required: true, type: 'string', min_length: 10, max_length: 8000 },
          name: { required: false, type: 'string', max_length: 120 },
        },
        example: {
          type: 'inquiry',
          site,
          body: 'How should we sequence governance before workflow pilots?',
        },
      },
      ...(site === 'org'
        ? {
            story: {
              scope: 'write:story',
              sites: ['org'],
              method: 'POST',
              path: '/api/v1/contributions',
              auth: 'Authorization: Bearer <write_token>',
              body: {
                type: { required: true, value: 'story' },
                site: { required: false, value: 'org' },
                title: { required: true, type: 'string', min_length: 4, max_length: 160 },
                body: { required: true, type: 'string', min_length: 10, max_length: 8000 },
                name: { required: false, type: 'string', max_length: 120 },
              },
            },
            prompt_reply: {
              scope: 'write:prompt_reply',
              sites: ['org'],
              method: 'POST',
              path: '/api/v1/contributions',
              auth: 'Authorization: Bearer <write_token>',
              body: {
                type: { required: true, value: 'prompt_reply' },
                site: { required: false, value: 'org' },
                body: { required: true, type: 'string', min_length: 10, max_length: 8000 },
                prompt_id: {
                  required: false,
                  type: 'string',
                  max_length: 120,
                  default: 'current active community prompt',
                },
                name: { required: false, type: 'string', max_length: 120 },
              },
            },
          }
        : {}),
    },
    changelog_url: `${origin}/api/v1/agent/changelog`,
    content_index_example: `${origin}/api/v1/content?site=${site}`,
    client_id: {
      header: 'X-Agent-Client-Id',
      required: false,
      format: 'Stable string, 1–120 characters — e.g. "your-agent-name/1.0" or a UUID you reuse per deployment.',
      purpose:
        'Anonymous read quota is tracked per client_id (3/day). Reuse the same value across calls in one session.',
      verified_reads:
        'After POST /api/v1/agent/authorize and human email confirm, reads tied to that email get 10/day.',
    },
    errors: {
      shape: { ok: false, error: 'machine_code', message: 'optional human-readable detail' },
      codes: {
        not_found: { status: 404, when: 'Unknown slug or missing resource' },
        read_quota_exceeded: { status: 429, when: 'Daily content read limit reached' },
        missing_token: { status: 401, when: 'POST /contributions without Bearer token' },
        invalid_token: { status: 401, when: 'Expired or unknown write token' },
        validation_error: { status: 400, when: 'Request body failed schema validation' },
        invalid_body: { status: 400, when: 'Malformed JSON body' },
        site_restriction: { status: 403, when: 'Story or prompt reply submitted on .io' },
        missing_code: { status: 400, when: 'Authorize confirm without code query param' },
        invalid_or_expired_code: { status: 400, when: 'Authorize confirm link invalid or expired' },
        no_active_prompt: { status: 400, when: 'Prompt reply when no active community prompt' },
      },
      rate_limit_headers: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
    },
    changelog: {
      path: '/api/v1/agent/changelog',
      response_shape: {
        ok: true,
        api_version: 'semver string',
        entries: [{ version: 'semver', date: 'ISO date', summary: 'string', agent_action: 'string' }],
      },
    },
    quick_start: [
      `GET ${origin}/api/agent`,
      `GET ${origin}/api/v1/capabilities`,
      `GET ${origin}/api/v1/content?site=${site}`,
      `GET ${origin}/api/v1/curated?site=${site}`,
      `GET ${origin}/api/v1/content/{slug}?site=${site}`,
      `POST ${origin}/api/v1/agent/authorize → human confirms → Bearer write token`,
      `POST ${origin}/api/v1/contributions`,
    ],
  };
}

const agentProtocolRouter = new Hono();

agentProtocolRouter.get('/agent', handleAgentEntry);

agentProtocolRouter.get('/capabilities', (c) => {
  const site = resolveSite(c);
  return c.json(buildCapabilities(site));
});

agentProtocolRouter.get('/agent/changelog', (c) =>
  c.json({
    ok: true,
    api_version: API_VERSION,
    entries: [
      {
        version: API_VERSION,
        date: '2026-06-23',
        summary:
          'Content index entries include api_url and human_url; capabilities document write_payloads for inquiries and .org contributions.',
        agent_action:
          'Use api_url from GET /api/v1/content; read write_payloads from GET /api/v1/capabilities before POST /contributions.',
      },
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
  const site = resolveSite(c);
  const feed = loadCuratedFeed(site);
  return c.json({ ok: true, ...feed });
});

agentProtocolRouter.get('/content', (c) => {
  const site = resolveSite(c);
  const origin = resolveOrigin(site);
  const articles = listContent(site);
  return c.json({
    ok: true,
    site,
    site_domain: site === 'org' ? 'ai-transformation.org' : 'ai-transformation.io',
    origin,
    count: articles.length,
    articles,
  });
});

agentProtocolRouter.get('/content/:slug', (c) => {
  const slug = c.req.param('slug');
  const site = resolveSite(c);
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
          capabilities_url: `${origin}/api/v1/capabilities`,
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

  const site = resolveSite(c);
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

  const hostSite = resolveSite(c);
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
