import { cookies } from 'next/headers';
import { getAllPages, getCuratedHomeFeed } from '@ai-transformation/content';

import { HomeCurationGrid } from '@/components/home-curation-grid';
import { HomeView } from '@/components/home-view';

const SESSION_COOKIE_NAME = 'atx_session';

function collectCuratedSlugs(feed: ReturnType<typeof getCuratedHomeFeed>): string[] {
  const slugs = new Set<string>();
  feed.spotlight.forEach((item) => slugs.add(item.slug));
  feed.readerPaths.forEach((path) => {
    (path.articleSlugs ?? []).forEach((slug) => slugs.add(slug));
  });
  feed.topics.forEach((topic) => {
    if (topic.anchorSlug) slugs.add(topic.anchorSlug);
    (topic.relatedSlugs ?? []).forEach((slug) => slugs.add(slug));
  });
  return Array.from(slugs);
}

export default async function HomePage() {
  const cookieStore = await cookies();
  const hasSessionCookie = Boolean(cookieStore.get(SESSION_COOKIE_NAME)?.value);

  const feed = getCuratedHomeFeed('io');
  const pages = getAllPages();
  const curatedSlugs = collectCuratedSlugs(feed);
  const loggedOutContent = <HomeCurationGrid feed={feed} />;

  return (
    <div className="site-panel-x py-6 md:py-8">
      <HomeView
        loggedOutContent={loggedOutContent}
        pages={pages}
        curatedSlugs={curatedSlugs}
        hasSessionCookie={hasSessionCookie}
      />
    </div>
  );
}
