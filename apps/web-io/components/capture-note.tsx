'use client';

import { useState } from 'react';

import { useCapturedNotes } from '@/lib/captured-notes';

export function CaptureNote({ context }: { context?: string }) {
  const { notes, add, remove } = useCapturedNotes();
  const [body, setBody] = useState('');

  function save() {
    if (!body.trim()) return;
    add(body, context);
    setBody('');
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 md:p-6">
        <label htmlFor="capture-body" className="text-sm font-normal text-[var(--foreground)]">
          Capture a private note
        </label>
        <p className="mt-1 text-xs font-light text-[var(--muted)]">
          Rough thoughts and project context. Always private — synced to your account when signed in.
        </p>
        {context ? (
          <p className="mt-3 inline-flex items-center rounded-full bg-[var(--accent)]/10 px-3 py-1 text-xs font-normal text-[var(--foreground)]">
            Context: {context}
          </p>
        ) : null}
        <textarea
          id="capture-body"
          value={body}
          onChange={(event) => setBody(event.target.value)}
          rows={4}
          placeholder="What do you want to remember?"
          className="mt-3 w-full resize-y rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 text-sm font-light text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
        />
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={save}
            disabled={!body.trim()}
            className="inline-flex min-h-9 items-center rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--accent-fg)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Save note
          </button>
        </div>
      </div>

      <section>
        <h2 className="font-serif text-lg font-normal tracking-tight">Your notes</h2>
        {notes.length === 0 ? (
          <p className="mt-3 text-sm font-light text-[var(--muted)]">
            No notes yet. Saved notes stay private — to your account when signed in, otherwise this device.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {notes.map((note) => (
              <li
                key={note.id}
                className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4"
              >
                <p className="whitespace-pre-wrap text-sm font-light leading-relaxed text-[var(--foreground)]">
                  {note.body}
                </p>
                <div className="mt-3 flex items-center justify-between text-xs font-light text-[var(--muted)]">
                  <span>{new Date(note.createdAt).toLocaleString()}</span>
                  <button
                    type="button"
                    onClick={() => remove(note.id)}
                    className="text-[var(--secondary)] underline-offset-2 hover:text-[var(--foreground)] hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
