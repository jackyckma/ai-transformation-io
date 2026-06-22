type ChatCompletionMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

type GenerateReplyInput = {
  site: 'io' | 'org';
  history: Array<{ role: 'user' | 'assistant'; content: string }>;
  userMessage: string;
  contextSnippets: string[];
};

export type LlmConfig = {
  apiKey: string;
  baseUrl: string;
  model: string;
  provider: 'minimax' | 'openai-compatible';
};

const MINIMAX_BASE_URL = 'https://api.minimax.io/v1';
const DEFAULT_MINIMAX_MODEL = 'MiniMax-M3';

export function resolveLlmConfig(): LlmConfig {
  const minimaxKey = process.env.MINIMAX_API_KEY?.trim() || '';
  const chatKey = process.env.CHAT_LLM_API_KEY?.trim() || '';
  const openaiKey = process.env.OPENAI_API_KEY?.trim() || '';
  const apiKey = minimaxKey || chatKey || openaiKey;

  const explicitBase =
    process.env.CHAT_LLM_BASE_URL?.trim() || process.env.OPENAI_BASE_URL?.trim() || '';
  const baseUrl = (
    explicitBase ||
    (minimaxKey ? MINIMAX_BASE_URL : 'https://hnd1.aihub.zeabur.ai/v1')
  ).replace(/\/$/, '');

  const model =
    process.env.CHAT_LLM_MODEL?.trim() ||
    process.env.MINIMAX_MODEL?.trim() ||
    DEFAULT_MINIMAX_MODEL;

  const provider: LlmConfig['provider'] = baseUrl.includes('minimax.io')
    ? 'minimax'
    : 'openai-compatible';

  return { apiKey, baseUrl, model, provider };
}

export function extractAssistantContent(message: {
  content?: string | null;
  reasoning_content?: string | null;
}): string | null {
  const raw = message.content?.trim() ?? '';
  if (raw) {
    const withoutThinking = raw
      .replace(/<redacted_thinking>[\s\S]*?<\/redacted_thinking>\s*/gi, '')
      .trim();
    if (withoutThinking) {
      return withoutThinking;
    }
  }

  const reasoning = message.reasoning_content?.trim();
  return reasoning && reasoning.length > 0 ? reasoning : null;
}

function buildSystemPrompt(site: 'io' | 'org', contextSnippets: string[]): string {
  const siteVoice =
    site === 'org'
      ? 'You are the Harvest Hub companion on ai-transformation.org — warm, experience-first, encouraging thoughtful field stories when relevant.'
      : 'You are the AI transformation companion on ai-transformation.io — pragmatic, anti-hype, oriented to enterprise leaders.';

  const guidance =
    site === 'org'
      ? 'Prefer linking to /learn articles, /stories, /prompts, or /ask when helpful. Do not invent community stories.'
      : 'Prefer linking to /frameworks, /playbook, /functions role guides, /assessment (org diagnostic), or /ask when helpful. Do not invent case studies.';

  const contextBlock =
    contextSnippets.length > 0
      ? `\n\nRelevant site content (ground answers in this when applicable):\n\n${contextSnippets.join('\n\n---\n\n')}`
      : '';

  return [
    siteVoice,
    guidance,
    'Answer in clear English. Keep replies concise (2–4 short paragraphs max).',
    'When you reference site pages, mention the path (e.g. /frameworks/governance).',
    'If unsure, say so and suggest where on the site to read next — do not fabricate statistics.',
    contextBlock,
  ].join('\n');
}

export async function generateChatReply(input: GenerateReplyInput): Promise<string | null> {
  const { apiKey, baseUrl, model, provider } = resolveLlmConfig();
  if (!apiKey) {
    return null;
  }

  const messages: ChatCompletionMessage[] = [
    { role: 'system', content: buildSystemPrompt(input.site, input.contextSnippets) },
    ...input.history.slice(-8).map((item) => ({
      role: item.role,
      content: item.content,
    })),
    { role: 'user', content: input.userMessage },
  ];

  const body: Record<string, unknown> = {
    model,
    messages,
    temperature: 0.4,
    max_tokens: 700,
  };

  if (provider === 'minimax') {
    body.reasoning_split = true;
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string; reasoning_content?: string } }>;
  };
  const message = payload.choices?.[0]?.message;
  if (!message) {
    return null;
  }

  return extractAssistantContent(message);
}

export function isChatLlmConfigured(): boolean {
  return Boolean(resolveLlmConfig().apiKey);
}
