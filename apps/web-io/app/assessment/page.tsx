import type { Metadata } from 'next';
import { AssessmentWizard } from '@/components/assessment/assessment-wizard';
import { PageIntro } from '@/components/page-intro';
import { PageShell } from '@/components/page-shell';

export const metadata: Metadata = {
  title: 'Assessment',
  description: 'Three Gaps diagnostic — 36 questions with radar results for org-level AI readiness.',
};

export default function AssessmentPage() {
  return (
    <PageShell width="wide">
      <PageIntro
        title="Assessment"
        description="Org-level Three Gaps diagnostic — save and resume when signed in."
      />
      <AssessmentWizard />
    </PageShell>
  );
}
