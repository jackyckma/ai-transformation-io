'use client';

import { resolveClientApiUrl } from '@ai-transformation/shared';
import { useCallback, useEffect, useRef, useState } from 'react';

import { OPEN_COMPANION_EVENT, OPEN_COMPANION_WITH_MESSAGE_EVENT } from './companion-nav';

type ChatSite = 'io' | 'org';
type ChatLayout = 'docked' | 'floating' | 'page';

type ChatLink = {
  label: string;
  href: string;
};

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  links?: ChatLink[];
  createdAt: string;
};

type ChatQuota = {
  limit: number;
  remaining: number;
  reset: string;
};

export type SidebarChatProps = {
  site: ChatSite;
  layout?: ChatLayout;
  /** Prefill the message input (e.g. from /ask?message=). */
  initialInput?: string;
  /** @deprecated use same-origin resolveClientApiUrl inside the component */
  apiBase?: string;
};

const COPY: Record<
  ChatSite,
  { title: string; subtitle: string; placeholder: string; toggle: string }
> = {
  io: {
    title: 'Copilot',
    subtitle: 'Grounded in this site’s library and insights.',
    placeholder: 'Ask about frameworks, roles, or where to start…',
    toggle: 'Open Copilot',
  },
  org: {
    title: 'Copilot',
    subtitle: 'Learn, share, and find your next step in the community.',
    placeholder: 'Ask about learn guides, stories, or prompts…',
    toggle: 'Open Copilot',
  },
};

