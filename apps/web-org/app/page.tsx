import { HomeCurationGrid, loadOrgCuratedFeed } from '@/components/home-curation-grid';
import { HomeView } from '@/components/home-view';
import { buildRecommendationCandidates } from '@/lib/home-recommendations';

export default function HomePage() {
  const feed = loadOrgCuratedFeed();
  const candidates = buildRecommendationCandidates();

  return (
    <div className="site-panel-x py-6 md:py-8">
      <HomeView curated={<HomeCurationGrid feed={feed} />} candidates={candidates} />
    </div>
  );
}
