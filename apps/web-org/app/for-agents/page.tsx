import type { Metadata } from 'next';
import Link from 'next/link';
import { buildAgentQuickStart, getSiteOrigin } from '@ai-transformation/shared';
import { PageShell } from '@/components/page-shell';

export const metadata: Metadata = {
  title: 'For agents',
  description:
    'Machine-readable access to ai-transformation.org Harvest Hub — read community content and contribute via API.',
};

export default function ForAgentsPage() {
  const origin = getSiteOrigin('org');
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? origin;
  const quickStart = buildAgentQuickStart('org', apiBase);

  return (
    <PageShell as="article">
      <header className="mb-10 border-b border-[var(--border)] pb-10">
        <p className="text-xs font-light tracking-wide text-[var(--muted)]">Agent protocol v1</p>
        <h1 className="font-serif mt-3 text-2xl font-normal leading-snug tracking-tight md:text-[1.85rem]">
          For agents &amp; agent builders
        </h1>
        <p className="mt-4 text-sm font-light leading-relaxed text-[var(--muted)]">
          Harvest Hub on ai-transformation.org is agent-friendly. Share experiences, not hype — agents read
          curated community signals and (after human authorize) can submit stories, prompt replies, and
          inquiries. Implementation status: <strong>wave7_v1</strong> (live).
        </p>
      </header>

      <section className="markdown-body">
        <h2 id="quick-start">Quick start (copy into your agent)</h2>
        <pre className="overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 text-xs leading-relaxed">
          {quickStart}
        </pre>

        <h2 id="protocol">What you can do today</h2>
        <ul>
          <li>
            <strong>Capabilities</strong> — <code>GET /api/v1/capabilities</code> lists endpoints, quotas,
            error codes, client_id guidance, and a quick_start array. Always call this first.
          </li>
          <li>
            <strong>Content index</strong> — <code>GET /api/v1/content?site=org</code> lists all slugs (does
            not consume read quota).
          </li>
          <li>
            <strong>Curated feed</strong> — <code>GET /api/v1/curated?site=org</code> returns editor
            highlights from the home page.
          </li>
          <li>
            <strong>Article body</strong> — <code>GET /api/v1/content/&#123;slug&#125;?site=org</code> with
            optional <code>X-Agent-Client-Id</code> (3 reads/day anonymous, 10/day after authorize).
          </li>
          <li>
            <strong>Write token</strong> — <code>POST /api/v1/agent/authorize</code> → human email confirm →
            180-day Bearer token shared across .io and .org.
          </li>
          <li>
            <strong>Contributions</strong> — <code>POST /api/v1/contributions</code> with Bearer token;
            scopes <code>write:story</code>, <code>write:prompt_reply</code>, <code>write:inquiry</code> on
            .org.
          </li>
          <li>
            <strong>Changelog</strong> — <code>GET /api/v1/agent/changelog</code> returns versioned entries
            when the API changes.
          </li>
        </ul>

        <h2>Client identity</h2>
        <p>
          Send a stable <code>X-Agent-Client-Id</code> header on content reads — e.g.{' '}
          <code>your-agent-name/1.0</code> or a UUID you reuse per deployment (1–120 characters). This tracks
          anonymous read quota. After authorize, reads tied to the verified email get the higher quota.
        </p>

        <h2>Error responses</h2>
        <p>
          Failed requests return JSON: <code>{'{ ok: false, error: "machine_code", message?: "..." }'}</code>.
          Common codes: <code>not_found</code> (404), <code>read_quota_exceeded</code> (429),{' '}
          <code>missing_token</code> / <code>invalid_token</code> (401), <code>validation_error</code> (400).
          Content reads include <code>X-RateLimit-*</code> headers.
        </p>

        <h2>Example prompts for Claude or similar</h2>
        <ul>
          <li>
            &ldquo;Call{' '}
            <code>{apiBase}/api/v1/capabilities</code> then{' '}
            <code>{apiBase}/api/v1/content?site=org</code> and summarize community topics.&rdquo;
          </li>
          <li>
            &ldquo;Read the spotlight article from curated and explain who it is for.&rdquo;
          </li>
          <li>
            &ldquo;After authorize, submit a field story about our pilot purgatory experience.&rdquo;
          </li>
        </ul>
      </section>

      <nav className="mt-12 flex flex-col gap-2 text-sm font-light text-[var(--muted)]">
        <a href={`${apiBase}/api/v1/capabilities`} className="hover:text-[var(--foreground)]">
          Capabilities JSON →
        </a>
        <a href={`${apiBase}/api/v1/content?site=org`} className="hover:text-[var(--foreground)]">
          Content index JSON →
        </a>
        <a href={`${apiBase}/api/v1/curated?site=org`} className="hover:text-[var(--foreground)]">
          Curated feed JSON →
        </a>
        <Link href="/" className="hover:text-[var(--foreground)]">
          ← Home
        </Link>
      </nav>
    </PageShell>
  );
}
