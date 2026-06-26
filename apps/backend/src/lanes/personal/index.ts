import {
  rankSuggestionsRequestSchema,
  rankSuggestionsResponseSchema,
} from '@ai-transformation/shared';
import { Hono } from 'hono';

import { isChatLlmConfigured } from '../chat/llm.js';
import { rankSuggestionCandidates } from '../community/llm-rerank.js';
import {
  getValidationErrorMessage,
  requireResolvedUser,
  resolveRequester,
} from '../objects/index.js';
import type { SessionVariables } from '../../types/session.js';

const personalRouter = new Hono<{ Variables: SessionVariables }>();

personalRouter.post('/personal/rank-suggestions', async (c) => {
  const requester = resolveRequester(c);
  const user = requireResolvedUser(requester);
  if (!user) {
    return c.json({ ok: false, error: 'Not authenticated' }, 401);
  }

  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ ok: false, error: 'Invalid request body' }, 400);
  }
  const parsed = rankSuggestionsRequestSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ ok: false, error: getValidationErrorMessage(parsed.error) }, 400);
  }

  const limit = parsed.data.limit ?? parsed.data.candidates.length;

  let ranked = parsed.data.candidates.map((candidate) => ({
    id: candidate.id,
    reason: 'Ranked by rule-based order (deterministic fallback).',
  }));
  let llmAssisted = false;
  let rerankModel: string | undefined;

  if (parsed.data.useLlmRerank && isChatLlmConfigured()) {
    const result = await rankSuggestionCandidates({
      site: parsed.data.site,
      candidates: parsed.data.candidates,
      context: parsed.data.context,
    });
    if (result) {
      ranked = result.ranked;
      llmAssisted = true;
      rerankModel = result.rerankModel;
    }
  }

  const response = rankSuggestionsResponseSchema.parse({
    experimental: true,
    site: parsed.data.site,
    generatedAt: new Date().toISOString(),
    llmAssisted,
    ...(rerankModel ? { rerankModel } : {}),
    ranked: ranked.slice(0, limit),
  });
  return c.json(response);
});

export default personalRouter;
