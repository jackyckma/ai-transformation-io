'use client';

import type { PersonalTarget } from '@ai-transformation/shared';

type SaveButtonProps = {
  target: PersonalTarget;
  title?: string;
  saved: boolean;
  pending: boolean;
  onToggle: (target: PersonalTarget, title?: string) => void;
};

export function SaveButton({ target, title, saved, pending, onToggle }: SaveButtonProps) {
  return (
    <button
      type="button"
      onClick={() => onToggle(target, title)}
      disabled={pending}
      aria-pressed={saved}
      className={`rounded-full border px-3 py-1 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${
        saved
          ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
          : 'border-[var(--border)] text-[var(--foreground)] hover:border-[var(--accent)] hover:text-[var(--accent)]'
      }`}
    >
      {pending ? 'Saving…' : saved ? 'Saved' : 'Save'}
    </button>
  );
}
