'use client';

import Link from 'next/link';
import { requestOpenCompanionWithMessage } from '@ai-transformation/chat-ui';
import { resolveClientApiUrl } from '@ai-transformation/shared';
import { useEffect, useState } from 'react';
import type { AssessmentGapId, AssessmentScoreResponse } from '@ai-transformation/shared';
import { RadarChart } from '@/components/assessment/radar-chart';

type AuthUser = {
  id: string;
  email: string;
  name?: string | null;
};

type AssessmentSessionPayload = {
  answers: Record<string, number>;
  stepIndex: number;
  lastScore?: AssessmentScoreResponse | null;
  updatedAt: string;
};

const WEAKEST_GAP_LINKS: Record<AssessmentGapId, { label: string; href: string }[]> = {
  work_redesign: [
    { label: 'CIO guide', href: '/functions/cio' },
    { label: 'Roadmap framework', href: '/frameworks/roadmap' },
  ],
  governance: [
    { label: 'Executive guide', href: '/functions/executive' },
    { label: 'Governance framework', href: '/frameworks/governance' },
  ],
  value_measurement: [
    { label: 'Measuring value', href: '/frameworks/measuring-value' },
    { label: 'Executive guide', href: '/functions/executive' },
  ],
};

function isScoreResponse(value: unknown): value is AssessmentScoreResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    'ok' in value &&
    (value as AssessmentScoreResponse).ok === true &&
    'weakestGap' in value
  );
}

export function ProgressDashboard() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<AssessmentSessionPayload | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const authRes = await fetch(resolveClientApiUrl('/api/auth/me'), { credentials: 'include' });
        if (!authRes.ok) {
          if (!cancelled) setUser(null);
          return;
        }
        const authData = (await authRes.json()) as { ok: boolean; user: AuthUser | null };
        if (!cancelled) {
          setUser(authData.user ?? null);
        }
        if (!authData.user) {
          return;
        }

        const sessionRes = await fetch(resolveClientApiUrl('/api/assessment/session'), {
          credentials: 'include',
        });
        if (!sessionRes.ok || cancelled) {
          return;
        }
        const sessionData = (await sessionRes.json()) as {
          ok: boolean;
          session: AssessmentSessionPayload | null;
        };
        if (!cancelled && sessionData.ok) {
          setSession(sessionData.session);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <p className="text-sm font-light text-[var(--muted)]">Loading your progress…</p>;
  }

  if (!user) {
    return (
      <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 md:p-8">
        <h2 className="font-serif text-xl font-normal tracking-tight">Sign in to save progress</h2>
        <p className="mt-3 text-sm font-light leading-relaxed text-[var(--muted)]">
          Your assessment answers and results are saved when you sign in with Google. The companion
          works without an account.
        </p>
        <a
          href={resolveClientApiUrl('/api/auth/google?return=/progress')}
          className="mt-6 inline-flex min-h-9 items-center rounded-lg bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-[var(--accent-fg)] transition hover:opacity-90"
        >
          Sign in with Google
        </a>
      </section>
    );
  }

  const answerCount = session ? Object.keys(session.answers).length : 0;
  const lastScore = isScoreResponse(session?.lastScore) ? session.lastScore : null;
  const inProgress = answerCount > 0 && !lastScore;
  const recommendedLinks = lastScore ? WEAKEST_GAP_LINKS[lastScore.weakestGap.id] ?? [] : [];

  return (
    <div className="space-y-8">
      <p className="text-sm font-light text-[var(--muted)]">
        Signed in as <span className="text-[var(--foreground)]">{user.email}</span>
      </p>

      <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 md:p-8">
        <h2 className="font-serif text-xl font-normal tracking-tight">Three Gaps assessment</h2>

        {!session || answerCount === 0 ? (
          <>
            <p className="mt-3 text-sm font-light text-[var(--muted)]">
              No saved assessment yet — start the org-level diagnostic when you are ready.
            </p>
            <Link
              href="/assessment"
              className="mt-5 inline-flex min-h-9 items-center rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--accent-fg)] transition hover:opacity-90"
            >
              Start assessment
            </Link>
          </>
        ) : null}

        {inProgress && session ? (
          <>
            <p className="mt-3 text-sm font-light text-[var(--muted)]">
              In progress — {answerCount} of 36 questions answered. Last updated{' '}
              {new Date(session.updatedAt).toLocaleDateString()}.
            </p>
            <Link
              href="/assessment"
              className="mt-5 inline-flex min-h-9 items-center rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--accent-fg)] transition hover:opacity-90"
            >
              Continue assessment
            </Link>
          </>
        ) : null}

        {lastScore ? (
          <div className="mt-6 space-y-6">
            <p className="text-sm font-light text-[var(--muted)]">
              Completed — overall {lastScore.overall.toFixed(1)} / 5. Weakest gap:{' '}
              <span className="text-[var(--foreground)]">{lastScore.weakestGap.label}</span>.
            </p>
            <div className="flex justify-center rounded-xl border border-[var(--border)] bg-[var(--background)] p-4">
              <RadarChart points={lastScore.radar} max={5} />
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/assessment"
                className="inline-flex min-h-9 items-center rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-light transition hover:border-[var(--accent)]"
              >
                Retake assessment
              </Link>
              {recommendedLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="inline-flex min-h-9 items-center rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-light transition hover:border-[var(--accent)]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 md:p-8">
        <h2 className="font-serif text-xl font-normal tracking-tight">Companion</h2>
        <p className="mt-3 text-sm font-light text-[var(--muted)]">
          Ask follow-up questions grounded in frameworks and playbook — available on every page.
        </p>
        <button
          type="button"
          onClick={() =>
            requestOpenCompanionWithMessage(
              lastScore
                ? `My weakest Three Gaps area is ${lastScore.weakestGap.label}. What should I read or do next?`
                : 'Where should I start with AI transformation on this site?',
            )
          }
          className="mt-5 inline-flex min-h-9 items-center rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--accent-fg)] transition hover:opacity-90"
        >
          Open companion
        </button>
      </section>
    </div>
  );
}
