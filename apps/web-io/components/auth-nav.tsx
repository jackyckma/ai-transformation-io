'use client';

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

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

function apiUrl(path: string): string {
  return `${API_BASE}${path}`;
}

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
      const response = await fetch(apiUrl('/api/auth/me'), {
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
      await fetch(apiUrl('/api/auth/logout'), {
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
    return <div className="h-8 w-20" aria-hidden />;
  }

  if (!user) {
    return (
      <a
        href={apiUrl('/api/auth/google')}
        className="text-sm font-light text-[var(--muted)] transition hover:text-[var(--foreground)]"
      >
        Sign in
      </a>
    );
  }

  return (
    <div className="flex items-center gap-3 text-sm font-light">
      <span className="max-w-32 truncate text-[var(--muted)]" title={user.email}>
        {displayName(user)}
      </span>
      <button
        type="button"
        onClick={signOut}
        disabled={isSigningOut}
        className="text-[var(--muted)] transition hover:text-[var(--foreground)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSigningOut ? 'Signing out…' : 'Sign out'}
      </button>
    </div>
  );
}
