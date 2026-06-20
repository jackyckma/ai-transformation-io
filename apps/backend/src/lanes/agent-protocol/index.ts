import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { Hono } from 'hono';

const moduleDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(moduleDir, '../../../../../');
const curatedDir = path.join(repoRoot, 'data/curated');

function loadCuratedFeed(site: 'io' | 'org') {
  const filePath = path.join(curatedDir, `${site}-home.json`);
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

const agentProtocolRouter = new Hono();

agentProtocolRouter.get('/capabilities', (c) => {
  const host = c.req.header('host') ?? 'ai-transformation.io';
  const site = host.includes('ai-transformation.org') ? 'org' : 'io';
  const origin = site === 'org' ? 'https://ai-transformation.org' : 'https://ai-transformation.io';

  return c.json({
    ok: true,
    api_version: '1.0.0-stub',
    min_client_version: '1.0.0',
    site: site === 'org' ? 'ai-transformation.org' : 'ai-transformation.io',
    implementation_status: 'wave6_stub',
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
      read_content: {
        status: 'planned',
        path: '/api/v1/content/{slug}',
        auth: 'optional',
        planned_version: '1.0.0',
        free_reads_per_day: {
          anonymous_client_id: 3,
          verified_email: 10,
        },
      },
      write_contribution: {
        status: 'planned',
        path: '/api/v1/contributions',
        auth: 'write_token_required',
        planned_version: '1.0.0',
        scopes:
          site === 'org'
            ? ['write:story', 'write:prompt_reply', 'write:inquiry']
            : ['write:inquiry'],
      },
      agent_authorize: {
        status: 'planned',
        path: '/api/v1/agent/authorize',
        planned_version: '1.0.0',
      },
    },
    identity: {
      primary: 'email',
      write_authorization: 'one_time_email_confirm_then_bearer_token',
      token_ttl_days: 180,
      token_sites: ['io', 'org'],
    },
  });
});

agentProtocolRouter.get('/curated', (c) => {
  const siteParam = c.req.query('site');
  const site = siteParam === 'org' ? 'org' : 'io';
  const feed = loadCuratedFeed(site);
  return c.json({ ok: true, ...feed });
});

export default agentProtocolRouter;
