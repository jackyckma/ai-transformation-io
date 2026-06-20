import Link from 'next/link';
import { AuthNav } from '@/components/auth-nav';
import { ThemeToggle } from '@/components/theme-toggle';

const nav = [
  { href: '/frameworks', label: 'Frameworks' },
  { href: '/playbook', label: 'Playbook' },
  { href: '/for-agents', label: 'For agents' },
  { href: '/assessment', label: 'Assessment' },
  { href: '/ask', label: 'Ask' },
];

export function SiteHeader() {
  return (
    <header className="border-b border-[var(--border)]">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-6 py-5">
        <Link href="/" className="font-serif text-base font-normal tracking-tight">
          AI Transformation
          <span className="ml-1 font-sans text-sm font-light text-[var(--muted)]">.io</span>
        </Link>
        <nav className="hidden items-center gap-5 text-sm font-light md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[var(--muted)] transition hover:text-[var(--foreground)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <AuthNav />
          <ThemeToggle />
        </div>
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
        <a href="https://ai-transformation.org" className="underline hover:text-[var(--foreground)]">
          Community on .org
        </a>
      </p>
    </footer>
  );
}
