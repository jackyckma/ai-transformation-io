'use client';

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
  const href = `/ask?message=${encodeURIComponent(prompt)}`;

  return (
    <aside
      className={
        className ??
        'rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-4 md:px-5 md:py-5'
      }
      aria-labelledby="companion-topic-title"
    >
      <p id="companion-topic-title" className="text-xs font-normal uppercase tracking-wide text-[var(--secondary)]">
        Companion
      </p>
      <p className="mt-2 text-sm font-normal leading-relaxed text-[var(--muted)]">
        Ask about this topic — answers grounded in this site&apos;s content.
      </p>
      <a
        href={href}
        className="mt-4 inline-flex min-h-9 items-center rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--accent-fg)] transition hover:opacity-90"
      >
        Ask about this →
      </a>
    </aside>
  );
}
