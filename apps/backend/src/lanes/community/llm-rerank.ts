import { resolveLlmConfig } from '../chat/llm.js';

type RerankMessage = {
  role: 'system' | 'user';
  content: string;
};

const REASON_MAX_LENGTH = 240;
const PERSONAL_REASON_MAX_LENGTH = 400;

/**
 * Low-level call to the same OpenAI-compatible /chat/completions endpoint the
 * chat lane uses. Returns the raw assistant content, or null on any failure —
 * callers must treat null as "fall back to deterministic order" and never throw.
 */
async function requestLlmContent(messages: RerankMessage[]): Promise<string | null> {
  const config = resolveLlmConfig();
  if (!config.apiKey) {
    return null;
  }

  try {
    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages,
        temperature: 0,
        max_tokens: 900,
        stream: false,
      }),
    });
    if (!response.ok) {
      return null;
    }
    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string | null; reasoning_content?: string | null } }>;
    };
    const message = payload.choices?.[0]?.message;
    const content = message?.content?.trim() || message?.reasoning_content?.trim() || '';
    return content.length > 0 ? content : null;
  } catch {
    return null;
  }
}

/** Extract the first JSON value from a possibly fenced/prefixed LLM response. */
function parseJsonLoose(raw: string): unknown {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = (fenced?.[1] ?? raw).trim();
  try {
    return JSON.parse(candidate);
  } catch {
    // fall through to bracket scan
  }
  const start = candidate.search(/[[{]/);
  if (start === -1) {
    return null;
  }
  const openChar = candidate[start];
  const closeChar = openChar === '[' ? ']' : '}';
  const end = candidate.lastIndexOf(closeChar);
  if (end <= start) {
    return null;
  }
  try {
    return JSON.parse(candidate.slice(start, end + 1));
  } catch {
    return null;
  }
}

function sanitizeReasons(value: unknown, maxLength: number): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  const reasons: string[] = [];
  for (const item of value) {
    if (typeof item !== 'string') {
      continue;
    }
    const trimmed = item.trim().slice(0, maxLength);
    if (trimmed.length > 0) {
      reasons.push(trimmed);
    }
  }
  return reasons;
}

export type MatchRerankCandidate = {
  objectId: string;
  type: string;
  title: string;
  score: number;
  reasons: string[];
};

export type MatchRerankResult<T extends MatchRerankCandidate> = {
  candidates: T[];
  rerankModel: string;
};

/**
 * Ask the LLM to re-order the already-selected top candidates and refresh their
 * human-readable reasons. The candidate SET is never changed: on any error,
 * malformed output, or mismatched id set, returns null so the caller keeps the
 * deterministic rule-based order. Generic so callers keep their precise types.
 */
export async function rerankMatchCandidates<T extends MatchRerankCandidate>(input: {
  source: { type: string; title: string };
  candidates: T[];
}): Promise<MatchRerankResult<T> | null> {
  const candidates = input.candidates;
  if (candidates.length <= 1) {
    return null;
  }

  const config = resolveLlmConfig();
  const candidateLines = candidates
    .map(
      (candidate, index) =>
        `${index + 1}. objectId="${candidate.objectId}" type=${candidate.type} title=${JSON.stringify(
          candidate.title,
        )} currentReasons=${JSON.stringify(candidate.reasons)}`,
    )
    .join('\n');

  const messages: RerankMessage[] = [
    {
      role: 'system',
      content: [
        'You are an experimental re-ranking assistant for an enterprise AI-transformation community matcher.',
        'You are given a source community object and a fixed set of candidate matches.',
        'Re-order the candidates from most to least relevant and rewrite each reason to be concise and human-readable.',
        'You MUST use exactly the provided objectId values — never invent, drop, or duplicate an objectId.',
        'Respond with STRICT JSON only: an array of objects {"objectId": string, "reasons": string[]} ordered best-first. No prose, no code fences.',
      ].join(' '),
    },
    {
      role: 'user',
      content: [
        `Source object: type=${input.source.type} title=${JSON.stringify(input.source.title)}`,
        '',
        'Candidates:',
        candidateLines,
        '',
        'Return the re-ordered JSON array now.',
      ].join('\n'),
    },
  ];

  const content = await requestLlmContent(messages);
  if (!content) {
    return null;
  }

  const parsed = parseJsonLoose(content);
  if (!Array.isArray(parsed)) {
    return null;
  }

  const byId = new Map(candidates.map((candidate) => [candidate.objectId, candidate]));
  const orderedIds: string[] = [];
  const refreshedReasons = new Map<string, string[]>();
  const seen = new Set<string>();

  for (const entry of parsed) {
    if (!entry || typeof entry !== 'object') {
      return null;
    }
    const objectId = (entry as { objectId?: unknown }).objectId;
    if (typeof objectId !== 'string' || !byId.has(objectId) || seen.has(objectId)) {
      return null;
    }
    seen.add(objectId);
    orderedIds.push(objectId);
    refreshedReasons.set(objectId, sanitizeReasons((entry as { reasons?: unknown }).reasons, REASON_MAX_LENGTH));
  }

  if (orderedIds.length !== candidates.length) {
    return null;
  }

  const reordered = orderedIds.map((objectId) => {
    const original = byId.get(objectId)!;
    const reasons = refreshedReasons.get(objectId) ?? [];
    return {
      ...original,
      reasons: reasons.length > 0 ? reasons : original.reasons,
    };
  });

  return { candidates: reordered, rerankModel: config.model };
}

export type RankSuggestionInputCandidate = {
  id: string;
  title: string;
  summary?: string;
  kind?: string;
};

export type RankSuggestionContext = {
  followedTopics?: string[];
  profileSummary?: string;
  recentInterests?: string[];
  [key: string]: unknown;
};

export type RankSuggestionResult = {
  ranked: Array<{ id: string; reason: string }>;
  rerankModel: string;
};

/**
 * Ask the LLM to rank personalization candidates and produce one short reason
 * per id, constrained to the input id set. Returns null on any failure so the
 * caller falls back to deterministic input order with generic reasons.
 */
export async function rankSuggestionCandidates(input: {
  site: 'io' | 'org';
  candidates: RankSuggestionInputCandidate[];
  context?: RankSuggestionContext;
}): Promise<RankSuggestionResult | null> {
  const candidates = input.candidates;
  if (candidates.length === 0) {
    return null;
  }

  const config = resolveLlmConfig();
  const candidateLines = candidates
    .map(
      (candidate, index) =>
        `${index + 1}. id="${candidate.id}" kind=${candidate.kind ?? 'unknown'} title=${JSON.stringify(
          candidate.title,
        )} summary=${JSON.stringify(candidate.summary ?? '')}`,
    )
    .join('\n');

  const contextLines: string[] = [];
  if (input.context?.profileSummary) {
    contextLines.push(`Profile: ${input.context.profileSummary}`);
  }
  if (input.context?.followedTopics?.length) {
    contextLines.push(`Followed topics: ${input.context.followedTopics.join(', ')}`);
  }
  if (input.context?.recentInterests?.length) {
    contextLines.push(`Recent interests: ${input.context.recentInterests.join(', ')}`);
  }

  const siteLabel = input.site === 'org' ? 'the AI Transformation community/knowledge commons' : 'the AI Transformation library';

  const messages: RerankMessage[] = [
    {
      role: 'system',
      content: [
        `You are an experimental personalization ranker for ${siteLabel}.`,
        'Rank the provided candidates from most to least relevant for this member and give one short reason each.',
        'You MUST use exactly the provided id values — never invent or duplicate an id.',
        'Respond with STRICT JSON only: an array of objects {"id": string, "reason": string} ordered best-first. No prose, no code fences.',
      ].join(' '),
    },
    {
      role: 'user',
      content: [
        contextLines.length > 0 ? `Member context:\n${contextLines.join('\n')}` : 'Member context: (none provided)',
        '',
        'Candidates:',
        candidateLines,
        '',
        'Return the ranked JSON array now.',
      ].join('\n'),
    },
  ];

  const content = await requestLlmContent(messages);
  if (!content) {
    return null;
  }

  const parsed = parseJsonLoose(content);
  if (!Array.isArray(parsed)) {
    return null;
  }

  const validIds = new Set(candidates.map((candidate) => candidate.id));
  const seen = new Set<string>();
  const ranked: Array<{ id: string; reason: string }> = [];

  for (const entry of parsed) {
    if (!entry || typeof entry !== 'object') {
      continue;
    }
    const id = (entry as { id?: unknown }).id;
    if (typeof id !== 'string' || !validIds.has(id) || seen.has(id)) {
      continue;
    }
    const rawReason = (entry as { reason?: unknown }).reason;
    const reason =
      typeof rawReason === 'string' && rawReason.trim().length > 0
        ? rawReason.trim().slice(0, PERSONAL_REASON_MAX_LENGTH)
        : 'Ranked by experimental LLM assist.';
    seen.add(id);
    ranked.push({ id, reason });
  }

  if (ranked.length === 0) {
    return null;
  }

  for (const candidate of candidates) {
    if (!seen.has(candidate.id)) {
      ranked.push({ id: candidate.id, reason: 'Included by rule-based fallback.' });
    }
  }

  return { ranked, rerankModel: config.model };
}
