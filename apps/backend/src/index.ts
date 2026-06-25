import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';

import assessmentRouter from './lanes/assessment/index.js';
import agentRouter from './lanes/agent/index.js';
import agentProtocolRouter from './lanes/agent-protocol/index.js';
import { handleAgentEntry } from './lanes/agent-protocol/entry.js';
import authRouter from './lanes/auth/index.js';
import chatRouter from './lanes/chat/index.js';
import communityRouter from './lanes/community/index.js';
import editorialRouter from './lanes/editorial-supply/index.js';
import harvestRouter from './lanes/harvest/index.js';
import newsletterInternalRouter from './lanes/newsletter/internal.js';
import newsletterRouter from './lanes/newsletter/index.js';
import objectsRouter from './lanes/objects/index.js';
import { sessionMiddleware } from './middleware/session.js';
import type { SessionVariables } from './types/session.js';

export function createApp() {
  const app = new Hono<{ Variables: SessionVariables }>();

  app.use(
    '*',
    cors({
      origin: [
        'http://localhost:3002',
        'http://localhost:3003',
        'https://ai-transformation.io',
        'https://www.ai-transformation.io',
        'https://ai-transformation.org',
        'https://www.ai-transformation.org',
      ],
      credentials: true,
    }),
  );

  app.use('/api/*', sessionMiddleware);

  app.get('/api/health', (c) =>
    c.json({
      ok: true,
      service: 'backend',
      version: '0.1.0-chat-v1',
    }),
  );

  app.get('/api/agent', handleAgentEntry);

  app.route('/api', harvestRouter);
  app.route('/api', objectsRouter);
  app.route('/api', communityRouter);
  app.route('/api', chatRouter);
  app.route('/api', newsletterRouter);
  app.route('/api/internal/agent', agentRouter);
  app.route('/api/internal/newsletter', newsletterInternalRouter);
  app.route('/api/internal/editorial', editorialRouter);
  app.route('/api/auth', authRouter);
  app.route('/api/assessment', assessmentRouter);
  app.route('/api/v1', objectsRouter);
  app.route('/api/v1', communityRouter);
  app.route('/api/v1', agentProtocolRouter);

  return app;
}

export const app = createApp();

if (process.env.NODE_ENV !== 'test') {
  const port = Number(process.env.PORT ?? 3001);
  console.log(`Backend listening on http://127.0.0.1:${port}`);
  serve({ fetch: app.fetch, port, hostname: '127.0.0.1' });
}
