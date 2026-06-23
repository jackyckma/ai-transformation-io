'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { SidebarChat } from '@ai-transformation/chat-ui';
import {
  ASK_MODE_METADATA,
  askModeValues,
  getAllowedAskModes,
  isAskModeAllowed,
  type AskMode,
} from '@ai-transformation/shared';

import { useAuthUser } from '@/lib/use-auth-user';

function parseMode(raw: string | null): AskMode | null {
  if (raw && (askModeValues as readonly string[]).includes(raw)) {
    return raw as AskMode;
  }
  return null;
}

export function AskModes() {
  const { audience, isLoading } = useAuthUser();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const allowed = useMemo(() => getAllowedAskModes('org', audience), [audience]);
  const requested = parseMode(searchParams.get('mode'));
  const activeMode: AskMode = requested && isAskModeAllowed('org', audience, requested) ? requested : 'ask';
  const initialInput = searchParams.get('message') ?? searchParams.get('topic') ?? undefined;

  const selectMode = useCallback(
    (mode: AskMode) => {
      const params = new URLSearchParams(searchParams.toString());
      if (mode === 'ask') {
        params.delete('mode');
      } else {
        params.set('mode', mode);
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  return (
    <div>
      <div role="tablist" aria-label="Ask modes" className="flex flex-wrap gap-2 text-sm">
        {allowed.map((mode) => {
          const isActive = mode === activeMode;
          return (
            <button
              key={mode}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => selectMode(mode)}
              className={`rounded-full border px-4 py-1.5 transition ${
                isActive
                  ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--foreground)]'
                  : 'border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)]/40'
              }`}
            >
              {ASK_MODE_METADATA[mode].label}
            </button>
          );
        })}
      </div>

      {audience === 'guest' && !isLoading ? (
        <p className="mt-3 text-xs font-light text-[var(--secondary)]">
          Sign in to unlock Capture, Submit, and Find Help.
        </p>
      ) : null}

      <div className="mt-6">
        {activeMode === 'ask' ? (
          <SidebarChat site="org" layout="page" initialInput={initialInput} />
        ) : (
          <LocalDraftStub mode={activeMode} initialBody={initialInput} />
        )}
      </div>
    </div>
  );
}

type SavedDraft = { id: string; body: string; createdAt: string };

const STORE_PREFIX = 'atx-org-ask-';

const MODE_COPY: Record<Exclude<AskMode, 'ask'>, { title: string; verb: string; saved: string; note: string }> = {
  capture: {
    title: 'Capture a private note',
    verb: 'Save note',
    saved: 'Saved notes',
    note: 'Private to you. Notes sync to your library when the object model ships (Wave 12).',
  },
  submit: {
    title: 'Draft a contribution',
    verb: 'Save draft',
    saved: 'Saved drafts',
    note: 'Drafts stay local for now. Submitting to review or agent auto-publish wires up in Wave 13.',
  },
  'find-help': {
    title: 'Describe what you need',
    verb: 'Save request',
    saved: 'Saved requests',
    note: 'Becomes a community help request once the community types ship (Wave 13).',
  },
};

function LocalDraftStub({ mode, initialBody }: { mode: Exclude<AskMode, 'ask'>; initialBody?: string }) {
  const copy = MODE_COPY[mode];
  const storeKey = `${STORE_PREFIX}${mode}`;
  const [body, setBody] = useState('');
  const [drafts, setDrafts] = useState<SavedDraft[]>([]);
  const [status, setStatus] = useState('');

  useEffect(() => {
    setBody(initialBody ?? '');
  }, [initialBody, mode]);

  useEffect(() => {
    setStatus('');
    try {
      const raw = window.localStorage.getItem(storeKey);
      setDrafts(raw ? (JSON.parse(raw) as SavedDraft[]) : []);
    } catch {
      setDrafts([]);
    }
  }, [storeKey]);

  const persist = useCallback(
    (next: SavedDraft[]) => {
      setDrafts(next);
      try {
        window.localStorage.setItem(storeKey, JSON.stringify(next));
      } catch {
        // Local persistence is best-effort in Phase 1.
      }
    },
    [storeKey],
  );

  function save() {
    const trimmed = body.trim();
    if (trimmed.length < 1) {
      setStatus('Add a little detail before saving.');
      return;
    }
    const entry: SavedDraft = {
      id: `${Date.now()}`,
      body: trimmed,
      createdAt: new Date().toISOString(),
    };
    persist([entry, ...drafts]);
    setBody('');
    setStatus('Saved locally.');
  }

  function remove(id: string) {
    persist(drafts.filter((draft) => draft.id !== id));
  }

  return (
    <section>
      <h2 className="font-serif text-lg font-normal tracking-tight">{copy.title}</h2>
      <p className="mt-2 text-sm font-light leading-relaxed text-[var(--muted)]">{copy.note}</p>

      <div className="mt-4 space-y-3">
        <label htmlFor={`ask-${mode}`} className="sr-only">
          {ASK_MODE_METADATA[mode].label}
        </label>
        <textarea
          id={`ask-${mode}`}
          value={body}
          onChange={(event) => {
            setBody(event.target.value);
            setStatus('');
          }}
          rows={6}
          placeholder={ASK_MODE_METADATA[mode].placeholder}
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none ring-[var(--accent)] transition focus:ring-2"
        />
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={save}
            className="inline-flex min-h-9 items-center rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--accent-fg)] transition hover:opacity-90"
          >
            {copy.verb}
          </button>
          {status ? (
            <span role="status" className="text-sm font-light text-[var(--accent)]">
              {status}
            </span>
          ) : null}
        </div>
      </div>

      {drafts.length > 0 ? (
        <div className="mt-8">
          <h3 className="text-xs font-normal uppercase tracking-[0.12em] text-[var(--secondary)]">
            {copy.saved}
          </h3>
          <ul className="mt-3 space-y-3">
            {drafts.map((draft) => (
              <li
                key={draft.id}
                className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 text-sm font-light text-[var(--muted)]"
              >
                <p className="whitespace-pre-wrap">{draft.body}</p>
                <button
                  type="button"
                  onClick={() => remove(draft.id)}
                  className="mt-3 text-xs text-[var(--secondary)] underline underline-offset-4 hover:text-[var(--accent)]"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
