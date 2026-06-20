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

type Prompt = {
  id: string;
  question: string;
  weekOf: string;
};

type PromptResponse = {
  ok: true;
  prompt: Prompt | null;
};

type PromptReplyResponse = {
  ok?: boolean;
  id?: string;
  error?: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
const SIGN_IN_URL = `${API_BASE}/api/auth/google?return=/prompts`;

function formatWeekOf(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

function validateReply(value: string): string {
  const length = value.trim().length;
  if (length < 10 || length > 5000) {
    return 'Reply must be between 10 and 5000 characters.';
  }
  return '';
}

async function readJsonSafe(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export function PromptReply() {
  const [isLoading, setIsLoading] = useState(true);
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loadError, setLoadError] = useState('');
  const [reply, setReply] = useState('');
  const [replyError, setReplyError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function loadPromptAndAuth() {
    setIsLoading(true);
    setLoadError('');

    try {
      const [promptResponse, authResponse] = await Promise.all([
        fetch(`${API_BASE}/api/prompts/current`),
        fetch(`${API_BASE}/api/auth/me`, { credentials: 'include' }),
      ]);

      if (!promptResponse.ok) {
        setLoadError('Unable to load this week’s prompt right now. Please try again shortly.');
        return;
      }

      const promptPayload = (await promptResponse.json()) as PromptResponse;
      setPrompt(promptPayload.prompt ?? null);

      if (authResponse.ok) {
        const authPayload = (await authResponse.json()) as AuthMeResponse;
        setUser(authPayload.user ?? null);
      } else {
        setUser(null);
      }
    } catch {
      setLoadError('Unable to reach the server. Please try again shortly.');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadPromptAndAuth();
  }, []);

  const replyLength = useMemo(() => reply.trim().length, [reply]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setReplyError('');
    setSubmitError('');
    setSuccessMessage('');

    if (!prompt) {
      setSubmitError('No active prompt is available right now.');
      return;
    }

    const validationError = validateReply(reply);
    if (validationError) {
      setReplyError(validationError);
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`${API_BASE}/api/prompts/${prompt.id}/replies`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ body: reply.trim() }),
      });

      const payload = (await readJsonSafe(response)) as PromptReplyResponse | null;

      if (response.status === 201 && payload?.ok) {
        setReply('');
        setSuccessMessage('Thanks for replying — your reflection has been saved.');
        return;
      }

      if (response.status === 401) {
        setUser(null);
        setSubmitError('Please sign in again to submit your reply.');
        return;
      }

      if (response.status === 400 && payload?.error) {
        setSubmitError(payload.error);
        return;
      }

      setSubmitError('We could not submit your reply right now. Please try again shortly.');
    } catch {
      setSubmitError('Unable to reach the server. Please try again shortly.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 md:p-8">
      <header className="border-b border-[var(--border)] pb-6">
        <p className="text-xs font-light tracking-wide text-[var(--muted)]">Harvest Hub</p>
        <h1 className="mt-3 font-serif text-3xl font-normal tracking-tight md:text-4xl">
          Weekly prompt
        </h1>
      </header>

      <div className="mt-8">
        {isLoading ? <p className="text-sm font-light text-[var(--muted)]">Loading prompt…</p> : null}

        {!isLoading && loadError ? (
          <div className="space-y-4">
            <p role="alert" className="text-sm text-red-700 dark:text-red-200">
              {loadError}
            </p>
            <button
              type="button"
              onClick={() => void loadPromptAndAuth()}
              className="inline-flex items-center rounded-full border border-[var(--border)] px-4 py-2 text-sm font-light text-[var(--foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              Retry
            </button>
          </div>
        ) : null}

        {!isLoading && !loadError && !prompt ? (
          <p className="text-sm font-light text-[var(--muted)]">
            There is no active weekly prompt right now. Check back soon.
          </p>
        ) : null}

        {!isLoading && !loadError && prompt ? (
          <div className="space-y-8">
            <article className="space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--background)] p-5">
              <p className="text-xs font-light tracking-wide text-[var(--muted)]">
                Week of {formatWeekOf(prompt.weekOf)}
              </p>
              <p className="font-serif text-2xl font-normal leading-snug tracking-tight">
                {prompt.question}
              </p>
            </article>

            {!user ? (
              <div className="space-y-3">
                <p className="text-sm font-light leading-relaxed text-[var(--muted)]">
                  Sign in to reply and add your perspective to this week’s conversation.
                </p>
                <a
                  href={SIGN_IN_URL}
                  className="inline-flex items-center rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--accent-fg)] transition hover:opacity-90"
                >
                  Sign in to reply
                </a>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={handleSubmit} noValidate>
                <div className="space-y-2">
                  <label htmlFor="prompt-reply" className="text-sm font-medium">
                    Your reply
                  </label>
                  <textarea
                    id="prompt-reply"
                    name="body"
                    value={reply}
                    onChange={(event) => {
                      setReply(event.target.value);
                      setReplyError('');
                      setSubmitError('');
                      setSuccessMessage('');
                    }}
                    disabled={submitting}
                    aria-invalid={Boolean(replyError)}
                    aria-describedby={replyError ? 'prompt-reply-error' : 'prompt-reply-help'}
                    rows={9}
                    maxLength={5000}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none ring-[var(--accent)] transition focus:ring-2 disabled:cursor-not-allowed disabled:opacity-70"
                    required
                  />
                  <p id="prompt-reply-help" className="text-xs text-[var(--muted)]">
                    {replyLength}/5000 characters (minimum 10)
                  </p>
                  {replyError ? (
                    <p id="prompt-reply-error" className="text-sm text-red-700 dark:text-red-200">
                      {replyError}
                    </p>
                  ) : null}
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--accent-fg)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitting ? 'Submitting…' : 'Submit reply'}
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
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}
