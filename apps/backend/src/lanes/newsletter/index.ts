import { Hono } from 'hono';

import { getNewsletterProvider } from './provider.js';

const newsletterRouter = new Hono();

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
  return c.json(
    {
      ok: false,
      error: 'not_implemented',
      message: 'Inbound reply parsing ships in Wave 10 (Cloudflare Email Worker). Use manual forward to info@ for pilot.',
    },
    501,
  );
});

newsletterRouter.post('/newsletter/subscribe', async (c) => {
  return c.json(
    {
      ok: false,
      error: 'not_available',
      message: 'Public subscribe UI deferred until Wave 10 pilot.',
    },
    501,
  );
});

newsletterRouter.post('/newsletter/unsubscribe', async (c) => {
  return c.json(
    {
      ok: false,
      error: 'not_available',
      message: 'Public unsubscribe deferred until Wave 10 pilot.',
    },
    501,
  );
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
