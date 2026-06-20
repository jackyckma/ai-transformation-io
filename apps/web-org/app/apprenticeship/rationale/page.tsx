import type { Metadata } from 'next';
import Link from 'next/link';
import { MarkdownBody } from '@/components/markdown-body';
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
    <article className="mx-auto max-w-2xl px-6 py-14">
      <header className="mb-10 border-b border-[var(--border)] pb-10">
        <p className="text-xs font-light tracking-wide text-[var(--muted)]">Apprenticeship · Design rationale</p>
        <h1 className="font-serif mt-3 text-2xl font-normal leading-snug tracking-tight md:text-[1.85rem]">
          {title}
        </h1>
        <p className="mt-4 text-sm font-light leading-relaxed text-[var(--muted)]">{description}</p>
      </header>

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
    </article>
  );
}
