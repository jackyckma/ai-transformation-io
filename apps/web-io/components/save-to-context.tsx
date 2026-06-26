'use client';

import { useEffect, useRef, useState } from 'react';
import type { PersonalTarget } from '@ai-transformation/shared';

import { useBookmarks } from '@/lib/bookmarks';

type SaveToContextProps = {
  target: PersonalTarget;
  title?: string;
  className?: string;
};

/** How long the inline "just saved" check stays before settling. */
const CONFIRM_MS = 1600;

/**
 * Bookmark / Save-to-context action (§6). Members-only — renders nothing for
 * logged-out visitors, who use the localStorage-backed surfaces instead.
 */
export function SaveToContext({ target, title, className = '' }: SaveToContextProps) {
  const { isSignedIn, isLoaded, isBookmarked, toggle } = useBookmarks();
  const [busy, setBusy] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const confirmTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (confirmTimer.current) clearTimeout(confirmTimer.current);
    },
    [],
  );

  if (!isLoaded || !isSignedIn) return null;

  const saved = isBookmarked(target);

  async function onClick() {
    if (busy) return;
    const wasSaved = saved;
    setBusy(true);
    try {
      await toggle(target, title);
      if (!wasSaved) {
        setJustSaved(true);
        if (confirmTimer.current) clearTimeout(confirmTimer.current);
        confirmTimer.current = setTimeout(() => setJustSaved(false), CONFIRM_MS);
      }
    } finally {
      setBusy(false);
    }
  }

  const showConfirm = saved && justSaved;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      aria-pressed={saved}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-normal transition disabled:opacity-60 ${
        saved
          ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--foreground)]'
          : 'border-[var(--border)] text-[var(--secondary)] hover:border-[var(--accent)]/40 hover:text-[var(--foreground)]'
      } ${className}`.trim()}
    >
      {showConfirm ? <CheckGlyph /> : <BookmarkGlyph filled={saved} />}
      {saved ? 'Saved' : 'Save to my context'}
    </button>
  );
}

function CheckGlyph() {
  return (
    <svg
      aria-hidden
      className="h-3.5 w-3.5 text-[var(--accent)]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BookmarkGlyph({ filled }: { filled: boolean }) {
  return (
    <svg
      aria-hidden
      className="h-3.5 w-3.5"
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <path d="M6 4h12v16l-6-4-6 4V4z" strokeLinejoin="round" />
    </svg>
  );
}
