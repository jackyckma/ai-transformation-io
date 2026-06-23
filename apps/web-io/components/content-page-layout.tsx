import Link from 'next/link';
import type { ContentDocument } from '@ai-transformation/content';
import { CompanionTopicPrompt } from '@ai-transformation/chat-ui';
import { ArticleViewTracker } from '@/components/article-view-tracker';
import { CuratedVisual, DECORATIVE_ASPECT } from '@/components/curated-cards';
import { MarkdownBody } from '@/components/markdown-body';
import { OpenInAsk } from '@/components/open-in-ask';
import { PageShell } from '@/components/page-shell';
import { libraryAskActions } from '@/lib/ask-actions';

type ContentPageLayoutProps = {
  doc: ContentDocument;
  backHref?: string;
  backLabel?: string;
};

const PILLAR_LABEL: Record<ContentDocument['pillar'], string> = {
  framework: 'Framework',
  function: 'Role guide',
  resource: 'Playbook',
};

export function ContentPageLayout({
  doc,
  backHref = '/library',
  backLabel = '← All library',
}: ContentPageLayoutProps) {
  return (
    <PageShell as="article">
      <ArticleViewTracker slug={doc.slug} title={doc.title} pathname={doc.pathname} />
      <header className="mb-8 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)]">
        <CuratedVisual
          seed={doc.slug}
          aspectClass={`${DECORATIVE_ASPECT.pageBand} w-full`}
          flush
        />
        <div className="border-t border-[var(--border)] p-5 md:p-6">
          <p className="text-xs font-light tracking-wide text-[var(--muted)]">
            {PILLAR_LABEL[doc.pillar]}
          </p>
          <h1 className="font-serif mt-3 text-2xl font-normal leading-snug tracking-tight md:text-[1.85rem]">
            {doc.title}
          </h1>
          <p className="mt-4 text-sm font-light leading-relaxed text-[var(--muted)]">{doc.description}</p>
          <OpenInAsk contextId={doc.slug} actions={libraryAskActions(doc.title)} className="mt-5" />
        </div>
      </header>

      <CompanionTopicPrompt topic={doc.title} className="mb-8" />

      <MarkdownBody content={doc.markdown} />

      <Link
        href={backHref}
        className="mt-12 inline-block text-sm font-light text-[var(--muted)] hover:text-[var(--foreground)]"
      >
        {backLabel}
      </Link>
    </PageShell>
  );
}
