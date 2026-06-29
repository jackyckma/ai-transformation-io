'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { AuthNav } from '@/components/auth-nav';
import { ThemeToggle } from '@/components/theme-toggle';
import { ORG_HAMBURGER_LINKS } from '@/lib/nav';

export function MobileNavDrawer() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

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

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const drawer =
    mounted && typeof document !== 'undefined'
      ? createPortal(
          <>
            {open ? (
              <button
                type="button"
                aria-label="Close menu overlay"
                className="fixed inset-0 z-[100] bg-black/25"
                onClick={() => setOpen(false)}
              />
            ) : null}

            <aside
              id="mobile-nav-drawer"
              aria-hidden={!open}
              className={`fixed inset-y-0 right-0 z-[110] w-[min(100vw,20rem)] border-l border-[var(--border)] bg-[var(--background)] shadow-xl transition-transform duration-200 ease-out ${
                open ? 'translate-x-0' : 'pointer-events-none translate-x-full'
              }`}
            >
              <div className="flex h-full flex-col overflow-y-auto p-5 pt-[max(1.25rem,env(safe-area-inset-top))]">
                <p className="text-xs font-normal uppercase tracking-[0.12em] text-[var(--secondary)]">Account</p>
                <div className="mt-4">
                  <AuthNav />
                </div>

                <p className="mt-8 text-xs font-normal uppercase tracking-[0.12em] text-[var(--secondary)]">Menu</p>
                <nav aria-label="Menu" className="mt-4 flex flex-col gap-4 text-sm font-normal">
                  {ORG_HAMBURGER_LINKS.map((item) =>
                    item.external ? (
                      <a
                        key={item.href}
                        href={item.href}
                        className="text-[var(--foreground)] hover:text-[var(--accent)]"
                        rel="noopener noreferrer"
                      >
                        {item.label}
                      </a>
                    ) : (
                      <Link key={item.href} href={item.href} className="group block">
                        <span className="text-[var(--foreground)] group-hover:text-[var(--accent)]">
                          {item.label}
                        </span>
                        {item.description ? (
                          <span className="mt-0.5 block text-xs font-light text-[var(--muted)]">
                            {item.description}
                          </span>
                        ) : null}
                      </Link>
                    ),
                  )}
                </nav>
                <div className="mt-8 flex items-center justify-between border-t border-[var(--border)] pt-6">
                  <span className="text-sm font-light text-[var(--muted)]">Appearance</span>
                  <ThemeToggle />
                </div>
              </div>
            </aside>
          </>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-nav-drawer"
        aria-label={open ? 'Close menu' : 'Open menu'}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[color-mix(in_srgb,var(--surface-chrome-fg)_32%,transparent)] bg-[color-mix(in_srgb,var(--surface-chrome-fg)_8%,transparent)] text-[var(--surface-chrome-fg)] shadow-sm"
      >
        <svg aria-hidden className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          {open ? (
            <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
          ) : (
            <>
              <path d="M4 7h16" strokeLinecap="round" />
              <path d="M4 12h16" strokeLinecap="round" />
              <path d="M4 17h16" strokeLinecap="round" />
            </>
          )}
        </svg>
      </button>
      {drawer}
    </>
  );
}
