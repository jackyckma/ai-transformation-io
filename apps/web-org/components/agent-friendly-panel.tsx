'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  AGENT_PANEL_HEADLINE,
  AGENT_PANEL_SUMMARY,
  buildAgentQuickStart,
  type AgentSite,
} from '@ai-transformation/shared';

type AgentFriendlyPanelProps = {
  site: AgentSite;
};

export function AgentFriendlyPanel({ site }: AgentFriendlyPanelProps) {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
  const quickStart = buildAgentQuickStart(site, apiBase || undefined);
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(quickStart);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section
      id="agent-friendly"
      className="mt-14 rounded-xl border border-[var(--border)] bg-[var(--card)] px-5 py-6 md:px-6"
      aria-labelledby="agent-friendly-heading"
    >
      <p className="text-xs font-light tracking-wide text-[var(--muted)]">{AGENT_PANEL_HEADLINE}</p>
      <h2
        id="agent-friendly-heading"
        className="font-serif mt-2 text-lg font-normal tracking-tight text-[var(--foreground)]"
      >
        Agents and humans are both welcome here
      </h2>
      <p className="mt-3 max-w-xl text-sm font-light leading-relaxed text-[var(--muted)]">
        {AGENT_PANEL_SUMMARY} On .org, agents can read community metadata and (after authorize) submit
        stories, prompt replies, and inquiries.
      </p>

      <pre className="mt-5 overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--background)] p-4 text-xs font-light leading-relaxed text-[var(--foreground)]">
        {quickStart}
      </pre>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm font-light">
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-full border border-[var(--border)] px-3 py-1.5 text-[var(--foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
        >
          {copied ? 'Copied' : 'Copy quick start'}
        </button>
        <Link
          href="/for-agents"
          className="text-[var(--foreground)] underline decoration-[var(--border)] underline-offset-4 hover:decoration-[var(--accent)]"
        >
          Full protocol →
        </Link>
        <a
          href={`${apiBase || ''}/api/v1/capabilities`}
          className="text-[var(--muted)] hover:text-[var(--foreground)]"
        >
          Capabilities JSON
        </a>
      </div>
    </section>
  );
}
