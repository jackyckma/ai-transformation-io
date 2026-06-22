import Link from 'next/link';

import { AuthNav } from '@/components/auth-nav';
import { DesktopNavLinks } from '@/components/hub-index-sections';
import { MobileNavDrawer } from '@/components/mobile-nav-drawer';
import { ThemeToggle } from '@/components/theme-toggle';

const DESKTOP_NAV = [
  { href: '/frameworks', label: 'Frameworks' },
  { href: '/playbook', label: 'Playbook' },
  { href: '/functions', label: 'Roles' },
  { href: '/assessment', label: 'Assessment' },
  { href: '/for-agents', label: 'For agents' },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 shrink-0 border-b border-[var(--border)] bg-[var(--background)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--background)]/80">
      <div className="site-panel-x py-3 sm:py-4">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="min-w-0 max-w-[calc(100%-3rem)] truncate font-serif text-xl font-normal tracking-tight text-[var(--foreground)] md:max-w-none md:text-[1.35rem]"
          >
            AI Transformation
            <span className="ml-1 font-sans text-sm font-normal text-[var(--secondary)]">.io</span>
          </Link>

          <div className="relative z-40 flex shrink-0 items-center gap-2 sm:gap-3">
            <div className="hidden items-center gap-2 sm:gap-3 lg:flex">
              <AuthNav />
              <ThemeToggle />
            </div>
            <MobileNavDrawer />
          </div>
        </div>

        <nav
          aria-label="Primary"
          className="mt-3 hidden flex-wrap items-center gap-x-4 gap-y-2 text-sm lg:mt-4 lg:flex"
        >
          <DesktopNavLinks links={DESKTOP_NAV} />
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="hidden shrink-0 border-t border-[var(--border)] py-6 text-center text-sm font-normal text-[var(--secondary)] lg:block">
      <p>
        Information for enterprise leaders.{' '}
        <a href="/api/agent" className="underline hover:text-[var(--foreground)]">
          Agent entry
        </a>
        {' · '}
        <Link href="/frameworks" className="underline hover:text-[var(--foreground)]">
          Frameworks
        </Link>
        {' · '}
        <Link href="/progress" className="underline hover:text-[var(--foreground)]">
          Your progress
        </Link>
        {' · '}
        <a href="https://ai-transformation.org" className="underline hover:text-[var(--foreground)]">
          Community on .org
        </a>
      </p>
    </footer>
  );
}
