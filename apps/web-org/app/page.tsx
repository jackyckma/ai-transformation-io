import Link from 'next/link';
import { getOrgLearnPages } from '@ai-transformation/content';
import { ContentCard } from '@/components/content-card';
import { EditorialHero } from '@/components/editorial-hero';
import { SectionLabel } from '@/components/section-label';

const ways = [
  {
    num: '01',
    title: 'Share your experience',
    body: 'Tell us what you tried — wins, failures, surprises. Moderated stories on .org.',
    href: '/stories/submit',
  },
  {
    num: '02',
    title: 'Answer the weekly prompt',
    body: 'One open question per week. Reply via the question box — no forum required.',
    href: '/prompts',
  },
  {
    num: '03',
    title: 'Ask anything',
    body: 'Low-key email + question. We read every message.',
    href: '/ask',
  },
];

export default function HomePage() {
  const learnPages = getOrgLearnPages().slice(0, 3);

  return (
    <>
      <EditorialHero
        eyebrow="Harvest Hub · ai-transformation.org"
        title="Share what you're seeing in the wild"
        subtitle="Start with real playbook content, then contribute experiences, respond to prompts, and help build curated insights for everyone."
        primaryCta={{ href: '/learn', label: 'Read the intro guides' }}
        secondaryCta={{ href: '/stories/submit', label: 'Share a story' }}
      />

      <section className="border-b border-[var(--border)]">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <SectionLabel>Learn first · then contribute</SectionLabel>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight">AI Transformation Playbook</h2>
          <p className="mt-3 max-w-2xl text-[var(--muted)]">
            Visitors from Google should find substance — not an empty community shell.
          </p>
          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {learnPages.map((page, index) => (
              <ContentCard key={page.slug} page={page} index={index + 1} />
            ))}
          </div>
          <Link href="/learn" className="mt-8 inline-block text-sm text-[var(--accent)] underline">
            All learn articles →
          </Link>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-5xl px-6 py-20">
          <SectionLabel>Contribute · three ways</SectionLabel>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight">Join the harvest</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {ways.map((way) => (
              <Link
                key={way.href}
                href={way.href}
                className="group rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 transition hover:border-[var(--accent)] hover:shadow-[var(--glow)]"
              >
                <span className="font-mono text-xs text-[var(--muted)]">{way.num} ·</span>
                <h3 className="mt-2 font-semibold group-hover:text-[var(--accent)]">{way.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{way.body}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
