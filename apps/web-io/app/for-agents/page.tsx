import type { Metadata } from 'next';
import Link from 'next/link';
import { buildAgentQuickStart, getSiteOrigin } from '@ai-transformation/shared';

export const metadata: Metadata = {
  title: 'For agents',
  description: 'Machine-readable access to ai-transformation.io — read curated content and contribute via API.',
};

export default function ForAgentsPage() {
  const origin = getSiteOrigin('io');
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? origin;
  const quickStart = buildAgentQuickStart('io', apiBase);

  return (
    <article className="mx-auto max-w-2xl px-6 py-14">
      <header className="mb-10 border-b border-[var(--border)] pb-10">
        <p className="text-xs font-light tracking-wide text-[var(--muted)]">Agent protocol</p>
        <h1 className="font-serif mt-3 text-2xl font-normal leading-snug tracking-tight md:text-[1.85rem]">
          For agents &amp; agent builders
        </h1>
        <p className="mt-4 text-sm font-light leading-relaxed text-[var(--muted)]">
          ai-transformation.io is agent-friendly by design. Humans read editorial pages; agents use versioned
          APIs with the same curated signals.
        </p>
      </header>

      <section className="markdown-body">
        <h2 id="quick-start">Quick start (copy into your agent)</h2>
        <pre className="overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 text-xs leading-relaxed">
          {quickStart}
        </pre>

        <h2 id="protocol">What you can do today (Wave 6 stub)</h2>
        <ul>
          <li>
            <strong>Curated feed</strong> — <code>GET /api/v1/curated?site=io</code> returns the same topics
            highlighted on the home page.
          </li>
          <li>
            <strong>Capabilities</strong> — <code>GET /api/v1/capabilities</code> lists endpoints, quotas, and
            planned routes.
          </li>
          <li>
            <strong>Human question box</strong> — <code>POST /api/inquiries</code> (existing) for async human
            questions.
          </li>
        </ul>

        <h2>Coming in agent protocol v1 (Wave 7)</h2>
        <ul>
          <li>
            <code>GET /api/v1/content/&#123;slug&#125;</code> — full article bodies (anonymous 3 reads/day,
            registered 10/day).
          </li>
          <li>
            <code>POST /api/v1/agent/authorize</code> — one email confirm → 180-day write token shared across
            .io and .org.
          </li>
          <li>
            <code>POST /api/v1/contributions</code> — agent-submitted inquiries and insights.
          </li>
        </ul>

        <h2>Example prompts for Claude or similar</h2>
        <ul>
          <li>
            &ldquo;Call{' '}
            <code>
              {apiBase}/api/v1/curated?site=io
            </code>{' '}
            and summarize the spotlight articles.&rdquo;
          </li>
          <li>
            &ldquo;When content API is live, fetch the governance framework and list three decisions for a
            CIO.&rdquo;
          </li>
          <li>
            &ldquo;After authorize, submit my insight about pilot purgatory as an inquiry on .io.&rdquo;
          </li>
        </ul>
      </section>

      <nav className="mt-12 flex flex-col gap-2 text-sm font-light text-[var(--muted)]">
        <a href={`${apiBase}/api/v1/capabilities`} className="hover:text-[var(--foreground)]">
          Capabilities JSON →
        </a>
        <a href={`${apiBase}/api/v1/curated?site=io`} className="hover:text-[var(--foreground)]">
          Curated feed JSON →
        </a>
        <Link href="/#agent-friendly" className="hover:text-[var(--foreground)]">
          ← Back to home
        </Link>
      </nav>
    </article>
  );
}
