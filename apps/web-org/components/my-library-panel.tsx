'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { Bookmark, Note, RecentlyViewedEntry } from '@ai-transformation/shared';

import { getApiClient } from '@/lib/api-client';
import { formatDate } from '@/lib/object-display';

type LoadState = 'loading' | 'ready' | 'error';

type LibraryData = {
  bookmarks: Bookmark[];
  notes: Note[];
  recentlyViewed: RecentlyViewedEntry[];
};

function targetHref(target: { targetType: string; targetId: string }): string {
  if (target.targetType === 'object') {
    return `/knowledge/${encodeURIComponent(target.targetId)}`;
  }
  return `/knowledge/${encodeURIComponent(target.targetId)}`;
}

export function MyLibraryPanel() {
  const [data, setData] = useState<LibraryData>({ bookmarks: [], notes: [], recentlyViewed: [] });
  const [state, setState] = useState<LoadState>('loading');

  useEffect(() => {
    let cancelled = false;
    setState('loading');
    void (async () => {
      try {
        const client = getApiClient();
        const [bookmarks, notes, recentlyViewed] = await Promise.all([
          client.bookmarks.list({ site: 'org', mine: true }),
          client.notes.list({ site: 'org', mine: true }),
          client.recentlyViewed.list({ site: 'org', mine: true }),
        ]);
        if (cancelled) return;
        setData({
          bookmarks: bookmarks.bookmarks,
          notes: notes.notes,
          recentlyViewed: recentlyViewed.entries,
        });
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
    return <PanelMessage>Loading your library…</PanelMessage>;
  }

  if (state === 'error') {
    return (
      <PanelMessage>
        Your library is unavailable right now. Please try again shortly.
      </PanelMessage>
    );
  }

  return (
    <div className="space-y-10">
      <section aria-labelledby="lib-bookmarks">
        <SectionTitle id="lib-bookmarks">Bookmarks</SectionTitle>
        {data.bookmarks.length === 0 ? (
          <EmptyState body="No bookmarks yet. Save an article or contribution to find it here." />
        ) : (
          <ul className="mt-4 space-y-3">
            {data.bookmarks.map((bookmark) => (
              <li
                key={bookmark.id}
                className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4"
              >
                <Link
                  href={targetHref(bookmark.target)}
                  className="font-serif text-base font-normal tracking-tight text-[var(--foreground)] hover:text-[var(--accent)]"
                >
                  {bookmark.title?.trim() || bookmark.target.targetId}
                </Link>
                <p className="mt-1 text-xs font-light text-[var(--secondary)]">
                  Saved {formatDate(bookmark.createdAt)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="lib-notes">
        <SectionTitle id="lib-notes">Notes</SectionTitle>
        {data.notes.length === 0 ? (
          <EmptyState body="No notes yet. Use Ask → Capture to save a private note." />
        ) : (
          <ul className="mt-4 space-y-3">
            {data.notes.map((note) => (
              <li
                key={note.id}
                className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 text-sm font-light text-[var(--muted)]"
              >
                {note.title ? (
                  <p className="font-serif text-base font-normal tracking-tight text-[var(--foreground)]">
                    {note.title}
                  </p>
                ) : null}
                <p className="mt-1 whitespace-pre-wrap">{note.body}</p>
                <p className="mt-2 text-xs font-light text-[var(--secondary)]">
                  {note.isCapture ? 'Captured' : 'Noted'} {formatDate(note.createdAt)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="lib-recent">
        <SectionTitle id="lib-recent">Recently viewed</SectionTitle>
        {data.recentlyViewed.length === 0 ? (
          <EmptyState body="Articles you open will show up here." />
        ) : (
          <ul className="mt-4 space-y-2">
            {data.recentlyViewed.map((entry) => (
              <li key={entry.id} className="text-sm font-light">
                <Link
                  href={targetHref(entry.target)}
                  className="text-[var(--foreground)] hover:text-[var(--accent)]"
                >
                  {entry.target.targetId}
                </Link>
                <span className="ml-2 text-xs text-[var(--secondary)]">
                  {formatDate(entry.viewedAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function SectionTitle({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="text-xs font-normal uppercase tracking-[0.12em] text-[var(--secondary)]">
      {children}
    </h2>
  );
}

function EmptyState({ body }: { body: string }) {
  return <p className="mt-3 text-sm font-light text-[var(--muted)]">{body}</p>;
}

function PanelMessage({ children }: { children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 md:p-8">
      <p className="text-sm font-light text-[var(--muted)]">{children}</p>
    </section>
  );
}
