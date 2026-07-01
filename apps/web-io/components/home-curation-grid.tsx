import Link from 'next/link';
import {
  getCuratedHomeFeed,
  resolveCuratedArticles,
  type CuratedHomeFeed,
  type CuratedReaderPath,
} from '@ai-transformation/content';
import { CompactPathCard } from '@/components/curated-cards';

function useKnowledgePaths(value: {
  useOrgKnowledgePaths?: boolean;
  useOrgLearnPaths?: boolean;
}): boolean {
  return Boolean(value.useOrgKnowledgePaths ?? value.useOrgLearnPaths);
}

function ReaderPathLinks({ path }: { path: CuratedReaderPath }) {
  const articles = resolveCuratedArticles(path.articleSlugs ?? [], useKnowledgePaths(path));
  const externals = path.externalLinks ?? [];

  if (articles.length === 0 && externals.length === 0) {
    return null;
  }

  return (
    <>
      {articles.map((article) => (
        <li key={article.slug}>
          <Link href={article.pathname} className="text-[var(--secondary)] hover:text-[var(--foreground)]">
            {article.title}
          </Link>
        </li>
      ))}
      {externals.map((link) => (
        <li key={link.href}>
          <a
            href={link.href}
            className="text-[var(--secondary)] hover:text-[var(--foreground)]"
            rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
          >
            {link.label}
          </a>
        </li>
      ))}
    </>
  );
}

type HomeCurationGridProps = {
  feed: CuratedHomeFeed;
};

export function HomeCurationGrid({ feed }: HomeCurationGridProps) {
  const { readerEntry, readerPaths, secondaryLinks } = feed;

  return (
    <div className="space-y-10">
      <header>
        <h1 className="font-serif text-2xl font-normal tracking-tight text-[var(--foreground)] md:text-[1.85rem]">
          {readerEntry.headline}
        </h1>
        <p className="mt-3 max-w-2xl text-sm font-light leading-relaxed text-[var(--muted)]">
          {readerEntry.description}
        </p>
      </header>

      {readerPaths.length > 0 ? (
        <section aria-labelledby="home-paths-heading">
          <h2 id="home-paths-heading" className="sr-only">
            Choose your path
          </h2>
          <ul className="grid gap-4 md:grid-cols-3">
            {readerPaths.map((path) => (
              <CompactPathCard
                key={path.id}
                seed={path.id}
                label={path.label}
                description={path.description}
                image={path.image}
              >
                <ReaderPathLinks path={path} />
              </CompactPathCard>
            ))}
          </ul>
        </section>
      ) : null}

      {secondaryLinks.length > 0 ? (
        <section aria-labelledby="home-secondary-heading" className="border-t border-[var(--border)] pt-8">
          <h2 id="home-secondary-heading" className="sr-only">
            Also on this site
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {secondaryLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 transition hover:border-[var(--accent)]/40"
                >
                  <h3 className="font-serif text-base font-normal tracking-tight text-[var(--foreground)]">
                    {link.label}
                  </h3>
                  <p className="mt-2 text-sm font-light leading-relaxed text-[var(--muted)]">{link.description}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <nav
        aria-label="Browse the site"
        className="flex flex-wrap gap-x-4 gap-y-2 border-t border-[var(--border)] pt-6 text-sm font-light text-[var(--secondary)]"
      >
        <Link href="/library" className="hover:text-[var(--foreground)]">
          Library
        </Link>
        <Link href="/insights" className="hover:text-[var(--foreground)]">
          Insights
        </Link>
        <a
          href="https://ai-transformation.org"
          className="hover:text-[var(--foreground)]"
          rel="noopener noreferrer"
        >
          Community on .org
        </a>
      </nav>
    </div>
  );
}

export function loadIoCuratedFeed() {
  return getCuratedHomeFeed('io');
}
