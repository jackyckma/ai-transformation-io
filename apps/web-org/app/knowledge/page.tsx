import type { Metadata } from 'next';

import { KnowledgeIndexView } from '@/components/knowledge-index-view';
import { PageShell } from '@/components/page-shell';
import { getKnowledgeIndex } from '@/lib/knowledge-index';

export const metadata: Metadata = {
  title: 'Knowledge',
  description: 'The community knowledge commons — frameworks, patterns, and references for AI transformation.',
};

export default function KnowledgePage() {
  const index = getKnowledgeIndex();

  return (
    <PageShell width="wide">
      <KnowledgeIndexView index={index} />
    </PageShell>
  );
}
