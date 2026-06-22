import type { Metadata } from 'next';
import Link from 'next/link';

import { HubIndexSections } from '@/components/hub-index-sections';
import { PageShell } from '@/components/page-shell';
import { getHubPage } from '@/lib/hub-index';

export const metadata: Metadata = {
  title: 'Frameworks',
  description: 'Cross-cutting AI transformation frameworks — roadmap, governance, and definitions.',
};

export default function FrameworksHubPage() {
  const { intro, sections } = getHubPage('frameworks');

  return (
    <PageShell>
      <HubIndexSections
        title={intro.title}
        description={intro.description}
        seed="frameworks"
        sections={sections}
      />
      <Link
        href="/playbook"
        className="mt-10 inline-block text-sm font-normal text-[var(--secondary)] hover:text-[var(--foreground)]"
      >
        Playbook articles →
      </Link>
    </PageShell>
  );
}
