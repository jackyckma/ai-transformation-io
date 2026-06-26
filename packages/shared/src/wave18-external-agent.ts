import { z } from 'zod';

export const externalAgentProviderSchema = z.enum(['chatgpt', 'claude']);
export type ExternalAgentProvider = z.infer<typeof externalAgentProviderSchema>;

export const externalAgentSiteSchema = z.enum(['io', 'org']);
export type ExternalAgentSite = z.infer<typeof externalAgentSiteSchema>;

export type ExternalAgentLinkInput = {
  title: string;
  canonicalUrl: string;
  suggestedPrompt?: string;
  site: ExternalAgentSite;
};

export type ExternalAgentLink = {
  provider: ExternalAgentProvider;
  label: string;
  url: string;
};

const CHATGPT_COMPOSE_BASE = 'https://chatgpt.com/';
const CLAUDE_COMPOSE_BASE = 'https://claude.ai/new';

const PROVIDER_LABELS: Record<ExternalAgentProvider, string> = {
  chatgpt: 'Open in ChatGPT',
  claude: 'Open in Claude',
};

/**
 * Default prompt an external agent receives: orient it to the page so the human
 * can paste-and-go. Kept short so the encoded query stays well within URL limits.
 */
export function buildSuggestedAgentPrompt(input: {
  title: string;
  canonicalUrl: string;
  site: ExternalAgentSite;
}): string {
  const source = input.site === 'org' ? 'AI Transformation Harvest Hub' : 'AI Transformation';
  const title = input.title.trim() || 'this page';
  return [
    `Read this ${source} page and help me understand and apply it: "${title}".`,
    input.canonicalUrl.trim(),
  ]
    .filter((line) => line.length > 0)
    .join('\n');
}

function resolvePrompt(input: ExternalAgentLinkInput): string {
  const explicit = input.suggestedPrompt?.trim();
  if (explicit) {
    return explicit;
  }
  return buildSuggestedAgentPrompt({
    title: input.title,
    canonicalUrl: input.canonicalUrl,
    site: input.site,
  });
}

export function buildChatGptDeepLink(input: ExternalAgentLinkInput): string {
  const prompt = resolvePrompt(input);
  const params = new URLSearchParams({ q: prompt });
  return `${CHATGPT_COMPOSE_BASE}?${params.toString()}`;
}

export function buildClaudeDeepLink(input: ExternalAgentLinkInput): string {
  const prompt = resolvePrompt(input);
  const params = new URLSearchParams({ q: prompt });
  return `${CLAUDE_COMPOSE_BASE}?${params.toString()}`;
}

export function buildExternalAgentLinks(input: ExternalAgentLinkInput): ExternalAgentLink[] {
  return [
    { provider: 'chatgpt', label: PROVIDER_LABELS.chatgpt, url: buildChatGptDeepLink(input) },
    { provider: 'claude', label: PROVIDER_LABELS.claude, url: buildClaudeDeepLink(input) },
  ];
}

/**
 * Machine-readable hint embedded on detail pages (script type="application/json"
 * or a data attribute) so visiting agents can discover the canonical URL +
 * suggested prompts without scraping rendered HTML.
 */
export type ExternalAgentHint = {
  url: string;
  title: string;
  site: ExternalAgentSite;
  suggestedPrompts: string[];
  deepLinks: ExternalAgentLink[];
};

export function buildExternalAgentHint(input: ExternalAgentLinkInput): ExternalAgentHint {
  const prompt = resolvePrompt(input);
  return {
    url: input.canonicalUrl,
    title: input.title,
    site: input.site,
    suggestedPrompts: [prompt],
    deepLinks: buildExternalAgentLinks({ ...input, suggestedPrompt: prompt }),
  };
}
