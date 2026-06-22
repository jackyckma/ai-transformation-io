import { buildAgentEntryJson, buildAgentEntryText } from '@ai-transformation/shared';
import type { Context } from 'hono';

import { resolveRequestSite } from './request-site.js';

function resolveSite(c: Context): 'io' | 'org' {
  return resolveRequestSite(
    c.req.header('host'),
    c.req.header('x-forwarded-host'),
    c.req.query('site'),
  );
}

export function handleAgentEntry(c: Context) {
  const site = resolveSite(c);
  const accept = c.req.header('accept') ?? '';

  if (accept.includes('application/json')) {
    return c.json(buildAgentEntryJson(site));
  }

  return c.text(buildAgentEntryText(site), 200, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Cache-Control': 'public, max-age=300',
  });
}
