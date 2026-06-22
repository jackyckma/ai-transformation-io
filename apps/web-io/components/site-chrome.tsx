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
  { href: '/for-agents', label: 'For agents' },
  { href: '/assessment', label: 'Assessment' },
  { type: 'companion', label: 'Companion' },
  { href: '/ask', label: 'Ask' },
];

export function SiteHeader() {
  return (
    <header className="border-b border-[var(--border)]">
      <div className="layout-shell grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-4 py-4 sm:py-5 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:gap-x-8">
        <Link href="/" className="col-start-1 row-start-1 shrink-0 font-serif text-base font-normal tracking-tight">
          AI Transformation
          <span className="ml-1 font-sans text-sm font-light text-[var(--muted)]">.io</span>
        </Link>
        <div className="col-start-2 row-start-1 flex shrink-0 items-center gap-3">
          <AuthNav />
          <ThemeToggle />
        </div>
        <nav
          aria-label="Primary"
          className="col-span-2 row-start-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-light lg:col-span-1 lg:col-start-2 lg:row-start-1 lg:justify-center"
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
    <footer className="mt-auto border-t border-[var(--border)] py-10 text-center text-sm font-light text-[var(--muted)]">
      <p>
        Information for enterprise leaders.{' '}
        <Link href="/for-agents" className="underline hover:text-[var(--foreground)]">
          Agent-friendly API
        </Link>
        {' · '}
        <Link href="/functions" className="underline hover:text-[var(--foreground)]">
          Role guides
        </Link>
        {' · '}
        <a href="https://ai-transformation.org" className="underline hover:text-[var(--foreground)]">
          Community on .org
        </a>
      </p>
    </footer>
  );
}
