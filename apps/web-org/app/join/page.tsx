import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Join',
  description: 'Join Harvest Hub to share stories and save your reflections.',
};

export default function JoinPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-14">
      <header className="border-b border-[var(--border)] pb-10">
        <p className="text-xs font-light tracking-wide text-[var(--muted)]">Harvest Hub</p>
        <h1 className="mt-3 font-serif text-3xl font-normal tracking-tight md:text-4xl">
          Join the community
        </h1>
        <p className="mt-4 max-w-xl text-sm font-light leading-relaxed text-[var(--muted)]">
          Sign in to post your field stories, save reflections, and continue the conversation with
          peers navigating enterprise AI change.
        </p>
      </header>

      <section className="mt-10 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8">
        <a
          href={`${process.env.NEXT_PUBLIC_API_BASE_URL ?? ''}/api/auth/google`}
          className="inline-flex items-center rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-[var(--accent-fg)] transition hover:opacity-90"
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
    </div>
  );
}
