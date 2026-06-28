'use client';

import { usePathname } from 'next/navigation';

import { SidebarChat } from '@ai-transformation/chat-ui';

/** Full /ask workspace replaces the docked panel; every other route keeps Copilot visible. */
function isCopilotWorkspace(pathname: string): boolean {
  return pathname === '/ask' || pathname.startsWith('/ask?');
}

export function LayoutCompanion() {
  const pathname = usePathname();
  if (isCopilotWorkspace(pathname)) {
    return null;
  }

  return (
    <>
      <div className="hidden border-t border-[var(--border)] lg:flex lg:h-full lg:w-[var(--chat-panel-w)] lg:shrink-0 lg:flex-col lg:overflow-hidden lg:border-t-0 lg:border-l">
        <div className="flex h-full min-h-0 flex-col overflow-hidden">
          <SidebarChat site="io" layout="docked" />
        </div>
      </div>
      <div className="lg:hidden">
        <SidebarChat site="io" layout="floating" />
      </div>
    </>
  );
}
