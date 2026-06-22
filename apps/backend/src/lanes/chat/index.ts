import { randomUUID } from 'node:crypto';

import {
  CHAT_QUOTA_ANONYMOUS,
  CHAT_QUOTA_REGISTERED,
  chatSendMessageRequestSchema,
} from '@ai-transformation/shared';
import type { Context } from 'hono';
import { getCookie, setCookie } from 'hono/cookie';
import { Hono } from 'hono';
import { streamSSE } from 'hono/streaming';

import { getChatDb } from '../../db/index.js';
import type { SessionVariables } from '../../types/session.js';
import { buildContextSnippets, buildFallbackReply } from './context.js';
import { generateChatReply, streamChatReply } from './llm.js';

const CHAT_SESSION_COOKIE = 'atx_chat_session';
const CHAT_VISITOR_COOKIE = 'atx_chat_visitor';

const chatRouter = new Hono<{ Variables: SessionVariables }>();

function resolveSite(host: string | undefined, querySite: string | undefined): 'io' | 'org' {
  if (querySite === 'io' || querySite === 'org') {
    return querySite;
  }
  return host?.includes('ai-transformation.org') ? 'org' : 'io';
}

function cookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax' as const,
    path: '/',
    maxAge: maxAgeSeconds,
  };
}

function welcomeMessage(site: 'io' | 'org'): string {
  return site === 'org'
    ? 'Ask about learn guides, sharing a field story, or where to start in the community. I keep answers grounded in this site.'
    : 'Ask about frameworks, role guides, or where to start with AI transformation. I keep answers grounded in this site.';
}

function ensureWelcomeMessage(sessionId: string, site: 'io' | 'org') {
  const chat = getChatDb();
  const existing = chat.listMessagesForSession(sessionId);
  if (existing.length > 0) {
    return existing;
  }
  chat.insertChatMessage({
    sessionId,
    role: 'assistant',
    content: welcomeMessage(site),
    metadata: {
      links:
        site === 'org'
          ? [
              { label: 'Learn guides', href: '/learn' },
              { label: 'Share a story', href: '/stories/submit' },
            ]
          : [
              { label: 'Frameworks', href: '/frameworks' },
              { label: 'Role guides', href: '/functions' },
            ],
    },
  });
  return chat.listMessagesForSession(sessionId);
}

function serializeMessages(sessionId: string) {
  const chat = getChatDb();
  return chat.listMessagesForSession(sessionId).map((row) => ({
    id: row.id,
    role: row.role,
    content: row.content,
    links: chat.parseMessageLinks(row.metadata),
    createdAt: row.createdAt,
  }));
}

function getOrCreateSession(c: Context<{ Variables: SessionVariables }>) {
  const site = resolveSite(c.req.header('host'), c.req.query('site'));
  const chat = getChatDb();
  const user = c.get('user');

  let visitorId = getCookie(c, CHAT_VISITOR_COOKIE);
  if (!visitorId) {
    visitorId = randomUUID();
    setCookie(c, CHAT_VISITOR_COOKIE, visitorId, cookieOptions(60 * 60 * 24 * 365));
  }

  const sessionCookie = getCookie(c, CHAT_SESSION_COOKIE);
  let session = sessionCookie ? chat.getSessionById(sessionCookie) : null;

  if (session && session.site !== site) {
    session = null;
  }

  if (!session) {
    session =
      chat.getLatestSessionForVisitor({ visitorId, site }) ??
      chat.createChatSession({ site, visitorId, userId: user?.id ?? null });
    setCookie(c, CHAT_SESSION_COOKIE, session.id, cookieOptions(60 * 60 * 24 * 30));
  } else if (user && !session.userId) {
    chat.attachUserToSession(session.id, user.id);
    session = chat.getSessionById(session.id)!;
  }

  ensureWelcomeMessage(session.id, site);
  session = chat.getSessionById(session.id)!;

  return { session, site };
}

function parseMessageBody(c: Context<{ Variables: SessionVariables }>) {
  return c.req.json().catch(() => null);
}

type PreparedMessage =
  | { ok: false; status: number; error: string }
  | {
      ok: true;
      session: NonNullable<ReturnType<ReturnType<typeof getChatDb>['getSessionById']>>;
      userMessage: ReturnType<ReturnType<typeof getChatDb>['insertChatMessage']>;
      history: Array<{ role: 'user' | 'assistant'; content: string }>;
      snippets: string[];
      contextLinks: Array<{ label: string; href: string }>;
      limit: number;
      quotaKey: string;
    };

async function prepareUserMessage(
  c: Context<{ Variables: SessionVariables }>,
  body: unknown,
): Promise<PreparedMessage> {
  const { session: activeSession } = getOrCreateSession(c);
  const chat = getChatDb();
  const user = c.get('user');

  if (user && !activeSession.userId) {
    chat.attachUserToSession(activeSession.id, user.id);
  }
  const session = chat.getSessionById(activeSession.id)!;

  const parsed = chatSendMessageRequestSchema.safeParse(body);
  if (!parsed.success) {
    return { ok: false, status: 400, error: parsed.error.issues[0]?.message ?? 'Invalid body' };
  }

  const quotaKey = chat.getQuotaKey(session);
  const limit = session.userId ? CHAT_QUOTA_REGISTERED : CHAT_QUOTA_ANONYMOUS;
  const used = chat.getMessageCountToday(quotaKey);
  if (used >= limit) {
    return {
      ok: false,
      status: 429,
      error: session.userId
        ? 'Daily message limit reached. Try again tomorrow.'
        : 'Daily message limit reached. Sign in for a higher limit, or try again tomorrow.',
    };
  }

  const userMessage = chat.insertChatMessage({
    sessionId: session.id,
    role: 'user',
    content: parsed.data.content.trim(),
  });

  const history = chat
    .listMessagesForSession(session.id)
    .filter((row) => row.id !== userMessage.id)
    .map((row) => ({ role: row.role, content: row.content }));

  const { snippets, links: contextLinks } = buildContextSnippets(session.site, parsed.data.content.trim());

  return {
    ok: true,
    session,
    userMessage,
    history,
    snippets,
    contextLinks,
    limit,
    quotaKey,
  };
}

