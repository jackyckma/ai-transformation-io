'use client';

import { usePathname } from 'next/navigation';
import { CompanionAskStrip } from '@ai-transformation/chat-ui';

/** List/index surfaces that get a subtle Ask entry instead of a docked chat panel. */
const ASK_STRIP_PATHS = new Set(['/', '/library', '/insights']);

export function CompanionAskEntry() {
  const pathname = usePathname();
  if (!ASK_STRIP_PATHS.has(pathname)) {
    return null;
  }

  return (
    <div className="site-panel-x layout-read pb-10 pt-4">
      <CompanionAskStrip site="io" />
    </div>
  );
}
