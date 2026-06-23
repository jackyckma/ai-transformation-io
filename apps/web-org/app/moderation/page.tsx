import type { Metadata } from 'next';
import { ModerationPanel } from '@/components/moderation-panel';
import { PageShell } from '@/components/page-shell';

export const metadata: Metadata = {
  title: 'Moderation',
  description: 'Review and curate community contributions for the knowledge commons.',
  robots: { index: false, follow: false },
};

export default function ModerationPage() {
  return (
    <PageShell width="wide">
      <ModerationPanel />
    </PageShell>
  );
}
