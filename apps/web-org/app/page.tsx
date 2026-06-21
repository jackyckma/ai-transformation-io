import Link from 'next/link';
import { AgentFriendlyPanel } from '@/components/agent-friendly-panel';
import {
  AllLearnArticlesSection,
  CuratedSections,
  loadOrgCuratedFeed,
} from '@/components/curated-sections';
import { PageIntro } from '@/components/page-intro';
import { ReaderEntrySection } from '@/components/reader-entry-section';

export default function HomePage() {
  const feed = loadOrgCuratedFeed();

  return (
    <div className="layout-read py-14">
      <PageIntro
        title="Harvest Hub"
        description="A community space on ai-transformation.org — read first, contribute when you have something to share. No forum, no noise."
      />

      <ReaderEntrySection feed={feed} />

      <CuratedSections feed={feed} />

      <AgentFriendlyPanel site="org" />

      <AllLearnArticlesSection />

      <nav className="mt-12 flex flex-wrap gap-x-6 gap-y-2 text-sm font-light text-[var(--muted)]">
        <Link href="/learn" className="hover:text-[var(--foreground)]">
          All guides
        </Link>
        <Link href="/apprenticeship" className="hover:text-[var(--foreground)]">
          Apprenticeship
        </Link>
        <Link href="/for-agents" className="hover:text-[var(--foreground)]">
          For agents
        </Link>
        <a href="https://ai-transformation.io" className="hover:text-[var(--foreground)]">
          Frameworks on .io
        </a>
      </nav>
    </div>
  );
}
