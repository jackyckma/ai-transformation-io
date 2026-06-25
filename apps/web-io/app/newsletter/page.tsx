import type { Metadata } from 'next';

import { NewsletterAdmin } from '@/components/newsletter-admin';
import { PageShell } from '@/components/page-shell';

export const metadata: Metadata = {
  title: 'Newsletter',
  description: 'Compile and send the Transformation Pulse newsletter pilot.',
  robots: { index: false, follow: false },
};

export default function NewsletterPage() {
  return (
    <PageShell width="wide">
      <NewsletterAdmin site="io" defaultList="io_pulse" />
    </PageShell>
  );
}
