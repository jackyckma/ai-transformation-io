'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { scoreRecommendation, type ActivitySummary } from '@ai-transformation/shared';

import { getApiClient } from '@/lib/api-client';
import type { AuthUser } from '@/lib/use-auth-user';
import { COMMUNITY_TYPE_LABEL, KNOWLEDGE_TYPE_LABEL } from '@/lib/object-display';
import {
  ACTIVITY_WEIGHTS,
  activitySignalsFor,
  type ActivitySignal,
  type RecommendationCandidate,
} from '@/lib/recommendation-types';

function firstName(user: AuthUser): string {
  const name = user.name?.trim();
  if (name) return name.split(/\s+/)[0] ?? name;
  return user.email.split('@')[0] ?? 'there';
}

function subtypeLabel(subtype: string): string {
  return KNOWLEDGE_TYPE_LABEL[subtype] ?? COMMUNITY_TYPE_LABEL[subtype] ?? subtype;
}

export function CommunityActivityDashboard({
  user,
  candidates,
}: {
  user: AuthUser;
  candidates: RecommendationCandidate[];
}) {
  const [summary, setSummary] = useState<ActivitySummary | null>(null);
  const [summaryReady, setSummaryReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const response = await getApiClient().personalization.getActivitySummary({ site: 'org' });
        if (!cancelled) {
          setSummary(response.summary);
        }
      } catch {
        if (!cancelled) {
          setSummary(null);
        }
      } finally {
        if (!cancelled) {
          setSummaryReady(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const ranked = useMemo(() => {
    return candidates
      .map((candidate) => ({
        candidate,
        result: scoreRecommendation<ActivitySignal>(
          activitySignalsFor(candidate, summary),
          ACTIVITY_WEIGHTS,
        ),
      }))
      .sort((a, b) => b.result.score - a.result.score)
      .slice(0, 4);
  }, [candidates, summary]);

  const hasActivity =
    summary !== null &&
    (summary.followedTopics.length > 0 ||
      summary.contributionsCount > 0 ||
      summary.interactionsCount > 0 ||
      summary.bookmarksCount > 0);

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
          A rule-based view of what is worth your attention — ranked by the topics you follow, your
          contributions, and recent interactions.
        </p>
        {summaryReady && !hasActivity ? (
          <p className="mt-2 max-w-2xl text-sm font-light text-[var(--secondary)]">
            You are just getting started. Follow a topic, reply, or post a request and this view will
            adapt to your activity.
          </p>
        ) : null}
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

      <div className="grid gap-4 sm:grid-cols-3">
        <FollowedTopicsPanel summary={summary} ready={summaryReady} />
        <ContributionsPanel summary={summary} ready={summaryReady} />
        <InteractionsPanel summary={summary} ready={summaryReady} />
      </div>
    </div>
  );
}

function PanelFrame({
  title,
  children,
  cta,
}: {
  title: string;
  children: ReactNode;
  cta: { href: string; label: string };
}) {
  return (
    <section className="flex flex-col rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
      <h2 className="font-serif text-base font-normal tracking-tight">{title}</h2>
      <div className="mt-2 flex-1 text-sm font-light leading-relaxed text-[var(--muted)]">{children}</div>
      <Link
        href={cta.href}
        className="mt-4 inline-flex w-fit min-h-9 items-center rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--foreground)] transition hover:border-[var(--accent)]"
      >
        {cta.label}
      </Link>
    </section>
  );
}

function CountStat({ value, unit }: { value: number; unit: string }) {
  return (
    <p>
      <span className="font-serif text-2xl font-normal text-[var(--foreground)]">{value}</span>{' '}
      <span className="text-xs font-light text-[var(--secondary)]">{unit}</span>
    </p>
  );
}

function Loading() {
  return <p className="text-sm font-light text-[var(--secondary)]">Loading…</p>;
}

function FollowedTopicsPanel({
  summary,
  ready,
}: {
  summary: ActivitySummary | null;
  ready: boolean;
}) {
  return (
    <PanelFrame title="Followed topics" cta={{ href: '/community', label: 'Browse community' }}>
      {!ready ? (
        <Loading />
      ) : summary && summary.followedTopics.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {summary.followedTopics.map((topic) => (
            <li
              key={topic.topic}
              className="rounded-full border border-[var(--border)] px-2.5 py-0.5 text-xs font-light text-[var(--muted)]"
            >
              {topic.topic}
              <span className="ml-1 text-[var(--secondary)]">{topic.count}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p>You are not following any topics yet. Follow discussions or events to tune this view.</p>
      )}
    </PanelFrame>
  );
}

function ContributionsPanel({
  summary,
  ready,
}: {
  summary: ActivitySummary | null;
  ready: boolean;
}) {
  return (
    <PanelFrame title="Your contributions" cta={{ href: '/ask?mode=submit', label: 'Draft a contribution' }}>
      {!ready ? (
        <Loading />
      ) : summary && summary.contributionsCount > 0 ? (
        <div className="space-y-2">
          <CountStat value={summary.contributionsCount} unit="contributions" />
          {summary.bookmarksCount > 0 ? (
            <p className="text-xs font-light text-[var(--secondary)]">{summary.bookmarksCount} saved</p>
          ) : null}
        </div>
      ) : (
        <p>No contributions yet. Draft a field note or reply to a prompt to start building here.</p>
      )}
    </PanelFrame>
  );
}

function InteractionsPanel({
  summary,
  ready,
}: {
  summary: ActivitySummary | null;
  ready: boolean;
}) {
  return (
    <PanelFrame title="Recent interactions" cta={{ href: '/community', label: 'Browse community' }}>
      {!ready ? (
        <Loading />
      ) : summary && summary.interactionsCount > 0 ? (
        <div className="space-y-2">
          <CountStat value={summary.interactionsCount} unit="follows, offers, and joins" />
          {summary.recentObjectTypes.length > 0 ? (
            <ul className="flex flex-wrap gap-2">
              {summary.recentObjectTypes.map((entry) => (
                <li
                  key={entry.type}
                  className="rounded-full border border-[var(--border)] px-2.5 py-0.5 text-xs font-light text-[var(--muted)]"
                >
                  {subtypeLabel(entry.type)}
                  <span className="ml-1 text-[var(--secondary)]">{entry.count}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : (
        <p>Discussions you follow, help you offer, and events you join will appear here.</p>
      )}
    </PanelFrame>
  );
}
