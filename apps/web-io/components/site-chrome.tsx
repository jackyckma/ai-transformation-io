import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';

const nav = [
  { href: '/functions/executive', label: 'Functions' },
  { href: '/frameworks', label: 'Frameworks' },
  { href: '/assessment', label: 'Assessment' },
  { href: '/ask', label: 'Ask' },
];

export function SiteHeader() {
  return (
    <header className="border-b border-[var(--border)] bg-[var(--card)]/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-semibold tracking-tight">
          AI Transformation
          <span className="ml-1 text-[var(--muted)]">.io</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm md:flex">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="text-[var(--muted)] hover:text-[var(--foreground)]">
              {item.label}
            </Link>
          ))}
        </nav>
        <ThemeToggle />
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-[var(--border)] py-8 text-center text-sm text-[var(--muted)]">
      <p>
        Corporate knowledge for enterprise AI transformation.{' '}
        <a href="https://ai-transformation.org" className="underline hover:text-[var(--foreground)]">
          Learn together on .org →
        </a>
      </p>
    </footer>
  );
}