export function SidebarChat({ site, layout = 'docked', initialInput }: SidebarChatProps) {
  const copy = COPY[site];
  const isDocked = layout === 'docked';
  const isPage = layout === 'page';
  const [open, setOpen] = useState(isDocked || isPage);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [quota, setQuota] = useState<ChatQuota | null>(null);
  const [input, setInput] = useState(initialInput ?? '');
  const [loadingSession, setLoadingSession] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    const node = listRef.current;
    if (!node) return;
    node.scrollTop = node.scrollHeight;
  }, []);

  const loadSession = useCallback(async () => {
    setLoadingSession(true);
    setError(null);
    try {
      const res = await fetch(resolveClientApiUrl(`/api/chat/session?site=${site}`), {
        credentials: 'include',
      });
      const data = (await res.json()) as {
        ok?: boolean;
        session?: { messages: ChatMessage[]; quota: ChatQuota };
        error?: string;
      };
      if (!res.ok || !data.ok || !data.session) {
        throw new Error(data.error ?? 'Could not load chat');
      }
      setMessages(data.session.messages);
      setQuota(data.session.quota);
      setLoaded(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load chat');
    } finally {
      setLoadingSession(false);
    }
  }, [site]);

  useEffect(() => {
    void loadSession();
  }, [loadSession]);

  useEffect(() => {
    if (!isPage || !initialInput) {
      return undefined;
    }

    setInput(initialInput);
    inputRef.current?.focus();

    return undefined;
  }, [isPage, initialInput]);

  useEffect(() => {
    if (isDocked || isPage) {
      return undefined;
    }

    const openFromNav = () => setOpen(true);
    const openWithMessage = (event: Event) => {
      const message = (event as CustomEvent<string>).detail?.trim();
      setOpen(true);
      if (message) {
        setInput(message);
      }
    };
    window.addEventListener(OPEN_COMPANION_EVENT, openFromNav);
    window.addEventListener(OPEN_COMPANION_WITH_MESSAGE_EVENT, openWithMessage);
    return () => {
      window.removeEventListener(OPEN_COMPANION_EVENT, openFromNav);
      window.removeEventListener(OPEN_COMPANION_WITH_MESSAGE_EVENT, openWithMessage);
    };
  }, [isDocked, isPage]);

  useEffect(() => {
    if (isDocked) {
      const openWithMessage = (event: Event) => {
        const message = (event as CustomEvent<string>).detail?.trim();
        if (message) {
          setInput(message);
          inputRef.current?.focus();
        }
      };
      window.addEventListener(OPEN_COMPANION_WITH_MESSAGE_EVENT, openWithMessage);
      return () => {
        window.removeEventListener(OPEN_COMPANION_WITH_MESSAGE_EVENT, openWithMessage);
      };
    }

    if (isPage) {
      return undefined;
    }

    return undefined;
  }, [isDocked, isPage]);

  useEffect(() => {
    if (open && !loaded && !loadingSession) {
      void loadSession();
    }
  }, [open, loaded, loadingSession, loadSession]);

  useEffect(() => {
    if (open) {
      scrollToBottom();
      inputRef.current?.focus();
    }
  }, [open, messages, scrollToBottom]);

  async function handleSend(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || sending) return;

    setSending(true);
    setError(null);
    setInput('');

    const streamingAssistantId = `streaming-${Date.now()}`;

    try {
      if (!loaded) {
        await loadSession();
      }

      const res = await fetch(resolveClientApiUrl('/api/chat/session/messages/stream'), {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content: trimmed }),
      });

      if (!res.ok) {
        const errPayload = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(errPayload?.error ?? 'Could not send message');
      }

      if (!res.body) {
        throw new Error('Could not send message');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let userAdded = false;
      let assistantStarted = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const frames = buffer.split('\n\n');
        buffer = frames.pop() ?? '';

        for (const frame of frames) {
          if (!frame.trim()) {
            continue;
          }

          let eventName = 'message';
          let dataLine = '';
          for (const line of frame.split('\n')) {
            if (line.startsWith('event:')) {
              eventName = line.slice(6).trim();
            } else if (line.startsWith('data:')) {
              dataLine = line.slice(5).trim();
            }
          }

          if (!dataLine) {
            continue;
          }

          if (eventName === 'user') {
            const userMessage = JSON.parse(dataLine) as ChatMessage;
            if (!userAdded) {
              setMessages((prev) => [...prev, userMessage]);
              userAdded = true;
            }
            continue;
          }

          if (eventName === 'delta') {
            const { content } = JSON.parse(dataLine) as { content: string };
            if (!assistantStarted) {
              assistantStarted = true;
              setMessages((prev) => [
                ...prev,
                {
                  id: streamingAssistantId,
                  role: 'assistant',
                  content,
                  createdAt: new Date().toISOString(),
                },
              ]);
            } else {
              setMessages((prev) =>
                prev.map((message) =>
                  message.id === streamingAssistantId
                    ? { ...message, content: message.content + content }
                    : message,
                ),
              );
            }
            continue;
          }

          if (eventName === 'done') {
            const payload = JSON.parse(dataLine) as {
              assistantMessage: ChatMessage;
              quota: ChatQuota;
            };
            setMessages((prev) => {
              const withoutStreaming = prev.filter((message) => message.id !== streamingAssistantId);
              return [...withoutStreaming, payload.assistantMessage];
            });
            setQuota(payload.quota);
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send message');
      setInput(trimmed);
      setMessages((prev) => prev.filter((message) => message.id !== streamingAssistantId));
    } finally {
      setSending(false);
    }
  }

  const panel = (
    <>
      <header className="shrink-0 border-b border-[var(--border)] px-4 py-3 lg:px-5 lg:py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-serif text-base font-normal tracking-tight lg:text-lg">{copy.title}</h2>
            <p className="mt-1 text-xs font-light text-[var(--muted)] lg:text-sm">{copy.subtitle}</p>
          </div>
          {!isDocked ? (
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md px-2 py-1 text-sm text-[var(--muted)] transition hover:text-[var(--foreground)]"
              aria-label="Close companion panel"
            >
              ×
            </button>
          ) : null}
        </div>
        {quota ? (
          <p className="mt-2 text-xs font-light text-[var(--muted)]">
            {quota.remaining} of {quota.limit} messages left today
          </p>
        ) : null}
      </header>

      <div ref={listRef} className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4 lg:px-5">
        {loadingSession ? <p className="text-sm text-[var(--muted)]">Loading conversation…</p> : null}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[95%] rounded-2xl px-3 py-2.5 text-sm leading-relaxed lg:max-w-[90%] lg:px-4 lg:py-3 ${
                message.role === 'user'
                  ? 'bg-[var(--accent)] text-[var(--accent-fg)]'
                  : 'border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)]'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
              {message.links && message.links.length > 0 ? (
                <ul className="mt-3 space-y-2 border-t border-[var(--border)] pt-3 text-sm">
                  {message.links.map((link) => (
                    <li key={`${message.id}-${link.href}`}>
                      <a
                        href={link.href}
                        className="underline decoration-[var(--border)] underline-offset-4 hover:decoration-[var(--accent)]"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      <footer className="shrink-0 border-t border-[var(--border)] px-4 py-3 lg:px-5 lg:py-4">
        {error ? <p className="mb-2 text-sm text-[var(--accent)]">{error}</p> : null}
        <form onSubmit={handleSend} className="space-y-2 lg:space-y-3">
          <label htmlFor={`companion-input-${site}`} className="sr-only">
            Message
          </label>
          <textarea
            id={`companion-input-${site}`}
            ref={inputRef}
            rows={2}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={copy.placeholder}
            disabled={sending || loadingSession || (quota?.remaining ?? 1) <= 0}
            className="w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={sending || loadingSession || !input.trim() || (quota?.remaining ?? 1) <= 0}
            className="inline-flex w-full items-center justify-center rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--accent-fg)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {sending ? 'Thinking…' : 'Send'}
          </button>
        </form>
      </footer>
    </>
  );

  if (isDocked) {
    return (
      <aside
        id="site-companion-panel"
        className="flex h-full min-h-0 flex-col bg-[var(--background)]"
      >
        {panel}
      </aside>
    );
  }

  if (isPage) {
    return (
      <div
        id="site-companion-panel"
        className="flex min-h-[calc(100dvh-var(--mobile-nav-h)-11rem)] flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] lg:min-h-[32rem]"
      >
        <div className="flex min-h-0 flex-1 flex-col">{panel}</div>
      </div>
    );
  }

  return (
    <>
      {open ? (
        <button
          type="button"
          aria-label="Close companion panel"
          className="fixed inset-0 z-[90] bg-black/20 sm:bg-black/10"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <button
        type="button"
        aria-expanded={open}
        aria-controls="site-companion-panel"
        onClick={() => setOpen((value) => !value)}
        className="fixed bottom-[calc(var(--mobile-nav-h)+1rem)] right-5 z-[100] rounded-full border border-[var(--accent)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-[var(--foreground)] shadow-md transition hover:bg-[var(--background)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] lg:bottom-5"
      >
        {open ? 'Close companion' : copy.toggle}
      </button>

      <aside
        id="site-companion-panel"
        aria-hidden={!open}
        className={`fixed inset-x-0 bottom-[var(--mobile-nav-h)] top-14 z-[100] flex flex-col border-t border-[var(--border)] bg-[var(--background)] shadow-xl transition-transform duration-200 ease-out sm:inset-x-auto sm:inset-y-0 sm:bottom-0 sm:right-0 sm:top-14 sm:w-full sm:max-w-md sm:border-l sm:border-t-0 ${
          open
            ? 'translate-y-0 sm:translate-x-0 sm:translate-y-0'
            : 'pointer-events-none translate-y-full sm:translate-y-0 sm:translate-x-full'
        }`}
      >
        {panel}
      </aside>
    </>
  );
}
