'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { getApiClient, IO_SITE } from '@/lib/api-client';
import { useAuthUser } from '@/lib/use-auth-user';

const STORAGE_KEY = 'io.recently-viewed.v1';
const MAX_ENTRIES = 12;
const EVENT = 'io:recently-viewed-changed';

export type RecentEntry = {
  slug: string;
  title: string;
  pathname: string;
  viewedAt: string;
};

/** Minimal reference used across the personal layer; metadata resolved from content. */
export type RecentRef = {
  slug: string;
  viewedAt: string;
};

function readLocal(): RecentEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as RecentEntry[]) : [];
  } catch {
    return [];
  }
}

function writeLocal(entries: RecentEntry[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
  window.dispatchEvent(new Event(EVENT));
}

/** Local cache write — keeps the logged-out fallback and metadata for resolution. */
export function recordRecentlyViewedLocal(entry: Omit<RecentEntry, 'viewedAt'>): void {
  const existing = readLocal().filter((item) => item.slug !== entry.slug);
  const next = [{ ...entry, viewedAt: new Date().toISOString() }, ...existing];
  writeLocal(next);
}

function localRefs(): RecentRef[] {
  return readLocal()
    .map((entry) => ({ slug: entry.slug, viewedAt: entry.viewedAt }))
    .slice(0, MAX_ENTRIES);
}

/**
 * Records a recently-viewed article. Always writes the local cache (offline
 * fallback + metadata); additionally persists to the personal-layer API when
 * the user is signed in. Backend failures fall back to the local cache only.
 */
export function useRecordRecentlyViewed(): (entry: Omit<RecentEntry, 'viewedAt'>) => void {
  const { user } = useAuthUser();

  return useCallback(
    (entry: Omit<RecentEntry, 'viewedAt'>) => {
      recordRecentlyViewedLocal(entry);
      if (!user) return;
      void getApiClient()
        .recentlyViewed.create({
          site: IO_SITE,
          target: { targetType: 'library_article', targetId: entry.slug },
        })
        .catch(() => {
          // Backend unreachable — local cache already updated.
        });
    },
    [user],
  );
}

/**
 * Reads recently-viewed references. Signed-in users read from the API (with a
 * local-cache fallback when the backend is unavailable); logged-out users read
 * from localStorage.
 */
export function useRecentlyViewed(): RecentRef[] {
  const { user, isLoading } = useAuthUser();
  const [entries, setEntries] = useState<RecentRef[]>([]);
  const userIdRef = useRef<string | null>(null);
  userIdRef.current = user?.id ?? null;

  const load = useCallback(async () => {
    if (!userIdRef.current) {
      setEntries(localRefs());
      return;
    }
    try {
      const res = await getApiClient().recentlyViewed.list({ site: IO_SITE, mine: true });
      const refs = res.entries
        .filter((entry) => entry.target.targetType === 'library_article')
        .map((entry) => ({ slug: entry.target.targetId, viewedAt: entry.viewedAt }))
        .sort((a, b) => b.viewedAt.localeCompare(a.viewedAt))
        .slice(0, MAX_ENTRIES);
      setEntries(refs);
    } catch {
      setEntries(localRefs());
    }
  }, []);

  useEffect(() => {
    if (isLoading) return;
    void load();
    const sync = () => void load();
    window.addEventListener(EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, [isLoading, user?.id, load]);

  return entries;
}
