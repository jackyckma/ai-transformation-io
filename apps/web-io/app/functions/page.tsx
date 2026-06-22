import type { Metadata } from 'next';

import { HubIndexSections } from '@/components/hub-index-sections';
import { PageShell } from '@/components/page-shell';
import { getHubPage } from '@/lib/hub-index';

export const metadata: Metadata = {
  title: 'Guides by role',
  description:
    'Executive and technology lenses on AI transformation — responsibilities, checklists, and playbook links.',
};

export default function FunctionsIndexPage() {
  const { intro, sections } = getHubPage('functions');

  return (
    <PageShell>
      <HubIndexSections
        title={intro.title}
        description={intro.description}
        seed="functions"
        sections={sections}
      />
    </PageShell>
  );
}
