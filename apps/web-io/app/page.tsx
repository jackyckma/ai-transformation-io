import { HomeCurationGrid, loadIoCuratedFeed } from '@/components/home-curation-grid';

export default function HomePage() {
  const feed = loadIoCuratedFeed();

  return (
    <div className="layout-shell py-6 md:py-8">
      <HomeCurationGrid feed={feed} />
    </div>
  );
}
