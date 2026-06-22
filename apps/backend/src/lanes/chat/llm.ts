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

function resolveLlmConfig() {
  const apiKey =
    process.env.CHAT_LLM_API_KEY?.trim() ||
    process.env.OPENAI_API_KEY?.trim() ||
    process.env.MINIMAX_API_KEY?.trim() ||
    '';
  const baseUrl = (
    process.env.CHAT_LLM_BASE_URL?.trim() ||
    process.env.OPENAI_BASE_URL?.trim() ||
    'https://hnd1.aihub.zeabur.ai/v1'
  ).replace(/\/$/, '');
  const model =
    process.env.CHAT_LLM_MODEL?.trim() ||
    process.env.MINIMAX_MODEL?.trim() ||
    'MiniMax-M2.1';
  return { apiKey, baseUrl, model };
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
  const { apiKey, baseUrl, model } = resolveLlmConfig();
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

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.4,
      max_tokens: 700,
    }),
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = payload.choices?.[0]?.message?.content?.trim();
  return content && content.length > 0 ? content : null;
}

export function isChatLlmConfigured(): boolean {
  return Boolean(resolveLlmConfig().apiKey);
}
