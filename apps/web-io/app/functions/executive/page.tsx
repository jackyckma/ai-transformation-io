import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Executive / Board',
};

export default function ExecutivePage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <p className="text-sm text-[var(--muted)]">Function playbook · Wave 1 placeholder</p>
      <h1 className="mt-2 text-3xl font-semibold">Executive / Board</h1>
      <p className="mt-4 text-[var(--muted)]">
        Strategy, board reporting, and Return on Autonomy — full playbook ships in Wave 7.
      </p>
      <section className="mt-10 space-y-6 text-sm">
        <div>
          <h2 className="font-semibold">You own</h2>
          <p className="mt-1 text-[var(--muted)]">Portfolio prioritization, risk appetite, and value narrative to the board.</p>
        </div>
        <div>
          <h2 className="font-semibold">Three Gaps lens</h2>
          <p className="mt-1 text-[var(--muted)]">Executives often underestimate governance lag and over-index on deployment metrics.</p>
        </div>
      </section>
      <Link href="/assessment" className="mt-10 inline-block text-sm text-[var(--accent)] underline">
        Start assessment →
      </Link>
    </div>
  );
}
