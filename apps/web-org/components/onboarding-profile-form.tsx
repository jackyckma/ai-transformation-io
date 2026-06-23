'use client';

import { FormEvent, useEffect, useState } from 'react';
import { onboardingProfileSchema, type OnboardingProfile } from '@ai-transformation/shared';

type FieldErrors = Partial<Record<keyof OnboardingProfile, string>>;

const STORE_KEY = 'atx-org-onboarding-profile';

const EMPTY: OnboardingProfile = { role: '', industry: '', projectFocus: '' };

export function OnboardingProfileForm() {
  const [values, setValues] = useState<OnboardingProfile>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState('');

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORE_KEY);
      if (raw) {
        const parsed = onboardingProfileSchema.partial().safeParse(JSON.parse(raw));
        if (parsed.success) {
          setValues({ ...EMPTY, ...parsed.data });
        }
      }
    } catch {
      // Ignore unreadable local state.
    }
  }, []);

  function update(field: keyof OnboardingProfile, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setStatus('');
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const candidate = {
      role: values.role.trim(),
      industry: values.industry.trim(),
      projectFocus: values.projectFocus?.trim() ? values.projectFocus.trim() : undefined,
    };
    const result = onboardingProfileSchema.safeParse(candidate);
    if (!result.success) {
      const nextErrors: FieldErrors = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof OnboardingProfile;
        if (key && !nextErrors[key]) {
          nextErrors[key] = key === 'projectFocus' ? issue.message : `${labelFor(key)} is required.`;
        }
      }
      setErrors(nextErrors);
      return;
    }

    try {
      window.localStorage.setItem(STORE_KEY, JSON.stringify(result.data));
      setStatus('Profile saved.');
    } catch {
      setStatus('Could not save locally. Check your browser settings.');
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit} noValidate>
      <Field
        id="profile-role"
        label="Role"
        help="Your role guides recommendations on Home and Knowledge."
        value={values.role}
        error={errors.role}
        onChange={(value) => update('role', value)}
        placeholder="e.g. Head of operations"
      />
      <Field
        id="profile-industry"
        label="Industry"
        value={values.industry}
        error={errors.industry}
        onChange={(value) => update('industry', value)}
        placeholder="e.g. Financial services"
      />
      <Field
        id="profile-focus"
        label="Project focus"
        optional
        help="What you are working on right now (optional)."
        value={values.projectFocus ?? ''}
        error={errors.projectFocus}
        onChange={(value) => update('projectFocus', value)}
        placeholder="e.g. Rolling out a claims copilot"
      />

      <div className="flex items-center gap-3">
        <button
          type="submit"
          className="inline-flex min-h-9 items-center rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--accent-fg)] transition hover:opacity-90"
        >
          Save profile
        </button>
        {status ? (
          <span role="status" className="text-sm font-light text-[var(--accent)]">
            {status}
          </span>
        ) : null}
      </div>
    </form>
  );
}

function labelFor(field: keyof OnboardingProfile): string {
  if (field === 'role') return 'Role';
  if (field === 'industry') return 'Industry';
  return 'Project focus';
}

function Field({
  id,
  label,
  value,
  error,
  onChange,
  placeholder,
  help,
  optional = false,
}: {
  id: string;
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  help?: string;
  optional?: boolean;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label} {optional ? <span className="text-[var(--muted)]">(optional)</span> : null}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : help ? `${id}-help` : undefined}
        className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none ring-[var(--accent)] transition focus:ring-2"
      />
      {help && !error ? (
        <p id={`${id}-help`} className="text-xs text-[var(--muted)]">
          {help}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="text-sm text-red-700 dark:text-red-200">
          {error}
        </p>
      ) : null}
    </div>
  );
}
