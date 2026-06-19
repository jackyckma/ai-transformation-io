import type { Metadata } from 'next';
import { AssessmentWizard } from '@/components/assessment/assessment-wizard';

export const metadata: Metadata = {
  title: 'Assessment',
};

export default function AssessmentPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <AssessmentWizard />
    </div>
  );
}
