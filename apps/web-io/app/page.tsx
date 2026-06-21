import Link from 'next/link';
import { getAllPages } from '@ai-transformation/content';
import { AgentFriendlyPanel } from '@/components/agent-friendly-panel';
import {
  CollapsibleArticleIndex,
  CuratedSections,
  loadIoCuratedFeed,
} from '@/components/curated-sections';
import { PageIntro } from '@/components/page-intro';
import { ReaderEntrySection } from '@/components/reader-entry-section';

export default function HomePage() {
  const feed = loadIoCuratedFeed();
  const allArticles = getAllPages();

  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <PageIntro
        title="AI Transformation"
        description="An information portal for enterprise leaders — frameworks, playbook articles, and practical guides on operating model change, not tool deployment alone."
      />

      <ReaderEntrySection feed={feed} />

      <CuratedSections feed={feed} />

      <AgentFriendlyPanel site="io" />

      <CollapsibleArticleIndex
        title="All articles"
        description="Full index — secondary to curated paths above."
        pages={allArticles}
      />

      <nav className="mt-12 flex flex-wrap gap-x-6 gap-y-2 text-sm font-light text-[var(--muted)]">
        <Link href="/frameworks" className="hover:text-[var(--foreground)]">
          Frameworks
        </Link>
        <Link href="/playbook" className="hover:text-[var(--foreground)]">
          Playbook
        </Link>
        <Link href="/for-agents" className="hover:text-[var(--foreground)]">
          For agents
        </Link>
        <a href="https://ai-transformation.org" className="hover:text-[var(--foreground)]">
          Harvest Hub on .org
        </a>
      </nav>
    </div>
  );
}
