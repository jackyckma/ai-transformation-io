import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Transformation Roadmap',
};

export default function RoadmapPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <p className="text-sm text-[var(--muted)]">Framework · Wave 1 placeholder</p>
      <h1 className="mt-2 text-3xl font-semibold">Seven-stage transformation roadmap</h1>
      <p className="mt-4 text-[var(--muted)]">
        From exploration to scaled value — full content from knowledge-base ships in Wave 1–7.
      </p>
      <ol className="mt-10 list-decimal space-y-3 pl-5 text-sm text-[var(--muted)]">
        <li>Explore &amp; educate</li>
        <li>Experiment &amp; pilot</li>
        <li>Standardize patterns</li>
        <li>Scale workflows</li>
        <li>Measure outcomes</li>
        <li>Govern autonomy</li>
        <li>Reinvent operating model</li>
      </ol>
      <Link href="/" className="mt-10 inline-block text-sm text-[var(--accent)] underline">
        ← Back home
      </Link>
    </div>
  );
}
