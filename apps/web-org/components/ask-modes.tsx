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
import { getApiClient } from '@/lib/api-client';

function parseMode(raw: string | null): AskMode | null {
  if (raw && (askModeValues as readonly string[]).includes(raw)) {
    return raw as AskMode;
  }
  return null;
}

export function AskModes() {
  const { audience, isLoading } = useAuthUser();
  const isMember = audience === 'member';
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
          <AskComposer mode={activeMode} initialBody={initialInput} isMember={isMember} />
        )}
      </div>
    </div>
  );
}

type ComposerMode = Exclude<AskMode, 'ask'>;

type SavedDraft = { id: string; body: string; createdAt: string };

const STORE_PREFIX = 'atx-org-ask-';

const MODE_COPY: Record<ComposerMode, { title: string; verb: string; saved: string; note: string }> = {
  capture: {
    title: 'Capture a private note',
    verb: 'Save note',
    saved: 'Offline notes',
    note: 'Private to you. Saved to your library and visible under Knowledge → My Library.',
  },
  submit: {
    title: 'Draft a contribution',
    verb: 'Save draft',
    saved: 'Offline drafts',
    note: 'Saved as a draft. Auto-publish or review-before-publish follows your Settings preference; it never becomes public on its own.',
  },
  'find-help': {
    title: 'Describe what you need',
    verb: 'Save request',
    saved: 'Offline requests',
    note: 'Creates a community help request draft. Full reply and matching actions arrive in Wave 13.',
  },
};

async function writeAsk(mode: ComposerMode, body: string): Promise<void> {
  const client = getApiClient();
  if (mode === 'capture') {
    await client.notes.create({ site: 'org', body, isCapture: true, captureSource: 'ask_capture' });
    return;
  }
  if (mode === 'find-help') {
    await client.objects.saveDraft({
      objectType: 'community',
      type: 'help_request',
      site: 'org',
      visibility: 'public',
      body,
      status: 'draft',
    });
    return;
  }

  const draft = await client.contributions.saveDraft({
    site: 'org',
    objectType: 'knowledge',
    type: 'field_note',
    visibility: 'members-only',
    body,
    status: 'draft',
  });

  let publishMode: 'auto' | 'review' = 'review';
  try {
    const preference = await client.publishPreference.get();
    publishMode = preference.publishPreference.defaultPublishMode;
  } catch {
    publishMode = 'review';
  }

  if (publishMode === 'auto') {
    await client.contributions.submit({
      contributionId: draft.contribution.id,
      publishMode: 'auto',
      visibility: 'members-only',
    });
  }
}

function AskComposer({
  mode,
  initialBody,
  isMember,
}: {
  mode: ComposerMode;
  initialBody?: string;
  isMember: boolean;
}) {
  const copy = MODE_COPY[mode];
  const storeKey = `${STORE_PREFIX}${mode}`;
  const [body, setBody] = useState('');
  const [drafts, setDrafts] = useState<SavedDraft[]>([]);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setBody(initialBody ?? '');
  }, [initialBody, mode]);

  useEffect(() => {
    setStatus('');
    setError('');
    try {
      const raw = window.localStorage.getItem(storeKey);
      setDrafts(raw ? (JSON.parse(raw) as SavedDraft[]) : []);
    } catch {
      setDrafts([]);
    }
  }, [storeKey]);

  const persistLocal = useCallback(
    (next: SavedDraft[]) => {
      setDrafts(next);
      try {
        window.localStorage.setItem(storeKey, JSON.stringify(next));
      } catch {
        // Best-effort local fallback.
      }
    },
    [storeKey],
  );

  function saveLocal(trimmed: string, message: string) {
    const entry: SavedDraft = {
      id: `${Date.now()}`,
      body: trimmed,
      createdAt: new Date().toISOString(),
    };
    persistLocal([entry, ...drafts]);
    setStatus(message);
  }

  async function save() {
    const trimmed = body.trim();
    if (trimmed.length < 1) {
      setError('Add a little detail before saving.');
      return;
    }
    setError('');
    setStatus('');

    if (!isMember) {
      saveLocal(trimmed, 'Saved on this device. Sign in to save to your account.');
      setBody('');
      return;
    }

    setSubmitting(true);
    try {
      await writeAsk(mode, trimmed);
      setBody('');
      setStatus(SAVED_MESSAGE[mode]);
    } catch {
      saveLocal(trimmed, 'Saved on this device — could not reach your account. We kept it here.');
      setBody('');
    } finally {
      setSubmitting(false);
    }
  }

  function remove(id: string) {
    persistLocal(drafts.filter((draft) => draft.id !== id));
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
            setError('');
          }}
          rows={6}
          placeholder={ASK_MODE_METADATA[mode].placeholder}
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none ring-[var(--accent)] transition focus:ring-2"
        />
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => void save()}
            disabled={submitting}
            className="inline-flex min-h-9 items-center rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--accent-fg)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Saving…' : copy.verb}
          </button>
          {status ? (
            <span role="status" className="text-sm font-light text-[var(--accent)]">
              {status}
            </span>
          ) : null}
          {error ? (
            <span role="alert" className="text-sm text-red-700 dark:text-red-200">
              {error}
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

const SAVED_MESSAGE: Record<ComposerMode, string> = {
  capture: 'Saved to your notes.',
  submit: 'Draft saved. Check Settings for your publish preference.',
  'find-help': 'Help request drafted.',
};
