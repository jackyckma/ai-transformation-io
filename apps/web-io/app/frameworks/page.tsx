import type { Metadata } from 'next';
import Link from 'next/link';
import { getPagesByPillar } from '@ai-transformation/content';
import { ContentCard } from '@/components/content-card';
import { SectionLabel } from '@/components/section-label';

export const metadata: Metadata = {
  title: 'Frameworks',
  description: 'Cross-cutting AI transformation frameworks — roadmap, governance, and definitions.',
};

export default function FrameworksHubPage() {
  const pages = getPagesByPillar('framework');

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <SectionLabel>Cornerstone · frameworks</SectionLabel>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">Frameworks</h1>
      <p className="mt-6 max-w-2xl text-lg text-[var(--muted)]">
        Cross-functional language for enterprise AI transformation — grounded in research, free of hype.
      </p>
      <div className="mt-12 grid gap-5 sm:grid-cols-2">
        {pages.map((page, index) => (
          <ContentCard key={page.slug} page={page} index={index + 1} />
        ))}
      </div>
      <Link href="/playbook" className="mt-12 inline-block text-sm text-[var(--accent)] underline">
        Continue to the playbook →
      </Link>
    </div>
  );
}
