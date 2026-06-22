import Link from 'next/link';
import type { ContentPageMeta } from '@ai-transformation/content';
import {
  getCuratedHomeFeed,
  resolveCuratedArticles,
  type CuratedHomeFeed,
} from '@ai-transformation/content';
import { ArticleList } from '@/components/article-list';
import { FeatureSpotlightCard, TopicRowCard } from '@/components/curated-cards';

type CuratedSectionsProps = {
  feed: CuratedHomeFeed;
};

export function CuratedSections({ feed }: CuratedSectionsProps) {
  return (
    <>
      {feed.spotlight.length > 0 ? (
        <section className="mb-14">
          <h2 className="font-serif text-lg font-normal tracking-tight">Editor&apos;s spotlight</h2>
          <ul className="mt-6 space-y-6">
            {feed.spotlight.map((item) => {
              const article = resolveCuratedArticles([item.slug], item.useOrgLearnPaths)[0];
              if (!article) return null;
              return (
                <li key={item.slug}>
                  <FeatureSpotlightCard
                    article={article}
                    editorNote={item.editorNote}
                    image={item.image}
                  />
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {feed.topics.length > 0 ? (
        <section className="mb-14 border-t border-[var(--border)] pt-10">
          <h2 className="font-serif text-lg font-normal tracking-tight">Curated topics</h2>
          <ul className="mt-6 grid gap-4 md:grid-cols-2 md:gap-5">
            {feed.topics.map((topic) => {
              const anchor = topic.anchorSlug
                ? resolveCuratedArticles([topic.anchorSlug], topic.useOrgLearnPaths)[0]
                : null;
              const related = resolveCuratedArticles(topic.relatedSlugs ?? [], topic.useOrgLearnPaths);
              const primaryHref = topic.externalHref ?? anchor?.pathname ?? null;

              return (
                <li key={topic.id} className="h-full">
                  <TopicRowCard
                    title={topic.title}
                    summary={topic.summary}
                    href={primaryHref}
                    related={related}
                    image={topic.image}
                    seed={topic.id}
                  />
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

export function HomeCuratedPreview({ feed }: CuratedSectionsProps) {
  const spotlight = feed.spotlight.slice(0, 1);
  const topics = feed.topics.slice(0, 2);

  return (
    <>
      {spotlight.length > 0 ? (
        <section className="mt-12">
          <h2 className="font-serif text-lg font-normal tracking-tight">Editor&apos;s pick</h2>
          <ul className="mt-5 space-y-6">
            {spotlight.map((item) => {
              const article = resolveCuratedArticles([item.slug], item.useOrgLearnPaths)[0];
              if (!article) return null;
              return (
                <li key={item.slug}>
                  <FeatureSpotlightCard
                    article={article}
                    editorNote={item.editorNote}
                    image={item.image}
                  />
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {topics.length > 0 ? (
        <section className="mt-12 border-t border-[var(--border)] pt-10">
          <h2 className="font-serif text-lg font-normal tracking-tight">Curated topics</h2>
          <ul className="mt-5 grid gap-4 md:grid-cols-2 md:gap-5">
            {topics.map((topic) => {
              const anchor = topic.anchorSlug
                ? resolveCuratedArticles([topic.anchorSlug], topic.useOrgLearnPaths)[0]
                : null;
              const related = resolveCuratedArticles(topic.relatedSlugs ?? [], topic.useOrgLearnPaths);
              const primaryHref = topic.externalHref ?? anchor?.pathname ?? null;

              return (
                <li key={topic.id} className="h-full">
                  <TopicRowCard
                    title={topic.title}
                    summary={topic.summary}
                    href={primaryHref}
                    related={related}
                    image={topic.image}
                    seed={topic.id}
                  />
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
    </>
  );
}

export function CollapsibleArticleIndex({
  title,
  description,
  pages,
}: {
  title: string;
  description: string;
  pages: ContentPageMeta[];
}) {
  return (
    <details className="group mt-14 border-t border-[var(--border)] pt-10">
      <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="font-serif text-lg font-normal tracking-tight">{title}</h2>
          <span className="text-sm font-light text-[var(--muted)] group-open:hidden">Show all</span>
          <span className="hidden text-sm font-light text-[var(--muted)] group-open:inline">Hide</span>
        </div>
        <p className="mt-2 text-sm font-light text-[var(--muted)]">{description}</p>
      </summary>
      <div className="mt-6">
        <ArticleList pages={pages} />
      </div>
    </details>
  );
}

export function loadIoCuratedFeed() {
  return getCuratedHomeFeed('io');
}
