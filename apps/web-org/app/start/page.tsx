import type { Metadata } from 'next';
import { PageIntro } from '@/components/page-intro';
import { PageShell } from '@/components/page-shell';

export const metadata: Metadata = { title: 'Start here' };

export default function StartPage() {
  return (
    <PageShell width="wide">
      <PageIntro
        title="Start here"
        description="What AI transformation means in practice — community lens. Full content in Wave 5."
      />
    </PageShell>
  );
}
