import type { Metadata } from 'next';
import Link from 'next/link';
import { getOrgLearnPages } from '@ai-transformation/content';
import { ArticleList } from '@/components/article-list';
import { HubExploreNav } from '@/components/hub-explore-nav';
import { PageIntro } from '@/components/page-intro';
import { PageShell } from '@/components/page-shell';
import { ORG_EXPLORE_LINKS } from '@/lib/explore-links';

export const metadata: Metadata = {
  title: 'Learn',
  description: 'Introductory AI transformation guides — for visitors and community members alike.',
};

export default function LearnHubPage() {
  const pages = getOrgLearnPages();

  return (
    <PageShell>
      <PageIntro
        title="Learn"
        description="Foundational guides from our knowledge base — substance for visitors before they contribute."
      />
      <ArticleList pages={pages} />
      <p className="mt-10 text-sm font-light text-[var(--muted)]">
        More on{' '}
        <a href="https://ai-transformation.io/playbook" className="underline hover:text-[var(--foreground)]">
          ai-transformation.io/playbook
        </a>
      </p>
      <Link href="/" className="mt-4 inline-block text-sm font-light text-[var(--muted)] hover:text-[var(--foreground)]">
        ← Home
      </Link>
      <HubExploreNav links={ORG_EXPLORE_LINKS} className="mt-12" />
    </PageShell>
  );
}
