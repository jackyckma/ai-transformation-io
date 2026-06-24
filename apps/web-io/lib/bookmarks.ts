'use client';

import { useCallback, useMemo, useSyncExternalStore } from 'react';
import { resolveClientApiUrl, type Bookmark, type PersonalTarget } from '@ai-transformation/shared';

import { getApiClient, IO_SITE } from '@/lib/api-client';

export function targetKey(target: PersonalTarget): string {
  return `${target.targetType}:${target.targetId}`;
}

type Status = 'idle' | 'loading' | 'ready';

type StoreState = {
  status: Status;
  signedIn: boolean;
  bookmarks: Bookmark[];
};

/**
 * Module-level shared store so the many Save-to-context buttons on a list page
 * resolve auth + bookmarks once, not per item. Bookmarks are members-only
 * (§5.4); logged-out users get an empty list and the buttons render nothing.
 */
let store: StoreState = { status: 'idle', signedIn: false, bookmarks: [] };
const listeners = new Set<() => void>();
let started = false;

function setStore(next: Partial<StoreState>): void {
  store = { ...store, ...next };
  listeners.forEach((listener) => listener());
}

async function fetchAuthUserId(): Promise<string | null> {
  try {
    const res = await fetch(resolveClientApiUrl('/api/auth/me'), { credentials: 'include' });
    if (!res.ok) return null;
    const data = (await res.json()) as { user?: { id?: string } | null };
    return data?.user?.id ?? null;
  } catch {
    return null;
  }
}

async function refresh(): Promise<void> {
  const userId = await fetchAuthUserId();
  if (!userId) {
    setStore({ status: 'ready', signedIn: false, bookmarks: [] });
    return;
  }
  try {
    const res = await getApiClient().bookmarks.list({ site: IO_SITE, mine: true });
    setStore({ status: 'ready', signedIn: true, bookmarks: res.bookmarks });
  } catch {
    setStore({ status: 'ready', signedIn: true, bookmarks: [] });
  }
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  if (!started) {
    started = true;
    setStore({ status: 'loading' });
    void refresh();
  }
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): StoreState {
  return store;
}

const SERVER_SNAPSHOT: StoreState = { status: 'idle', signedIn: false, bookmarks: [] };

function getServerSnapshot(): StoreState {
  return SERVER_SNAPSHOT;
}

export type BookmarksState = {
  bookmarks: Bookmark[];
  isSignedIn: boolean;
  isLoaded: boolean;
  isBookmarked: (target: PersonalTarget) => boolean;
  toggle: (target: PersonalTarget, title?: string) => Promise<void>;
};

export function useBookmarks(): BookmarksState {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const keys = useMemo(
    () => new Set(snapshot.bookmarks.map((bookmark) => targetKey(bookmark.target))),
    [snapshot.bookmarks],
  );

  const isBookmarked = useCallback(
    (target: PersonalTarget) => keys.has(targetKey(target)),
    [keys],
  );

  const toggle = useCallback(async (target: PersonalTarget, title?: string) => {
    if (!store.signedIn) return;
    const existing = store.bookmarks.find(
      (bookmark) => targetKey(bookmark.target) === targetKey(target),
    );
    try {
      if (existing) {
        await getApiClient().bookmarks.delete(existing.id);
      } else {
        await getApiClient().bookmarks.create({ site: IO_SITE, target, title });
      }
      await refresh();
    } catch {
      // Backend unreachable — leave state unchanged.
    }
  }, []);

  return {
    bookmarks: snapshot.bookmarks,
    isSignedIn: snapshot.signedIn,
    isLoaded: snapshot.status === 'ready',
    isBookmarked,
    toggle,
  };
}
