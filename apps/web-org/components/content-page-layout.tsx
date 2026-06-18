import Link from 'next/link';
import type { ContentDocument } from '@ai-transformation/content';
import { MarkdownBody } from '@/components/markdown-body';
import { SectionLabel } from '@/components/section-label';

type ContentPageLayoutProps = {
  doc: ContentDocument;
  backHref?: string;
  backLabel?: string;
};

export function ContentPageLayout({
  doc,
  backHref = '/',
  backLabel = '← Back home',
}: ContentPageLayoutProps) {
  return (
    <article>
      <header className="hero-mesh border-b border-[var(--border)]">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <SectionLabel>Learn · harvest hub</SectionLabel>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">{doc.title}</h1>
          <p className="mt-4 text-lg text-[var(--muted)]">{doc.description}</p>
        </div>
      </header>
      <div className="mx-auto max-w-3xl px-6 py-12">
        <MarkdownBody content={doc.markdown} />
        <Link href={backHref} className="mt-12 inline-block text-sm text-[var(--accent)] underline">
          {backLabel}
        </Link>
      </div>
    </article>
  );
}
