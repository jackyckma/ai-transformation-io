import Link from 'next/link';
import type { ContentDocument } from '@ai-transformation/content';
import { CompanionTopicPrompt } from '@ai-transformation/chat-ui';
import { buildExternalAgentHint, getSiteOrigin } from '@ai-transformation/shared';
import { ArticleViewTracker } from '@/components/article-view-tracker';
import { CuratedVisual, DECORATIVE_ASPECT } from '@/components/curated-cards';
import { ExternalAgentLinks } from '@/components/external-agent-links';
import { MarkdownBody } from '@/components/markdown-body';
import { OpenInAsk } from '@/components/open-in-ask';
import { PageShell } from '@/components/page-shell';
import { libraryAskActions } from '@/lib/ask-actions';

export type RelatedLink = {
  slug: string;
  title: string;
  pathname: string;
  pillar: ContentDocument['pillar'];
};

type ContentPageLayoutProps = {
  doc: ContentDocument;
  related?: RelatedLink[];
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
  related = [],
  backHref = '/library',
  backLabel = '← All library',
}: ContentPageLayoutProps) {
  const canonicalUrl = `${getSiteOrigin('io')}${doc.pathname}`;
  const agentHint = buildExternalAgentHint({
    title: doc.title,
    canonicalUrl,
    site: 'io',
  });

  return (
    <PageShell as="article">
      <script
        type="application/json"
        data-agent-hint="external-agent"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(agentHint) }}
      />
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
          <ExternalAgentLinks title={doc.title} path={doc.pathname} className="mt-3" />
        </div>
      </header>

      <CompanionTopicPrompt topic={doc.title} className="mb-8" />

      <MarkdownBody content={doc.markdown} />

      {related.length > 0 ? (
        <aside className="mt-14 border-t border-[var(--border)] pt-8">
          <h2 className="text-[11px] font-normal uppercase tracking-[0.12em] text-[var(--secondary)]">
            More in Library
          </h2>
          <ul className="mt-4 divide-y divide-[var(--border)]">
            {related.map((item) => (
              <li key={item.slug} className="py-3 first:pt-0">
                <Link href={item.pathname} className="group block">
                  <span className="text-[11px] font-light tracking-wide text-[var(--muted)]">
                    {PILLAR_LABEL[item.pillar]}
                  </span>
                  <span className="font-serif mt-1 block text-base font-normal leading-snug tracking-tight text-[var(--foreground)] transition group-hover:text-[var(--accent)]">
                    {item.title}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      ) : null}

      <Link
        href={backHref}
        className="mt-12 inline-block text-sm font-light text-[var(--muted)] hover:text-[var(--foreground)]"
      >
        {backLabel}
      </Link>
    </PageShell>
  );
}
