import type { Metadata } from 'next';
import { StoryForm } from '@/components/story-form';
import { HubExploreNav } from '@/components/hub-explore-nav';
import { PageShell } from '@/components/page-shell';
import { ORG_EXPLORE_LINKS } from '@/lib/explore-links';

export const metadata: Metadata = {
  title: 'Submit a story',
  description: 'Share an implementation story with the Harvest Hub community.',
};

export default function StorySubmitPage() {
  return (
    <PageShell width="wide">
      <StoryForm />
      <HubExploreNav links={ORG_EXPLORE_LINKS} className="mt-10" />
    </PageShell>
  );
}
