import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Start here' };

export default function StartPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold">Start here</h1>
      <p className="mt-4 text-[var(--muted)]">
        What AI transformation means in practice — community lens. Full content in Wave 5.
      </p>
    </div>
  );
}
