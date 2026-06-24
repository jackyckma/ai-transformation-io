'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { getApiClient, IO_SITE } from '@/lib/api-client';
import { useAuthUser } from '@/lib/use-auth-user';

const STORAGE_KEY = 'io.capture-notes.v1';
const EVENT = 'io:capture-notes-changed';
const MAX_NOTES = 50;

export type CapturedNote = {
  id: string;
  body: string;
  context?: string;
  createdAt: string;
};

function readLocal(): CapturedNote[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CapturedNote[]) : [];
  } catch {
    return [];
  }
}

function writeLocal(notes: CapturedNote[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notes.slice(0, MAX_NOTES)));
  window.dispatchEvent(new Event(EVENT));
}

function addLocal(body: string, context?: string): void {
  const note: CapturedNote = {
    id: `note_${Date.now().toString(36)}`,
    body,
    context,
    createdAt: new Date().toISOString(),
  };
  writeLocal([note, ...readLocal()]);
}

function contextOf(metadata: Record<string, unknown> | undefined): string | undefined {
  const value = metadata?.context;
  return typeof value === 'string' && value.trim() ? value : undefined;
}

export type CapturedNotesState = {
  notes: CapturedNote[];
  add: (body: string, context?: string) => void;
  remove: (id: string) => void;
};

/**
 * Private Capture notes (§4 — always private visibility). Signed-in users
 * read/write through the notes API; logged-out users fall back to localStorage.
 * Backend failures degrade to the local cache so a note is never lost.
 */
export function useCapturedNotes(): CapturedNotesState {
  const { user, isLoading } = useAuthUser();
  const [notes, setNotes] = useState<CapturedNote[]>([]);
  const userIdRef = useRef<string | null>(null);
  userIdRef.current = user?.id ?? null;

  const load = useCallback(async () => {
    if (!userIdRef.current) {
      setNotes(readLocal());
      return;
    }
    try {
      const res = await getApiClient().notes.list({ site: IO_SITE, mine: true });
      const mapped = res.notes
        .filter((note) => note.isCapture)
        .map((note) => ({
          id: note.id,
          body: note.body,
          context: contextOf(note.metadata),
          createdAt: note.createdAt,
        }))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      setNotes(mapped);
    } catch {
      setNotes(readLocal());
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

  const add = useCallback(
    (body: string, context?: string) => {
      const trimmed = body.trim();
      if (!trimmed) return;
      if (!userIdRef.current) {
        addLocal(trimmed, context);
        return;
      }
      void getApiClient()
        .notes.create({
          site: IO_SITE,
          body: trimmed,
          isCapture: true,
          captureSource: 'ask_capture',
          metadata: context ? { context } : undefined,
        })
        .then(() => load())
        .catch(() => {
          addLocal(trimmed, context);
        });
    },
    [load],
  );

  const remove = useCallback(
    (id: string) => {
      if (!userIdRef.current) {
        writeLocal(readLocal().filter((note) => note.id !== id));
        return;
      }
      void getApiClient()
        .notes.delete(id)
        .then(() => load())
        .catch(() => {
          writeLocal(readLocal().filter((note) => note.id !== id));
        });
    },
    [load],
  );

  return { notes, add, remove };
}
