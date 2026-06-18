import type { Metadata } from 'next';
import Link from 'next/link';
import { getPagesByPillar } from '@ai-transformation/content';
import { ArticleList } from '@/components/article-list';
import { PageIntro } from '@/components/page-intro';

export const metadata: Metadata = {
  title: 'Frameworks',
  description: 'Cross-cutting AI transformation frameworks — roadmap, governance, and definitions.',
};

export default function FrameworksHubPage() {
  const pages = getPagesByPillar('framework');

  return (
    <div className="mx-auto max-w-2xl px-6 py-14">
      <PageIntro
        title="Frameworks"
        description="Cornerstone explainers — definitions, roadmaps, governance, and how to measure value."
      />
      <ArticleList pages={pages} />
      <Link href="/playbook" className="mt-10 inline-block text-sm font-light text-[var(--muted)] hover:text-[var(--foreground)]">
        Playbook articles →
      </Link>
    </div>
  );
}
