import type { Metadata } from 'next';
import Link from 'next/link';

import { InsightsCards } from '@/components/insights-cards';
import { PageIntro } from '@/components/page-intro';
import { PageShell } from '@/components/page-shell';

export const metadata: Metadata = {
  title: 'Insights',
  description:
    'Curated external benchmarks, datasets, and surveys with short interpretation for enterprise AI transformation.',
};

export default function InsightsPage() {
  return (
    <PageShell>
      <PageIntro
        eyebrow="Insights"
        title="Insights"
        description="External benchmarks, datasets, and surveys — with a short read on what each means for enterprise leaders. Sign in to reorder by your role and industry."
      />

      <InsightsCards />

      <section className="mt-12 rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 md:p-6">
        <p className="text-[11px] font-normal uppercase tracking-[0.12em] text-[var(--secondary)]">
          Diagnostic
        </p>
        <h2 className="font-serif mt-2 text-xl font-normal tracking-tight">
          Three Gaps organizational assessment
        </h2>
        <p className="mt-3 text-sm font-light leading-relaxed text-[var(--muted)]">
          A 36-question diagnostic across work redesign, governance, and value measurement — one
          Insight product among the benchmarks above, not a personal quiz.
        </p>
        <Link
          href="/insights/assessment"
          className="mt-5 inline-flex min-h-9 items-center rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--accent-fg)] transition hover:opacity-90"
        >
          Start the assessment
        </Link>
      </section>
    </PageShell>
  );
}
