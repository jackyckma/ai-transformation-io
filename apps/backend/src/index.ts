import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';

import assessmentRouter from './lanes/assessment/index.js';
import harvestRouter from './lanes/harvest/index.js';

const app = new Hono();

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

app.get('/api/health', (c) =>
  c.json({
    ok: true,
    service: 'backend',
    version: '0.1.0-wave0',
  }),
);

app.route('/api', harvestRouter);
app.route('/api/assessment', assessmentRouter);

const port = Number(process.env.PORT ?? 3001);

console.log(`Backend listening on http://127.0.0.1:${port}`);

serve({ fetch: app.fetch, port, hostname: '127.0.0.1' });
