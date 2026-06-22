import type { Metadata } from 'next';
import Link from 'next/link';

import { HubIndexSections } from '@/components/hub-index-sections';
import { PageShell } from '@/components/page-shell';
import { getHubPage } from '@/lib/hub-index';

export const metadata: Metadata = {
  title: 'Playbook',
  description: 'Reference guides, patterns, and answers for enterprise AI transformation.',
};

export default function PlaybookHubPage() {
  const { intro, sections } = getHubPage('playbook');

  return (
    <PageShell>
      <HubIndexSections
        title={intro.title}
        description={intro.description}
        seed="playbook"
        sections={sections}
      />
      <Link
        href="/frameworks"
        className="mt-10 inline-block text-sm font-normal text-[var(--secondary)] hover:text-[var(--foreground)]"
      >
        ← Frameworks
      </Link>
    </PageShell>
  );
}
