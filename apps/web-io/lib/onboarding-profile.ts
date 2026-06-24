'use client';

import { onboardingProfileSchema, type OnboardingProfile } from '@ai-transformation/shared';
import { useCallback, useEffect, useRef, useState } from 'react';

import { getApiClient } from '@/lib/api-client';
import { useAuthUser } from '@/lib/use-auth-user';

const STORAGE_KEY = 'io.onboarding.profile.v1';
const PROFILE_EVENT = 'io:onboarding-profile-changed';

function readLocal(): OnboardingProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = onboardingProfileSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

function writeLocal(profile: OnboardingProfile): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  window.dispatchEvent(new Event(PROFILE_EVENT));
}

export type OnboardingProfileState = {
  profile: OnboardingProfile | null;
  isLoaded: boolean;
  save: (profile: OnboardingProfile) => void;
  clear: () => void;
};

/**
 * Onboarding profile (role / industry / project focus) feeding §9
 * recommendations. Signed-in users persist through the profile API; logged-out
 * users fall back to localStorage. The local copy is kept in sync so the
 * recommendation scorer has an input even when the backend is unreachable.
 */
export function useOnboardingProfile(): OnboardingProfileState {
  const { user, isLoading } = useAuthUser();
  const [profile, setProfile] = useState<OnboardingProfile | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const userIdRef = useRef<string | null>(null);
  userIdRef.current = user?.id ?? null;

  useEffect(() => {
    if (isLoading) return;
    let cancelled = false;

    async function load() {
      if (!userIdRef.current) {
        if (!cancelled) {
          setProfile(readLocal());
          setIsLoaded(true);
        }
        return;
      }
      try {
        const res = await getApiClient().profile.get();
        if (cancelled) return;
        setProfile(res.profile?.profile ?? readLocal());
      } catch {
        if (!cancelled) setProfile(readLocal());
      } finally {
        if (!cancelled) setIsLoaded(true);
      }
    }

    void load();

    const sync = () => setProfile(readLocal());
    window.addEventListener(PROFILE_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      cancelled = true;
      window.removeEventListener(PROFILE_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, [isLoading, user?.id]);

  const save = useCallback((next: OnboardingProfile) => {
    const parsed = onboardingProfileSchema.parse(next);
    setProfile(parsed);
    writeLocal(parsed);
    if (!userIdRef.current) return;
    void getApiClient()
      .profile.set({ profile: parsed })
      .catch(() => {
        // Backend unreachable — local copy already saved.
      });
  }, []);

  const clear = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_KEY);
      window.dispatchEvent(new Event(PROFILE_EVENT));
    }
    setProfile(null);
  }, []);

  return { profile, isLoaded, save, clear };
}
