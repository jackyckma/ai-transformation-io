'use client';

import { useState } from 'react';
import type { PersonalTarget } from '@ai-transformation/shared';

import { useBookmarks } from '@/lib/bookmarks';

type SaveToContextProps = {
  target: PersonalTarget;
  title?: string;
  className?: string;
};

/**
 * Bookmark / Save-to-context action (§6). Members-only — renders nothing for
 * logged-out visitors, who use the localStorage-backed surfaces instead.
 */
export function SaveToContext({ target, title, className = '' }: SaveToContextProps) {
  const { isSignedIn, isLoaded, isBookmarked, toggle } = useBookmarks();
  const [busy, setBusy] = useState(false);

  if (!isLoaded || !isSignedIn) return null;

  const saved = isBookmarked(target);

  async function onClick() {
    if (busy) return;
    setBusy(true);
    try {
      await toggle(target, title);
    } finally {
      setBusy(false);
    }
  }

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
      <BookmarkGlyph filled={saved} />
      {saved ? 'Saved' : 'Save to my context'}
    </button>
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
