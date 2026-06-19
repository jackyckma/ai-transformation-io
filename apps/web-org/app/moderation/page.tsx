import type { Metadata } from 'next';
import { ModerationPanel } from '@/components/moderation-panel';

export const metadata: Metadata = {
  title: 'Moderation',
  description: 'Review and curate community stories for Harvest Hub.',
};

export default function ModerationPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <ModerationPanel />
    </div>
  );
}
