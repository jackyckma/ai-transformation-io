import type { Metadata } from 'next';
import { CompanionHomeEntry } from '@ai-transformation/chat-ui';
import { InquiryForm } from '@/components/inquiry-form';
import { PageIntro } from '@/components/page-intro';
import { PageShell } from '@/components/page-shell';

export const metadata: Metadata = {
  title: 'Ask a question',
  description: 'Ask the companion for immediate guidance, or leave a message for our team.',
};

export default function AskPage() {
  return (
    <PageShell width="wide">
      <PageIntro
        title="Ask"
        description="Start with the companion for grounded answers from frameworks and playbook. Leave a message below if you prefer a human follow-up."
      />

      <CompanionHomeEntry site="io" />

      <section className="mt-12 border-t border-[var(--border)] pt-10">
        <h2 className="font-serif text-lg font-normal tracking-tight">Message our team</h2>
        <p className="mt-2 text-sm font-light text-[var(--muted)]">
          Async follow-up — we reply by email when a human response is better than the companion.
        </p>
        <div className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 md:p-6">
          <InquiryForm embedded />
        </div>
      </section>
    </PageShell>
  );
}
