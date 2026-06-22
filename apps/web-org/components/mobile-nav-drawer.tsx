'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { AuthNav } from '@/components/auth-nav';
import { ThemeToggle } from '@/components/theme-toggle';

const DRAWER_LINKS = [
  { href: '/stories', label: 'Stories' },
  { href: '/apprenticeship', label: 'Apprenticeship' },
  { href: '/prompts', label: 'Prompts' },
  { href: '/for-agents', label: 'For agents' },
  { href: 'https://ai-transformation.io', label: 'Frameworks on .io', external: true },
] as const;

export function MobileNavDrawer() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-nav-drawer"
        aria-label={open ? 'Close menu' : 'Open menu'}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--foreground)] lg:hidden"
      >
        <svg aria-hidden className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
      </button>

      {open ? (
        <button
          type="button"
          aria-label="Close menu overlay"
          className="fixed inset-0 z-50 bg-black/20 lg:hidden"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <aside
        id="mobile-nav-drawer"
        aria-hidden={!open}
        className={`fixed inset-y-0 right-0 z-[60] w-[min(100vw,18rem)] border-l border-[var(--border)] bg-[var(--background)] shadow-xl transition-transform duration-200 lg:hidden ${
          open ? 'translate-x-0' : 'pointer-events-none translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col overflow-y-auto p-5">
          <p className="text-xs font-normal uppercase tracking-[0.12em] text-[var(--secondary)]">Menu</p>
          <nav aria-label="Mobile menu" className="mt-4 flex flex-col gap-3 text-sm font-normal">
            {DRAWER_LINKS.map((item) =>
              'external' in item && item.external ? (
                <a key={item.href} href={item.href} className="text-[var(--foreground)]" rel="noopener noreferrer">
                  {item.label}
                </a>
              ) : (
                <Link key={item.href} href={item.href} className="text-[var(--foreground)]">
                  {item.label}
                </Link>
              ),
            )}
          </nav>
          <div className="mt-8 flex flex-col gap-3 border-t border-[var(--border)] pt-6">
            <AuthNav />
            <ThemeToggle />
          </div>
        </div>
      </aside>
    </>
  );
}
