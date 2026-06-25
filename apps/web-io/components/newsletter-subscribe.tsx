'use client';

import { resolveClientApiUrl } from '@ai-transformation/shared';
import { FormEvent, useId, useState } from 'react';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type SubscribeStatus = 'idle' | 'pending' | 'success' | 'error';

type NewsletterSubscribeProps = {
  list: string;
  label: string;
};

export function NewsletterSubscribe({ list, label }: NewsletterSubscribeProps) {
  const fieldId = useId();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<SubscribeStatus>('idle');
  const [message, setMessage] = useState('');

  const pending = status === 'pending';
  const messageId = `${fieldId}-message`;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = email.trim();

    if (!EMAIL_PATTERN.test(trimmed)) {
      setStatus('error');
      setMessage('Enter a valid email address.');
      return;
    }

    setStatus('pending');
    setMessage('');

    try {
      const response = await fetch(resolveClientApiUrl('/api/newsletter/subscribe'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed, list }),
      });

      if (response.ok) {
        setStatus('success');
        setMessage("You're subscribed.");
        setEmail('');
        return;
      }

      setStatus('error');
      setMessage("Couldn't subscribe right now. Please try again.");
    } catch {
      setStatus('error');
      setMessage("Couldn't reach the server. Please try again.");
    }
  }

  return (
    <form className="flex flex-col gap-2" onSubmit={handleSubmit} noValidate>
      <label htmlFor={fieldId} className="text-sm font-light text-[var(--secondary)]">
        {label}
      </label>
      <div className="flex max-w-sm items-center gap-2">
        <input
          id={fieldId}
          type="email"
          name="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (status !== 'idle') {
              setStatus('idle');
              setMessage('');
            }
          }}
          autoComplete="email"
          placeholder="you@example.com"
          disabled={pending}
          aria-invalid={status === 'error'}
          aria-describedby={message ? messageId : undefined}
          className="min-w-0 flex-1 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none ring-[var(--accent)] transition focus:ring-2 disabled:cursor-not-allowed disabled:opacity-70"
        />
        <button
          type="submit"
          disabled={pending}
          className="inline-flex shrink-0 items-center rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-light text-[var(--foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {pending ? 'Subscribing…' : 'Subscribe'}
        </button>
      </div>
      {message ? (
        <p
          id={messageId}
          role={status === 'error' ? 'alert' : 'status'}
          className={
            status === 'error'
              ? 'text-sm text-red-600 dark:text-red-300'
              : 'text-sm text-[var(--accent)]'
          }
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}
