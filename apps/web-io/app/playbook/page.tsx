import type { Metadata } from 'next';
import Link from 'next/link';
import { getPagesByPillar } from '@ai-transformation/content';
import { ArticleList } from '@/components/article-list';
import { PageIntro } from '@/components/page-intro';

export const metadata: Metadata = {
  title: 'Playbook',
  description: 'Reference guides, patterns, and answers for enterprise AI transformation.',
};

export default function PlaybookHubPage() {
  const pages = getPagesByPillar('resource');

  return (
    <div className="mx-auto max-w-2xl px-6 py-14">
      <PageIntro
        title="Playbook"
        description="Patterns, pitfalls, use cases, glossary, and FAQ — supporting depth behind the frameworks."
      />
      <ArticleList pages={pages} />
      <Link href="/frameworks" className="mt-10 inline-block text-sm font-light text-[var(--muted)] hover:text-[var(--foreground)]">
        ← Frameworks
      </Link>
    </div>
  );
}
