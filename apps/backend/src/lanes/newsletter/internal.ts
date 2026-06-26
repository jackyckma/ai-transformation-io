import { Hono } from 'hono';

import { getIssueById, listActiveSubscribers, markIssueSent } from '../../db/newsletter.js';
import { isAdmin } from '../../lib/admin.js';
import type { SessionVariables } from '../../types/session.js';
import { getNewsletterProvider } from './provider.js';

const newsletterInternalRouter = new Hono<{ Variables: SessionVariables }>();

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

newsletterInternalRouter.post('/send-issue', async (c) => {
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

  const issueId =
    body && typeof body === 'object' && typeof (body as { issueId?: unknown }).issueId === 'string'
      ? (body as { issueId: string }).issueId.trim()
      : '';
  if (!issueId) {
    return c.json({ ok: false, error: 'Invalid body' }, 400);
  }

  const issue = getIssueById(issueId);
  if (!issue) {
    return c.json({ ok: false, error: 'Issue not found' }, 404);
  }
  if (issue.status === 'sent') {
    return c.json({ ok: false, error: 'Issue already sent' }, 409);
  }

  const provider = getNewsletterProvider();
  const from =
    issue.site === 'org'
      ? process.env.NEWSLETTER_FROM_ORG || 'learn@ai-transformation.org'
      : process.env.NEWSLETTER_FROM_IO || 'pulse@ai-transformation.io';
  const replyTo = `replies+${issue.replyToToken}@ai-transformation.io`;

  const allRecipients = listActiveSubscribers(issue.list);
  const rawCap = Number(process.env.NEWSLETTER_PILOT_MAX ?? 25);
  const cap = Number.isFinite(rawCap) && rawCap > 0 ? Math.floor(rawCap) : 25;
  const recipients = allRecipients.slice(0, cap);
  const capped = allRecipients.length > recipients.length;

  if (recipients.length === 0) {
    return c.json({
      ok: true,
      sent: 0,
      status: issue.status,
    });
  }

  const result = await provider.send({
    from,
    to: recipients,
    subject: issue.title,
    text: issue.draftMd,
    replyTo,
  });

  if (!result.ok) {
    return c.json({ ok: false, error: result.error ?? 'Failed to send issue' }, 502);
  }

  const providerId = result.providerId ?? provider.name;
  markIssueSent(issue.id, providerId);

  return c.json({
    ok: true,
    sent: recipients.length,
    capped,
    providerId,
    status: 'sent',
  });
});

export default newsletterInternalRouter;
