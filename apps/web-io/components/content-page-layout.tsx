import Link from 'next/link';
import type { ContentDocument } from '@ai-transformation/content';
import { MarkdownBody } from '@/components/markdown-body';

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
    <div className="mx-auto max-w-3xl px-6 py-16">
      <p className="text-sm capitalize text-[var(--muted)]">{doc.pillar} · knowledge base</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">{doc.title}</h1>
      <p className="mt-3 text-[var(--muted)]">{doc.description}</p>
      <div className="mt-10">
        <MarkdownBody content={doc.markdown} />
      </div>
      <Link href={backHref} className="mt-12 inline-block text-sm text-[var(--accent)] underline">
        {backLabel}
      </Link>
    </div>
  );
}
