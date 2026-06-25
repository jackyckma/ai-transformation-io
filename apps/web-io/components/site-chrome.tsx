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
  const year = new Date().getFullYear();
  return (
    <footer className="hidden shrink-0 border-t border-[var(--border)] lg:block">
      <div className="site-panel-x py-6">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-3">
          <p className="font-serif text-sm font-normal tracking-tight text-[var(--foreground)]">
            Organized knowledge for enterprise AI transformation.
          </p>
          <nav
            aria-label="Footer"
            className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-light text-[var(--secondary)]"
          >
            <Link href="/library" className="hover:text-[var(--foreground)]">
              Library
            </Link>
            <Link href="/insights" className="hover:text-[var(--foreground)]">
              Insights
            </Link>
            <a href="/api/agent" className="hover:text-[var(--foreground)]">
              Agent entry
            </a>
            <a href="https://ai-transformation.org" className="hover:text-[var(--foreground)]">
              Community on .org
            </a>
            <Link href="/ask" className="hover:text-[var(--foreground)]">
              Contact
            </Link>
          </nav>
        </div>
        <p className="mt-4 text-xs font-light text-[var(--muted)]">© {year} AI Transformation</p>
      </div>
    </footer>
  );
}
