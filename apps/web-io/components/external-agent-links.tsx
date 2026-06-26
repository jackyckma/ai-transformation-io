import {
  buildExternalAgentLinks,
  getSiteOrigin,
  type ExternalAgentProvider,
} from '@ai-transformation/shared';

type ExternalAgentLinksProps = {
  title: string;
  /** Page path relative to the .io origin, e.g. `/library/<slug>` or `/insights#<id>`. */
  path: string;
  suggestedPrompt?: string;
  className?: string;
};

const PROVIDER_SHORT_LABEL: Record<ExternalAgentProvider, string> = {
  chatgpt: 'ChatGPT',
  claude: 'Claude',
};

/**
 * Discreet, secondary affordance: open the page in an external agent (ChatGPT /
 * Claude) with a pre-filled prompt. Subordinate to Open in Ask — small, muted,
 * new tab. Reuses the shared deep-link builder so URLs stay correct.
 */
export function ExternalAgentLinks({
  title,
  path,
  suggestedPrompt,
  className = '',
}: ExternalAgentLinksProps) {
  const canonicalUrl = `${getSiteOrigin('io')}${path}`;
  const links = buildExternalAgentLinks({ title, canonicalUrl, suggestedPrompt, site: 'io' });

  return (
    <div
      className={`flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-light text-[var(--muted)] ${className}`.trim()}
    >
      <span>Continue with an external agent</span>
      {links.map((link, index) => (
        <span key={link.provider} className="inline-flex items-center gap-2">
          {index > 0 ? <span aria-hidden>·</span> : null}
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            title={link.label}
            className="underline decoration-[var(--border)] underline-offset-2 transition hover:text-[var(--foreground)] hover:decoration-[var(--accent)]"
          >
            {PROVIDER_SHORT_LABEL[link.provider]}
          </a>
        </span>
      ))}
    </div>
  );
}
