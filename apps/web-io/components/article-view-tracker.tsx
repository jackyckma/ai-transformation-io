'use client';

import { useEffect } from 'react';

import { useRecordRecentlyViewed } from '@/lib/recently-viewed';

type ArticleViewTrackerProps = {
  slug: string;
  title: string;
  pathname: string;
};

/**
 * Records a library article view for the recommendation signal — local cache
 * always, plus the personal-layer API when signed in.
 */
export function ArticleViewTracker({ slug, title, pathname }: ArticleViewTrackerProps) {
  const record = useRecordRecentlyViewed();

  useEffect(() => {
    record({ slug, title, pathname });
  }, [slug, title, pathname, record]);

  return null;
}
