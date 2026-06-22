import { randomUUID } from 'node:crypto';

import {
  CHAT_QUOTA_ANONYMOUS,
  CHAT_QUOTA_REGISTERED,
  chatSendMessageRequestSchema,
} from '@ai-transformation/shared';
import type { Context } from 'hono';
import { getCookie, setCookie } from 'hono/cookie';
import { Hono } from 'hono';

import { getChatDb } from '../../db/index.js';
import type { SessionVariables } from '../../types/session.js';
import { buildContextSnippets, buildFallbackReply } from './context.js';
import { generateChatReply } from './llm.js';

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
  const sessionCookie = getCookie(c, CHAT_SESSION_COOKIE);
  if (!sessionCookie) {
    return c.json({ ok: false, error: 'Start a chat session first' }, 400);
  }

  const chat = getChatDb();
  const session = chat.getSessionById(sessionCookie);
  if (!session) {
    return c.json({ ok: false, error: 'Chat session not found' }, 404);
  }

  const user = c.get('user');
  if (user && !session.userId) {
    chat.attachUserToSession(session.id, user.id);
  }
  const activeSession = chat.getSessionById(session.id)!;

  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ ok: false, error: 'Invalid request body' }, 400);
  }

  const parsed = chatSendMessageRequestSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid body' }, 400);
  }

  const quotaKey = chat.getQuotaKey(activeSession);
  const limit = activeSession.userId ? CHAT_QUOTA_REGISTERED : CHAT_QUOTA_ANONYMOUS;
  const used = chat.getMessageCountToday(quotaKey);
  if (used >= limit) {
    return c.json(
      {
        ok: false,
        error: activeSession.userId
          ? 'Daily message limit reached. Try again tomorrow.'
          : 'Daily message limit reached. Sign in for a higher limit, or try again tomorrow.',
      },
      429,
    );
  }

  const userMessage = chat.insertChatMessage({
    sessionId: activeSession.id,
    role: 'user',
    content: parsed.data.content.trim(),
  });

  const history = chat
    .listMessagesForSession(activeSession.id)
    .filter((row) => row.id !== userMessage.id)
    .map((row) => ({ role: row.role, content: row.content }));

  const { snippets, links: contextLinks } = buildContextSnippets(activeSession.site, parsed.data.content);
  const llmReply = await generateChatReply({
    site: activeSession.site,
    history,
    userMessage: parsed.data.content.trim(),
    contextSnippets: snippets,
  });

  const fallback = buildFallbackReply(activeSession.site, parsed.data.content);
  const assistantContent = llmReply ?? fallback.content;
  const assistantLinks = llmReply ? contextLinks : fallback.links;

  const assistantMessage = chat.insertChatMessage({
    sessionId: activeSession.id,
    role: 'assistant',
    content: assistantContent,
    metadata: assistantLinks.length > 0 ? { links: assistantLinks } : {},
  });

  const messageCount = chat.incrementMessageCount(quotaKey);
  const refreshedSession = chat.getSessionById(activeSession.id)!;

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
    quota: {
      limit,
      remaining: Math.max(0, limit - messageCount),
      reset: chat.getQuotaForSession(refreshedSession).reset,
    },
  });
});

export default chatRouter;
