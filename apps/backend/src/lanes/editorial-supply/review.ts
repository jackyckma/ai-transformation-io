import type { EditorialAgentReview } from '@ai-transformation/shared';

import { extractAssistantContent, isChatLlmConfigured, resolveLlmConfig } from '../chat/llm.js';

type ReviewInput = {
  title: string | null;
  body: string;
  objectType: string;
  type: string;
};

const MAX_BODY_CHARS = 6000;

function nowIso(): string {
  return new Date().toISOString();
}

function buildMessages(input: ReviewInput): Array<{ role: 'system' | 'user'; content: string }> {
  const system = [
    'You are an editorial reviewer for an enterprise AI-transformation knowledge and community platform.',
    'The house voice is pragmatic and anti-hype, written for enterprise leaders.',
    'Assess one draft for editorial readiness: clarity, tone, factual risk, length, and on-brand fit.',
    'Return STRICT JSON only — no prose, no markdown fences — with this exact shape:',
    '{"score": <integer 0-100 editorial readiness>, "flags": [<short kebab strings e.g. "tone", "factual-risk", "length", "off-brand">], "summary": "<1-2 sentence editorial assessment>"}',
  ].join('\n');
  const user = [
    `Object type: ${input.objectType} / ${input.type}`,
    `Title: ${input.title ?? '(untitled)'}`,
    '',
    'Body:',
    input.body.slice(0, MAX_BODY_CHARS),
  ].join('\n');
  return [
    { role: 'system', content: system },
    { role: 'user', content: user },
  ];
}

function stripJsonFences(raw: string): string {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenced?.[1]) {
    return fenced[1].trim();
  }
  return trimmed;
}

function coerceReview(raw: string, model: string): EditorialAgentReview | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(stripJsonFences(raw));
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return null;
  }
  const value = parsed as Record<string, unknown>;
  const score = typeof value.score === 'number' ? value.score : Number(value.score);
  if (!Number.isFinite(score)) {
    return null;
  }
  const summary = typeof value.summary === 'string' ? value.summary.trim() : '';
  if (summary.length === 0) {
    return null;
  }
  const flags = Array.isArray(value.flags)
    ? value.flags
        .filter((flag): flag is string => typeof flag === 'string')
        .map((flag) => flag.trim())
        .filter((flag) => flag.length > 0)
    : [];
  return {
    score: Math.max(0, Math.min(100, Math.round(score))),
    flags,
    summary,
    reviewedAt: nowIso(),
    model,
  };
}

/**
 * Run an LLM editorial review over a single draft. Reuses the chat lane LLM
 * config/helpers. NEVER throws and NEVER changes publish state — on missing key
 * or any error it returns a `{ skipped: true }` result so the route still 200s.
 */
export async function reviewDraft(input: ReviewInput): Promise<EditorialAgentReview> {
  if (!isChatLlmConfigured()) {
    return { skipped: true, reviewedAt: nowIso(), reason: 'llm_not_configured' };
  }

  const config = resolveLlmConfig();
  try {
    const body: Record<string, unknown> = {
      model: config.model,
      messages: buildMessages(input),
      temperature: 0.2,
      max_tokens: 500,
      stream: false,
    };
    if (config.provider === 'minimax') {
      body.reasoning_split = true;
    }

    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return { skipped: true, reviewedAt: nowIso(), reason: 'llm_error' };
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string; reasoning_content?: string } }>;
    };
    const message = payload.choices?.[0]?.message;
    const content = message ? extractAssistantContent(message) : null;
    if (!content) {
      return { skipped: true, reviewedAt: nowIso(), reason: 'malformed' };
    }

    const review = coerceReview(content, config.model);
    if (!review) {
      return { skipped: true, reviewedAt: nowIso(), reason: 'malformed' };
    }
    return review;
  } catch {
    return { skipped: true, reviewedAt: nowIso(), reason: 'llm_error' };
  }
}
