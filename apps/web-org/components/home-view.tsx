'use client';

import type { ReactNode } from 'react';

import { useAuthUser } from '@/lib/use-auth-user';
import { CommunityActivityDashboard } from '@/components/community-activity-dashboard';
import type { RecommendationCandidate } from '@/lib/recommendation-types';

type HomeViewProps = {
  curated: ReactNode;
  candidates: RecommendationCandidate[];
  /** From server cookie probe — avoids flashing the public curation home while /api/auth/me loads. */
  hasSessionCookie: boolean;
};

function HomeDashboardPending() {
  return (
    <div className="space-y-10" aria-busy="true" aria-label="Loading your dashboard">
      <header>
        <p className="text-xs font-normal uppercase tracking-[0.12em] text-[var(--secondary)]">
          Personal community activity
        </p>
        <div className="mt-2 h-9 w-64 max-w-full animate-pulse rounded bg-[var(--border)]/40" />
        <div className="mt-3 h-4 w-96 max-w-full animate-pulse rounded bg-[var(--border)]/30" />
      </header>
      <section>
        <div className="h-4 w-40 animate-pulse rounded bg-[var(--border)]/30" />
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {[0, 1, 2, 3].map((index) => (
            <li
              key={index}
              className="h-32 animate-pulse rounded-xl border border-[var(--border)] bg-[var(--card)]"
            />
          ))}
        </ul>
      </section>
    </div>
  );
}

export function HomeView({ curated, candidates, hasSessionCookie }: HomeViewProps) {
  const { user, isLoading } = useAuthUser();

  if (user) {
    return <CommunityActivityDashboard user={user} candidates={candidates} />;
  }

  if (isLoading && hasSessionCookie) {
    return <HomeDashboardPending />;
  }

  return <>{curated}</>;
}
