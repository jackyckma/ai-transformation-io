'use client';

import { requestOpenCompanion, requestOpenCompanionWithMessage } from './companion-nav';

type ChatSite = 'io' | 'org';

const STARTERS: Record<ChatSite, string[]> = {
  io: [
    'How should we approach AI governance?',
    'Where do we start with AI transformation?',
    'How is this different from deploying copilots?',
  ],
  org: [
    'How do I share a field story?',
    'What should I read first in the community?',
    'How does the apprenticeship program work?',
  ],
};

type CompanionHomeEntryProps = {
  site: ChatSite;
};

export function CompanionHomeEntry({ site }: CompanionHomeEntryProps) {
  const starters = STARTERS[site];

  return (
    <section
      aria-labelledby="companion-home-title"
      className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 md:p-6"
    >
      <h2 id="companion-home-title" className="font-serif text-lg font-normal tracking-tight">
        Start with a question
      </h2>
      <p className="mt-2 text-sm font-light leading-relaxed text-[var(--muted)]">
        The companion answers from this site&apos;s frameworks and guides — no sign-in required. Pick a
        prompt or open the chat panel.
      </p>

      <ul className="mt-5 flex flex-col gap-2">
        {starters.map((question) => (
          <li key={question}>
            <button
              type="button"
              onClick={() => requestOpenCompanionWithMessage(question)}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-left text-sm font-light leading-snug transition hover:border-[var(--accent)]"
            >
              {question}
            </button>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={requestOpenCompanion}
        className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-[var(--accent-fg)] transition hover:opacity-90 sm:w-auto"
      >
        Open companion
      </button>
    </section>
  );
}
