import type { Metadata } from 'next';
import { getAllPages, getCuratedHomeFeed } from '@ai-transformation/content';

import { LibraryBrowser } from '@/components/library-browser';
import { PageIntro } from '@/components/page-intro';
import { PageShell } from '@/components/page-shell';
import { getLibraryCollections } from '@/lib/library-index';
import { formatMonthYear } from '@/lib/format-date';

export const metadata: Metadata = {
  title: 'Library',
  description:
    'The unified AI transformation library — frameworks, playbook, and reference articles, filterable by type and collection.',
};

export default function LibraryPage() {
  const pages = getAllPages().sort((a, b) => a.title.localeCompare(b.title));
  const collections = getLibraryCollections();
  const reviewedLabel = formatMonthYear(getCuratedHomeFeed('io').updatedAt);

  return (
    <PageShell>
      <PageIntro
        eyebrow="Library"
        title="Library"
        description="Every framework, playbook, and reference article in one place. Filter by type or collection, then open any article in Copilot."
      />
      <LibraryBrowser pages={pages} collections={collections} reviewedLabel={reviewedLabel} />
    </PageShell>
  );
}
