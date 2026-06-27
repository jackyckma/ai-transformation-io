'use client';

import type { PersonalTarget } from '@ai-transformation/shared';

import { ConfirmCheckGlyph, useJustConfirmed } from '@/lib/use-just-confirmed';

type SaveButtonProps = {
  target: PersonalTarget;
  title?: string;
  saved: boolean;
  pending: boolean;
  onToggle: (target: PersonalTarget, title?: string) => void;
};

export function SaveButton({ target, title, saved, pending, onToggle }: SaveButtonProps) {
  const { justConfirmed, markInteracted } = useJustConfirmed(saved);
  const showConfirm = justConfirmed && saved && !pending;

  return (
    <button
      type="button"
      onClick={() => {
        markInteracted();
        onToggle(target, title);
      }}
      disabled={pending}
      aria-pressed={saved}
      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${
        saved
          ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
          : 'border-[var(--border)] text-[var(--foreground)] hover:border-[var(--accent)] hover:text-[var(--accent)]'
      }`}
    >
      {showConfirm ? <ConfirmCheckGlyph /> : null}
      {pending ? 'Saving…' : saved ? 'Saved' : 'Save'}
    </button>
  );
}
