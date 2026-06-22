'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import type { HubSection } from '@/lib/hub-index';
import { PageIntro } from '@/components/page-intro';

const TONE_CLASSES = [
  'from-[#e8e4dc] to-[#f5f2eb] dark:from-[#2a2824] dark:to-[#1a1917]',
  'from-[#dce8e0] to-[#f0f7f3] dark:from-[#1e2a24] dark:to-[#141916]',
  'from-[#e5dfe8] to-[#f3eff5] dark:from-[#252028] dark:to-[#18161a]',
  'from-[#dfe4ea] to-[#eef1f5] dark:from-[#1e2228] dark:to-[#121416]',
] as const;

function toneForSeed(seed: string): (typeof TONE_CLASSES)[number] {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash + seed.charCodeAt(i)) % TONE_CLASSES.length;
  }
  return TONE_CLASSES[hash] ?? TONE_CLASSES[0];
}

type HubIndexSectionsProps = {
  title: string;
  description: string;
  seed: string;
  sections: HubSection[];
};

export function HubIndexSections({ title, description, seed, sections }: HubIndexSectionsProps) {
  return (
    <>
      <PageIntro title={title} description={description} seed={seed} />

      <div className="space-y-10">
        {sections.map((section) => (
          <section key={section.id} aria-labelledby={`hub-section-${section.id}`}>
            <h2
              id={`hub-section-${section.id}`}
              className="text-xs font-normal uppercase tracking-[0.12em] text-[var(--secondary)]"
            >
              {section.title}
            </h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {section.items.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className="group flex gap-3 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 transition hover:border-[var(--accent)]/40"
                  >
                    <div
                      className={`mt-0.5 h-full min-h-[3.5rem] w-1 shrink-0 rounded-full bg-gradient-to-b ${toneForSeed(item.id)}`}
                      aria-hidden
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-normal uppercase tracking-wide text-[var(--secondary)]">
                        {item.label}
                      </p>
                      <h3 className="font-serif mt-1 text-base font-normal leading-snug tracking-tight text-[var(--foreground)] transition group-hover:text-[var(--accent)]">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm font-normal leading-relaxed text-[var(--muted)]">
                        {item.description}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}

type HubNavLink = { href: string; label: string };

export function DesktopNavLinks({ links }: { links: readonly HubNavLink[] }) {
  const pathname = usePathname();

  return (
    <>
      {links.map((item) => {
        const active =
          item.href === '/'
            ? pathname === '/'
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`whitespace-nowrap transition ${
              active
                ? 'font-normal text-[var(--foreground)] underline decoration-[var(--accent)] underline-offset-4'
                : 'text-[var(--secondary)] hover:text-[var(--foreground)]'
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </>
  );
}
