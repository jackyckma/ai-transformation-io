import type { Metadata } from 'next';
import { AssessmentWizard } from '@/components/assessment/assessment-wizard';
import { PageIntro } from '@/components/page-intro';
import { PageShell } from '@/components/page-shell';

export const metadata: Metadata = {
  title: 'Three Gaps assessment',
  description: 'Three Gaps diagnostic — 36 questions with radar results for org-level AI readiness.',
};

export default function AssessmentPage() {
  return (
    <PageShell width="wide">
      <PageIntro
        title="Three Gaps assessment"
        description="Org-level diagnostic across work redesign, governance, and value measurement — save and resume when signed in."
        seed="insights"
      />
      <AssessmentWizard />
    </PageShell>
  );
}
