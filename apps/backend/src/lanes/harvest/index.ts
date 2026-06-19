import { inquiryPayloadSchema } from '@ai-transformation/shared';
import { Hono } from 'hono';

import { insertContribution } from '../../db/index.js';
import type { SessionVariables } from '../../types/session.js';

const harvestRouter = new Hono<{ Variables: SessionVariables }>();

function getValidationErrorMessage(error: {
  issues: Array<{ message: string }>;
  flatten: () => {
    formErrors: string[];
    fieldErrors: Record<string, string[] | undefined>;
  };
}): string {
  const firstIssue = error.issues[0]?.message;
  if (firstIssue) {
    return firstIssue;
  }
  const flattened = error.flatten();
  const flattenedMessage =
    flattened.formErrors[0] ??
    Object.values(flattened.fieldErrors).flat()[0] ??
    'Invalid request body';
  return flattenedMessage;
}

harvestRouter.post('/inquiries', async (c) => {
  const body = await c.req.json();
  const parsed = inquiryPayloadSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ ok: false, error: getValidationErrorMessage(parsed.error) }, 400);
  }

  const id = crypto.randomUUID();
  const user = c.get('user');
  insertContribution({
    id,
    source: 'web_inquiry',
    site: parsed.data.site ?? null,
    userId: user?.id,
    email: parsed.data.email,
    name: parsed.data.name ?? null,
    body: parsed.data.question,
    status: 'new',
    metadata: '{}',
    createdAt: new Date().toISOString(),
  });

  return c.json({ ok: true, id }, 201);
});

export default harvestRouter;
