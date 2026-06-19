import { assessmentScoreRequestSchema, assessmentSessionSaveRequestSchema } from '@ai-transformation/shared';
import { Hono } from 'hono';

import { getAssessmentSession, upsertAssessmentSession } from '../../db/index.js';
import type { SessionVariables } from '../../types/session.js';
import { getQuestionBank } from './bank.js';
import { scoreAssessment, validateAssessmentAnswers } from './scoring.js';

const assessmentRouter = new Hono<{ Variables: SessionVariables }>();

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

assessmentRouter.get('/session', (c) => {
  const user = c.get('user');
  if (!user) {
    return c.json({ ok: false, error: 'Not authenticated' }, 401);
  }

  const savedSession = getAssessmentSession(user.id);
  if (!savedSession) {
    return c.json({ ok: true, session: null }, 200);
  }

  let answers: Record<string, number>;
  let lastScore: unknown = null;

  try {
    answers = JSON.parse(savedSession.answers) as Record<string, number>;
    lastScore = savedSession.lastScore ? JSON.parse(savedSession.lastScore) : null;
  } catch {
    return c.json({ ok: false, error: 'Failed to parse saved assessment session' }, 500);
  }

  return c.json(
    {
      ok: true,
      session: {
        answers,
        stepIndex: savedSession.stepIndex,
        lastScore,
        updatedAt: savedSession.updatedAt,
      },
    },
    200,
  );
});

assessmentRouter.post('/session', async (c) => {
  const user = c.get('user');
  if (!user) {
    return c.json({ ok: false, error: 'Not authenticated' }, 401);
  }

  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ ok: false, error: 'Invalid request body' }, 400);
  }

  const parsed = assessmentSessionSaveRequestSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ ok: false, error: getValidationErrorMessage(parsed.error) }, 400);
  }

  const result = upsertAssessmentSession({
    userId: user.id,
    answers: parsed.data.answers,
    stepIndex: parsed.data.stepIndex,
    lastScore: parsed.data.lastScore ?? null,
  });

  return c.json({ ok: true, updatedAt: result.updatedAt }, 200);
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
