import Link from 'next/link';
import type { ContentDocument } from '@ai-transformation/content';
import { MarkdownBody } from '@/components/markdown-body';

type ContentPageLayoutProps = {
  doc: ContentDocument;
  backHref?: string;
  backLabel?: string;
};

const PILLAR_LABEL: Record<ContentDocument['pillar'], string> = {
  framework: 'Framework',
  function: 'Function',
  resource: 'Playbook',
};

export function ContentPageLayout({
  doc,
  backHref = '/',
  backLabel = '← Home',
}: ContentPageLayoutProps) {
  return (
    <article className="mx-auto max-w-2xl px-6 py-14">
      <header className="mb-10 border-b border-[var(--border)] pb-10">
        <p className="text-xs font-light tracking-wide text-[var(--muted)]">
          {PILLAR_LABEL[doc.pillar]}
        </p>
        <h1 className="font-serif mt-3 text-2xl font-normal leading-snug tracking-tight md:text-[1.85rem]">
          {doc.title}
        </h1>
        <p className="mt-4 text-sm font-light leading-relaxed text-[var(--muted)]">{doc.description}</p>
      </header>
      <MarkdownBody content={doc.markdown} />
      <Link
        href={backHref}
        className="mt-12 inline-block text-sm font-light text-[var(--muted)] hover:text-[var(--foreground)]"
      >
        {backLabel}
      </Link>
    </article>
  );
}
