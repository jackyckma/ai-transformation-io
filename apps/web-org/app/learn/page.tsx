import type { Metadata } from 'next';
import Link from 'next/link';

import { HubIndexSections } from '@/components/hub-index-sections';
import { PageShell } from '@/components/page-shell';
import { getHubPage } from '@/lib/hub-index';

export const metadata: Metadata = {
  title: 'Learn',
  description: 'Introductory AI transformation guides — for visitors and community members alike.',
};

export default function LearnHubPage() {
  const { intro, sections } = getHubPage('learn');

  return (
    <PageShell>
      <HubIndexSections
        title={intro.title}
        description={intro.description}
        seed="learn"
        sections={sections}
      />
      <p className="mt-10 text-sm font-normal text-[var(--muted)]">
        More on{' '}
        <a href="https://ai-transformation.io/playbook" className="underline hover:text-[var(--foreground)]">
          ai-transformation.io/playbook
        </a>
      </p>
      <Link href="/" className="mt-4 inline-block text-sm font-normal text-[var(--secondary)] hover:text-[var(--foreground)]">
        ← Home
      </Link>
    </PageShell>
  );
}
