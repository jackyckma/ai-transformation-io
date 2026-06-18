import Link from 'next/link';
import type { ContentPageMeta } from '@ai-transformation/content';

type ArticleListItemProps = {
  page: ContentPageMeta;
  category?: string;
};

export function ArticleListItem({ page, category = 'Guide' }: ArticleListItemProps) {
  return (
    <article className="border-b border-[var(--border)] py-8 first:pt-0 last:border-b-0">
      <Link href={page.pathname} className="group block">
        <p className="text-xs font-light tracking-wide text-[var(--muted)]">{category}</p>
        <h2 className="font-serif mt-2 text-xl font-normal leading-snug tracking-tight text-[var(--foreground)] transition group-hover:text-[var(--accent)] md:text-2xl">
          {page.title}
        </h2>
        <p className="mt-2 max-w-2xl text-sm font-light leading-relaxed text-[var(--muted)]">
          {page.description}
        </p>
      </Link>
    </article>
  );
}

type ArticleListProps = {
  pages: ContentPageMeta[];
  getCategory?: (page: ContentPageMeta) => string;
};

export function ArticleList({ pages, getCategory }: ArticleListProps) {
  return (
    <div>
      {pages.map((page) => (
        <ArticleListItem
          key={page.slug}
          page={page}
          category={getCategory?.(page)}
        />
      ))}
    </div>
  );
}
