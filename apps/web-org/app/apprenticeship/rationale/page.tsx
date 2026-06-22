import type { Metadata } from 'next';
import Link from 'next/link';
import { CompanionTopicPrompt } from '@ai-transformation/chat-ui';
import { MarkdownBody } from '@/components/markdown-body';
import { PageShell } from '@/components/page-shell';
import {
  getApprenticeshipRationaleBody,
  getApprenticeshipRationaleContent,
} from '@/lib/apprenticeship-content';

export function generateMetadata(): Metadata {
  const { title, description } = getApprenticeshipRationaleContent();
  return {
    title: `${title} · Apprenticeship`,
    description,
  };
}

export default function ApprenticeshipRationalePage() {
  const { title, description } = getApprenticeshipRationaleContent();

  return (
    <PageShell as="article">
      <header className="mb-8 border-b border-[var(--border)] pb-8">
        <p className="text-xs font-light tracking-wide text-[var(--muted)]">Apprenticeship · Design rationale</p>
        <h1 className="font-serif mt-3 text-2xl font-normal leading-snug tracking-tight md:text-[1.85rem]">
          {title}
        </h1>
        <p className="mt-4 text-sm font-light leading-relaxed text-[var(--muted)]">{description}</p>
      </header>

      <CompanionTopicPrompt
        topic="apprenticeship design rationale"
        message="Summarize the apprenticeship design rationale and who it is for."
        className="mb-8"
      />

      <MarkdownBody content={getApprenticeshipRationaleBody()} />

      <nav className="mt-12 flex flex-col gap-2 text-sm font-light text-[var(--muted)]">
        <Link href="/apprenticeship#interest" className="hover:text-[var(--foreground)]">
          Express interest →
        </Link>
        <Link href="/apprenticeship" className="hover:text-[var(--foreground)]">
          ← Back to apprenticeship overview
        </Link>
        <Link href="/" className="hover:text-[var(--foreground)]">
          ← Harvest Hub home
        </Link>
      </nav>
    </PageShell>
  );
}