function serializeQuota(sessionId: string, limit: number, quotaKey: string) {
  const chat = getChatDb();
  const messageCount = chat.getMessageCountToday(quotaKey);
  const refreshedSession = chat.getSessionById(sessionId)!;
  return {
    limit,
    remaining: Math.max(0, limit - messageCount),
    reset: chat.getQuotaForSession(refreshedSession).reset,
  };
}

chatRouter.get('/chat/session', (c) => {
  const { session } = getOrCreateSession(c);
  const chat = getChatDb();
  const refreshed = chat.getSessionById(session.id)!;

  return c.json({
    ok: true,
    session: {
      id: refreshed.id,
      site: refreshed.site,
      messages: serializeMessages(refreshed.id),
      quota: chat.getQuotaForSession(refreshed),
    },
  });
});

chatRouter.post('/chat/session/messages', async (c) => {
  const body = await parseMessageBody(c);
  if (body === null) {
    return c.json({ ok: false, error: 'Invalid request body' }, 400);
  }

  const prepared = await prepareUserMessage(c, body);
  if (!prepared.ok) {
    return c.json({ ok: false, error: prepared.error }, prepared.status as 400 | 429);
  }

  const chat = getChatDb();
  const { session, userMessage, history, snippets, contextLinks, limit, quotaKey } = prepared;

  const llmReply = await generateChatReply({
    site: session.site,
    history,
    userMessage: userMessage.content,
    contextSnippets: snippets,
  });

  const fallback = buildFallbackReply(session.site, userMessage.content);
  const assistantContent = llmReply ?? fallback.content;
  const assistantLinks = llmReply ? contextLinks : fallback.links;

  const assistantMessage = chat.insertChatMessage({
    sessionId: session.id,
    role: 'assistant',
    content: assistantContent,
    metadata: assistantLinks.length > 0 ? { links: assistantLinks } : {},
  });

  chat.incrementMessageCount(quotaKey);

  return c.json({
    ok: true,
    userMessage: {
      id: userMessage.id,
      role: userMessage.role,
      content: userMessage.content,
      createdAt: userMessage.createdAt,
    },
    assistantMessage: {
      id: assistantMessage.id,
      role: assistantMessage.role,
      content: assistantMessage.content,
      links: chat.parseMessageLinks(assistantMessage.metadata),
      createdAt: assistantMessage.createdAt,
    },
    quota: serializeQuota(session.id, limit, quotaKey),
  });
});

chatRouter.post('/chat/session/messages/stream', async (c) => {
  const body = await parseMessageBody(c);
  if (body === null) {
    return c.json({ ok: false, error: 'Invalid request body' }, 400);
  }

  const prepared = await prepareUserMessage(c, body);
  if (!prepared.ok) {
    return c.json({ ok: false, error: prepared.error }, prepared.status as 400 | 429);
  }

  const chat = getChatDb();
  const { session, userMessage, history, snippets, contextLinks, limit, quotaKey } = prepared;
  const fallback = buildFallbackReply(session.site, userMessage.content);

  return streamSSE(c, async (stream) => {
    await stream.writeSSE({
      event: 'user',
      data: JSON.stringify({
        id: userMessage.id,
        role: userMessage.role,
        content: userMessage.content,
        createdAt: userMessage.createdAt,
      }),
    });

    let assistantContent = '';
    let usedLlm = false;

    const streamResult = streamChatReply({
      site: session.site,
      history,
      userMessage: userMessage.content,
      contextSnippets: snippets,
    });

    let next = await streamResult.next();
    while (!next.done) {
      assistantContent += next.value;
      usedLlm = true;
      await stream.writeSSE({
        event: 'delta',
        data: JSON.stringify({ content: next.value }),
      });
      next = await streamResult.next();
    }

    if (!usedLlm) {
      assistantContent = fallback.content;
      await stream.writeSSE({
        event: 'delta',
        data: JSON.stringify({ content: assistantContent }),
      });
    } else if (next.value) {
      assistantContent = next.value;
    }

    const assistantLinks = usedLlm ? contextLinks : fallback.links;
    const assistantMessage = chat.insertChatMessage({
      sessionId: session.id,
      role: 'assistant',
      content: assistantContent,
      metadata: assistantLinks.length > 0 ? { links: assistantLinks } : {},
    });

    chat.incrementMessageCount(quotaKey);

    await stream.writeSSE({
      event: 'done',
      data: JSON.stringify({
        assistantMessage: {
          id: assistantMessage.id,
          role: assistantMessage.role,
          content: assistantMessage.content,
          links: chat.parseMessageLinks(assistantMessage.metadata),
          createdAt: assistantMessage.createdAt,
        },
        quota: serializeQuota(session.id, limit, quotaKey),
      }),
    });
  });
});

export default chatRouter;
