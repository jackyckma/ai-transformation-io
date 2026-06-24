import { OpenInAsk } from '@/components/open-in-ask';
import { SaveToContext } from '@/components/save-to-context';
import { insightAskActions } from '@/lib/ask-actions';
import { INSIGHT_KIND_LABEL, IO_INSIGHTS } from '@/lib/insights-data';

export function InsightsCards() {
  return (
    <ul className="space-y-5">
      {IO_INSIGHTS.map((card) => (
        <li
          key={card.id}
          className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 md:p-6"
        >
          <div className="flex items-center gap-2 text-[11px] font-normal uppercase tracking-[0.12em] text-[var(--secondary)]">
            <span>{INSIGHT_KIND_LABEL[card.kind]}</span>
            <span aria-hidden>·</span>
            <span>{card.source}</span>
          </div>
          <h2 className="font-serif mt-2 text-xl font-normal leading-snug tracking-tight">
            <a
              href={card.href}
              rel="noopener noreferrer"
              className="text-[var(--foreground)] transition hover:text-[var(--accent)]"
            >
              {card.title}
            </a>
          </h2>
          <p className="mt-3 text-sm font-light leading-relaxed text-[var(--muted)]">{card.summary}</p>
          <p className="mt-3 border-l-2 border-[var(--accent)]/40 pl-3 text-sm font-light italic leading-relaxed text-[var(--foreground)]">
            What this means: {card.interpretation}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <OpenInAsk contextId={card.id} actions={insightAskActions(card.title, card.source)} />
            <SaveToContext target={{ targetType: 'object', targetId: card.id }} title={card.title} />
          </div>
        </li>
      ))}
    </ul>
  );
}
