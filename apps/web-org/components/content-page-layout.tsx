import Link from 'next/link';
import type { ContentDocument } from '@ai-transformation/content';
import { CompanionTopicPrompt } from '@ai-transformation/chat-ui';
import { MarkdownBody } from '@/components/markdown-body';
import { PageIntro } from '@/components/page-intro';
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
      <PageIntro eyebrow={eyebrow} title={doc.title} description={doc.description} />
      {actions && actions.length > 0 ? (
        <div className="mb-8 flex flex-wrap gap-x-4 gap-y-1 text-xs">
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
