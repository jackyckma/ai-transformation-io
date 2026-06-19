import { assessmentScoreRequestSchema } from '@ai-transformation/shared';
import { Hono } from 'hono';

import { getQuestionBank } from './bank.js';
import { scoreAssessment, validateAssessmentAnswers } from './scoring.js';

const assessmentRouter = new Hono();

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

assessmentRouter.get('/questions', (c) => {
  const bank = getQuestionBank();
  return c.json(bank, 200);
});

assessmentRouter.post('/score', async (c) => {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ ok: false, error: 'Invalid request body' }, 400);
  }

  const parsed = assessmentScoreRequestSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ ok: false, error: getValidationErrorMessage(parsed.error) }, 400);
  }

  const bank = getQuestionBank();
  const validated = validateAssessmentAnswers(bank, parsed.data);
  if (!validated.ok) {
    return c.json({ ok: false, error: validated.error }, 400);
  }

  return c.json(scoreAssessment(bank, validated.answers), 200);
});

export default assessmentRouter;
