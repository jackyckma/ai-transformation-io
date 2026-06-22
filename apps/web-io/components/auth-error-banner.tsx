'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function AuthErrorBannerInner() {
  const params = useSearchParams();
  if (params.get('auth_error') !== 'oauth') {
    return null;
  }

  return (
    <div
      role="status"
      className="border-b border-[var(--border)] bg-[var(--card)] px-4 py-3 text-center text-sm font-light text-[var(--foreground)]"
    >
      Google sign-in did not complete. Please try again, or continue without signing in — the companion
      works for guests too.
    </div>
  );
}

export function AuthErrorBanner() {
  return (
    <Suspense fallback={null}>
      <AuthErrorBannerInner />
    </Suspense>
  );
}
