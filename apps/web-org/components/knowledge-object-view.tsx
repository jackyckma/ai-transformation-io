'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { getSiteOrigin, type Comment, type ObjectRecord } from '@ai-transformation/shared';

import { getApiClient } from '@/lib/api-client';
import { useAuthUser } from '@/lib/use-auth-user';
import { useBookmarks } from '@/lib/use-bookmarks';
import { AgentDeepLinks, AgentHintScript } from '@/components/agent-deep-links';
import { MarkdownBody } from '@/components/markdown-body';
import { PageShell } from '@/components/page-shell';
import { SaveButton } from '@/components/save-button';
import { knowledgeActions } from '@/lib/ask-prefill';
import {
  VISIBILITY_LABEL,
  formatDate,
  objectTarget,
  objectTitle,
  subtypeLabel,
} from '@/lib/object-display';

type LoadState = 'loading' | 'ready' | 'not-found' | 'error';

export function KnowledgeObjectView({ id }: { id: string }) {
  const { audience } = useAuthUser();
  const isMember = audience === 'member';
  const [object, setObject] = useState<ObjectRecord | null>(null);
  const [state, setState] = useState<LoadState>('loading');
  const bookmarks = useBookmarks(isMember);
  const recordedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    setState('loading');
    void (async () => {
      try {
        const response = await getApiClient().objects.get(id);
        if (cancelled) return;
        setObject(response.object);
        setState('ready');
      } catch (error) {
        if (cancelled) return;
        const message = error instanceof Error ? error.message : '';
        setState(/\b40[34]\b/.test(message) ? 'not-found' : 'error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!isMember || state !== 'ready' || recordedRef.current) {
      return;
    }
    recordedRef.current = true;
    void getApiClient()
      .recentlyViewed.create({ site: 'org', target: { targetType: 'object', targetId: id } })
      .catch(() => undefined);
  }, [id, isMember, state]);

  if (state === 'loading') {
    return (
      <PageShell>
        <p className="text-sm font-light text-[var(--muted)]">Loading…</p>
      </PageShell>
    );
  }

  if (state === 'not-found') {
    return (
      <PageShell>
        <h1 className="font-serif text-2xl font-normal tracking-tight">Not available</h1>
        <p className="mt-3 text-sm font-light text-[var(--muted)]">
          This item is not public, or you need to sign in to view it.
        </p>
        <Link href="/knowledge" className="mt-6 inline-block text-sm font-light text-[var(--muted)] hover:text-[var(--foreground)]">
          ← All knowledge
        </Link>
      </PageShell>
    );
  }

  if (state === 'error' || !object) {
    return (
      <PageShell>
        <h1 className="font-serif text-2xl font-normal tracking-tight">Knowledge commons</h1>
        <p className="mt-3 text-sm font-light text-[var(--muted)]">
          We could not load this item right now. Please try again shortly.
        </p>
        <Link href="/knowledge" className="mt-6 inline-block text-sm font-light text-[var(--muted)] hover:text-[var(--foreground)]">
          ← All knowledge
        </Link>
      </PageShell>
    );
  }

  const title = objectTitle(object);
  const target = objectTarget(object);
  const actions = knowledgeActions(title, object.id);
  const canonicalUrl = `${getSiteOrigin('org')}/knowledge/${encodeURIComponent(object.id)}`;

  return (
    <PageShell as="article">
      <header className="mb-8 rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 md:p-6">
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-normal uppercase tracking-wide text-[var(--secondary)]">
          <span>Knowledge</span>
          <span aria-hidden>·</span>
          <span>{subtypeLabel(object.type)}</span>
          <span aria-hidden>·</span>
          <span>{VISIBILITY_LABEL[object.visibility]}</span>
        </div>
        <h1 className="font-serif mt-3 text-2xl font-normal leading-snug tracking-tight md:text-[1.85rem]">
          {title}
        </h1>
        <p className="mt-3 text-xs font-light text-[var(--secondary)]">
          Updated {formatDate(object.updatedAt)}
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[var(--border)] pt-4 text-xs">
          {isMember ? (
            <SaveButton
              target={target}
              title={title}
              saved={bookmarks.isSaved(target)}
              pending={bookmarks.isPending(target)}
              onToggle={bookmarks.toggle}
            />
          ) : null}
          {actions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="text-[var(--muted)] underline decoration-[var(--border)] underline-offset-4 hover:text-[var(--accent)] hover:decoration-[var(--accent)]"
            >
              {action.label}
            </Link>
          ))}
        </div>
        <div className="mt-3 border-t border-[var(--border)] pt-3 text-xs">
          <AgentDeepLinks title={title} canonicalUrl={canonicalUrl} />
        </div>
        {bookmarks.error ? (
          <p role="alert" className="mt-3 text-sm text-red-700 dark:text-red-200">
            {bookmarks.error}
          </p>
        ) : null}
      </header>

      <AgentHintScript title={title} canonicalUrl={canonicalUrl} />

      <MarkdownBody content={object.body} />

      <ObjectComments objectId={object.id} isMember={isMember} />

      <Link
        href="/knowledge"
        className="mt-12 inline-block text-sm font-light text-[var(--muted)] hover:text-[var(--foreground)]"
      >
        ← All knowledge
      </Link>
    </PageShell>
  );
}

