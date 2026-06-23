import Link from 'next/link';

import { MobileNavDrawer } from '@/components/mobile-nav-drawer';
import { RibbonNav } from '@/components/ribbon-nav';
import { ThemeToggle } from '@/components/theme-toggle';
import { IO_RIBBON } from '@/lib/nav';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 shrink-0 border-b border-[var(--border)] bg-[var(--background)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--background)]/80">
      <div className="site-panel-x py-3 sm:py-4">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="min-w-0 max-w-[calc(100%-6rem)] truncate font-serif text-xl font-normal tracking-tight text-[var(--foreground)] md:max-w-none md:text-[1.35rem]"
          >
            AI Transformation
            <span className="ml-1 font-sans text-sm font-normal text-[var(--secondary)]">.io</span>
          </Link>

          <div className="relative z-40 flex shrink-0 items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <MobileNavDrawer />
          </div>
        </div>

        <nav
          aria-label="Primary"
          className="mt-3 hidden flex-wrap items-center gap-x-5 gap-y-2 text-sm lg:mt-4 lg:flex"
        >
          <RibbonNav tabs={IO_RIBBON} />
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
        <Link href="/library" className="underline hover:text-[var(--foreground)]">
          Library
        </Link>
        {' · '}
        <Link href="/insights" className="underline hover:text-[var(--foreground)]">
          Insights
        </Link>
        {' · '}
        <a href="https://ai-transformation.org" className="underline hover:text-[var(--foreground)]">
          Community on .org
        </a>
      </p>
    </footer>
  );
}
