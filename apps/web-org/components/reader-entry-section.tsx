import Link from 'next/link';
import type { CuratedHomeFeed } from '@ai-transformation/content';
import { resolveCuratedArticles } from '@ai-transformation/content';
import { CompactPathCard } from '@/components/curated-cards';

type ReaderEntrySectionProps = {
  feed: CuratedHomeFeed;
};

export function ReaderEntrySection({ feed }: ReaderEntrySectionProps) {
  return (
    <section className="mb-14 border-b border-[var(--border)] pb-10">
      <h2 className="font-serif text-xl font-normal leading-snug tracking-tight md:text-2xl">
        {feed.readerEntry.headline}
      </h2>
      <p className="mt-4 max-w-xl text-sm font-light leading-relaxed text-[var(--muted)]">
        {feed.readerEntry.description}
      </p>

      <ul className="mt-8 grid gap-4 md:grid-cols-3 md:gap-5">
        {feed.readerPaths.map((pathEntry) => {
          const articles = resolveCuratedArticles(
            pathEntry.articleSlugs ?? [],
            pathEntry.useOrgLearnPaths,
          );

          return (
            <CompactPathCard
              key={pathEntry.id}
              label={pathEntry.label}
              description={pathEntry.description}
              seed={pathEntry.id}
              image={pathEntry.image}
            >
              {articles.map((article) => (
                <li key={article.slug}>
                  <Link
                    href={article.pathname}
                    className="text-[var(--foreground)] underline decoration-[var(--border)] underline-offset-4 hover:decoration-[var(--accent)]"
                  >
                    {article.title}
                  </Link>
                </li>
              ))}
              {pathEntry.externalLinks?.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[var(--foreground)] underline decoration-[var(--border)] underline-offset-4 hover:decoration-[var(--accent)]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </CompactPathCard>
          );
        })}
      </ul>
    </section>
  );
}
