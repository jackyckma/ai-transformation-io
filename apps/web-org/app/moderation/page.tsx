import type { Metadata } from 'next';
import { ModerationPanel } from '@/components/moderation-panel';
import { PageShell } from '@/components/page-shell';

export const metadata: Metadata = {
  title: 'Moderation',
  description: 'Review and curate community stories for Harvest Hub.',
  robots: { index: false, follow: false },
};

export default function ModerationPage() {
  return (
    <PageShell width="wide">
      <ModerationPanel />
    </PageShell>
  );
}
