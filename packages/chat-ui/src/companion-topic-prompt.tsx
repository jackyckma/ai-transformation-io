'use client';

import { requestOpenCompanion, requestOpenCompanionWithMessage } from './companion-nav';

type CompanionTopicPromptProps = {
  topic: string;
  message?: string;
  className?: string;
};

function buildDefaultMessage(topic: string): string {
  return `I'm reading about "${topic}". What should I know or do next?`;
}

export function CompanionTopicPrompt({ topic, message, className }: CompanionTopicPromptProps) {
  const prompt = message ?? buildDefaultMessage(topic);

  return (
    <aside
      className={
        className ??
        'rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-4 md:px-5 md:py-5'
      }
      aria-labelledby="companion-topic-title"
    >
      <p id="companion-topic-title" className="text-xs font-light tracking-wide text-[var(--muted)]">
        Companion
      </p>
      <p className="mt-2 text-sm font-light leading-relaxed text-[var(--muted)]">
        Ask about this topic — answers grounded in this site&apos;s content. No sign-in required.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => requestOpenCompanionWithMessage(prompt)}
          className="inline-flex min-h-9 items-center rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--accent-fg)] transition hover:opacity-90"
        >
          Ask about this
        </button>
        <button
          type="button"
          onClick={requestOpenCompanion}
          className="inline-flex min-h-9 items-center rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-light text-[var(--foreground)] transition hover:border-[var(--accent)]"
        >
          Open companion
        </button>
      </div>
    </aside>
  );
}
