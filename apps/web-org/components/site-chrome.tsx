import Link from 'next/link';

import { DesktopNavLinks } from '@/components/desktop-nav-links';
import { MobileNavDrawer } from '@/components/mobile-nav-drawer';
import { NewsletterSubscribe } from '@/components/newsletter-subscribe';
import { ThemeToggle } from '@/components/theme-toggle';
import { ORG_RIBBON } from '@/lib/nav';

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
            <span className="ml-1 font-sans text-sm font-normal text-[var(--secondary)]">.org</span>
          </Link>

          <div className="relative z-40 flex shrink-0 items-center gap-2 sm:gap-3">
            <nav
              aria-label="Primary"
              className="hidden flex-wrap items-center gap-x-5 text-sm lg:flex"
            >
              <DesktopNavLinks links={ORG_RIBBON} />
            </nav>
            <div className="hidden items-center lg:flex">
              <ThemeToggle />
            </div>
            <MobileNavDrawer />
          </div>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="hidden shrink-0 border-t border-[var(--border)] py-6 text-sm font-normal text-[var(--secondary)] lg:block">
      <div className="site-panel-x layout-shell flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-serif text-[var(--foreground)]">
          A community knowledge commons for AI transformation — share experiences, not hype.
        </p>
        <nav aria-label="Footer" className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <a href="/ask?mode=submit" className="underline hover:text-[var(--foreground)]">
            Contribute
          </a>
          <a href="/api/agent" className="underline hover:text-[var(--foreground)]">
            Agent entry
          </a>
          <a href="https://ai-transformation.io" className="underline hover:text-[var(--foreground)]">
            Frameworks on .io
          </a>
        </nav>
      </div>
      <div className="site-panel-x layout-shell mt-6 border-t border-[var(--border)] pt-6">
        <NewsletterSubscribe list="org_harvest" label="Get the Harvest Hub digest" />
      </div>
      <p className="site-panel-x layout-shell mt-6 text-xs text-[var(--secondary)]">
        © {year} AI Transformation
      </p>
    </footer>
  );
}
