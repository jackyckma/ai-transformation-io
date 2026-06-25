import type { Metadata } from 'next';
import { EditorialQueue } from '@/components/editorial-queue';
import { PageShell } from '@/components/page-shell';

export const metadata: Metadata = {
  title: 'Editorial',
  description: 'Review ingested editorial drafts before they publish to the knowledge commons.',
  robots: { index: false, follow: false },
};

export default function EditorialPage() {
  return (
    <PageShell width="wide">
      <EditorialQueue />
    </PageShell>
  );
}
