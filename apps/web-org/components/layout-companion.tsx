'use client';

import { usePathname } from 'next/navigation';

import { SiteCompanion as DockedCompanion } from '@/components/site-companion';

/** Index/list routes that demote the docked chat to an inline Ask strip (Wave 15 item 9). */
const ASK_STRIP_ROUTES = new Set(['/community', '/knowledge']);

export function LayoutCompanion() {
  const pathname = usePathname();
  if (pathname === '/ask' || ASK_STRIP_ROUTES.has(pathname)) {
    return null;
  }

  return (
    <div className="border-t border-[var(--border)] lg:flex lg:h-full lg:w-[var(--chat-panel-w)] lg:shrink-0 lg:flex-col lg:overflow-hidden lg:border-t-0 lg:border-l">
      <div className="hidden h-full min-h-0 flex-col overflow-hidden lg:flex">
        <DockedCompanion />
      </div>
    </div>
  );
}
