import Link from 'next/link';
import { AuthNav } from '@/components/auth-nav';
import { ThemeToggle } from '@/components/theme-toggle';

const nav = [
  { href: '/stories', label: 'Stories' },
  { href: '/stories/submit', label: 'Share' },
  { href: '/prompts', label: 'Prompts' },
  { href: '/learn', label: 'Learn' },
  { href: '/apprenticeship', label: 'Apprenticeship' },
  { href: '/for-agents', label: 'For agents' },
  { href: '/ask', label: 'Ask' },
];

export function SiteHeader() {
  return (
    <header className="border-b border-[var(--border)]">
      <div className="layout-shell grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-4 py-4 sm:py-5 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:gap-x-8">
        <Link href="/" className="col-start-1 row-start-1 shrink-0 font-serif text-base font-normal tracking-tight">
          AI Transformation
          <span className="ml-1 font-sans text-sm font-light text-[var(--muted)]">.org</span>
        </Link>
        <div className="col-start-2 row-start-1 flex shrink-0 items-center gap-3">
          <AuthNav />
          <ThemeToggle />
        </div>
        <nav
          aria-label="Primary"
          className="col-span-2 row-start-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-light lg:col-span-1 lg:col-start-2 lg:row-start-1 lg:justify-center"
        >
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap text-[var(--muted)] transition hover:text-[var(--foreground)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-[var(--border)] py-10 text-center text-sm font-light text-[var(--muted)]">
      <p>
        Harvest Hub — share experiences, not hype.{' '}
        <Link href="/for-agents" className="underline hover:text-[var(--foreground)]">
          Agent-friendly API
        </Link>
        {' · '}
        <a href="https://ai-transformation.io" className="underline hover:text-[var(--foreground)]">
          Frameworks on .io
        </a>
      </p>
    </footer>
  );
}
