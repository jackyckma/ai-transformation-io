'use client';

import Link from 'next/link';

type AskAction = {
  label: string;
  message: string;
};

type OpenInAskProps = {
  contextId: string;
  /** Prefill prompts surfaced as contextual actions (§6). */
  actions: AskAction[];
  className?: string;
};

function buildHref(contextId: string, message: string): string {
  const params = new URLSearchParams({ mode: 'ask', context: contextId, message });
  return `/ask?${params.toString()}`;
}

export function OpenInAsk({ contextId, actions, className = '' }: OpenInAskProps) {
  if (actions.length === 0) return null;

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`.trim()}>
      {actions.map((action, index) => (
        <Link
          key={action.label}
          href={buildHref(contextId, action.message)}
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-normal transition ${
            index === 0
              ? 'border-[var(--accent)]/40 bg-[var(--card)] text-[var(--foreground)] hover:border-[var(--accent)]'
              : 'border-[var(--border)] text-[var(--secondary)] hover:border-[var(--accent)]/40 hover:text-[var(--foreground)]'
          }`}
        >
          {index === 0 ? <AskGlyph /> : null}
          {action.label}
        </Link>
      ))}
    </div>
  );
}

function AskGlyph() {
  return (
    <svg aria-hidden className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M6 7.5c0-2.4 2.7-4.5 6-4.5s6 2.1 6 4.5-2.7 4.5-6 4.5c-.8 0-1.6-.1-2.3-.4L6 17l1.4-3.5" />
    </svg>
  );
}

export function libraryAskActions(title: string): AskAction[] {
  return [
    { label: 'Open in Ask', message: `I'm reading "${title}". Walk me through the key ideas.` },
    { label: 'Apply this', message: `How do I apply "${title}" in my organization?` },
  ];
}

export function insightAskActions(title: string, source: string): AskAction[] {
  return [
    {
      label: 'Interpret for my role',
      message: `Interpret "${title}" (${source}) for my role and industry.`,
    },
  ];
}
