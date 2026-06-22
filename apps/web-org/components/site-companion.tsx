'use client';

import { SidebarChat } from '@ai-transformation/chat-ui';

export function SiteCompanion() {
  return <SidebarChat site="org" apiBase={process.env.NEXT_PUBLIC_API_BASE_URL ?? ''} />;
}
