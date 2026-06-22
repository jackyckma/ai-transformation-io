import { HomeCurationGrid, loadOrgCuratedFeed } from '@/components/home-curation-grid';

export default function HomePage() {
  const feed = loadOrgCuratedFeed();

  return (
    <div className="layout-shell py-6 md:py-8">
      <HomeCurationGrid feed={feed} />
    </div>
  );
}
