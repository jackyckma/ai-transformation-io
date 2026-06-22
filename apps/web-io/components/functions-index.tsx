import Link from 'next/link';

import { FUNCTION_PAGES, FUNCTION_SLUGS } from '@/data/function-pages';
import { PageIntro } from '@/components/page-intro';

export function FunctionsIndex() {
  const roles = FUNCTION_SLUGS.map((slug) => FUNCTION_PAGES[slug]);

  return (
    <div className="layout-read py-14 md:py-16">
      <PageIntro
        title="Guides by role"
        description="How AI transformation shows up for your lane — responsibilities, decisions, and links into frameworks and playbook. Secondary to curated home paths; not a product quiz."
      />

      <section className="mt-10">
        <h2 className="font-serif text-lg font-normal tracking-tight">Role guides</h2>
        <ul className="mt-5 space-y-4">
          {roles.map((role) => (
            <li key={role.slug} className="border-b border-[var(--border)] pb-4 last:border-b-0">
              <Link href={`/functions/${role.slug}`} className="group block">
                <span className="font-serif text-base text-[var(--foreground)] group-hover:text-[var(--accent)]">
                  {role.title}
                </span>
                <p className="mt-1 text-sm font-light text-[var(--muted)]">{role.description}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12 border-t border-[var(--border)] pt-10">
        <h2 className="font-serif text-lg font-normal tracking-tight">Reference</h2>
        <p className="mt-2 text-sm font-light text-[var(--muted)]">
          Shared playbook entries — useful across roles.
        </p>
        <ul className="mt-5 space-y-3 text-sm font-light">
          <li>
            <Link
              href="/playbook/glossary"
              className="underline decoration-[var(--border)] underline-offset-4 hover:decoration-[var(--accent)]"
            >
              Glossary
            </Link>
            <span className="text-[var(--muted)]"> — autonomy, RoA, workflow redesign</span>
          </li>
          <li>
            <Link
              href="/playbook/faq"
              className="underline decoration-[var(--border)] underline-offset-4 hover:decoration-[var(--accent)]"
            >
              FAQ
            </Link>
            <span className="text-[var(--muted)]"> — first questions leaders ask</span>
          </li>
          <li>
            <Link
              href="/playbook/use-cases"
              className="underline decoration-[var(--border)] underline-offset-4 hover:decoration-[var(--accent)]"
            >
              Use cases by industry
            </Link>
            <span className="text-[var(--muted)]"> — sector patterns</span>
          </li>
        </ul>
      </section>
    </div>
  );
}
