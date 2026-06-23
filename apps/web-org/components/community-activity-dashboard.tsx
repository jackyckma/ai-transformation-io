'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { scoreRecommendation } from '@ai-transformation/shared';

import type { AuthUser } from '@/lib/use-auth-user';
import {
  ACTIVITY_WEIGHTS,
  type ActivitySignal,
  type RecommendationCandidate,
} from '@/lib/recommendation-types';

function firstName(user: AuthUser): string {
  const name = user.name?.trim();
  if (name) return name.split(/\s+/)[0] ?? name;
  return user.email.split('@')[0] ?? 'there';
}

export function CommunityActivityDashboard({
  user,
  candidates,
}: {
  user: AuthUser;
  candidates: RecommendationCandidate[];
}) {
  const ranked = useMemo(() => {
    return candidates
      .map((candidate) => ({
        candidate,
        result: scoreRecommendation<ActivitySignal>(candidate.signals, ACTIVITY_WEIGHTS),
      }))
      .sort((a, b) => b.result.score - a.result.score)
      .slice(0, 4);
  }, [candidates]);

  return (
    <div className="space-y-10">
      <header>
        <p className="text-xs font-normal uppercase tracking-[0.12em] text-[var(--secondary)]">
          Personal community activity
        </p>
        <h1 className="font-serif mt-2 text-2xl font-normal tracking-tight md:text-[1.85rem]">
          Welcome back, {firstName(user)}
        </h1>
        <p className="mt-3 max-w-2xl text-sm font-light leading-relaxed text-[var(--muted)]">
          A rule-based view of what is worth your attention — ranked by followed topics, your
          contributions, and recent interactions.
        </p>
      </header>

      <section aria-labelledby="dash-recs">
        <h2 id="dash-recs" className="text-xs font-normal uppercase tracking-[0.12em] text-[var(--secondary)]">
          Recommended for you
        </h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {ranked.map(({ candidate }) => (
            <li key={candidate.id}>
              <Link
                href={candidate.href}
                className="group flex h-full flex-col rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 transition hover:border-[var(--accent)]/40"
              >
                <span className="text-[11px] font-normal uppercase tracking-wide text-[var(--secondary)]">
                  {candidate.badge}
                </span>
                <h3 className="font-serif mt-1 text-base font-normal leading-snug tracking-tight text-[var(--foreground)] transition group-hover:text-[var(--accent)]">
                  {candidate.title}
                </h3>
                <p className="mt-2 text-sm font-light leading-relaxed text-[var(--muted)]">
                  {candidate.description}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        <ActivityPanel
          title="Your contributions"
          body="Drafts, published articles, and prompt replies will summarize here as the object model lands."
          cta={{ href: '/ask?mode=submit', label: 'Draft a contribution' }}
        />
        <ActivityPanel
          title="Recent interactions"
          body="Discussions you follow, help you offered, and events you joined will appear here."
          cta={{ href: '/community', label: 'Browse community' }}
        />
      </div>
    </div>
  );
}

function ActivityPanel({
  title,
  body,
  cta,
}: {
  title: string;
  body: string;
  cta: { href: string; label: string };
}) {
  return (
    <section className="flex flex-col rounded-xl border border-dashed border-[var(--border)] bg-[var(--card)] p-5">
      <h2 className="font-serif text-base font-normal tracking-tight">{title}</h2>
      <p className="mt-2 flex-1 text-sm font-light leading-relaxed text-[var(--muted)]">{body}</p>
      <Link
        href={cta.href}
        className="mt-4 inline-flex w-fit min-h-9 items-center rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--foreground)] transition hover:border-[var(--accent)]"
      >
        {cta.label}
      </Link>
    </section>
  );
}
