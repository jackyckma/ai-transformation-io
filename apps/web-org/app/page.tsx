import { cookies } from 'next/headers';

import { HomeCurationGrid, loadOrgCuratedFeed } from '@/components/home-curation-grid';
import { HomeView } from '@/components/home-view';
import { buildRecommendationCandidates } from '@/lib/home-recommendations';

const SESSION_COOKIE_NAME = 'atx_session';

export default async function HomePage() {
  const cookieStore = await cookies();
  const hasSessionCookie = Boolean(cookieStore.get(SESSION_COOKIE_NAME)?.value);

  const feed = loadOrgCuratedFeed();
  const candidates = buildRecommendationCandidates();

  return (
    <div className="site-panel-x py-6 md:py-8">
      <HomeView
        curated={<HomeCurationGrid feed={feed} />}
        candidates={candidates}
        hasSessionCookie={hasSessionCookie}
      />
    </div>
  );
}
