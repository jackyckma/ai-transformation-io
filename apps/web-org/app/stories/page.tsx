import type { Metadata } from 'next';
import { StoryList } from '@/components/story-list';

export const metadata: Metadata = {
  title: 'Stories',
  description: 'Community stories from teams navigating AI transformation work.',
};

export default function StoriesPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <StoryList />
    </div>
  );
}
