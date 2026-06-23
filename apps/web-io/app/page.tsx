import Link from 'next/link';
import { getAllPages, getCuratedHomeFeed } from '@ai-transformation/content';

import { HomeCurationGrid } from '@/components/home-curation-grid';
import { HomeView } from '@/components/home-view';

function collectCuratedSlugs(feed: ReturnType<typeof getCuratedHomeFeed>): string[] {
  const slugs = new Set<string>();
  feed.spotlight.forEach((item) => slugs.add(item.slug));
  feed.topics.forEach((topic) => {
    if (topic.anchorSlug) slugs.add(topic.anchorSlug);
    (topic.relatedSlugs ?? []).forEach((slug) => slugs.add(slug));
  });
  return Array.from(slugs);
}

export default function HomePage() {
  const feed = getCuratedHomeFeed('io');
  const pages = getAllPages();
  const curatedSlugs = collectCuratedSlugs(feed);
  const highlights = pages.filter((page) => page.pillar === 'framework').slice(0, 4);

  const loggedOutContent = (
    <div className="space-y-12">
      <HomeCurationGrid feed={feed} />

      <section aria-labelledby="home-library-heading">
        <div className="flex items-baseline justify-between gap-4">
          <h2 id="home-library-heading" className="font-serif text-lg font-normal tracking-tight">
            From the library
          </h2>
          <Link
            href="/library"
            className="text-sm font-light text-[var(--secondary)] hover:text-[var(--foreground)]"
          >
            Browse all →
          </Link>
        </div>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {highlights.map((page) => (
            <li key={page.slug}>
              <Link
                href={page.pathname}
                className="block rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 transition hover:border-[var(--accent)]/40"
              >
                <h3 className="font-serif text-base font-normal leading-snug tracking-tight text-[var(--foreground)]">
                  {page.title}
                </h3>
                <p className="mt-2 text-sm font-light leading-relaxed text-[var(--muted)]">
                  {page.description}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );

  return (
    <div className="site-panel-x py-6 md:py-8">
      <HomeView loggedOutContent={loggedOutContent} pages={pages} curatedSlugs={curatedSlugs} />
    </div>
  );
}
