import type { Metadata } from 'next';
import { StoryForm } from '@/components/story-form';

export const metadata: Metadata = {
  title: 'Submit a story',
  description: 'Share an implementation story with the Harvest Hub community.',
};

export default function StorySubmitPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <StoryForm />
    </div>
  );
}
