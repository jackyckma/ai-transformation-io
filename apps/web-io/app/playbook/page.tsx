import type { Metadata } from 'next';
import Link from 'next/link';
import { getPagesByPillar } from '@ai-transformation/content';
import { ContentCard } from '@/components/content-card';
import { SectionLabel } from '@/components/section-label';

export const metadata: Metadata = {
  title: 'Playbook',
  description: 'Reference guides, patterns, and answers for enterprise AI transformation.',
};

export default function PlaybookHubPage() {
  const pages = getPagesByPillar('resource');

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <SectionLabel>Reference · depth</SectionLabel>
      <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">
        AI Transformation Playbook
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-[var(--muted)]">
        Patterns, pitfalls, use cases, and definitions — the supporting layer behind the frameworks.
        Built from our knowledge base for visitors arriving from search.
      </p>
      <div className="mt-12 grid gap-5 sm:grid-cols-2">
        {pages.map((page, index) => (
          <ContentCard key={page.slug} page={page} index={index + 1} />
        ))}
      </div>
      <Link href="/frameworks" className="mt-12 inline-block text-sm text-[var(--accent)] underline">
        ← Start with frameworks
      </Link>
    </div>
  );
}
