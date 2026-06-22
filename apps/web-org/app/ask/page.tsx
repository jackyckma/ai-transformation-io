import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AskChat } from '@/components/ask-chat';
import { InquiryForm } from '@/components/inquiry-form';
import { PageShell } from '@/components/page-shell';

export const metadata: Metadata = {
  title: 'Ask',
  description: 'Ask the Harvest companion for community guidance grounded in this site.',
};

export default function AskPage() {
  return (
    <PageShell width="wide" className="!py-4 md:!py-6">
      <header className="mb-4">
        <p className="text-xs font-normal uppercase tracking-[0.12em] text-[var(--secondary)]">Companion</p>
        <h1 className="font-serif mt-2 text-2xl font-normal tracking-tight md:text-[1.75rem]">Ask</h1>
        <p className="mt-3 max-w-2xl text-sm font-normal leading-relaxed text-[var(--muted)]">
          Learn, share, and find your next step — grounded in Harvest Hub content.
        </p>
      </header>

      <Suspense fallback={<p className="text-sm text-[var(--muted)]">Loading companion…</p>}>
        <AskChat />
      </Suspense>

      <section className="mt-10 border-t border-[var(--border)] pt-8">
        <h2 className="font-serif text-lg font-normal tracking-tight">Message our team</h2>
        <p className="mt-2 text-sm font-normal leading-relaxed text-[var(--muted)]">
          Async follow-up when a human response is better than the companion.
        </p>
        <div className="mt-5 rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 md:p-6">
          <InquiryForm embedded />
        </div>
      </section>
    </PageShell>
  );
}
