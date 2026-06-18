import Link from 'next/link';

const gaps = [
  {
    title: 'Work redesign',
    body: 'End-to-end workflow change — not copilot login counts.',
  },
  {
    title: 'Governance',
    body: 'Clear autonomy boundaries, accountability, and monitoring.',
  },
  {
    title: 'Value measurement',
    body: 'Outcome hypotheses and multidimensional ROI before scale.',
  },
];

const functions = [
  { href: '/functions/executive', label: 'Executive / Board' },
  { href: '/functions/cio', label: 'CIO / CTO' },
  { href: '/functions/coo', label: 'COO / Operations' },
  { href: '/functions/cfo', label: 'CFO / Finance' },
  { href: '/functions/chro', label: 'CHRO / People' },
];

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <p className="mb-3 text-sm font-medium uppercase tracking-widest text-[var(--accent)]">
        Enterprise AI transformation
      </p>
      <h1 className="max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">
        Close the gap between AI deployment and operating model change
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-[var(--muted)]">
        Practical frameworks for leaders — organized by function, grounded in research, free of hype.
      </p>
      <div className="mt-10 flex flex-wrap gap-4">
        <Link
          href="/assessment"
          className="rounded-lg bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-white"
        >
          Take the assessment
        </Link>
        <Link
          href="/frameworks/roadmap"
          className="rounded-lg border border-[var(--border)] px-5 py-2.5 text-sm font-medium"
        >
          Explore the roadmap
        </Link>
      </div>

      <section className="mt-20">
        <h2 className="text-2xl font-semibold">The Three Gaps</h2>
        <p className="mt-2 max-w-2xl text-[var(--muted)]">
          Most organizations deploy AI tools but stall on the shifts that create value.
        </p>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {gaps.map((gap) => (
            <article key={gap.title} className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
              <h3 className="font-semibold">{gap.title}</h3>
              <p className="mt-2 text-sm text-[var(--muted)]">{gap.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-20">
        <h2 className="text-2xl font-semibold">By function</h2>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {functions.map((fn) => (
            <li key={fn.href}>
              <Link
                href={fn.href}
                className="block rounded-lg border border-[var(--border)] px-4 py-3 text-sm hover:border-[var(--accent)]"
              >
                {fn.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
