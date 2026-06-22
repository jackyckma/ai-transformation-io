import type { Metadata } from 'next';
import { PageIntro } from '@/components/page-intro';
import { PageShell } from '@/components/page-shell';
import { ProgressDashboard } from '@/components/progress-dashboard';

export const metadata: Metadata = {
  title: 'Your progress',
  description: 'Saved assessment progress and recommended next steps when signed in.',
};

export default function ProgressPage() {
  return (
    <PageShell width="wide">
      <PageIntro
        title="Your progress"
        description="Assessment save/resume when signed in. The companion is always available without an account."
      />
      <ProgressDashboard />
    </PageShell>
  );
}
