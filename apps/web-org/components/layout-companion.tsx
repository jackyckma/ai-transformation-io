'use client';

import { usePathname } from 'next/navigation';

import { SiteCompanion as DockedCompanion } from '@/components/site-companion';

export function LayoutCompanion() {
  const pathname = usePathname();
  if (pathname === '/ask') {
    return null;
  }

  return (
    <div className="hidden h-full min-h-0 flex-col overflow-hidden lg:flex">
      <DockedCompanion />
    </div>
  );
}
