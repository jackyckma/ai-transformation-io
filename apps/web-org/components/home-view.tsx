'use client';

import type { ReactNode } from 'react';

import { useAuthUser } from '@/lib/use-auth-user';
import { CommunityActivityDashboard } from '@/components/community-activity-dashboard';
import type { RecommendationCandidate } from '@/lib/recommendation-types';

export function HomeView({
  curated,
  candidates,
}: {
  curated: ReactNode;
  candidates: RecommendationCandidate[];
}) {
  const { user, isLoading } = useAuthUser();

  if (!isLoading && user) {
    return <CommunityActivityDashboard user={user} candidates={candidates} />;
  }

  return <>{curated}</>;
}
