'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Bookmark, PersonalTarget } from '@ai-transformation/shared';

import { getApiClient } from '@/lib/api-client';
import { targetKey } from '@/lib/object-display';

type BookmarkState = {
  ready: boolean;
  isSaved: (target: PersonalTarget) => boolean;
  isPending: (target: PersonalTarget) => boolean;
  toggle: (target: PersonalTarget, title?: string) => Promise<void>;
  error: string;
};

/**
 * Loads the signed-in member's bookmarks once and exposes a keyed lookup plus an
 * optimistic toggle. When `enabled` is false (logged out) it stays inert so cards
 * can hide the Save affordance without extra branching.
 */
export function useBookmarks(enabled: boolean): BookmarkState {
  const [byKey, setByKey] = useState<Map<string, Bookmark>>(new Map());
  const [pending, setPending] = useState<Set<string>>(new Set());
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const loadedRef = useRef(false);

  useEffect(() => {
    if (!enabled || loadedRef.current) {
      return;
    }
    loadedRef.current = true;
    let cancelled = false;
    void (async () => {
      try {
        const response = await getApiClient().bookmarks.list({ site: 'org', mine: true });
        if (cancelled) return;
        const next = new Map<string, Bookmark>();
        for (const bookmark of response.bookmarks) {
          next.set(targetKey(bookmark.target), bookmark);
        }
        setByKey(next);
      } catch {
        if (!cancelled) {
          setByKey(new Map());
        }
      } finally {
        if (!cancelled) {
          setReady(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  const isSaved = useCallback((target: PersonalTarget) => byKey.has(targetKey(target)), [byKey]);
  const isPending = useCallback((target: PersonalTarget) => pending.has(targetKey(target)), [pending]);

  const toggle = useCallback(
    async (target: PersonalTarget, title?: string) => {
      if (!enabled) {
        return;
      }
      const key = targetKey(target);
      setPending((prev) => new Set(prev).add(key));
      setError('');
      try {
        const existing = byKey.get(key);
        if (existing) {
          await getApiClient().bookmarks.delete(existing.id);
          setByKey((prev) => {
            const next = new Map(prev);
            next.delete(key);
            return next;
          });
        } else {
          const response = await getApiClient().bookmarks.create({ site: 'org', target, title });
          setByKey((prev) => new Map(prev).set(key, response.bookmark));
        }
      } catch {
        setError('Could not update your bookmark. Try again shortly.');
      } finally {
        setPending((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      }
    },
    [byKey, enabled],
  );

  return { ready, isSaved, isPending, toggle, error };
}
