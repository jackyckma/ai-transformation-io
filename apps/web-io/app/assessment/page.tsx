import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Assessment',
};

export default function AssessmentPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold">Transformation Readiness Assessment</h1>
      <p className="mt-4 text-[var(--muted)]">
        36 questions across the Three Gaps — ships in Wave 3. Google OAuth save in Wave 4.
      </p>
    </div>
  );
}
