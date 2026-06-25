type ChatSite = 'io' | 'org';

type CompanionAskStripProps = {
  site: ChatSite;
  href?: string;
  label?: string;
  description?: string;
};

const DEFAULT_LABEL: Record<ChatSite, string> = {
  io: 'Have a question? Open Ask →',
  org: 'Have a question? Open Ask →',
};

const DEFAULT_DESCRIPTION: Record<ChatSite, string> = {
  io: "Get grounded guidance from this site's library and insights.",
  org: 'Get grounded guidance from the community and knowledge commons.',
};

export function CompanionAskStrip({
  site,
  href = '/ask',
  label,
  description,
}: CompanionAskStripProps) {
  const resolvedLabel = label ?? DEFAULT_LABEL[site];
  const resolvedDescription = description ?? DEFAULT_DESCRIPTION[site];

  return (
    <aside
      aria-label="Open Ask"
      className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3"
    >
      <a
        href={href}
        className="group flex w-full items-center justify-between gap-3 rounded-lg text-left outline-none transition hover:text-[var(--foreground)] focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--card)]"
      >
        <div className="min-w-0">
          <p className="font-serif text-base font-normal tracking-tight text-[var(--foreground)]">
            {resolvedLabel}
          </p>
          <p className="mt-1 text-sm font-light leading-relaxed text-[var(--muted)]">
            {resolvedDescription}
          </p>
        </div>
        <span
          aria-hidden="true"
          className="shrink-0 text-sm font-light text-[var(--accent)] transition group-hover:translate-x-0.5"
        >
          Open
        </span>
      </a>
    </aside>
  );
}
