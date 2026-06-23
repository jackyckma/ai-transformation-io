import Link from 'next/link';
import type { ContentDocument } from '@ai-transformation/content';
import { CompanionTopicPrompt } from '@ai-transformation/chat-ui';
import { CuratedVisual, DECORATIVE_ASPECT } from '@/components/curated-cards';
import { MarkdownBody } from '@/components/markdown-body';
import { PageShell } from '@/components/page-shell';
import type { ContextualAction } from '@/lib/ask-prefill';

type ContentPageLayoutProps = {
  doc: ContentDocument;
  backHref?: string;
  backLabel?: string;
  eyebrow?: string;
  actions?: ContextualAction[];
};

export function ContentPageLayout({
  doc,
  backHref = '/',
  backLabel = '← Home',
  eyebrow = 'Guide',
  actions,
}: ContentPageLayoutProps) {
  return (
    <PageShell as="article">
      <header className="mb-8 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)]">
        <CuratedVisual
          seed={doc.slug}
          aspectClass={`${DECORATIVE_ASPECT.pageBand} w-full`}
          flush
        />
        <div className="border-t border-[var(--border)] p-5 md:p-6">
          <p className="text-xs font-light tracking-wide text-[var(--muted)]">{eyebrow}</p>
          <h1 className="font-serif mt-3 text-2xl font-normal leading-snug tracking-tight md:text-[1.85rem]">
            {doc.title}
          </h1>
          <p className="mt-4 text-sm font-light leading-relaxed text-[var(--muted)]">{doc.description}</p>
          {actions && actions.length > 0 ? (
            <div className="mt-5 flex flex-wrap gap-x-4 gap-y-1 border-t border-[var(--border)] pt-4 text-xs">
              {actions.map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className="text-[var(--muted)] underline decoration-[var(--border)] underline-offset-4 hover:text-[var(--accent)] hover:decoration-[var(--accent)]"
                >
                  {action.label}
                </Link>
              ))}
            </div>
          ) : null}
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
