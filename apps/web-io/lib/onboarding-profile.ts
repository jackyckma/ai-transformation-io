'use client';

import { onboardingProfileSchema, type OnboardingProfile } from '@ai-transformation/shared';
import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'io.onboarding.profile.v1';
const PROFILE_EVENT = 'io:onboarding-profile-changed';

function readProfile(): OnboardingProfile | null {
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

function writeProfile(profile: OnboardingProfile): void {
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
 * Phase 1 stub: persist onboarding fields in localStorage until the Wave 12
 * profile API lands. Schema is the shared `onboardingProfileSchema`.
 */
export function useOnboardingProfile(): OnboardingProfileState {
  const [profile, setProfile] = useState<OnboardingProfile | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setProfile(readProfile());
    setIsLoaded(true);

    const sync = () => setProfile(readProfile());
    window.addEventListener(PROFILE_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(PROFILE_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const save = useCallback((next: OnboardingProfile) => {
    const parsed = onboardingProfileSchema.parse(next);
    writeProfile(parsed);
    setProfile(parsed);
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
