'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import type { RibbonTab } from '@/lib/nav';

function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function RibbonNav({ tabs }: { tabs: readonly RibbonTab[] }) {
  const pathname = usePathname();

  return (
    <>
      {tabs.map((tab) => {
        const active = isActive(pathname, tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? 'page' : undefined}
            className={`whitespace-nowrap transition ${
              active
                ? 'font-normal text-[var(--foreground)] underline decoration-[var(--accent)] underline-offset-4'
                : 'text-[var(--secondary)] hover:text-[var(--foreground)]'
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </>
  );
}
