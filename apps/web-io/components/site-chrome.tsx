import Link from 'next/link';
import { CompanionNavButton } from '@ai-transformation/chat-ui';
import { AuthNav } from '@/components/auth-nav';
import { ThemeToggle } from '@/components/theme-toggle';

type NavItem =
  | { href: string; label: string }
  | { type: 'companion'; label: string };

const nav: NavItem[] = [
  { href: '/frameworks', label: 'Frameworks' },
  { href: '/playbook', label: 'Playbook' },
  { href: '/functions', label: 'Roles' },
  { href: '/for-agents', label: 'For agents' },
  { type: 'companion', label: 'Companion' },
  { href: '/assessment', label: 'Assessment' },
  { href: '/ask', label: 'Ask' },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--background)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--background)]/80">
      <div className="layout-shell py-3 sm:py-4">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="shrink-0 font-serif text-base font-normal tracking-tight"
          >
            AI Transformation
            <span className="ml-1 font-sans text-sm font-light text-[var(--muted)]">.io</span>
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
          {nav.map((item) =>
            'type' in item && item.type === 'companion' ? (
              <CompanionNavButton key={item.label} />
            ) : (
              <Link
                key={'href' in item ? item.href : item.label}
                href={'href' in item ? item.href : '/'}
                className="whitespace-nowrap text-[var(--muted)] transition hover:text-[var(--foreground)]"
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-[var(--border)] py-8 text-center text-sm font-light text-[var(--muted)]">
      <p>
        Information for enterprise leaders.{' '}
        <Link href="/for-agents" className="underline hover:text-[var(--foreground)]">
          Agent API
        </Link>
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
