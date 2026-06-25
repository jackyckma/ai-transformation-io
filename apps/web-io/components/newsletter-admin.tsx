'use client';

import { resolveClientApiUrl } from '@ai-transformation/shared';
import { useCallback, useEffect, useState } from 'react';

import { MarkdownBody } from '@/components/markdown-body';

type NewsletterSite = 'io' | 'org';

type IssueSummary = {
  id: string;
  site: string;
  list: string;
  slug: string;
  title: string;
  status: string;
  providerId: string | null;
  sentAt: string | null;
  createdAt: string;
};

type CompiledIssue = IssueSummary & {
  replyToToken?: string;
  draftMd: string;
};

type SendResult = {
  issueId: string;
  sent: number;
  capped: boolean;
  status: string;
};

type NewsletterAdminProps = {
  site: NewsletterSite;
  defaultList: string;
};

function apiUrl(path: string): string {
  return resolveClientApiUrl(path);
}

function formatDate(value: string | null): string {
  if (!value) {
    return '—';
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function NewsletterAdmin({ site, defaultList }: NewsletterAdminProps) {
  const [issues, setIssues] = useState<IssueSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [loadError, setLoadError] = useState('');

  const [compiling, setCompiling] = useState(false);
  const [compileError, setCompileError] = useState('');
  const [compiledIssue, setCompiledIssue] = useState<CompiledIssue | null>(null);
  const [contributionCount, setContributionCount] = useState<number | null>(null);

  const [sendingId, setSendingId] = useState<string | null>(null);
  const [sendError, setSendError] = useState('');
  const [sendResult, setSendResult] = useState<SendResult | null>(null);

  const loadIssues = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');
    try {
      const response = await fetch(apiUrl('/api/internal/agent/issues?limit=25'), {
        credentials: 'include',
      });
      if (response.status === 401 || response.status === 403) {
        setAccessDenied(true);
        setIssues([]);
        return;
      }
      if (!response.ok) {
        throw new Error(`Issues request failed: ${response.status}`);
      }
      const body = (await response.json()) as { ok: boolean; issues?: IssueSummary[] };
      setAccessDenied(false);
      setIssues(body.issues ?? []);
    } catch {
      setLoadError('Unable to load issues right now. Please try again shortly.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadIssues();
  }, [loadIssues]);

  async function compileDraft() {
    setCompiling(true);
    setCompileError('');
    setSendResult(null);
    setSendError('');
    try {
      const response = await fetch(apiUrl('/api/internal/agent/compile-draft'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ site, list: defaultList }),
      });
      if (response.status === 401 || response.status === 403) {
        setAccessDenied(true);
        return;
      }
      if (!response.ok) {
        throw new Error(`Compile failed: ${response.status}`);
      }
      const body = (await response.json()) as {
        ok: boolean;
        issue: CompiledIssue;
        contributionCount?: number;
      };
      setCompiledIssue(body.issue);
      setContributionCount(body.contributionCount ?? null);
      await loadIssues();
    } catch {
      setCompileError("Couldn't compile a draft. Please try again.");
    } finally {
      setCompiling(false);
    }
  }

  async function sendIssue(issueId: string) {
    const confirmed = window.confirm(
      'This emails active subscribers on the list (pilot cap 25). Send now?',
    );
    if (!confirmed) {
      return;
    }
    setSendingId(issueId);
    setSendError('');
    setSendResult(null);
    try {
      const response = await fetch(apiUrl('/api/internal/newsletter/send-issue'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ issueId }),
      });
      if (response.status === 401 || response.status === 403) {
        setAccessDenied(true);
        return;
      }
      if (!response.ok) {
        throw new Error(`Send failed: ${response.status}`);
      }
      const body = (await response.json()) as {
        ok: boolean;
        sent: number;
        capped: boolean;
        providerId?: string;
        status: string;
      };
      setSendResult({
        issueId,
        sent: body.sent,
        capped: body.capped,
        status: body.status,
      });
      await loadIssues();
    } catch {
      setSendError("Couldn't send this issue. Please try again.");
    } finally {
      setSendingId(null);
    }
  }

  if (!isLoading && accessDenied) {
    return (
      <section className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 md:p-8">
        <p className="text-xs font-light tracking-wide text-[var(--muted)]">Newsletter</p>
        <h1 className="mt-3 font-serif text-3xl font-normal tracking-tight md:text-4xl">
          Newsletter pilot
        </h1>
        <p className="mt-4 text-sm font-light text-[var(--muted)]">
          Admins only. Sign in with an admin account to compile and send the pilot.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-8">
      <header className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 md:p-8">
        <p className="text-xs font-light tracking-wide text-[var(--muted)]">Newsletter</p>
        <h1 className="mt-3 font-serif text-3xl font-normal tracking-tight md:text-4xl">
          Newsletter pilot
        </h1>
        <p className="mt-4 max-w-2xl text-sm font-light leading-relaxed text-[var(--muted)]">
          Compile a draft from recent contributions, review it, then send to the pilot list. Sending
          emails active subscribers and is capped at 25 recipients.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => void compileDraft()}
            disabled={compiling}
            className="inline-flex items-center rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {compiling ? 'Compiling…' : 'Compile draft'}
          </button>
          <span className="text-xs font-light text-[var(--muted)]">List: {defaultList}</span>
        </div>
        {compileError ? (
          <p role="alert" className="mt-4 text-sm text-red-600 dark:text-red-300">
            {compileError}
          </p>
        ) : null}
      </header>

      {compiledIssue ? (
        <article className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 md:p-8">
          <header className="flex flex-wrap items-baseline justify-between gap-3 border-b border-[var(--border)] pb-4">
            <div>
              <h2 className="font-serif text-2xl font-normal tracking-tight">
                {compiledIssue.title}
              </h2>
              <p className="mt-2 text-xs font-light tracking-wide text-[var(--muted)]">
                Draft · {compiledIssue.slug}
                {contributionCount !== null
                  ? ` · ${contributionCount} contribution${contributionCount === 1 ? '' : 's'}`
                  : ''}
              </p>
            </div>
            <button
              type="button"
              onClick={() => void sendIssue(compiledIssue.id)}
              disabled={sendingId === compiledIssue.id}
              className="inline-flex items-center rounded-full border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {sendingId === compiledIssue.id ? 'Sending…' : 'Send to list'}
            </button>
          </header>
          <div className="mt-6">
            <MarkdownBody content={compiledIssue.draftMd} />
          </div>
        </article>
      ) : null}

      {sendResult ? (
        <p
          role="status"
          className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-4 text-sm text-[var(--accent)]"
        >
          Sent to {sendResult.sent} subscriber{sendResult.sent === 1 ? '' : 's'}
          {sendResult.capped ? ' (capped at the pilot limit)' : ''}. Status: {sendResult.status}.
        </p>
      ) : null}

      {sendError ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-300">
          {sendError}
        </p>
      ) : null}

      <section className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 md:p-8">
        <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-[var(--border)] pb-4">
          <h2 className="font-serif text-2xl font-normal tracking-tight">Recent issues</h2>
          <button
            type="button"
            onClick={() => void loadIssues()}
            disabled={isLoading}
            className="text-sm font-light text-[var(--secondary)] underline transition hover:text-[var(--foreground)] disabled:opacity-60"
          >
            Refresh
          </button>
        </div>

        <div className="mt-6">
          {isLoading ? (
            <p className="text-sm font-light text-[var(--muted)]">Loading issues…</p>
          ) : null}

          {!isLoading && loadError ? (
            <p role="alert" className="text-sm text-red-600 dark:text-red-300">
              {loadError}
            </p>
          ) : null}

          {!isLoading && !loadError && issues.length === 0 ? (
            <p className="text-sm font-light text-[var(--muted)]">
              No issues yet. Compile a draft to get started.
            </p>
          ) : null}

          {!isLoading && !loadError && issues.length > 0 ? (
            <ul className="space-y-3">
              {issues.map((issue) => (
                <li
                  key={issue.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--background)] p-4"
                >
                  <div className="min-w-0">
                    <p className="truncate font-serif text-base font-normal tracking-tight">
                      {issue.title}
                    </p>
                    <p className="mt-1 text-xs font-light tracking-wide text-[var(--muted)]">
                      {issue.status} · {issue.list} · created {formatDate(issue.createdAt)}
                      {issue.sentAt ? ` · sent ${formatDate(issue.sentAt)}` : ''}
                    </p>
                  </div>
                  {issue.status !== 'sent' ? (
                    <button
                      type="button"
                      onClick={() => void sendIssue(issue.id)}
                      disabled={sendingId === issue.id}
                      className="inline-flex shrink-0 items-center rounded-full border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {sendingId === issue.id ? 'Sending…' : 'Send to list'}
                    </button>
                  ) : (
                    <span className="shrink-0 text-xs font-light text-[var(--muted)]">Sent</span>
                  )}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </section>
    </section>
  );
}
