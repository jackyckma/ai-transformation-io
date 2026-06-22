'use client';

import { SidebarChat } from '@ai-transformation/chat-ui';

export function SiteCompanion() {
  return <SidebarChat site="io" apiBase={process.env.NEXT_PUBLIC_API_BASE_URL ?? ''} />;
}
