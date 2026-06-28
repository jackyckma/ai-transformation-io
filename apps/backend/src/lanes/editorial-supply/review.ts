import type { EditorialAgentReview, EditorialSubstanceDimensions } from '@ai-transformation/shared';

import { isChatLlmConfigured, resolveLlmConfig } from '../chat/llm.js';

type ReviewInput = {
  title: string | null;
  body: string;
  objectType: string;
  type: string;
};

type AssistantMessage = {
  content?: string | null;
  reasoning_content?: string | null;
};

const MAX_BODY_CHARS = 6000;

const SUBSTANCE_DIMENSION_KEYS: Array<keyof EditorialSubstanceDimensions> = [
  'claim_density',
  'specificity',
  'argument_coherence',
  'falsifiable_stance',
  'first_hand',
];

const REVIEW_FLAG_HINTS = [
  'ai-artifact',
  'inconsistent',
  'logic-gap',
  'low-claim-density',
  'specificity-gap',
  'argument-incoherence',
  'padding',
  'consensus-only',
  'stranger-test-fail',
  'no-first-hand',
] as const;

function buildReviewSystemPrompt(): string {
  return [
    'You are an editorial reviewer for an enterprise AI-transformation knowledge and community platform.',
    'Substance and editorial fitness matter; polished AI prose or house tone are NOT primary criteria.',
    '',
    'Step 1 — technical checks (flag if present):',
    '- ai-artifact: garbled or unrelated sentences, obvious generation glitches',
    '- inconsistent: internal contradictions',
    '- logic-gap: non sequiturs; paragraphs could be reordered without the reader noticing',
    '',
    'Step 2 — substance (score each dimension 1–3; sum = substance_score, range 5–15):',
    '- claim_density: verifiable claims vs atmosphere / zero-information sentences',
    '- specificity: mechanism, case, or data vs concept buzzwords only',
    '- argument_coherence: logical dependency between sections (shuffle test)',
    '- falsifiable_stance: debatable positions vs all consensus',
    '- first_hand: author judgment or experience vs safe middle / second-hand summary',
    '',
    'Principles: So what? (padding), falsifiability, specificity ladder, stranger test, first-hand stance.',
    'Bands: 10–15 publishable substance; 6–9 needs enrichment; ≤5 rewrite likely faster than edit.',
    'Set score = round(substance_score / 15 * 100). Full rubric: docs/EDITORIAL_REVIEW_RUBRIC.md',
    '',
    'Return STRICT JSON only — no prose, no markdown fences — exactly:',
    `{"substance_score":<5-15>,"dimensions":{"claim_density":<1-3>,"specificity":<1-3>,"argument_coherence":<1-3>,"falsifiable_stance":<1-3>,"first_hand":<1-3>},"score":<0-100>,"flags":[<kebab flags from: ${REVIEW_FLAG_HINTS.join(', ')}>],"summary":"<1-2 sentences for the founder queue>"}`,
  ].join('\n');
}

function buildMessages(input: ReviewInput): Array<{ role: 'system' | 'user'; content: string }> {
  const system = buildReviewSystemPrompt();
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

function nowIso(): string {
  return new Date().toISOString();
}

function stripThinkingTags(raw: string): string {
  return raw
    .replace(/<think>[\s\S]*?<\/redacted_thinking>\s*/gi, '')
    .replace(/<think>[\s\S]*?<\/think>\s*/gi, '')
    .replace(/[\s\S]*?<\/think>\s*/gi, '')
    .trim();
}

function stripJsonFences(raw: string): string {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenced?.[1]) {
    return fenced[1].trim();
  }
  return trimmed;
}

/** Pull the first balanced `{...}` object from prose or fenced JSON. */
export function extractJsonObject(raw: string): string | null {
  const trimmed = stripJsonFences(raw.trim());
  if (!trimmed) {
    return null;
  }

  try {
    JSON.parse(trimmed);
    return trimmed;
  } catch {
    // fall through — model may wrap JSON in short prose
  }

  const start = trimmed.indexOf('{');
  if (start === -1) {
    return null;
  }

  let depth = 0;
  for (let index = start; index < trimmed.length; index += 1) {
    const char = trimmed[index];
    if (char === '{') {
      depth += 1;
    } else if (char === '}') {
      depth -= 1;
      if (depth === 0) {
        const candidate = trimmed.slice(start, index + 1);
        try {
          JSON.parse(candidate);
          return candidate;
        } catch {
          return null;
        }
      }
    }
  }

  return null;
}

