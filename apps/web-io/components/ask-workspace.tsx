'use client';

import { SidebarChat } from '@ai-transformation/chat-ui';
import {
  ASK_MODE_METADATA,
  getAllowedAskModes,
  isAskModeAllowed,
  type AskMode,
} from '@ai-transformation/shared';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';

import { CaptureNote } from '@/components/capture-note';
import { useAuthUser } from '@/lib/use-auth-user';

export function AskWorkspace() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading } = useAuthUser();

  const audience = user ? 'member' : 'guest';
  const allowedModes = useMemo(() => getAllowedAskModes('io', audience), [audience]);

  const requestedMode = searchParams.get('mode') as AskMode | null;
  const mode: AskMode =
    requestedMode && isAskModeAllowed('io', audience, requestedMode) ? requestedMode : 'ask';

  const context = searchParams.get('context') ?? undefined;
  const message = searchParams.get('message') ?? searchParams.get('topic') ?? undefined;

  function selectMode(next: AskMode) {
    const params = new URLSearchParams(searchParams.toString());
    if (next === 'ask') {
      params.delete('mode');
    } else {
      params.set('mode', next);
    }
    const query = params.toString();
    router.replace(query ? `/ask?${query}` : '/ask', { scroll: false });
  }

  return (
    <div>
      <div
        role="tablist"
        aria-label="Copilot modes"
        className="flex flex-wrap gap-2 border-b border-[var(--border)] pb-4"
      >
        {allowedModes.map((value) => {
          const active = value === mode;
          return (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => selectMode(value)}
              className={`rounded-full border px-4 py-1.5 text-sm transition ${
                active
                  ? 'border-[var(--accent)] bg-[var(--accent)]/10 font-normal text-[var(--foreground)]'
                  : 'border-[var(--border)] font-light text-[var(--secondary)] hover:border-[var(--accent)]/40 hover:text-[var(--foreground)]'
              }`}
            >
              {ASK_MODE_METADATA[value].label}
            </button>
          );
        })}
        {!isLoading && audience === 'guest' ? (
          <span className="ml-auto self-center text-xs font-light text-[var(--muted)]">
            Sign in for Capture
          </span>
        ) : null}
      </div>

      <p className="mt-4 text-sm font-light leading-relaxed text-[var(--muted)]">
        {ASK_MODE_METADATA[mode].placeholder}
      </p>

      {context && mode === 'ask' ? (
        <p className="mt-3 inline-flex items-center rounded-full bg-[var(--accent)]/10 px-3 py-1 text-xs font-normal text-[var(--foreground)]">
          In context: {context}
        </p>
      ) : null}

      <div className="mt-6">
        {mode === 'capture' ? (
          <CaptureNote context={context} />
        ) : (
          <SidebarChat site="io" layout="page" initialInput={message} />
        )}
      </div>
    </div>
  );
}
