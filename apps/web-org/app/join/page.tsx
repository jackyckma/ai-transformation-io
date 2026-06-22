import type { Metadata } from 'next';
import Link from 'next/link';
import { PageIntro } from '@/components/page-intro';
import { PageShell } from '@/components/page-shell';

export const metadata: Metadata = {
  title: 'Join',
  description: 'Join Harvest Hub to share stories and save your reflections.',
};

export default function JoinPage() {
  return (
    <PageShell>
      <PageIntro
        title="Join the community"
        description="Sign in to post field stories, save reflections, and continue the conversation with peers navigating enterprise AI change."
      />

      <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 md:p-8">
        <a
          href={`${process.env.NEXT_PUBLIC_API_BASE_URL ?? ''}/api/auth/google`}
          className="inline-flex min-h-9 items-center rounded-lg bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-[var(--accent-fg)] transition hover:opacity-90"
        >
          Continue with Google
        </a>
        <p className="mt-4 text-sm font-light leading-relaxed text-[var(--muted)]">
          We use Google sign-in to keep posting simple across both domains while preserving each
          site&apos;s own session.
        </p>
      </section>

      <nav className="mt-10 text-sm font-light text-[var(--muted)]">
        <Link href="/stories" className="hover:text-[var(--foreground)]">
          Read community stories
        </Link>
        <span className="mx-3">·</span>
        <Link href="/stories/submit" className="hover:text-[var(--foreground)]">
          Share your own
        </Link>
      </nav>
    </PageShell>
  );
}
