'use client';

export const OPEN_COMPANION_EVENT = 'atx-open-companion';

export function requestOpenCompanion(): void {
  if (typeof window === 'undefined') {
    return;
  }
  window.dispatchEvent(new CustomEvent(OPEN_COMPANION_EVENT));
}

type CompanionNavButtonProps = {
  className?: string;
};

export function CompanionNavButton({ className }: CompanionNavButtonProps) {
  return (
    <button
      type="button"
      onClick={requestOpenCompanion}
      className={
        className ??
        'whitespace-nowrap text-[var(--muted)] transition hover:text-[var(--foreground)]'
      }
    >
      Companion
    </button>
  );
}
