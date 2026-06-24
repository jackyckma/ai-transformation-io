import type { Metadata } from 'next';

import { CommunityObjectView } from '@/components/community-object-view';

export const metadata: Metadata = {
  title: 'Community',
  description: 'A community item — discussion, help request, event, or announcement.',
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function CommunityObjectPage({ params }: PageProps) {
  const { id } = await params;
  return <CommunityObjectView id={id} />;
}
