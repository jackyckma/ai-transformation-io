import Link from 'next/link';
import {
  getCuratedHomeFeed,
  resolveCuratedArticles,
  type CuratedHomeFeed,
  type CuratedHomeTile,
} from '@ai-transformation/content';
import { FeatureSpotlightCard, CuratedVisual, DECORATIVE_ASPECT } from '@/components/curated-cards';
import { formatMonthYear } from '@/lib/format-date';

function resolveTileHref(tile: CuratedHomeTile): string | null {
  if (tile.href) {
    return tile.href;
  }
  if (tile.slug) {
    const article = resolveCuratedArticles([tile.slug], tile.useOrgLearnPaths)[0];
    return article?.pathname ?? null;
  }
  return null;
}

/** Honest content-type label derived from where a curated tile points. */
function tileTypeLabel(tile: CuratedHomeTile, href: string): string {
  if (tile.external) return 'Community';
  if (href.startsWith('/insights/assessment')) return 'Assessment';
  if (href.startsWith('/insights')) return 'Insights';
  if (href.startsWith('/library/') || tile.slug) return 'Framework';
  if (href.startsWith('/library')) return 'Library';
  if (href.startsWith('/api/agent')) return 'For agents';
  return 'Guide';
}

type HomeCurationGridProps = {
  feed: CuratedHomeFeed;
};

export function HomeCurationGrid({ feed }: HomeCurationGridProps) {
  const spotlight = feed.spotlight[0];
  const tiles = feed.homeTiles ?? [];
  const updatedLabel = formatMonthYear(feed.updatedAt);

  return (
    <div className="space-y-8">
      {spotlight ? (
        <section aria-labelledby="home-spotlight-heading">
          <h1 id="home-spotlight-heading" className="sr-only">
            Home
          </h1>
          {(() => {
            const article = resolveCuratedArticles([spotlight.slug], spotlight.useOrgLearnPaths)[0];
            if (!article) return null;
            return (
              <FeatureSpotlightCard
                article={article}
                editorNote={spotlight.editorNote}
                image={spotlight.image}
                category="Framework"
                dateLabel={updatedLabel ? `Updated ${updatedLabel}` : null}
              />
            );
          })()}
        </section>
      ) : null}

      {tiles.length > 0 ? (
        <section aria-labelledby="home-grid-heading">
          <h2 id="home-grid-heading" className="sr-only">
            Explore
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
            {tiles.map((tile) => {
              const href = resolveTileHref(tile);
              if (!href) return null;

              const inner = (
                <>
                  <CuratedVisual
                    seed={tile.id}
                    image={tile.image}
                    aspectClass={`${DECORATIVE_ASPECT.tile} w-full`}
                    flush
                  />
                  <div className="p-4 pb-5">
                    <p className="text-[11px] font-light tracking-wide text-[var(--muted)]">
                      <span className="rounded-full border border-[var(--brand)]/35 bg-[var(--brand)]/12 px-1.5 py-0.5 uppercase tracking-wide text-[var(--brand)]">
                        {tileTypeLabel(tile, href)}
                      </span>
                      {updatedLabel ? (
                        <span className="text-[var(--secondary)]"> · Updated {updatedLabel}</span>
                      ) : null}
                    </p>
                    <h3 className="font-serif mt-1.5 text-base font-normal leading-snug tracking-tight text-[var(--foreground)]">
                      {tile.title}
                    </h3>
                    {tile.summary ? (
                      <p className="mt-2 text-sm font-light leading-relaxed text-[var(--muted)]">
                        {tile.summary}
                      </p>
                    ) : null}
                  </div>
                </>
              );

              const className =
                'block overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] transition hover:border-[var(--accent)]/40';

              return (
                <li key={tile.id}>
                  {tile.external ? (
                    <a
                      href={href}
                      className={className}
                      data-curation-id={tile.id}
                      rel="noopener noreferrer"
                    >
                      {inner}
                    </a>
                  ) : (
                    <Link href={href} className={className} data-curation-id={tile.id}>
                      {inner}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

export function loadIoCuratedFeed() {
  return getCuratedHomeFeed('io');
}
