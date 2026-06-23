import type { Metadata } from 'next';
import { PromptReply } from '@/components/prompt-reply';
import { HubExploreNav } from '@/components/hub-explore-nav';
import { PageShell } from '@/components/page-shell';
import { ORG_EXPLORE_LINKS } from '@/lib/nav';

export const metadata: Metadata = {
  title: 'Weekly prompts',
  description: 'Respond to this week’s community reflection prompt.',
};

export default function PromptsPage() {
  return (
    <PageShell width="wide">
      <PromptReply />
      <HubExploreNav links={ORG_EXPLORE_LINKS} className="mt-10" />
    </PageShell>
  );
}
