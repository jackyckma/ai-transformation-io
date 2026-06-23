'use client';

import { useEffect } from 'react';

import { recordRecentlyViewed } from '@/lib/recently-viewed';

type ArticleViewTrackerProps = {
  slug: string;
  title: string;
  pathname: string;
};

/** Records a library article view for the Phase 1 recommendation signal. */
export function ArticleViewTracker({ slug, title, pathname }: ArticleViewTrackerProps) {
  useEffect(() => {
    recordRecentlyViewed({ slug, title, pathname });
  }, [slug, title, pathname]);

  return null;
}
