import type { Metadata } from 'next';
import Link from 'next/link';
import { getPagesByPillar } from '@ai-transformation/content';
import { ArticleList } from '@/components/article-list';
import { HubExploreNav } from '@/components/hub-explore-nav';
import { PageIntro } from '@/components/page-intro';
import { PageShell } from '@/components/page-shell';
import { IO_EXPLORE_LINKS } from '@/lib/explore-links';

export const metadata: Metadata = {
  title: 'Frameworks',
  description: 'Cross-cutting AI transformation frameworks — roadmap, governance, and definitions.',
};

export default function FrameworksHubPage() {
  const pages = getPagesByPillar('framework');

  return (
    <PageShell>
      <PageIntro
        title="Frameworks"
        description="Cornerstone explainers — definitions, roadmaps, governance, and how to measure value."
      />
      <ArticleList pages={pages} />
      <Link
        href="/playbook"
        className="mt-10 inline-block text-sm font-light text-[var(--muted)] hover:text-[var(--foreground)]"
      >
        Playbook articles →
      </Link>
      <HubExploreNav links={IO_EXPLORE_LINKS} className="mt-12" />
    </PageShell>
  );
}
