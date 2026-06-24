'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { Comment, ObjectRecord } from '@ai-transformation/shared';

import { getApiClient } from '@/lib/api-client';
import {
  VISIBILITY_LABEL,
  formatDate,
  objectExcerpt,
  objectTitle,
  subtypeLabel,
} from '@/lib/object-display';

type LoadState = 'loading' | 'ready' | 'error';

const STATUS_LABEL: Record<string, string> = {
  draft: 'Draft',
  pending: 'In review',
  published: 'Published',
  featured: 'Featured',
  archived: 'Archived',
  rejected: 'Rejected',
  new: 'New',
  reviewed: 'Reviewed',
  spam: 'Spam',
};

export function MyArticlesPanel() {
  const [objects, setObjects] = useState<ObjectRecord[]>([]);
  const [state, setState] = useState<LoadState>('loading');

  useEffect(() => {
    let cancelled = false;
    setState('loading');
    void (async () => {
      try {
        const response = await getApiClient().objects.list({ site: 'org', mine: true });
        if (cancelled) return;
        setObjects(response.objects);
        setState('ready');
      } catch {
        if (!cancelled) {
          setState('error');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (state === 'loading') {
    return <p className="text-sm font-light text-[var(--muted)]">Loading your articles…</p>;
  }

  if (state === 'error') {
    return (
      <p className="text-sm font-light text-[var(--muted)]">
        Your articles are unavailable right now. Please try again shortly.
      </p>
    );
  }

  if (objects.length === 0) {
    return (
      <p className="text-sm font-light text-[var(--muted)]">
        No articles yet. Use Ask → Submit to draft a contribution.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {objects.map((object) => {
        const title = objectTitle(object);
        const isPublished = object.status === 'published' || object.status === 'featured';
        return (
          <li
            key={object.id}
            className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4"
          >
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-normal uppercase tracking-wide text-[var(--secondary)]">
              <span>{subtypeLabel(object.type)}</span>
              <span aria-hidden>·</span>
              <span>{VISIBILITY_LABEL[object.visibility]}</span>
              <span aria-hidden>·</span>
              <span>{STATUS_LABEL[object.status] ?? object.status}</span>
            </div>
            {isPublished ? (
              <Link
                href={`/knowledge/${encodeURIComponent(object.id)}`}
                className="font-serif mt-1 block text-base font-normal tracking-tight text-[var(--foreground)] hover:text-[var(--accent)]"
              >
                {title}
              </Link>
            ) : (
              <p className="font-serif mt-1 text-base font-normal tracking-tight text-[var(--foreground)]">
                {title}
              </p>
            )}
            <p className="mt-2 text-sm font-light leading-relaxed text-[var(--muted)]">
              {objectExcerpt(object.body)}
            </p>
            <p className="mt-2 text-xs font-light text-[var(--secondary)]">
              Updated {formatDate(object.updatedAt)}
            </p>
          </li>
        );
      })}
    </ul>
  );
}

export function MyCommentsPanel() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [state, setState] = useState<LoadState>('loading');

  useEffect(() => {
    let cancelled = false;
    setState('loading');
    void (async () => {
      try {
        const response = await getApiClient().comments.list({ site: 'org', mine: true });
        if (cancelled) return;
        setComments(response.comments);
        setState('ready');
      } catch {
        if (!cancelled) {
          setState('error');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (state === 'loading') {
    return <p className="text-sm font-light text-[var(--muted)]">Loading your comments…</p>;
  }

  if (state === 'error') {
    return (
      <p className="text-sm font-light text-[var(--muted)]">
        Your comments are unavailable right now. Please try again shortly.
      </p>
    );
  }

  if (comments.length === 0) {
    return (
      <p className="text-sm font-light text-[var(--muted)]">
        No comments yet. Public comments you leave on the commons appear here.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {comments.map((comment) => (
        <li
          key={comment.id}
          className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 text-sm font-light text-[var(--muted)]"
        >
          <Link
            href={`/knowledge/${encodeURIComponent(comment.target.targetId)}`}
            className="text-xs font-normal uppercase tracking-wide text-[var(--secondary)] hover:text-[var(--accent)]"
          >
            On {comment.target.targetId}
          </Link>
          <p className="mt-1 whitespace-pre-wrap">{comment.body}</p>
          <p className="mt-2 text-xs font-light text-[var(--secondary)]">
            {formatDate(comment.createdAt)}
          </p>
        </li>
      ))}
    </ul>
  );
}
