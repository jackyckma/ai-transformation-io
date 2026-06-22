'use client';

export const OPEN_COMPANION_EVENT = 'atx-open-companion';
export const OPEN_COMPANION_WITH_MESSAGE_EVENT = 'atx-open-companion-message';

export function requestOpenCompanion(): void {
  if (typeof window === 'undefined') {
    return;
  }
  window.dispatchEvent(new CustomEvent(OPEN_COMPANION_EVENT));
}

export function requestOpenCompanionWithMessage(message: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  window.dispatchEvent(new CustomEvent(OPEN_COMPANION_WITH_MESSAGE_EVENT, { detail: message }));
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
