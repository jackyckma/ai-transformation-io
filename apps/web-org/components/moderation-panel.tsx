'use client';

import { useEffect, useMemo, useState } from 'react';
import type {
  LifecycleStatus,
  ModerationQueueItem,
  ModerationTransitionRequest,
} from '@ai-transformation/shared';

import { getApiClient } from '@/lib/api-client';
import {
  VISIBILITY_LABEL,
  formatDate,
  objectExcerpt,
  subtypeLabel,
} from '@/lib/object-display';

type TransitionStatus = ModerationTransitionRequest['status'];

const GROUP_ORDER: LifecycleStatus[] = ['draft', 'pending', 'published', 'featured', 'archived', 'rejected'];

const GROUP_LABELS: Record<string, string> = {
  draft: 'Drafts',
  pending: 'In review',
  published: 'Published',
  featured: 'Featured',
  archived: 'Archived',
  rejected: 'Rejected',
};

const ACCESS_DENIED = /\b40[13]\b/;

function slugify(text: string): string {
  const normalized = text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 72)
    .replace(/^-+|-+$/g, '');
  return normalized || 'contribution';
}

function itemHeading(item: ModerationQueueItem): string {
  return item.title?.trim() || item.subject?.trim() || objectExcerpt(item.body, 80);
}

export function ModerationPanel() {
  const [items, setItems] = useState<ModerationQueueItem[]>([]);
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
      const response = await getApiClient().moderation.list();
      setItems(response.items);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : '';
      if (ACCESS_DENIED.test(message)) {
        setAccessDenied(true);
        setItems([]);
      } else {
        setError('Unable to load the moderation queue right now. Please try again shortly.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadQueue();
  }, []);

  const grouped = useMemo(() => {
    const groups = new Map<string, ModerationQueueItem[]>();
    for (const item of items) {
      const bucket = groups.get(item.status) ?? [];
      bucket.push(item);
      groups.set(item.status, bucket);
    }
    return groups;
  }, [items]);

  async function transition(item: ModerationQueueItem, status: TransitionStatus) {
    setActingId(item.id);
    setActionError('');
    try {
      const payload: ModerationTransitionRequest = { status };
      if (status === 'published' || status === 'featured') {
        payload.publishedSlug = item.publishedSlug ?? slugify(itemHeading(item));
      }
      const response = await getApiClient().moderation.transition(item.id, payload);
      const next = response.item;
      setItems((prev) => prev.map((current) => (current.id === item.id ? next : current)));
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : '';
      if (ACCESS_DENIED.test(message)) {
        setAccessDenied(true);
        return;
      }
      setActionError('Failed to update this item. Please try again.');
    } finally {
      setActingId(null);
    }
  }

  return (
    <section className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 md:p-8">
      <header className="border-b border-[var(--border)] pb-6">
        <p className="text-xs font-light tracking-wide text-[var(--muted)]">Community</p>
        <h1 className="mt-3 font-serif text-3xl font-normal tracking-tight md:text-4xl">Moderation</h1>
        <p className="mt-4 max-w-2xl text-sm font-light leading-relaxed text-[var(--muted)]">
          Review draft and pending contributions and objects across the commons. Publish, feature,
          archive, or reject — visibility is enforced by the server.
        </p>
      </header>

      <div className="mt-8">
        {isLoading ? (
          <p className="text-sm font-light text-[var(--muted)]">Loading moderation queue…</p>
        ) : null}

        {!isLoading && accessDenied ? (
          <p className="text-sm font-light text-[var(--muted)]">You do not have moderation access.</p>
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
          <div className="space-y-8">
            {actionError ? (
              <p role="alert" className="text-sm text-red-700 dark:text-red-200">
                {actionError}
              </p>
            ) : null}

            {items.length === 0 ? (
              <p className="text-sm font-light text-[var(--muted)]">
                The queue is empty. New drafts and pending items will appear here.
              </p>
            ) : (
              GROUP_ORDER.map((status) => {
                const groupItems = grouped.get(status) ?? [];
                if (groupItems.length === 0) {
                  return null;
                }
                return (
                  <section key={status} className="space-y-4">
                    <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
                      <h2 className="font-serif text-xl font-normal tracking-tight">
                        {GROUP_LABELS[status] ?? status}
                      </h2>
                      <span className="text-xs font-light tracking-wide text-[var(--muted)]">
                        {groupItems.length}
                      </span>
                    </div>
                    <ul className="space-y-4">
                      {groupItems.map((item) => (
                        <li
                          key={item.id}
                          className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-5"
                        >
                          <article>
                            <header className="space-y-2">
                              <h3 className="font-serif text-lg font-normal tracking-tight">
                                {itemHeading(item)}
                              </h3>
                              <p className="text-xs font-light tracking-wide text-[var(--muted)]">
                                {item.entityType} · {subtypeLabel(item.type)} ·{' '}
                                {VISIBILITY_LABEL[item.visibility]} · {formatDate(item.createdAt)}
                              </p>
                            </header>
                            <p className="mt-4 whitespace-pre-wrap text-sm font-light leading-relaxed text-[var(--muted)]">
                              {objectExcerpt(item.body, 600)}
                            </p>
                            <div className="mt-5 flex flex-wrap gap-2">
                              <ActionButton
                                label="Publish"
                                onClick={() => void transition(item, 'published')}
                                disabled={actingId === item.id}
                              />
                              <ActionButton
                                label="Feature"
                                onClick={() => void transition(item, 'featured')}
                                disabled={actingId === item.id}
                              />
                              <ActionButton
                                label="Archive"
                                onClick={() => void transition(item, 'archived')}
                                disabled={actingId === item.id}
                              />
                              <ActionButton
                                label="Reject"
                                onClick={() => void transition(item, 'rejected')}
                                disabled={actingId === item.id}
                                danger
                              />
                            </div>
                          </article>
                        </li>
                      ))}
                    </ul>
                  </section>
                );
              })
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
