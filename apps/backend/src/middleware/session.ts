import type { MiddlewareHandler } from 'hono';
import { getCookie } from 'hono/cookie';

import { getSessionWithUser } from '../db/index.js';
import type { SessionVariables } from '../types/session.js';

export const sessionMiddleware: MiddlewareHandler<{ Variables: SessionVariables }> = async (c, next) => {
  const sessionId = getCookie(c, 'atx_session');
  if (!sessionId) {
    c.set('user', null);
    c.set('session', null);
    await next();
    return;
  }

  const sessionWithUser = getSessionWithUser(sessionId);
  if (!sessionWithUser) {
    c.set('user', null);
    c.set('session', null);
    await next();
    return;
  }

  c.set('user', sessionWithUser.user);
  c.set('session', sessionWithUser.session);
  await next();
};
