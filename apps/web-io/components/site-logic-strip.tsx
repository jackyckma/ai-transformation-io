import Link from 'next/link';

const STEPS = [
  {
    title: 'Ask',
    body: 'Start with the companion — answers grounded in frameworks and playbook content.',
    href: '/ask',
    label: 'Open companion',
  },
  {
    title: 'Read',
    body: 'Role guides, frameworks, and playbook articles when you need structured depth.',
    href: '/frameworks',
    label: 'Frameworks',
  },
  {
    title: 'Assess',
    body: 'Three Gaps diagnostic when you are ready to measure progress — secondary, not the front door.',
    href: '/assessment',
    label: 'Assessment',
  },
] as const;

export function SiteLogicStrip() {
  return (
    <section aria-labelledby="site-logic-heading" className="mt-8 max-w-3xl">
      <h2
        id="site-logic-heading"
        className="text-xs font-light uppercase tracking-wide text-[var(--muted)]"
      >
        How this site works
      </h2>
      <ol className="mt-4 grid gap-4 md:grid-cols-3">
        {STEPS.map((step, index) => (
          <li
            key={step.title}
            className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4"
          >
            <p className="text-xs font-light text-[var(--muted)]">Step {index + 1}</p>
            <h3 className="font-serif mt-1 text-lg font-normal tracking-tight">{step.title}</h3>
            <p className="mt-2 text-sm font-light leading-relaxed text-[var(--muted)]">{step.body}</p>
            <Link
              href={step.href}
              className="mt-3 inline-block text-sm font-light text-[var(--foreground)] underline-offset-4 hover:underline"
            >
              {step.label} →
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