function collectMessageTextCandidates(message: AssistantMessage): string[] {
  const seen = new Set<string>();
  const candidates: string[] = [];
  const add = (value: string | null | undefined) => {
    const trimmed = value?.trim();
    if (!trimmed || seen.has(trimmed)) {
      return;
    }
    seen.add(trimmed);
    candidates.push(trimmed);
  };

  const rawContent = message.content?.trim() ?? '';
  const strippedContent = stripThinkingTags(rawContent);

  add(strippedContent);
  add(rawContent);
  add(message.reasoning_content?.trim());

  if (strippedContent && message.reasoning_content?.trim()) {
    add(`${strippedContent}\n${message.reasoning_content.trim()}`);
  }

  return candidates;
}

function readDimensionScores(value: Record<string, unknown>): EditorialSubstanceDimensions | undefined {
  const raw = value.dimensions;
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return undefined;
  }
  const dimensions = {} as EditorialSubstanceDimensions;
  for (const key of SUBSTANCE_DIMENSION_KEYS) {
    const entry = (raw as Record<string, unknown>)[key];
    const score = typeof entry === 'number' ? entry : Number(entry);
    if (!Number.isFinite(score) || score < 1 || score > 3) {
      return undefined;
    }
    dimensions[key] = Math.round(score);
  }
  return dimensions;
}

function sumDimensions(dimensions: EditorialSubstanceDimensions): number {
  return SUBSTANCE_DIMENSION_KEYS.reduce((total, key) => total + dimensions[key], 0);
}

function coerceReview(raw: string, model: string): EditorialAgentReview | null {
  const jsonText = extractJsonObject(raw);
  if (!jsonText) {
    return null;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return null;
  }
  const value = parsed as Record<string, unknown>;
  const summary = typeof value.summary === 'string' ? value.summary.trim() : '';
  if (summary.length === 0) {
    return null;
  }

  const dimensions = readDimensionScores(value);
  let substanceScore =
    typeof value.substance_score === 'number'
      ? value.substance_score
      : Number(value.substance_score);
  if (dimensions) {
    const dimensionSum = sumDimensions(dimensions);
    if (Number.isFinite(substanceScore)) {
      substanceScore = Math.max(5, Math.min(15, Math.round(substanceScore)));
      if (Math.abs(substanceScore - dimensionSum) > 1) {
        substanceScore = dimensionSum;
      }
    } else {
      substanceScore = dimensionSum;
    }
  } else if (Number.isFinite(substanceScore)) {
    substanceScore = Math.max(5, Math.min(15, Math.round(substanceScore)));
  } else {
    substanceScore = undefined;
  }

  let score = typeof value.score === 'number' ? value.score : Number(value.score);
  if (!Number.isFinite(score) && substanceScore !== undefined) {
    score = Math.round((substanceScore / 15) * 100);
  }
  if (!Number.isFinite(score)) {
    return null;
  }
  score = Math.max(0, Math.min(100, Math.round(score)));

  const flags = Array.isArray(value.flags)
    ? value.flags
        .filter((flag): flag is string => typeof flag === 'string')
        .map((flag) => flag.trim())
        .filter((flag) => flag.length > 0)
    : [];

  const review: EditorialAgentReview = {
    score,
    flags,
    summary,
    reviewedAt: nowIso(),
    model,
  };

  if (substanceScore !== undefined && dimensions) {
    return {
      ...review,
      substance_score: substanceScore,
      dimensions,
    };
  }

  return review;
}

/** Parse editorial JSON from MiniMax/OpenAI assistant payloads (exported for tests). */
export function parseReviewFromAssistantMessage(
  message: AssistantMessage,
  model: string,
): EditorialAgentReview | null {
  for (const candidate of collectMessageTextCandidates(message)) {
    const review = coerceReview(candidate, model);
    if (review) {
      return review;
    }
  }
  return null;
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
      max_tokens: 700,
      stream: false,
      response_format: { type: 'json_object' },
    };
    if (config.provider === 'minimax') {
      body.reasoning_split = true;
    }

    let response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok && body.response_format) {
      const { response_format: _removed, ...retryBody } = body;
      response = await fetch(`${config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify(retryBody),
      });
    }

    if (!response.ok) {
      return { skipped: true, reviewedAt: nowIso(), reason: 'llm_error' };
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: AssistantMessage }>;
    };
    const message = payload.choices?.[0]?.message;
    if (!message) {
      return { skipped: true, reviewedAt: nowIso(), reason: 'malformed' };
    }

    const review = parseReviewFromAssistantMessage(message, config.model);
    if (!review) {
      return { skipped: true, reviewedAt: nowIso(), reason: 'malformed' };
    }
    return review;
  } catch {
    return { skipped: true, reviewedAt: nowIso(), reason: 'llm_error' };
  }
}
