import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';

import { Hono } from 'hono';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';

import { createSession, deleteSession, upsertUserByGoogle } from '../../db/index.js';
import type { SessionVariables } from '../../types/session.js';

const authRouter = new Hono<{ Variables: SessionVariables }>();

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://openidconnect.googleapis.com/v1/userinfo';
const SESSION_COOKIE_NAME = 'atx_session';
const OAUTH_STATE_COOKIE_NAME = 'atx_oauth_state';
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

function getAuthConfig():
  | {
      clientId: string;
      clientSecret: string;
      sessionSecret: string;
    }
  | null {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const sessionSecret = process.env.SESSION_SECRET;

  if (!clientId || !clientSecret || !sessionSecret) {
    return null;
  }

  return { clientId, clientSecret, sessionSecret };
}

function getFirstForwardedValue(headerValue: string | null | undefined): string | undefined {
  return headerValue?.split(',')[0]?.trim();
}

function getRequestOrigin(request: Request): string {
  const requestUrl = new URL(request.url);
  const proto = getFirstForwardedValue(request.headers.get('x-forwarded-proto')) ?? requestUrl.protocol.slice(0, -1);
  const host =
    getFirstForwardedValue(request.headers.get('x-forwarded-host')) ??
    request.headers.get('host') ??
    requestUrl.host;

  return `${proto}://${host}`;
}

function isSecureOrigin(origin: string): boolean {
  return origin.startsWith('https://');
}

function normalizeReturnPath(value: string | undefined): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) {
    return '/';
  }
  return value;
}

function signStatePayload(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('base64url');
}

function createStateToken(returnPath: string, secret: string): string {
  const payload = Buffer.from(
    JSON.stringify({
      nonce: randomUUID(),
      returnPath,
      iat: Date.now(),
    }),
  ).toString('base64url');
  const signature = signStatePayload(payload, secret);
  return `${payload}.${signature}`;
}

function parseStateToken(
  token: string,
  secret: string,
): {
  returnPath: string;
} | null {
  const [payload, signature] = token.split('.');
  if (!payload || !signature) {
    return null;
  }

  const expectedSignature = signStatePayload(payload, secret);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);
  if (signatureBuffer.length !== expectedBuffer.length) {
    return null;
  }
  if (!timingSafeEqual(signatureBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      returnPath?: string;
    };
    return { returnPath: normalizeReturnPath(decoded.returnPath) };
  } catch {
    return null;
  }
}

authRouter.get('/google', (c) => {
  const config = getAuthConfig();
  if (!config) {
    return c.json({ ok: false, error: 'Google sign-in is not configured' }, 501);
  }

  const origin = getRequestOrigin(c.req.raw);
  const redirectUri = `${origin}/api/auth/callback/google`;
  const returnPath = normalizeReturnPath(c.req.query('return'));
  const state = createStateToken(returnPath, config.sessionSecret);

  setCookie(c, OAUTH_STATE_COOKIE_NAME, state, {
    path: '/',
    maxAge: 10 * 60,
    httpOnly: true,
    sameSite: 'Lax',
    secure: isSecureOrigin(origin),
  });

  const authParams = new URLSearchParams({
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'online',
    prompt: 'select_account',
    client_id: config.clientId,
    redirect_uri: redirectUri,
    state,
  });

  return c.redirect(`${GOOGLE_AUTH_URL}?${authParams.toString()}`, 302);
});

authRouter.get('/callback/google', async (c) => {
  const config = getAuthConfig();
  if (!config) {
    return c.json({ ok: false, error: 'Google sign-in is not configured' }, 501);
  }

  const origin = getRequestOrigin(c.req.raw);
  const redirectUri = `${origin}/api/auth/callback/google`;
  const code = c.req.query('code');
  const state = c.req.query('state');
  const stateCookie = getCookie(c, OAUTH_STATE_COOKIE_NAME);

  if (!code || !state || !stateCookie || state !== stateCookie) {
    deleteCookie(c, OAUTH_STATE_COOKIE_NAME, { path: '/' });
    return c.json({ ok: false, error: 'Invalid OAuth state' }, 400);
  }

  const parsedState = parseStateToken(state, config.sessionSecret);
  if (!parsedState) {
    deleteCookie(c, OAUTH_STATE_COOKIE_NAME, { path: '/' });
    return c.json({ ok: false, error: 'Invalid OAuth state' }, 400);
  }

  try {
    const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: config.clientId,
        client_secret: config.clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }).toString(),
    });
    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange OAuth token');
    }
    const tokenPayload = (await tokenResponse.json()) as { access_token?: string };
    if (!tokenPayload.access_token) {
      throw new Error('OAuth token missing access token');
    }

    const profileResponse = await fetch(GOOGLE_USERINFO_URL, {
      headers: {
        authorization: `Bearer ${tokenPayload.access_token}`,
      },
    });
    if (!profileResponse.ok) {
      throw new Error('Failed to fetch Google profile');
    }
    const profile = (await profileResponse.json()) as {
      sub?: string;
      email?: string;
      name?: string;
      picture?: string;
    };

    if (!profile.sub || !profile.email) {
      throw new Error('Google profile missing required fields');
    }

    const user = upsertUserByGoogle({
      googleSub: profile.sub,
      email: profile.email,
      name: profile.name ?? null,
      picture: profile.picture ?? null,
    });
    const session = createSession(user.id, SESSION_TTL_MS);

    setCookie(c, SESSION_COOKIE_NAME, session.id, {
      path: '/',
      httpOnly: true,
      sameSite: 'Lax',
      secure: isSecureOrigin(origin),
      expires: new Date(session.expiresAt),
    });
    deleteCookie(c, OAUTH_STATE_COOKIE_NAME, { path: '/' });

    return c.redirect(parsedState.returnPath, 302);
  } catch {
    deleteCookie(c, OAUTH_STATE_COOKIE_NAME, { path: '/' });
    return c.redirect(`${origin}/?auth_error=oauth`, 302);
  }
});

authRouter.post('/logout', (c) => {
  const sessionId = getCookie(c, SESSION_COOKIE_NAME);
  if (sessionId) {
    deleteSession(sessionId);
  }
  deleteCookie(c, SESSION_COOKIE_NAME, { path: '/' });
  return c.json({ ok: true }, 200);
});

authRouter.get('/me', (c) => {
  const user = c.get('user');
  if (!user) {
    return c.json({ ok: true, user: null }, 200);
  }

  return c.json(
    {
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        createdAt: user.createdAt,
      },
    },
    200,
  );
});

export default authRouter;
