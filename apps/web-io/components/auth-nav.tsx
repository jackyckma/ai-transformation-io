'use client';

import { resolveClientApiUrl } from '@ai-transformation/shared';
import { useCallback, useEffect, useState } from 'react';

type AuthUser = {
  id: string;
  email: string;
  name?: string | null;
  picture?: string | null;
  createdAt: string;
};

type AuthMeResponse = {
  ok: true;
  user: AuthUser | null;
};

function displayName(user: AuthUser): string {
  if (user.name && user.name.trim().length > 0) {
    return user.name;
  }
  return user.email;
}

export function AuthNav() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);

  const refreshAuth = useCallback(async () => {
    try {
      const response = await fetch(resolveClientApiUrl('/api/auth/me'), {
        credentials: 'include',
      });
      if (!response.ok) {
        setUser(null);
        return;
      }

      const payload = (await response.json()) as AuthMeResponse;
      setUser(payload.user ?? null);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshAuth();
  }, [refreshAuth]);

  async function signOut() {
    setIsSigningOut(true);
    try {
      await fetch(resolveClientApiUrl('/api/auth/logout'), {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // Ignore network errors and reset to signed-out state.
    } finally {
      setUser(null);
      setIsSigningOut(false);
    }
  }

  if (isLoading) {
    return <div className="h-9 w-24" aria-hidden />;
  }

  if (!user) {
    return (
      <a
        href={resolveClientApiUrl('/api/auth/google')}
        className="inline-flex min-h-9 min-w-[5.5rem] items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-sm font-light text-[var(--foreground)] transition hover:border-[var(--accent)]"
      >
        Sign in
      </a>
    );
  }

  return (
    <div className="flex items-center gap-2 sm:gap-3 text-sm font-light">
      <span className="hidden max-w-32 truncate text-[var(--muted)] sm:inline" title={user.email}>
        {displayName(user)}
      </span>
      <button
        type="button"
        onClick={signOut}
        disabled={isSigningOut}
        className="inline-flex min-h-9 min-w-[5.5rem] items-center justify-center rounded-full border border-[var(--border)] px-4 py-2 text-[var(--foreground)] transition hover:border-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSigningOut ? 'Signing out…' : 'Sign out'}
      </button>
    </div>
  );
}
