import Link from 'next/link';
import { getPagesByPillar } from '@ai-transformation/content';
import { ContentCard } from '@/components/content-card';
import { EditorialHero } from '@/components/editorial-hero';
import { SectionLabel } from '@/components/section-label';

const gaps = [
  {
    num: '01',
    title: 'Work redesign',
    body: 'End-to-end workflow change — not copilot login counts.',
  },
  {
    num: '02',
    title: 'Governance',
    body: 'Clear autonomy boundaries, accountability, and monitoring.',
  },
  {
    num: '03',
    title: 'Value measurement',
    body: 'Outcome hypotheses and multidimensional ROI before scale.',
  },
];

export default function HomePage() {
  const frameworks = getPagesByPillar('framework').slice(0, 4);
  const playbook = getPagesByPillar('resource').slice(0, 3);

  return (
    <>
      <EditorialHero
        eyebrow="Enterprise AI transformation"
        title="Close the gap between AI deployment and operating model change"
        subtitle="Practical frameworks and playbook content for leaders — grounded in research, built for visitors arriving from search."
        primaryCta={{ href: '/frameworks/what-is-ai-transformation', label: 'Start with the explainer' }}
        secondaryCta={{ href: '/playbook', label: 'Browse the playbook' }}
      />

      <div className="mx-auto max-w-5xl px-6 py-20">
        <SectionLabel>The broken proxy</SectionLabel>
        <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight">The Three Gaps</h2>
        <p className="mt-4 max-w-2xl text-[var(--muted)]">
          Most organizations deploy AI tools but stall on the shifts that create value.
        </p>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {gaps.map((gap) => (
            <article
              key={gap.title}
              className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6"
            >
              <span className="font-mono text-xs text-[var(--muted)]">{gap.num} ·</span>
              <h3 className="mt-2 font-semibold">{gap.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{gap.body}</p>
            </article>
          ))}
        </div>
      </div>

      <section className="border-t border-[var(--border)] bg-[var(--card)]/40">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <SectionLabel>Frameworks · cornerstone</SectionLabel>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight">Start here</h2>
          <p className="mt-3 max-w-2xl text-[var(--muted)]">
            Definitive explainers and cross-functional language — the pages Google visitors should land on first.
          </p>
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {frameworks.map((page, index) => (
              <ContentCard key={page.slug} page={page} index={index + 1} />
            ))}
          </div>
          <Link href="/frameworks" className="mt-8 inline-block text-sm text-[var(--accent)] underline">
            All frameworks →
          </Link>
        </div>
      </section>

      <section className="border-t border-[var(--border)]">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <SectionLabel>Playbook · depth</SectionLabel>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight">Reference guides</h2>
          <p className="mt-3 max-w-2xl text-[var(--muted)]">
            Patterns, pitfalls, use cases, glossary, and FAQ — continuously expanded from the knowledge base.
          </p>
          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {playbook.map((page, index) => (
              <ContentCard key={page.slug} page={page} index={index + 1} />
            ))}
          </div>
          <Link href="/playbook" className="mt-8 inline-block text-sm text-[var(--accent)] underline">
            Full playbook →
          </Link>
        </div>
      </section>
    </>
  );
}
