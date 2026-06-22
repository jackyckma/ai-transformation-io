'use client';

import { useSearchParams } from 'next/navigation';
import { SidebarChat } from '@ai-transformation/chat-ui';

export function AskChat() {
  const searchParams = useSearchParams();
  const initialInput = searchParams.get('message') ?? searchParams.get('topic') ?? undefined;

  return <SidebarChat site="io" layout="page" initialInput={initialInput} />;
}
