import type { Metadata } from 'next';
import Link from 'next/link';
import { CompanionTopicPrompt } from '@ai-transformation/chat-ui';
import { ApprenticeshipInterestForm } from '@/components/apprenticeship-interest-form';
import { MarkdownBody } from '@/components/markdown-body';
import { PageShell } from '@/components/page-shell';
import { getApprenticeshipOverviewBody, getApprenticeshipOverviewContent } from '@/lib/apprenticeship-content';

export function generateMetadata(): Metadata {
  const { title, description } = getApprenticeshipOverviewContent();
  return {
    title,
    description,
  };
}

export default function ApprenticeshipPage() {
  const { title, description } = getApprenticeshipOverviewContent();
  const bodyMarkdown = getApprenticeshipOverviewBody()
    .replace(/## Why we're writing this down[\s\S]*$/m, '')
    .trim();

  return (
    <PageShell as="article">
      <header className="mb-8 border-b border-[var(--border)] pb-8">
        <p className="text-xs font-light tracking-wide text-[var(--muted)]">Program</p>
        <h1 className="font-serif mt-3 text-2xl font-normal leading-snug tracking-tight md:text-[1.85rem]">
          {title}
        </h1>
        <p className="mt-4 text-sm font-light leading-relaxed text-[var(--muted)]">{description}</p>
        <p className="mt-4 text-sm font-light text-[var(--muted)]">
          <strong className="font-normal text-[var(--foreground)]">Status:</strong> Preparing to launch — we are
          assembling the first cycle.
        </p>
      </header>

      <CompanionTopicPrompt
        topic="AI-era apprenticeship"
        message="How does the apprenticeship program work in this community?"
        className="mb-8"
      />

      <MarkdownBody content={bodyMarkdown} />

      <section className="mt-14 border-t border-[var(--border)] pt-10">
        <h2 className="font-serif text-lg font-normal tracking-tight">How this fits .org and .io</h2>
        <div className="markdown-body mt-4">
          <p>
            This apprenticeship lives on <strong>ai-transformation.org</strong> — the community knowledge commons face
            of this work — because it is about formation, judgment, and experience shared in the open. It is not a
            corporate product or a credential funnel.
          </p>
          <p>
            <a href="https://ai-transformation.io">ai-transformation.io</a> is a separate editorial portal for
            enterprise leaders: Three Gaps frameworks, playbooks, and assessment. It does not run this apprenticeship,
            and this program is not enterprise AI transformation consulting. The two domains share infrastructure but
            serve different audiences.
          </p>
          <p>
            If you are a corporate leader looking for frameworks, start on .io. If you are a parent, an early-career
            practitioner, or a potential mentor interested in this training mechanism, you are in the right place here
            on .org.
          </p>
        </div>
        <p className="mt-6 text-sm font-light text-[var(--muted)]">
          Want the full argument — social reproduction, institutional free-rider problems, leverage points, and what
          would change this reasoning?{' '}
          <Link
            href="/apprenticeship/rationale"
            className="text-[var(--foreground)] underline decoration-[var(--border)] underline-offset-4 hover:decoration-[var(--accent)]"
          >
            Read the design rationale →
          </Link>
        </p>
      </section>

      <section className="mt-14 border-t border-[var(--border)] pt-10">
        <h2 className="font-serif text-lg font-normal tracking-tight">Why we&apos;re writing this down</h2>
        <div className="markdown-body mt-4">
          <p>
            There is a small, real project behind this page. We&apos;re writing the thinking down so it&apos;s clear
            what we&apos;re actually trying to train, why now specifically, and whether the reasoning is legible enough
            for someone else to pick up, adapt it, and run with it.
          </p>
          <p>
            If you&apos;re a parent feeling the same quiet unease we described at the start, or someone early in a
            technical career wondering what&apos;s actually worth practicing right now, we&apos;d be glad to hear from
            you.
          </p>
          <p className="text-sm text-[var(--muted)]">
            A related essay on{' '}
            <a
              href="https://jackyma.info/blog/ai-era-apprenticeship-en/"
              className="text-[var(--foreground)] underline decoration-[var(--border)] underline-offset-4 hover:decoration-[var(--accent)]"
            >
              jackyma.info
            </a>{' '}
            explores the same reasoning in the founder&apos;s voice; this page is the public &quot;we&quot; overview for
            .org.
          </p>
        </div>
      </section>

      <ApprenticeshipInterestForm />

      <nav className="mt-12 flex flex-col gap-2 text-sm font-light text-[var(--muted)]">
        <Link href="/apprenticeship/rationale" className="hover:text-[var(--foreground)]">
          Design rationale →
        </Link>
        <Link href="/" className="hover:text-[var(--foreground)]">
          ← Back to home
        </Link>
      </nav>
    </PageShell>
  );
}
