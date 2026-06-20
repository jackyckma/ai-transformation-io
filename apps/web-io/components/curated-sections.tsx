import Link from 'next/link';
import {
  getCuratedHomeFeed,
  resolveCuratedArticles,
  type CuratedHomeFeed,
} from '@ai-transformation/content';
import { ArticleListItem } from '@/components/article-list';

type CuratedSectionsProps = {
  feed: CuratedHomeFeed;
};

export function CuratedSections({ feed }: CuratedSectionsProps) {
  return (
    <>
      {feed.spotlight.length > 0 ? (
        <section className="mb-14">
          <h2 className="font-serif text-lg font-normal tracking-tight">Editor&apos;s spotlight</h2>
          <ul className="mt-6 space-y-8">
            {feed.spotlight.map((item) => {
              const article = resolveCuratedArticles([item.slug], item.useOrgLearnPaths)[0];
              if (!article) return null;
              return (
                <li key={item.slug}>
                  <ArticleListItem page={{ ...article, pillar: 'framework' }} category="Spotlight" />
                  <p className="mt-2 text-sm font-light text-[var(--muted)]">{item.editorNote}</p>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {feed.topics.length > 0 ? (
        <section className="mb-14 border-t border-[var(--border)] pt-10">
          <h2 className="font-serif text-lg font-normal tracking-tight">Curated topics</h2>
          <ul className="mt-6 space-y-8">
            {feed.topics.map((topic) => {
              const anchor = topic.anchorSlug
                ? resolveCuratedArticles([topic.anchorSlug], topic.useOrgLearnPaths)[0]
                : null;
              const related = resolveCuratedArticles(topic.relatedSlugs ?? [], topic.useOrgLearnPaths);
              const primaryHref = topic.externalHref ?? anchor?.pathname;

              return (
                <li key={topic.id} className="text-sm font-light">
                  {primaryHref ? (
                    <Link
                      href={primaryHref}
                      className="font-serif text-base text-[var(--foreground)] underline decoration-[var(--border)] underline-offset-4 hover:decoration-[var(--accent)]"
                    >
                      {topic.title}
                    </Link>
                  ) : (
                    <span className="font-serif text-base text-[var(--foreground)]">{topic.title}</span>
                  )}
                  <p className="mt-2 leading-relaxed text-[var(--muted)]">{topic.summary}</p>
                  {related.length > 0 ? (
                    <p className="mt-2 text-[var(--muted)]">
                      Related:{' '}
                      {related.map((article, index) => (
                        <span key={article.slug}>
                          {index > 0 ? ' · ' : ''}
                          <Link href={article.pathname} className="hover:text-[var(--foreground)]">
                            {article.title}
                          </Link>
                        </span>
                      ))}
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {feed.secondaryLinks.length > 0 ? (
        <section className="mb-14 border-t border-[var(--border)] pt-10">
          <h2 className="font-serif text-lg font-normal tracking-tight">Also on this site</h2>
          <ul className="mt-5 space-y-4">
            {feed.secondaryLinks.map((link) => (
              <li key={link.href} className="text-sm font-light">
                <Link
                  href={link.href}
                  className="text-[var(--foreground)] underline decoration-[var(--border)] underline-offset-4 hover:decoration-[var(--accent)]"
                >
                  {link.label}
                </Link>
                <span className="text-[var(--muted)]"> — {link.description}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  );
}

export function loadIoCuratedFeed() {
  return getCuratedHomeFeed('io');
}
