import { CompanionHomeEntry } from '@ai-transformation/chat-ui';
import { HomeCuratedPreview, loadOrgCuratedFeed } from '@/components/curated-sections';
import { HubExploreNav } from '@/components/hub-explore-nav';
import { SiteLogicStrip } from '@/components/site-logic-strip';
import { ORG_EXPLORE_LINKS } from '@/lib/explore-links';

export default function HomePage() {
  const feed = loadOrgCuratedFeed();

  return (
    <div className="layout-shell py-8 md:py-12">
      <section className="max-w-2xl">
        <h1 className="font-serif text-2xl font-normal tracking-tight md:text-3xl">Harvest Hub</h1>
        <p className="mt-3 text-sm font-light leading-relaxed text-[var(--muted)] md:text-base">
          Share field experiences and learn from practitioners — ask first, read guides, share when you have
          something real.
        </p>
      </section>

      <SiteLogicStrip />

      <div className="mt-10 max-w-2xl">
        <CompanionHomeEntry site="org" />
      </div>

      <HubExploreNav links={ORG_EXPLORE_LINKS} className="mt-10 border-y py-4" />

      <HomeCuratedPreview feed={feed} />
    </div>
  );
}
