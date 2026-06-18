import type { Metadata } from 'next';
import { InquiryForm } from '@/components/inquiry-form';

export const metadata: Metadata = {
  title: 'Ask a question',
};

export default function AskPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <InquiryForm />
    </div>
  );
}
