'use client';

import { useCallback, useEffect, useState } from 'react';
import { resolveClientApiUrl } from '@ai-transformation/shared';

export type AuthUser = {
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

export type AuthState = {
  user: AuthUser | null;
  isLoading: boolean;
  audience: 'guest' | 'member';
};

export function useAuthUser(): AuthState {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
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
    void refresh();
  }, [refresh]);

  return { user, isLoading, audience: user ? 'member' : 'guest' };
}
