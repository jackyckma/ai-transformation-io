'use client';

import { FormEvent, useMemo, useState } from 'react';

type InterestFormValues = {
  email: string;
  name: string;
  note: string;
};

type FieldErrors = Partial<Record<keyof InterestFormValues, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const endpoint = `${process.env.NEXT_PUBLIC_API_BASE_URL ?? ''}/api/apprenticeship/interest`;

function validate(values: InterestFormValues): FieldErrors {
  const errors: FieldErrors = {};
  const email = values.email.trim();
  const nameLength = values.name.trim().length;
  const noteLength = values.note.trim().length;

  if (!email) {
    errors.email = 'Email is required.';
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = 'Enter a valid email address.';
  }

  if (nameLength > 120) {
    errors.name = 'Name must be 120 characters or fewer.';
  }

  if (noteLength > 1000) {
    errors.note = 'Note must be 1000 characters or fewer.';
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

export function ApprenticeshipInterestForm() {
  const [values, setValues] = useState<InterestFormValues>({
    email: '',
    name: '',
    note: '',
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const noteLength = useMemo(() => values.note.trim().length, [values.note]);

  function updateField(field: keyof InterestFormValues, nextValue: string) {
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
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: values.email.trim(),
          name: values.name.trim() || undefined,
          note: values.note.trim() || undefined,
        }),
      });

      const payload = (await readJsonSafe(response)) as
        | { ok?: boolean; error?: string }
        | null;

      if (response.status === 201 && payload?.ok) {
        setSuccessMessage("Thanks — we'll be in touch when the first cycle opens.");
        setValues({ email: '', name: '', note: '' });
        return;
      }

      if (response.status === 400 && payload?.error) {
        setSubmitError(payload.error);
        return;
      }

      setSubmitError('We could not save your details right now. Please try again shortly.');
    } catch {
      setSubmitError('Unable to reach the server. Please try again shortly.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="interest" className="mt-14 border-t border-[var(--border)] pt-10">
      <h2 className="font-serif text-lg font-normal tracking-tight">Hear from you</h2>
      <p className="mt-3 max-w-xl text-sm font-light leading-relaxed text-[var(--muted)]">
        Leave your email if you want to hear when the first cycle opens — as a parent, an early-career practitioner,
        or someone who might mentor or collaborate. A short note on your context is optional but welcome.
      </p>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
        <div className="space-y-2">
          <label htmlFor="apprenticeship-email" className="text-sm font-light text-[var(--foreground)]">
            Email
          </label>
          <input
            id="apprenticeship-email"
            name="email"
            type="email"
            value={values.email}
            onChange={(event) => updateField('email', event.target.value)}
            autoComplete="email"
            disabled={submitting}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'apprenticeship-email-error' : undefined}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm font-light outline-none ring-[var(--accent)] transition focus:ring-2 disabled:cursor-not-allowed disabled:opacity-70"
            required
          />
          {errors.email ? (
            <p id="apprenticeship-email-error" className="text-sm text-red-700 dark:text-red-200">
              {errors.email}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="apprenticeship-name" className="text-sm font-light text-[var(--foreground)]">
            Name <span className="text-[var(--muted)]">(optional)</span>
          </label>
          <input
            id="apprenticeship-name"
            name="name"
            type="text"
            value={values.name}
            onChange={(event) => updateField('name', event.target.value)}
            autoComplete="name"
            disabled={submitting}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? 'apprenticeship-name-error' : undefined}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm font-light outline-none ring-[var(--accent)] transition focus:ring-2 disabled:cursor-not-allowed disabled:opacity-70"
            maxLength={120}
          />
          {errors.name ? (
            <p id="apprenticeship-name-error" className="text-sm text-red-700 dark:text-red-200">
              {errors.name}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="apprenticeship-note" className="text-sm font-light text-[var(--foreground)]">
            Why you are interested <span className="text-[var(--muted)]">(optional)</span>
          </label>
          <textarea
            id="apprenticeship-note"
            name="note"
            value={values.note}
            onChange={(event) => updateField('note', event.target.value)}
            disabled={submitting}
            aria-invalid={Boolean(errors.note)}
            aria-describedby={errors.note ? 'apprenticeship-note-error' : 'apprenticeship-note-help'}
            rows={4}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm font-light outline-none ring-[var(--accent)] transition focus:ring-2 disabled:cursor-not-allowed disabled:opacity-70"
          />
          <p id="apprenticeship-note-help" className="text-xs text-[var(--muted)]">
            {noteLength}/1000 characters
          </p>
          {errors.note ? (
            <p id="apprenticeship-note-error" className="text-sm text-red-700 dark:text-red-200">
              {errors.note}
            </p>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center rounded-full border border-[var(--border)] px-4 py-2 text-sm font-light text-[var(--foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitting ? 'Sending…' : 'Get in touch'}
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
