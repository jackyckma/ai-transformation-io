'use client';

import { FormEvent, useMemo, useState } from 'react';

type InquiryFormValues = {
  email: string;
  name: string;
  question: string;
};

type FieldErrors = Partial<Record<keyof InquiryFormValues, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const endpoint = `${process.env.NEXT_PUBLIC_API_BASE_URL ?? ''}/api/inquiries`;

function validate(values: InquiryFormValues): FieldErrors {
  const errors: FieldErrors = {};
  const email = values.email.trim();
  const nameLength = values.name.trim().length;
  const questionLength = values.question.trim().length;

  if (!email) {
    errors.email = 'Email is required.';
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = 'Enter a valid email address.';
  }

  if (nameLength > 120) {
    errors.name = 'Name must be 120 characters or fewer.';
  }

  if (questionLength < 10 || questionLength > 5000) {
    errors.question = 'Question must be between 10 and 5000 characters.';
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

export function InquiryForm({ embedded = false }: { embedded?: boolean }) {
  const [values, setValues] = useState<InquiryFormValues>({
    email: '',
    name: '',
    question: '',
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const questionLength = useMemo(() => values.question.trim().length, [values.question]);

  function updateField(field: keyof InquiryFormValues, nextValue: string) {
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
          question: values.question.trim(),
          site: 'org',
        }),
      });

      const payload = (await readJsonSafe(response)) as
        | { ok?: boolean; error?: string }
        | null;

      if (response.status === 201 && payload?.ok) {
        setSuccessMessage("Thanks for sharing — we'll be in touch.");
        setValues({ email: '', name: '', question: '' });
        return;
      }

      if (response.status === 400 && payload?.error) {
        setSubmitError(payload.error);
        return;
      }

      setSubmitError('We could not submit your question right now. Please try again shortly.');
    } catch {
      setSubmitError('Unable to reach the server. Please try again shortly.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className={embedded ? '' : 'rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 md:p-8'}>
      {!embedded ? (
        <>
          <h1 className="font-serif text-2xl font-normal tracking-tight">Ask the community</h1>
          <p className="mt-3 text-sm font-light text-[var(--muted)]">
            Share what you&apos;re navigating right now, and we&apos;ll follow up with practical suggestions.
          </p>
        </>
      ) : null}

      <form className={embedded ? 'space-y-6' : 'mt-8 space-y-6'} onSubmit={handleSubmit} noValidate>
        <div className="space-y-2">
          <label htmlFor="org-email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="org-email"
            name="email"
            type="email"
            value={values.email}
            onChange={(event) => updateField('email', event.target.value)}
            autoComplete="email"
            disabled={submitting}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'org-email-error' : undefined}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none ring-[var(--accent)] transition focus:ring-2 disabled:cursor-not-allowed disabled:opacity-70"
            required
          />
          {errors.email ? (
            <p id="org-email-error" className="text-sm text-red-700 dark:text-red-200">
              {errors.email}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="org-name" className="text-sm font-medium">
            Name <span className="text-[var(--muted)]">(optional)</span>
          </label>
          <input
            id="org-name"
            name="name"
            type="text"
            value={values.name}
            onChange={(event) => updateField('name', event.target.value)}
            autoComplete="name"
            disabled={submitting}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? 'org-name-error' : undefined}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none ring-[var(--accent)] transition focus:ring-2 disabled:cursor-not-allowed disabled:opacity-70"
            maxLength={120}
          />
          {errors.name ? (
            <p id="org-name-error" className="text-sm text-red-700 dark:text-red-200">
              {errors.name}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="org-question" className="text-sm font-medium">
            Question
          </label>
          <textarea
            id="org-question"
            name="question"
            value={values.question}
            onChange={(event) => updateField('question', event.target.value)}
            disabled={submitting}
            aria-invalid={Boolean(errors.question)}
            aria-describedby={errors.question ? 'org-question-error' : 'org-question-help'}
            rows={8}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none ring-[var(--accent)] transition focus:ring-2 disabled:cursor-not-allowed disabled:opacity-70"
            required
          />
          <p id="org-question-help" className="text-xs text-[var(--muted)]">
            {questionLength}/5000 characters (minimum 10)
          </p>
          {errors.question ? (
            <p id="org-question-error" className="text-sm text-red-700 dark:text-red-200">
              {errors.question}
            </p>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitting ? 'Sending…' : 'Share question'}
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
