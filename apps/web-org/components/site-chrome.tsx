import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';

const nav = [
  { href: '/learn', label: 'Learn' },
  { href: '/start', label: 'Start here' },
  { href: '/stories', label: 'Stories' },
  { href: '/prompts', label: 'Prompts' },
  { href: '/ask', label: 'Ask' },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--background)]/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-semibold tracking-tight">
          AI Transformation
          <span className="ml-1 font-normal text-[var(--muted)]">.org</span>
        </Link>
        <nav className="hidden items-center gap-5 text-sm md:flex">
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
        Harvest Hub — share experiences, not hype.{' '}
        <a href="https://ai-transformation.io" className="underline hover:text-[var(--foreground)]">
          Frameworks on .io →
        </a>
      </p>
    </footer>
  );
}
