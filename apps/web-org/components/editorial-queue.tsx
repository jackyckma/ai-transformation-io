'use client';

import { useEffect, useState } from 'react';
import type { ObjectSubtype } from '@ai-transformation/shared';
import { resolveClientApiUrl } from '@ai-transformation/shared';

import { formatDate, subtypeLabel } from '@/lib/object-display';

type EditorialDraft = {
  id: string;
  objectType: string;
  type: string;
  site: string;
  title: string | null;
  bodyExcerpt: string;
  status: string;
  visibility: string;
  publishedSlug: string | null;
  createdAt: string;
  metadata?: Record<string, unknown> | null;
};

const ACCESS_DENIED = /\b40[13]\b/;

const SITE_LABEL: Record<string, string> = {
  io: 'ai-transformation.io',
  org: 'ai-transformation.org',
};

const OBJECT_TYPE_LABEL: Record<string, string> = {
  knowledge: 'Knowledge',
  community: 'Community',
};

const SOURCE_LABEL: Record<string, string> = {
  admin_session: 'Admin draft',
  bearer: 'Agent draft',
};

function apiBase(): string {
  return resolveClientApiUrl('/').replace(/\/$/, '');
}

function draftHeading(draft: EditorialDraft): string {
  const heading = draft.title?.trim();
  if (heading) {
    return heading;
  }
  const excerpt = draft.bodyExcerpt.trim();
  if (!excerpt) {
    return 'Untitled draft';
  }
  return excerpt.length > 80 ? `${excerpt.slice(0, 79)}…` : excerpt;
}

function sourceLabel(metadata: EditorialDraft['metadata']): string | null {
  const source = metadata?.editorial_source;
  if (typeof source !== 'string') {
    return null;
  }
  return SOURCE_LABEL[source] ?? source;
}

export function EditorialQueue() {
  const [drafts, setDrafts] = useState<EditorialDraft[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [accessDenied, setAccessDenied] = useState(false);
  const [actingId, setActingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState('');

  async function loadQueue() {
    setIsLoading(true);
    setError('');
    setAccessDenied(false);
    try {
      const res = await fetch(`${apiBase()}/api/internal/editorial/drafts`, {
        credentials: 'include',
      });
      if (!res.ok) {
        throw new Error(`Editorial drafts request failed: ${res.status}`);
      }
      const body = (await res.json()) as { ok: boolean; drafts?: EditorialDraft[] };
      setDrafts(body.drafts ?? []);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : '';
      if (ACCESS_DENIED.test(message)) {
        setAccessDenied(true);
        setDrafts([]);
      } else {
        setError('Unable to load the editorial queue right now. Please try again shortly.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadQueue();
  }, []);

  async function act(draft: EditorialDraft, action: 'approve' | 'reject') {
    setActingId(draft.id);
    setActionError('');
    try {
      const res = await fetch(
        `${apiBase()}/api/internal/editorial/drafts/${encodeURIComponent(draft.id)}/${action}`,
        { method: 'POST', credentials: 'include' },
      );
      if (!res.ok) {
        throw new Error(`Editorial ${action} failed: ${res.status}`);
      }
      setDrafts((prev) => prev.filter((current) => current.id !== draft.id));
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : '';
      if (ACCESS_DENIED.test(message)) {
        setAccessDenied(true);
        return;
      }
      setActionError(`Couldn't ${action} this draft. Please try again.`);
    } finally {
      setActingId(null);
    }
  }

  return (
    <section className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 md:p-8">
      <header className="border-b border-[var(--border)] pb-6">
        <p className="text-xs font-light tracking-wide text-[var(--muted)]">Editorial</p>
        <h1 className="mt-3 font-serif text-3xl font-normal tracking-tight md:text-4xl">Editorial drafts</h1>
        <p className="mt-4 max-w-2xl text-sm font-light leading-relaxed text-[var(--muted)]">
          Review drafts ingested for the knowledge commons before they go live. Approve to publish, or
          reject to archive — both sites share this queue.
        </p>
      </header>

      <div className="mt-8">
        {isLoading ? (
          <p className="text-sm font-light text-[var(--muted)]">Loading editorial queue…</p>
        ) : null}

        {!isLoading && accessDenied ? (
          <p className="text-sm font-light text-[var(--muted)]">You do not have editorial access.</p>
        ) : null}

        {!isLoading && !accessDenied && error ? (
          <div className="space-y-4">
            <p role="alert" className="text-sm text-red-700 dark:text-red-200">
              {error}
            </p>
            <button
              type="button"
              onClick={() => void loadQueue()}
              className="inline-flex items-center rounded-full border border-[var(--border)] px-4 py-2 text-sm font-light text-[var(--foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              Retry
            </button>
          </div>
        ) : null}

        {!isLoading && !accessDenied && !error ? (
          <div className="space-y-6">
            {actionError ? (
              <p role="alert" className="text-sm text-red-700 dark:text-red-200">
                {actionError}
              </p>
            ) : null}

            {drafts.length === 0 ? (
              <p className="text-sm font-light text-[var(--muted)]">
                No drafts waiting for review. New editorial drafts will appear here.
              </p>
            ) : (
              <ul className="space-y-4">
                {drafts.map((draft) => (
                  <li
                    key={draft.id}
                    className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-5"
                  >
                    <article>
                      <header className="space-y-2">
                        <h2 className="font-serif text-lg font-normal tracking-tight">
                          {draftHeading(draft)}
                        </h2>
                        <p className="text-xs font-light tracking-wide text-[var(--muted)]">
                          {OBJECT_TYPE_LABEL[draft.objectType] ?? draft.objectType} ·{' '}
                          {subtypeLabel(draft.type as ObjectSubtype)} ·{' '}
                          {SITE_LABEL[draft.site] ?? draft.site} · {formatDate(draft.createdAt)}
                          {sourceLabel(draft.metadata) ? ` · ${sourceLabel(draft.metadata)}` : ''}
                        </p>
                      </header>
                      <p className="mt-4 whitespace-pre-wrap text-sm font-light leading-relaxed text-[var(--muted)]">
                        {draft.bodyExcerpt}
                      </p>
                      <div className="mt-5 flex flex-wrap gap-2">
                        <ActionButton
                          label="Approve"
                          onClick={() => void act(draft, 'approve')}
                          disabled={actingId === draft.id}
                        />
                        <ActionButton
                          label="Reject"
                          onClick={() => void act(draft, 'reject')}
                          disabled={actingId === draft.id}
                          danger
                        />
                      </div>
                    </article>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function ActionButton({
  label,
  onClick,
  disabled,
  danger = false,
}: {
  label: string;
  onClick: () => void;
  disabled: boolean;
  danger?: boolean;
}) {
  const hover = danger
    ? 'hover:border-red-400 hover:text-red-700 dark:hover:text-red-300'
    : 'hover:border-[var(--accent)] hover:text-[var(--accent)]';
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-full border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--foreground)] transition ${hover} disabled:cursor-not-allowed disabled:opacity-60`}
    >
      {label}
    </button>
  );
}
