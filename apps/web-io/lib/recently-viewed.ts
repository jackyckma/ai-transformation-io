'use client';

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'io.recently-viewed.v1';
const MAX_ENTRIES = 12;
const EVENT = 'io:recently-viewed-changed';

export type RecentEntry = {
  slug: string;
  title: string;
  pathname: string;
  viewedAt: string;
};

function read(): RecentEntry[] {
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

export function recordRecentlyViewed(entry: Omit<RecentEntry, 'viewedAt'>): void {
  if (typeof window === 'undefined') return;
  const existing = read().filter((item) => item.slug !== entry.slug);
  const next = [{ ...entry, viewedAt: new Date().toISOString() }, ...existing].slice(0, MAX_ENTRIES);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(EVENT));
}

export function useRecentlyViewed(): RecentEntry[] {
  const [entries, setEntries] = useState<RecentEntry[]>([]);

  const sync = useCallback(() => setEntries(read()), []);

  useEffect(() => {
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, [sync]);

  return entries;
}
