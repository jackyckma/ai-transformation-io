'use client';

import { resolveClientApiUrl } from '@ai-transformation/shared';
import { useEffect, useState } from 'react';

export type AuthUser = {
  id: string;
  email: string;
  name?: string | null;
  picture?: string | null;
  createdAt?: string;
};

type AuthMeResponse = {
  ok: boolean;
  user: AuthUser | null;
};

export type AuthState = {
  user: AuthUser | null;
  isLoading: boolean;
};

/** Client-side auth state from the combined `/api/auth/me` proxy. */
export function useAuthUser(): AuthState {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch(resolveClientApiUrl('/api/auth/me'), {
          credentials: 'include',
        });
        if (!response.ok) {
          if (!cancelled) setUser(null);
          return;
        }
        const payload = (await response.json()) as AuthMeResponse;
        if (!cancelled) setUser(payload.user ?? null);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { user, isLoading };
}
