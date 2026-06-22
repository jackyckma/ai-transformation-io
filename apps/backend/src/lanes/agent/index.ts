import { compileIssueDraftRequestSchema } from '@ai-transformation/shared';
import { Hono } from 'hono';

import {
  createIssueDraft,
  listContributionsSince,
  listNewsletterReplyContributions,
} from '../../db/newsletter.js';
import { isAdmin } from '../../lib/admin.js';
import type { SessionVariables } from '../../types/session.js';
import { clusterNewsletterReplies, compileIssueDraftMarkdown } from './compile-draft.js';

const agentRouter = new Hono<{ Variables: SessionVariables }>();

function getAuthenticatedAdmin(c: {
  get: (key: 'user') => import('../../db/index.js').UserRow | null;
  json: (body: unknown, status?: number) => Response;
}) {
  const user = c.get('user');
  if (!user) {
    return c.json({ ok: false, error: 'Not authenticated' }, 401);
  }
  if (!isAdmin(user)) {
    return c.json({ ok: false, error: 'Forbidden' }, 403);
  }
  return user;
}

agentRouter.post('/compile-draft', async (c) => {
  const admin = getAuthenticatedAdmin(c);
  if (admin instanceof Response) {
    return admin;
  }

  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ ok: false, error: 'Invalid request body' }, 400);
  }

  const parsed = compileIssueDraftRequestSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid body' }, 400);
  }

  const site = parsed.data.site;
  const list = parsed.data.list ?? (site === 'org' ? 'org_harvest' : 'io_pulse');
  const contributions = listContributionsSince({
    since: parsed.data.since,
    site,
    limit: parsed.data.limit ?? 30,
  });

  const { title, draftMd } = compileIssueDraftMarkdown({ site, contributions });
  const issue = createIssueDraft({
    site,
    list,
    title,
    draftMd,
    contributionIds: contributions.map((item) => item.id),
  });

  return c.json({
    ok: true,
    job: 'compile_issue_draft',
    issue: {
      id: issue.id,
      site: issue.site,
      list: issue.list,
      slug: issue.slug,
      title: issue.title,
      status: issue.status,
      replyToToken: issue.replyToToken,
      draftMd: issue.draftMd,
      createdAt: issue.createdAt,
    },
    contributionCount: contributions.length,
  });
});

agentRouter.post('/cluster-replies', async (c) => {
  const admin = getAuthenticatedAdmin(c);
  if (admin instanceof Response) {
    return admin;
  }

  const replies = listNewsletterReplyContributions(50);
  const { ok: _ok, ...cluster } = clusterNewsletterReplies(replies);
  return c.json({ ok: true, job: 'cluster_replies', ...cluster });
});

export default agentRouter;
