import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Weekly prompts' };

export default function PromptsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold">Weekly prompts</h1>
      <p className="mt-4 text-[var(--muted)]">
        One question per week — reply via the question box. First seed prompt in Wave 5.
      </p>
    </div>
  );
}
