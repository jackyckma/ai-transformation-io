import { CompanionHomeEntry } from '@ai-transformation/chat-ui';
import { HomeCuratedPreview, loadIoCuratedFeed } from '@/components/curated-sections';
import { HubExploreNav } from '@/components/hub-explore-nav';
import { IO_EXPLORE_LINKS } from '@/lib/explore-links';

export default function HomePage() {
  const feed = loadIoCuratedFeed();

  return (
    <div className="layout-shell py-8 md:py-12">
      <section className="max-w-2xl">
        <h1 className="font-serif text-2xl font-normal tracking-tight md:text-3xl">
          Your AI transformation companion
        </h1>
        <p className="mt-3 text-sm font-light leading-relaxed text-[var(--muted)] md:text-base">
          Structured guidance for enterprise leaders — ask first, then read frameworks and playbook
          articles when you need depth.
        </p>
      </section>

      <div className="mt-8 max-w-2xl">
        <CompanionHomeEntry site="io" />
      </div>

      <HubExploreNav links={IO_EXPLORE_LINKS} className="mt-10 border-y py-4" />

      <HomeCuratedPreview feed={feed} />
    </div>
  );
}
