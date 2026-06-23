import type { Metadata } from 'next';

import { CommunityHighlights } from '@/components/community-highlights';
import { PageShell } from '@/components/page-shell';

export const metadata: Metadata = {
  title: 'Community',
  description: 'Community highlights — discussions, help requests, events, and announcements.',
};

export default function CommunityPage() {
  return (
    <PageShell width="wide">
      <CommunityHighlights />
    </PageShell>
  );
}
