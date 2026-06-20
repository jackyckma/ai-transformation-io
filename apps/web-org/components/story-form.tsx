'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';

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

type StoryFormValues = {
  title: string;
  body: string;
  name: string;
};

type StoryFieldErrors = Partial<Record<keyof StoryFormValues, string>>;

type StoryCreateResponse = {
  ok?: boolean;
  id?: string;
  error?: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
const SIGN_IN_URL = `${API_BASE}/api/auth/google?return=/stories/submit`;

function validate(values: StoryFormValues): StoryFieldErrors {
  const errors: StoryFieldErrors = {};
  const titleLength = values.title.trim().length;
  const bodyLength = values.body.trim().length;
  const nameLength = values.name.trim().length;

  if (titleLength < 4 || titleLength > 160) {
    errors.title = 'Title must be between 4 and 160 characters.';
  }

  if (bodyLength < 50 || bodyLength > 8000) {
    errors.body = 'Story body must be between 50 and 8000 characters.';
  }

  if (nameLength > 120) {
    errors.name = 'Display name must be 120 characters or fewer.';
  }

  return errors;
}

async function readJsonSafe(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export function StoryForm() {
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [values, setValues] = useState<StoryFormValues>({ title: '', body: '', name: '' });
  const [errors, setErrors] = useState<StoryFieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadAuth() {
      try {
        const response = await fetch(`${API_BASE}/api/auth/me`, {
          credentials: 'include',
        });
        if (!response.ok) {
          if (!cancelled) {
            setUser(null);
          }
          return;
        }
        const payload = (await response.json()) as AuthMeResponse;
        if (!cancelled) {
          setUser(payload.user ?? null);
        }
      } catch {
        if (!cancelled) {
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setIsAuthLoading(false);
        }
      }
    }

    void loadAuth();

    return () => {
      cancelled = true;
    };
  }, []);

  const bodyLength = useMemo(() => values.body.trim().length, [values.body]);

  function updateField(field: keyof StoryFormValues, nextValue: string) {
    setValues((prev) => ({ ...prev, [field]: nextValue }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setSubmitError('');
    setSuccessMessage('');
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError('');
    setSuccessMessage('');

    const nextErrors = validate(values);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);

    try {
      const response = await fetch(`${API_BASE}/api/stories`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: values.title.trim(),
          body: values.body.trim(),
          name: values.name.trim() || undefined,
        }),
      });

      const payload = (await readJsonSafe(response)) as StoryCreateResponse | null;

      if (response.status === 201 && payload?.ok) {
        setValues({ title: '', body: '', name: '' });
        setSuccessMessage(
          'Thanks for sharing your story. Our moderators will review it before publishing.',
        );
        return;
      }

      if (response.status === 401) {
        setSubmitError('Your session has ended. Please sign in again to submit your story.');
        setUser(null);
        return;
      }

      if (response.status === 400 && payload?.error) {
        setSubmitError(payload.error);
        return;
      }

      setSubmitError('We could not submit your story right now. Please try again shortly.');
    } catch {
      setSubmitError('Unable to reach the server. Please try again shortly.');
    } finally {
      setSubmitting(false);
    }
  }

  if (isAuthLoading) {
    return (
      <section className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 md:p-8">
        <p className="text-sm font-light text-[var(--muted)]">Checking sign-in status…</p>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 md:p-8">
        <h1 className="font-serif text-3xl font-normal tracking-tight md:text-4xl">Share your story</h1>
        <p className="mt-4 max-w-2xl text-sm font-light leading-relaxed text-[var(--muted)]">
          Sign in to share your story with the Harvest Hub community.
        </p>
        <a
          href={SIGN_IN_URL}
          className="mt-8 inline-flex items-center rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--accent-fg)] transition hover:opacity-90"
        >
          Sign in to share your story
        </a>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 md:p-8">
      <header className="border-b border-[var(--border)] pb-6">
        <p className="text-xs font-light tracking-wide text-[var(--muted)]">Harvest Hub</p>
        <h1 className="mt-3 font-serif text-3xl font-normal tracking-tight md:text-4xl">
          Share your story
        </h1>
        <p className="mt-4 max-w-2xl text-sm font-light leading-relaxed text-[var(--muted)]">
          Tell us what changed, what surprised you, and what other teams can learn from.
        </p>
      </header>

      <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
        <div className="space-y-2">
          <label htmlFor="story-title" className="text-sm font-medium">
            Title
          </label>
          <input
            id="story-title"
            name="title"
            type="text"
            value={values.title}
            onChange={(event) => updateField('title', event.target.value)}
            disabled={submitting}
            aria-invalid={Boolean(errors.title)}
            aria-describedby={errors.title ? 'story-title-error' : 'story-title-help'}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none ring-[var(--accent)] transition focus:ring-2 disabled:cursor-not-allowed disabled:opacity-70"
            required
            maxLength={160}
          />
          <p id="story-title-help" className="text-xs text-[var(--muted)]">
            4 to 160 characters.
          </p>
          {errors.title ? (
            <p id="story-title-error" className="text-sm text-red-700 dark:text-red-200">
              {errors.title}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="story-body" className="text-sm font-medium">
            Story
          </label>
          <textarea
            id="story-body"
            name="body"
            value={values.body}
            onChange={(event) => updateField('body', event.target.value)}
            disabled={submitting}
            aria-invalid={Boolean(errors.body)}
            aria-describedby={errors.body ? 'story-body-error' : 'story-body-help'}
            rows={12}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none ring-[var(--accent)] transition focus:ring-2 disabled:cursor-not-allowed disabled:opacity-70"
            required
            maxLength={8000}
          />
          <p id="story-body-help" className="text-xs text-[var(--muted)]">
            {bodyLength}/8000 characters (minimum 50)
          </p>
          {errors.body ? (
            <p id="story-body-error" className="text-sm text-red-700 dark:text-red-200">
              {errors.body}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="story-name" className="text-sm font-medium">
            Display name <span className="text-[var(--muted)]">(optional)</span>
          </label>
          <input
            id="story-name"
            name="name"
            type="text"
            value={values.name}
            onChange={(event) => updateField('name', event.target.value)}
            disabled={submitting}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? 'story-name-error' : 'story-name-help'}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none ring-[var(--accent)] transition focus:ring-2 disabled:cursor-not-allowed disabled:opacity-70"
            maxLength={120}
          />
          <p id="story-name-help" className="text-xs text-[var(--muted)]">
            Up to 120 characters.
          </p>
          {errors.name ? (
            <p id="story-name-error" className="text-sm text-red-700 dark:text-red-200">
              {errors.name}
            </p>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--accent-fg)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitting ? 'Submitting…' : 'Submit story'}
        </button>

        {submitError ? (
          <p role="alert" className="text-sm text-red-700 dark:text-red-200">
            {submitError}
          </p>
        ) : null}

        {successMessage ? (
          <p role="status" className="text-sm text-[var(--accent)]">
            {successMessage}
          </p>
        ) : null}
      </form>
    </section>
  );
}
