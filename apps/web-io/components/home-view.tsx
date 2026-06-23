'use client';

import type { ReactNode } from 'react';
import type { ContentPageMeta } from '@ai-transformation/content';

import { PersonalDashboard } from '@/components/personal-dashboard';
import { useAuthUser } from '@/lib/use-auth-user';

type HomeViewProps = {
  loggedOutContent: ReactNode;
  pages: ContentPageMeta[];
  curatedSlugs: string[];
};

export function HomeView({ loggedOutContent, pages, curatedSlugs }: HomeViewProps) {
  const { user, isLoading } = useAuthUser();

  if (!isLoading && user) {
    return <PersonalDashboard user={user} pages={pages} curatedSlugs={curatedSlugs} />;
  }

  return <>{loggedOutContent}</>;
}
