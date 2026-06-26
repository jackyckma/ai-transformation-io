import { compileIssueDraftRequestSchema } from '@ai-transformation/shared';
import { Hono } from 'hono';

import {
  createIssueDraft,
  listContributionsSince,
  listRecentIssues,
  listNewsletterReplyContributions,
} from '../../db/newsletter.js';
import { listObjectsForRequester } from '../../db/objects.js';
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

  const publishedContext = {
    site,
    requesterUserId: admin.id,
    bearerOwnerUserId: null,
    isAuthenticated: true,
  };
  const knowledge = listObjectsForRequester({
    request: { site, objectType: 'knowledge', status: 'published', limit: 10 },
    context: publishedContext,
  }).objects;
  const community = listObjectsForRequester({
    request: { site, objectType: 'community', status: 'published', limit: 10 },
    context: publishedContext,
  }).objects;

  const { title, draftMd } = compileIssueDraftMarkdown({ site, contributions, knowledge, community });
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

agentRouter.get('/issues', (c) => {
  const admin = getAuthenticatedAdmin(c);
  if (admin instanceof Response) {
    return admin;
  }

  const rawLimit = c.req.query('limit');
  const parsedLimit = rawLimit ? Number.parseInt(rawLimit, 10) : 20;
  const limit = Number.isFinite(parsedLimit) ? parsedLimit : 20;

  const issues = listRecentIssues(limit).map((issue) => ({
    id: issue.id,
    site: issue.site,
    list: issue.list,
    slug: issue.slug,
    title: issue.title,
    status: issue.status,
    providerId: issue.providerId,
    sentAt: issue.sentAt,
    createdAt: issue.createdAt,
  }));

  return c.json({ ok: true, issues });
});

export default agentRouter;
