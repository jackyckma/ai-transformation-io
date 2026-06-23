'use client';

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'io.capture-notes.v1';
const EVENT = 'io:capture-notes-changed';
const MAX_NOTES = 50;

export type CapturedNote = {
  id: string;
  body: string;
  context?: string;
  createdAt: string;
};

function read(): CapturedNote[] {
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

function write(notes: CapturedNote[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notes.slice(0, MAX_NOTES)));
  window.dispatchEvent(new Event(EVENT));
}

export type CapturedNotesState = {
  notes: CapturedNote[];
  add: (body: string, context?: string) => void;
  remove: (id: string) => void;
};

/**
 * Phase 1 Capture stub (§4): private notes held in localStorage until the
 * Wave 12 object store + visibility model lands. Always private to the device.
 */
export function useCapturedNotes(): CapturedNotesState {
  const [notes, setNotes] = useState<CapturedNote[]>([]);

  const sync = useCallback(() => setNotes(read()), []);

  useEffect(() => {
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, [sync]);

  const add = useCallback((body: string, context?: string) => {
    const trimmed = body.trim();
    if (!trimmed) return;
    const note: CapturedNote = {
      id: `note_${Date.now().toString(36)}`,
      body: trimmed,
      context,
      createdAt: new Date().toISOString(),
    };
    write([note, ...read()]);
  }, []);

  const remove = useCallback((id: string) => {
    write(read().filter((note) => note.id !== id));
  }, []);

  return { notes, add, remove };
}
