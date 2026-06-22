import type { Metadata } from 'next';
import { StoryList } from '@/components/story-list';
import { HubExploreNav } from '@/components/hub-explore-nav';
import { PageShell } from '@/components/page-shell';
import { ORG_EXPLORE_LINKS } from '@/lib/explore-links';

export const metadata: Metadata = {
  title: 'Stories',
  description: 'Community stories from teams navigating AI transformation work.',
};

export default function StoriesPage() {
  return (
    <PageShell width="wide">
      <StoryList />
      <HubExploreNav links={ORG_EXPLORE_LINKS} className="mt-10" />
    </PageShell>
  );
}
