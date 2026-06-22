import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';

import assessmentRouter from './lanes/assessment/index.js';
import agentRouter from './lanes/agent/index.js';
import agentProtocolRouter from './lanes/agent-protocol/index.js';
import authRouter from './lanes/auth/index.js';
import harvestRouter from './lanes/harvest/index.js';
import newsletterRouter from './lanes/newsletter/index.js';
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
      version: '0.1.0-wave8',
    }),
  );

  app.route('/api', harvestRouter);
  app.route('/api', newsletterRouter);
  app.route('/api/agent', agentRouter);
  app.route('/api/auth', authRouter);
  app.route('/api/assessment', assessmentRouter);
  app.route('/api/v1', agentProtocolRouter);

  return app;
}

export const app = createApp();

if (process.env.NODE_ENV !== 'test') {
  const port = Number(process.env.PORT ?? 3001);
  console.log(`Backend listening on http://127.0.0.1:${port}`);
  serve({ fetch: app.fetch, port, hostname: '127.0.0.1' });
}
