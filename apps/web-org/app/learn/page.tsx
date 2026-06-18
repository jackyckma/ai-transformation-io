import type { Metadata } from 'next';
import Link from 'next/link';
import { getOrgLearnPages } from '@ai-transformation/content';
import { ContentCard } from '@/components/content-card';
import { SectionLabel } from '@/components/section-label';

export const metadata: Metadata = {
  title: 'Learn',
  description: 'Introductory AI transformation guides — for visitors and community members alike.',
};

export default function LearnHubPage() {
  const pages = getOrgLearnPages();

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <SectionLabel>Intro · playbook</SectionLabel>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">Learn together</h1>
      <p className="mt-6 max-w-2xl text-lg text-[var(--muted)]">
        Foundational guides from our knowledge base — so visitors from search find substance before they
        contribute stories or prompts.
      </p>
      <div className="mt-12 grid gap-5 sm:grid-cols-2">
        {pages.map((page, index) => (
          <ContentCard key={page.slug} page={page} index={index + 1} />
        ))}
      </div>
      <p className="mt-12 text-sm text-[var(--muted)]">
        More depth on{' '}
        <a href="https://ai-transformation.io/playbook" className="text-[var(--accent)] underline">
          ai-transformation.io/playbook
        </a>
        .
      </p>
      <Link href="/" className="mt-4 inline-block text-sm text-[var(--accent)] underline">
        ← Harvest Hub home
      </Link>
    </div>
  );
}
