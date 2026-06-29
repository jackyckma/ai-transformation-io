'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import type { NavLink } from '@/lib/nav';

export function DesktopNavLinks({ links }: { links: readonly NavLink[] }) {
  const pathname = usePathname();

  return (
    <>
      {links.map((item) => {
        const active =
          item.href === '/'
            ? pathname === '/'
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={`whitespace-nowrap transition ${
              active
                ? 'font-normal text-[var(--surface-chrome-fg)] underline decoration-[var(--accent)] underline-offset-4'
                : 'text-[var(--surface-chrome-muted)] hover:text-[var(--surface-chrome-fg)]'
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </>
  );
}
