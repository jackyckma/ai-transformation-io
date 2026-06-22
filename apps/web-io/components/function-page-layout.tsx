import type { ReactNode } from 'react';
import Link from 'next/link';
import { CompanionTopicPrompt } from '@ai-transformation/chat-ui';
import type { FunctionPageContent } from '@/data/function-pages';
import { PageShell } from '@/components/page-shell';

type FunctionPageLayoutProps = {
  page: FunctionPageContent;
};

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-[var(--border)] pt-10 first:border-t-0 first:pt-0">
      <h2 className="font-serif text-xl font-normal tracking-tight text-[var(--foreground)]">{title}</h2>
      <div className="mt-4 space-y-3 text-sm font-light leading-relaxed text-[var(--muted)]">{children}</div>
    </section>
  );
}

export function FunctionPageLayout({ page }: FunctionPageLayoutProps) {
  return (
    <PageShell as="article">
      <header className="mb-8 border-b border-[var(--border)] pb-8">
        <p className="text-xs font-light tracking-wide text-[var(--muted)]">{page.subtitle}</p>
        <h1 className="font-serif mt-3 text-2xl font-normal tracking-tight md:text-[1.85rem]">{page.title}</h1>
        <p className="mt-4 max-w-xl text-sm font-light leading-relaxed text-[var(--muted)]">{page.description}</p>
      </header>

      <CompanionTopicPrompt
        topic={page.title}
        message={`I'm a ${page.title.toLowerCase()} looking at AI transformation. Where should I focus first?`}
        className="mb-10"
      />

      <div className="space-y-10">
        <Section title="You own">
          <ul className="list-disc space-y-2 pl-5">
            {page.youOwn.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Section>

        <Section title="Three Gaps lens">
          <ul className="space-y-4">
            {page.threeGapsLens.map((item) => (
              <li key={item.gap}>
                <span className="font-normal text-[var(--foreground)]">{item.gap}</span>
                <span className="mt-1 block">{item.insight}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Key decisions">
          <ol className="list-decimal space-y-2 pl-5">
            {page.keyDecisions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </Section>

        <Section title="Checklist">
          <p className="text-[var(--muted)]">Self-assessment items — many feed the full Three Gaps diagnostic.</p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            {page.checklist.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Section>

        <Section title="Playbook & frameworks">
          <ul className="space-y-2">
            {page.playbookLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-[var(--foreground)] underline decoration-[var(--border)] underline-offset-4 hover:decoration-[var(--accent)]"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Case patterns">
          <ul className="space-y-5">
            {page.casePatterns.map((pattern) => (
              <li key={pattern.title}>
                <p className="font-normal text-[var(--foreground)]">{pattern.title}</p>
                <p className="mt-1">{pattern.body}</p>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Next step">
          <ul className="flex flex-wrap gap-3">
            {page.nextSteps.map((step) =>
              step.external ? (
                <li key={step.href}>
                  <a
                    href={step.href}
                    className="inline-flex rounded-full border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--foreground)] transition hover:border-[var(--accent)]"
                  >
                    {step.label}
                  </a>
                </li>
              ) : (
                <li key={step.href}>
                  <Link
                    href={step.href}
                    className="inline-flex rounded-full border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--foreground)] transition hover:border-[var(--accent)]"
                  >
                    {step.label}
                  </Link>
                </li>
              ),
            )}
          </ul>
        </Section>
      </div>

      <Link
        href="/functions"
        className="mt-12 inline-block text-sm font-light text-[var(--muted)] hover:text-[var(--foreground)]"
      >
        ← All role guides
      </Link>
    </PageShell>
  );
}
