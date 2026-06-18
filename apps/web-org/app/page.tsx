import Link from 'next/link';

const ways = [
  {
    title: 'Share your experience',
    body: 'Tell us what you tried — wins, failures, surprises. Moderated stories on .org.',
    href: '/stories/submit',
  },
  {
    title: 'Answer the weekly prompt',
    body: 'One open question per week. Reply via the question box — no forum required.',
    href: '/prompts',
  },
  {
    title: 'Ask anything',
    body: 'Low-key email + question. We read every message.',
    href: '/ask',
  },
];

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <p className="mb-3 text-sm font-medium uppercase tracking-widest text-[var(--accent)]">
        ai-transformation.org
      </p>
      <h1 className="max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">
        Learn together — share what you&apos;re seeing in the wild
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-[var(--muted)]">
        Not another empty forum. Contribute experiences, respond to prompts, and help build curated
        insights for everyone.
      </p>

      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {ways.map((way) => (
          <Link
            key={way.href}
            href={way.href}
            className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 transition hover:border-[var(--accent)]"
          >
            <h2 className="font-semibold">{way.title}</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">{way.body}</p>
          </Link>
        ))}
      </div>

      <section className="mt-16 rounded-2xl border border-dashed border-[var(--border)] p-8 text-center">
        <h2 className="text-lg font-semibold">Harvest Hub</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-[var(--muted)]">
          Your submissions feed curated articles on{' '}
          <a href="https://ai-transformation.io/insights" className="underline">
            ai-transformation.io
          </a>
          . Newsletter switchboard coming in a later wave.
        </p>
      </section>
    </div>
  );
}
