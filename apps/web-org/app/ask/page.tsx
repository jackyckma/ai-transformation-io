import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Ask' };

export default function AskPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold">Ask the community</h1>
      <p className="mt-4 text-[var(--muted)]">Shared question box with .io — Wave 2.</p>
    </div>
  );
}
