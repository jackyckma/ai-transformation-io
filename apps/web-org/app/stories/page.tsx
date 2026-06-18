import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Stories' };

export default function StoriesPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold">Experience stories</h1>
      <p className="mt-4 text-[var(--muted)]">Published UGC — listing and moderation ship in Wave 5.</p>
      <Link href="/stories/submit" className="mt-8 inline-block text-sm text-[var(--accent)] underline">
        Submit your story →
      </Link>
    </div>
  );
}
