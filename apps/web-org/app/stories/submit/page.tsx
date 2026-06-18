import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Submit a story' };

export default function StorySubmitPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold">Share your experience</h1>
      <p className="mt-4 text-[var(--muted)]">Submission form ships in Wave 5 with the harvest API.</p>
    </div>
  );
}
