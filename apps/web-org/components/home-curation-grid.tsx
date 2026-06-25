import Link from 'next/link';
import {
  getCuratedHomeFeed,
  resolveCuratedArticles,
  type CuratedHomeFeed,
  type CuratedHomeTile,
} from '@ai-transformation/content';
import { FeatureSpotlightCard, CuratedVisual, DECORATIVE_ASPECT } from '@/components/curated-cards';
import { formatDate } from '@/lib/object-display';

function useKnowledgePaths(value: { useOrgKnowledgePaths?: boolean; useOrgLearnPaths?: boolean }): boolean {
  return Boolean(value.useOrgKnowledgePaths ?? value.useOrgLearnPaths);
}

/** Section kind shown as the content-type kicker on home tiles (Wave 15 item 1). */
const TILE_KIND_LABEL: Record<string, string> = {
  knowledge: 'Knowledge',
  community: 'Community',
  contribute: 'Contribute',
  apprenticeship: 'Program',
  prompts: 'Prompts',
  'agent-entry': 'For agents',
};

function tileKind(tile: CuratedHomeTile): string {
  return TILE_KIND_LABEL[tile.id] ?? 'Explore';
}

function resolveTileHref(tile: CuratedHomeTile): string | null {
  if (tile.href) {
    return tile.href;
  }
  if (tile.slug) {
    const article = resolveCuratedArticles([tile.slug], useKnowledgePaths(tile))[0];
    return article?.pathname ?? null;
  }
  return null;
}

type HomeCurationGridProps = {
  feed: CuratedHomeFeed;
};

export function HomeCurationGrid({ feed }: HomeCurationGridProps) {
  const spotlight = feed.spotlight[0];
  const tiles = feed.homeTiles ?? [];

  return (
    <div className="space-y-8">
      {spotlight ? (
        <section aria-labelledby="home-spotlight-heading">
          <h1 id="home-spotlight-heading" className="sr-only">
            Community · Knowledge commons
          </h1>
          {(() => {
            const article = resolveCuratedArticles(
              [spotlight.slug],
              useKnowledgePaths(spotlight),
            )[0];
            if (!article) return null;
            return (
              <FeatureSpotlightCard
                article={article}
                editorNote={spotlight.editorNote}
                image={spotlight.image}
                category="Spotlight"
                date={feed.updatedAt ? formatDate(feed.updatedAt) : undefined}
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
                    <span className="text-[11px] font-normal uppercase tracking-wide text-[var(--secondary)]">
                      {tileKind(tile)}
                    </span>
                    <h3 className="font-serif mt-1 text-base font-normal leading-snug tracking-tight text-[var(--foreground)]">
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

export function loadOrgCuratedFeed() {
  return getCuratedHomeFeed('org');
}
