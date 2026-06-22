import type { Metadata } from 'next';

import { FunctionsIndex } from '@/components/functions-index';

export const metadata: Metadata = {
  title: 'Guides by role',
  description:
    'Executive and technology lenses on AI transformation — responsibilities, checklists, and playbook links.',
};

export default function FunctionsIndexPage() {
  return <FunctionsIndex />;
}
