import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ask a question',
};

export default function AskPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold">Have a question?</h1>
      <p className="mt-4 text-[var(--muted)]">
        Low-key question box — form and backend API ship in Wave 2.
      </p>
    </div>
  );
}
