'use client';

import { usePathname } from 'next/navigation';

import { SiteCompanion as DockedCompanion } from '@/components/site-companion';

/**
 * Reading and personal-cockpit surfaces keep the full docked companion.
 * List/index pages (home, /library, /insights) and /ask demote to the
 * lightweight Ask strip (see CompanionAskEntry) instead of a second chat panel.
 */
function showsDockedCompanion(pathname: string): boolean {
  return (
    pathname.startsWith('/library/') ||
    pathname.startsWith('/insights/assessment') ||
    pathname.startsWith('/progress') ||
    pathname.startsWith('/settings') ||
    pathname.startsWith('/for-agents')
  );
}

export function LayoutCompanion() {
  const pathname = usePathname();
  if (!showsDockedCompanion(pathname)) {
    return null;
  }

  return (
    <div className="hidden border-t border-[var(--border)] lg:flex lg:h-full lg:w-[var(--chat-panel-w)] lg:shrink-0 lg:flex-col lg:overflow-hidden lg:border-t-0 lg:border-l">
      <div className="flex h-full min-h-0 flex-col overflow-hidden">
        <DockedCompanion />
      </div>
    </div>
  );
}