function ObjectComments({ objectId, isMember }: { objectId: string; isMember: boolean }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [state, setState] = useState<LoadState>('loading');
  const [draft, setDraft] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setState('loading');
    void (async () => {
      try {
        const response = await getApiClient().comments.list({
          site: 'org',
          targetType: 'object',
          targetId: objectId,
        });
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
  }, [objectId]);

  async function submit() {
    const body = draft.trim();
    if (body.length === 0) {
      setSubmitError('Write a comment before posting.');
      return;
    }
    setSubmitting(true);
    setSubmitError('');
    try {
      const response = await getApiClient().comments.create({
        site: 'org',
        target: { targetType: 'object', targetId: objectId },
        body,
      });
      setComments((prev) => [response.comment, ...prev]);
      setDraft('');
    } catch {
      setSubmitError('Could not post your comment. Please try again shortly.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mt-12 border-t border-[var(--border)] pt-8" aria-labelledby="obj-comments">
      <h2 id="obj-comments" className="font-serif text-lg font-normal tracking-tight">
        Comments
      </h2>

      {isMember ? (
        <div className="mt-4 space-y-3">
          <label htmlFor="obj-comment" className="sr-only">
            Add a public comment
          </label>
          <textarea
            id="obj-comment"
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value);
              setSubmitError('');
            }}
            rows={3}
            placeholder="Add a public comment"
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none ring-[var(--accent)] transition focus:ring-2"
          />
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => void submit()}
              disabled={submitting}
              className="inline-flex min-h-9 items-center rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--accent-fg)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Posting…' : 'Post comment'}
            </button>
            {submitError ? (
              <span role="alert" className="text-sm text-red-700 dark:text-red-200">
                {submitError}
              </span>
            ) : null}
          </div>
        </div>
      ) : (
        <p className="mt-3 text-sm font-light text-[var(--muted)]">Sign in to comment.</p>
      )}

      <div className="mt-6">
        {state === 'loading' ? (
          <p className="text-sm font-light text-[var(--muted)]">Loading comments…</p>
        ) : null}
        {state === 'error' ? (
          <p className="text-sm font-light text-[var(--muted)]">Comments are unavailable right now.</p>
        ) : null}
        {state === 'ready' && comments.length === 0 ? (
          <p className="text-sm font-light text-[var(--muted)]">No comments yet.</p>
        ) : null}
        {state === 'ready' && comments.length > 0 ? (
          <ul className="space-y-3">
            {comments.map((comment) => (
              <li
                key={comment.id}
                className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 text-sm font-light text-[var(--muted)]"
              >
                <p className="whitespace-pre-wrap">{comment.body}</p>
                <p className="mt-2 text-xs font-light text-[var(--secondary)]">
                  {formatDate(comment.createdAt)}
                </p>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
