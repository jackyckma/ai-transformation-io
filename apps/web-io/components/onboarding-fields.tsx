'use client';

import { onboardingProfileSchema, type OnboardingProfile } from '@ai-transformation/shared';
import { useState } from 'react';

import { useOnboardingProfile } from '@/lib/onboarding-profile';

type OnboardingFieldsProps = {
  submitLabel?: string;
  onSaved?: (profile: OnboardingProfile) => void;
};

const ROLE_OPTIONS = [
  'Executive / Board',
  'Strategy / Transformation lead',
  'Technology / CIO / CTO',
  'Operations',
  'People / HR',
  'Product / Engineering',
  'Other',
];

const INDUSTRY_OPTIONS = [
  'Financial services',
  'Healthcare',
  'Manufacturing',
  'Retail / Consumer',
  'Technology',
  'Public sector',
  'Professional services',
  'Other',
];

export function OnboardingFields({ submitLabel = 'Save profile', onSaved }: OnboardingFieldsProps) {
  const { profile, isLoaded, save } = useOnboardingProfile();
  const [role, setRole] = useState('');
  const [industry, setIndustry] = useState('');
  const [projectFocus, setProjectFocus] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  if (isLoaded && !hydrated) {
    setHydrated(true);
    if (profile) {
      setRole(profile.role);
      setIndustry(profile.industry);
      setProjectFocus(profile.projectFocus ?? '');
    }
  }

  function submit() {
    setError(null);
    const candidate = {
      role: role.trim(),
      industry: industry.trim(),
      projectFocus: projectFocus.trim() ? projectFocus.trim() : undefined,
    };
    const parsed = onboardingProfileSchema.safeParse(candidate);
    if (!parsed.success) {
      setError('Add your role and industry to personalize recommendations.');
      return;
    }
    save(parsed.data);
    setSaved(true);
    onSaved?.(parsed.data);
  }

  return (
    <div className="space-y-4">
      <Field label="Role" htmlFor="onboarding-role">
        <input
          id="onboarding-role"
          list="onboarding-role-options"
          value={role}
          onChange={(event) => {
            setRole(event.target.value);
            setSaved(false);
          }}
          placeholder="e.g. Technology / CIO"
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm font-light text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
        />
        <datalist id="onboarding-role-options">
          {ROLE_OPTIONS.map((option) => (
            <option key={option} value={option} />
          ))}
        </datalist>
      </Field>

      <Field label="Industry" htmlFor="onboarding-industry">
        <input
          id="onboarding-industry"
          list="onboarding-industry-options"
          value={industry}
          onChange={(event) => {
            setIndustry(event.target.value);
            setSaved(false);
          }}
          placeholder="e.g. Financial services"
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm font-light text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
        />
        <datalist id="onboarding-industry-options">
          {INDUSTRY_OPTIONS.map((option) => (
            <option key={option} value={option} />
          ))}
        </datalist>
      </Field>

      <Field label="Project focus (optional)" htmlFor="onboarding-focus">
        <input
          id="onboarding-focus"
          value={projectFocus}
          onChange={(event) => {
            setProjectFocus(event.target.value);
            setSaved(false);
          }}
          placeholder="e.g. Governance for agentic workflows"
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm font-light text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
        />
      </Field>

      {error ? <p className="text-sm font-light text-[var(--accent)]">{error}</p> : null}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={submit}
          className="inline-flex min-h-9 items-center rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--accent-fg)] transition hover:opacity-90"
        >
          {submitLabel}
        </button>
        {saved ? <span className="text-sm font-light text-[var(--muted)]">Saved</span> : null}
      </div>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="text-sm font-normal text-[var(--foreground)]">
        {label}
      </label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
