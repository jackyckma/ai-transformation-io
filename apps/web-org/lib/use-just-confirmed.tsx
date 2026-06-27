'use client';

import { useEffect, useRef, useState } from 'react';

/** How long the inline confirmation check stays before settling (matches .io save-to-context). */
export const CONFIRM_MS = 1600;

/**
 * Drives a brief inline confirmation for controlled toggle affordances whose
 * async toggle returns no direction (e.g. follow via useCommunityInteractions,
 * save via useBookmarks). Call `markInteracted()` from the click handler, then
 * the hook flashes `justConfirmed` only when `active` transitions false→true
 * right after a user click — never on the initial async load and never on a
 * toggle-off. The check clears after CONFIRM_MS and on unmount.
 */
export function useJustConfirmed(active: boolean): { justConfirmed: boolean; markInteracted: () => void } {
  const [justConfirmed, setJustConfirmed] = useState(false);
  const interactedRef = useRef(false);
  const prevActiveRef = useRef(active);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const prev = prevActiveRef.current;
    prevActiveRef.current = active;
    if (prev === active) return;
    if (active && interactedRef.current) {
      setJustConfirmed(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setJustConfirmed(false), CONFIRM_MS);
    }
    interactedRef.current = false;
  }, [active]);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  return {
    justConfirmed,
    markInteracted: () => {
      interactedRef.current = true;
    },
  };
}

/** Inline check glyph shown during the brief post-action confirmation. */
export function ConfirmCheckGlyph() {
  return (
    <svg
      aria-hidden
      className="h-3.5 w-3.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
