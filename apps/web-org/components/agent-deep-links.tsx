import { buildExternalAgentHint, buildExternalAgentLinks } from '@ai-transformation/shared';

type AgentLinkProps = {
  title: string;
  canonicalUrl: string;
  suggestedPrompt?: string;
};

/**
 * Discreet "open this page in an external agent" links (ChatGPT / Claude). These
 * are deliberately subordinate — small underlined text beside the on-site Ask
 * actions, never a hero CTA. New tab so the reader keeps their place.
 */
export function AgentDeepLinks({ title, canonicalUrl, suggestedPrompt }: AgentLinkProps) {
  const links = buildExternalAgentLinks({ title, canonicalUrl, site: 'org', suggestedPrompt });
  return (
    <span className="inline-flex items-center gap-x-3">
      <span className="text-[var(--secondary)]">Open in</span>
      {links.map((link) => (
        <a
          key={link.provider}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--muted)] underline decoration-[var(--border)] underline-offset-4 hover:text-[var(--accent)] hover:decoration-[var(--accent)]"
        >
          {link.provider === 'chatgpt' ? 'ChatGPT' : 'Claude'}
        </a>
      ))}
    </span>
  );
}

/**
 * Machine-readable agent hint embedded as application/json so visiting agents can
 * discover the canonical URL + suggested prompts without scraping rendered HTML.
 */
export function AgentHintScript({ title, canonicalUrl, suggestedPrompt }: AgentLinkProps) {
  const hint = buildExternalAgentHint({ title, canonicalUrl, site: 'org', suggestedPrompt });
  return (
    <script
      type="application/json"
      data-agent-hint="page"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(hint) }}
    />
  );
}
