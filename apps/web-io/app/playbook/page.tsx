import type { Metadata } from 'next';
import Link from 'next/link';
import { getPagesByPillar } from '@ai-transformation/content';
import { ArticleList } from '@/components/article-list';
import { HubExploreNav } from '@/components/hub-explore-nav';
import { PageIntro } from '@/components/page-intro';
import { PageShell } from '@/components/page-shell';
import { IO_EXPLORE_LINKS } from '@/lib/explore-links';

export const metadata: Metadata = {
  title: 'Playbook',
  description: 'Reference guides, patterns, and answers for enterprise AI transformation.',
};

export default function PlaybookHubPage() {
  const pages = getPagesByPillar('resource');

  return (
    <PageShell>
      <PageIntro
        title="Playbook"
        description="Patterns, pitfalls, use cases, glossary, and FAQ — supporting depth behind the frameworks."
      />
      <ArticleList pages={pages} />
      <Link
        href="/frameworks"
        className="mt-10 inline-block text-sm font-light text-[var(--muted)] hover:text-[var(--foreground)]"
      >
        ← Frameworks
      </Link>
      <HubExploreNav links={IO_EXPLORE_LINKS} className="mt-12" />
    </PageShell>
  );
}
