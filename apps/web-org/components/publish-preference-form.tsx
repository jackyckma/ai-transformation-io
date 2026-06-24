'use client';

import { useEffect, useState } from 'react';
import type { PublishMode } from '@ai-transformation/shared';

import { getApiClient } from '@/lib/api-client';
import { useAuthUser } from '@/lib/use-auth-user';

type LoadState = 'loading' | 'ready' | 'signed-out' | 'error';

const OPTIONS: { value: PublishMode; label: string; help: string }[] = [
  {
    value: 'review',
    label: 'Review before publish',
    help: 'Your contributions wait in the moderation queue until reviewed.',
  },
  {
    value: 'auto',
    label: 'Auto-publish',
    help: 'Publish automatically within visibility rules. Members-only stays members-only; nothing becomes public on its own.',
  },
];

export function PublishPreferenceForm() {
  const { audience, isLoading } = useAuthUser();
  const isMember = audience === 'member';
  const [mode, setMode] = useState<PublishMode>('review');
  const [state, setState] = useState<LoadState>('loading');
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isLoading) {
      return;
    }
    if (!isMember) {
      setState('signed-out');
      return;
    }
    let cancelled = false;
    setState('loading');
    void (async () => {
      try {
        const response = await getApiClient().publishPreference.get();
        if (cancelled) return;
        setMode(response.publishPreference.defaultPublishMode);
        setState('ready');
      } catch {
        if (!cancelled) {
          setState('error');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isLoading, isMember]);

  async function save(next: PublishMode) {
    setMode(next);
    setStatus('');
    setSaving(true);
    try {
      const response = await getApiClient().publishPreference.set({ defaultPublishMode: next });
      setMode(response.publishPreference.defaultPublishMode);
      setStatus('Preference saved.');
    } catch {
      setStatus('Could not save your preference. Please try again shortly.');
    } finally {
      setSaving(false);
    }
  }

  if (state === 'signed-out') {
    return (
      <p className="mt-4 text-sm font-light text-[var(--muted)]">
        Sign in to choose how your contributions publish.
      </p>
    );
  }

  if (state === 'loading') {
    return <p className="mt-4 text-sm font-light text-[var(--muted)]">Loading your preference…</p>;
  }

  if (state === 'error') {
    return (
      <p className="mt-4 text-sm font-light text-[var(--muted)]">
        Your publish preference is unavailable right now. Please try again shortly.
      </p>
    );
  }

  return (
    <div className="mt-4 space-y-3">
      <fieldset className="space-y-3" disabled={saving}>
        <legend className="sr-only">Publish preference</legend>
        {OPTIONS.map((option) => (
          <label
            key={option.value}
            className={`flex cursor-pointer gap-3 rounded-xl border p-4 transition ${
              mode === option.value
                ? 'border-[var(--accent)] bg-[var(--accent)]/10'
                : 'border-[var(--border)] hover:border-[var(--accent)]/40'
            }`}
          >
            <input
              type="radio"
              name="publish-preference"
              value={option.value}
              checked={mode === option.value}
              onChange={() => void save(option.value)}
              className="mt-1"
            />
            <span>
              <span className="block text-sm font-medium text-[var(--foreground)]">{option.label}</span>
              <span className="mt-1 block text-sm font-light leading-relaxed text-[var(--muted)]">
                {option.help}
              </span>
            </span>
          </label>
        ))}
      </fieldset>
      {status ? (
        <span role="status" className="text-sm font-light text-[var(--accent)]">
          {status}
        </span>
      ) : null}
    </div>
  );
}
