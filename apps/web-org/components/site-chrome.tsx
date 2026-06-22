import Link from 'next/link';
import { AuthNav } from '@/components/auth-nav';
import { ThemeToggle } from '@/components/theme-toggle';

const nav = [
  { href: '/stories/submit', label: 'Share' },
  { href: '/stories', label: 'Stories' },
  { href: '/learn', label: 'Learn' },
  { href: '/apprenticeship', label: 'Apprenticeship' },
  { href: '/prompts', label: 'Prompts' },
  { href: '/for-agents', label: 'For agents' },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--background)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--background)]/80">
      <div className="site-panel-x py-3 sm:py-4">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="shrink-0 font-serif text-base font-normal tracking-tight"
          >
            AI Transformation
            <span className="ml-1 font-sans text-sm font-light text-[var(--muted)]">.org</span>
          </Link>

          <div className="relative z-40 flex shrink-0 items-center gap-2 sm:gap-3">
            <AuthNav />
            <ThemeToggle />
          </div>
        </div>

        <nav
          aria-label="Primary"
          className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-light sm:mt-4"
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
    <footer className="mt-auto border-t border-[var(--border)] py-6 text-center text-sm font-light text-[var(--muted)]">
      <p>
        Harvest Hub — share experiences, not hype.{' '}
        <a href="/api/agent" className="underline hover:text-[var(--foreground)]">
          Agent entry
        </a>
        {' · '}
        <a href="https://ai-transformation.io" className="underline hover:text-[var(--foreground)]">
          Frameworks on .io
        </a>
      </p>
    </footer>
  );
}
