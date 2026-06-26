import { randomUUID } from 'node:crypto';

import { inquiryPayloadSchema, newsletterListSchema } from '@ai-transformation/shared';
import { Hono } from 'hono';

import { insertContribution } from '../../db/index.js';
import {
  getIssueByReplyToToken,
  linkIssueContribution,
  unsubscribeSubscriber,
  upsertSubscriber,
} from '../../db/newsletter.js';
import { getNewsletterProvider } from './provider.js';

const newsletterRouter = new Hono();

function parseSubscribeBody(body: unknown): { email: string; list: 'io_pulse' | 'org_harvest' } | null {
  if (!body || typeof body !== 'object') {
    return null;
  }
  const payload = body as Record<string, unknown>;
  const email = inquiryPayloadSchema.shape.email.safeParse(payload.email);
  const list = newsletterListSchema.safeParse(payload.list);
  if (!email.success || !list.success) {
    return null;
  }
  return {
    email: email.data,
    list: list.data,
  };
}

function parseInboundBody(body: unknown):
  | {
      replyToToken: string;
      from: string;
      subject?: string;
      text?: string;
      body?: string;
    }
  | null {
  if (!body || typeof body !== 'object') {
    return null;
  }
  const payload = body as Record<string, unknown>;
  const replyToToken =
    typeof payload.replyToToken === 'string' && payload.replyToToken.trim().length > 0
      ? payload.replyToToken.trim()
      : null;
  const from = inquiryPayloadSchema.shape.email.safeParse(payload.from);
  if (!replyToToken || !from.success) {
    return null;
  }

  if (payload.subject !== undefined && typeof payload.subject !== 'string') {
    return null;
  }
  if (payload.text !== undefined && typeof payload.text !== 'string') {
    return null;
  }
  if (payload.body !== undefined && typeof payload.body !== 'string') {
    return null;
  }

  return {
    replyToToken,
    from: from.data,
    subject: payload.subject as string | undefined,
    text: payload.text as string | undefined,
    body: payload.body as string | undefined,
  };
}

function getInboundSecret(c: { req: { header: (name: string) => string | undefined } }): string | null {
  const direct = c.req.header('x-inbound-secret');
  if (direct && direct.trim().length > 0) {
    return direct.trim();
  }
  const authorization = c.req.header('authorization');
  if (!authorization) {
    return null;
  }
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : null;
}

newsletterRouter.post('/webhooks/zsend', async (c) => {
  let payload: unknown;
  try {
    payload = await c.req.json();
  } catch {
    payload = null;
  }

  console.info('[zsend-webhook] event received', {
    type: typeof payload === 'object' && payload && 'event' in payload ? (payload as { event?: string }).event : 'unknown',
  });

  return c.json({
    ok: true,
    status: 'accepted',
    note: 'Wave 8 stub — delivery/bounce handling wired in Wave 10 pilot',
  });
});

newsletterRouter.post('/webhooks/inbound-email', async (c) => {
  const expectedSecret = process.env.INBOUND_EMAIL_WEBHOOK_SECRET;
  const requestSecret = getInboundSecret(c);
  if (!expectedSecret || requestSecret !== expectedSecret) {
    return c.json({ ok: false, error: 'Unauthorized' }, 401);
  }

  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ ok: false, error: 'Invalid request body' }, 400);
  }

  const parsedBody = parseInboundBody(body);
  if (!parsedBody) {
    return c.json({ ok: false, error: 'Invalid body' }, 400);
  }

  const issue = getIssueByReplyToToken(parsedBody.replyToToken);
  const contributionId = randomUUID();
  const bodyText = parsedBody.text ?? parsedBody.body ?? '';

  insertContribution({
    id: contributionId,
    source: 'newsletter_reply',
    site: issue?.site ?? null,
    email: parsedBody.from,
    subject: parsedBody.subject,
    body: bodyText,
    status: 'new',
    metadata: JSON.stringify({
      issue_id: issue?.id ?? null,
      replyToToken: parsedBody.replyToToken,
      from: parsedBody.from,
    }),
    createdAt: new Date().toISOString(),
  });

  if (issue) {
    linkIssueContribution(issue.id, contributionId, 'reply');
  }

  return c.json({
    ok: true,
    linked: Boolean(issue),
    contributionId,
  });
});

newsletterRouter.post('/newsletter/subscribe', async (c) => {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ ok: false, error: 'Invalid request body' }, 400);
  }
  const parsedBody = parseSubscribeBody(body);
  if (!parsedBody) {
    return c.json({ ok: false, error: 'Invalid body' }, 400);
  }

  upsertSubscriber({
    email: parsedBody.email,
    list: parsedBody.list,
  });

  return c.json({ ok: true, status: 'active' });
});

newsletterRouter.post('/newsletter/unsubscribe', async (c) => {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ ok: false, error: 'Invalid request body' }, 400);
  }
  const parsedBody = parseSubscribeBody(body);
  if (!parsedBody) {
    return c.json({ ok: false, error: 'Invalid body' }, 400);
  }

  unsubscribeSubscriber({
    email: parsedBody.email,
    list: parsedBody.list,
  });

  return c.json({ ok: true, status: 'unsubscribed' });
});

newsletterRouter.get('/newsletter/provider', (c) => {
  const provider = getNewsletterProvider();
  return c.json({
    ok: true,
    provider: provider.name,
    zsendConfigured: Boolean(process.env.ZSEND_API_KEY),
  });
});

export default newsletterRouter;
