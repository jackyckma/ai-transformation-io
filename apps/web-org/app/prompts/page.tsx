import type { Metadata } from 'next';
import { PromptReply } from '@/components/prompt-reply';

export const metadata: Metadata = {
  title: 'Weekly prompts',
  description: 'Respond to this week’s Harvest Hub reflection prompt.',
};

export default function PromptsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <PromptReply />
    </div>
  );
}
