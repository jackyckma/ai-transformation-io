import Link from 'next/link';
import { getAllPages, getPagesByPillar } from '@ai-transformation/content';
import { ArticleList } from '@/components/article-list';
import { PageIntro } from '@/components/page-intro';

export default function HomePage() {
  const frameworks = getPagesByPillar('framework');
  const playbook = getPagesByPillar('resource');
  const articles = getAllPages();

  return (
    <div className="mx-auto max-w-2xl px-6 py-14">
      <PageIntro
        title="AI Transformation"
        description="An information portal for enterprise leaders — frameworks, playbook articles, and practical guides on operating model change, not tool deployment alone."
      />

      <ArticleList pages={articles} />

      <nav className="mt-12 flex flex-wrap gap-x-6 gap-y-2 text-sm font-light text-[var(--muted)]">
        <Link href="/frameworks" className="hover:text-[var(--foreground)]">
          Frameworks ({frameworks.length})
        </Link>
        <Link href="/playbook" className="hover:text-[var(--foreground)]">
          Playbook ({playbook.length})
        </Link>
        <Link href="/assessment" className="hover:text-[var(--foreground)]">
          Assessment
        </Link>
        <a href="https://ai-transformation.org" className="hover:text-[var(--foreground)]">
          Harvest Hub on .org
        </a>
      </nav>
    </div>
  );
}
