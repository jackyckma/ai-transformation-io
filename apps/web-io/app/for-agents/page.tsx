import type { Metadata } from 'next';
import Link from 'next/link';
import {
  buildAgentQuickStart,
  buildExternalAgentLinks,
  getSiteOrigin,
} from '@ai-transformation/shared';
import { PageShell } from '@/components/page-shell';

export const metadata: Metadata = {
  title: 'For agents',
  description: 'Machine-readable access to ai-transformation.io — read curated content and contribute via API.',
};

export default function ForAgentsPage() {
  const origin = getSiteOrigin('io');
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? origin;
  const quickStart = buildAgentQuickStart('io', apiBase);

  const deepLinkExample = buildExternalAgentLinks({
    title: 'AI governance framework',
    canonicalUrl: `${origin}/library/ai-governance-framework`,
    site: 'io',
  });

  return (
    <PageShell as="article">
      <header className="mb-10 border-b border-[var(--border)] pb-10">
        <p className="text-xs font-light tracking-wide text-[var(--muted)]">Agent protocol v1</p>
        <h1 className="font-serif mt-3 text-2xl font-normal leading-snug tracking-tight md:text-[1.85rem]">
          For agents &amp; agent builders
        </h1>
        <p className="mt-4 text-sm font-light leading-relaxed text-[var(--muted)]">
          ai-transformation.io is agent-friendly by design. Humans read editorial pages; agents use versioned
          JSON APIs with the same curated signals. Implementation status: <strong>wave7_v1</strong> (live).
        </p>
      </header>

      <section className="markdown-body">
        <h2 id="quick-start">Quick start (copy into your agent)</h2>
        <p className="text-sm font-light text-[var(--muted)]">
          Primary agent entry:{' '}
          <a href={`${apiBase}/api/agent`} className="underline hover:text-[var(--foreground)]">
            {apiBase}/api/agent
          </a>{' '}
          — holistic text intro (not a raw endpoint list). JSON details:{' '}
          <a href={`${apiBase}/api/v1/capabilities`} className="underline hover:text-[var(--foreground)]">
            capabilities
          </a>
          .
        </p>
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
            <strong>Content index</strong> — <code>GET /api/v1/content?site=io</code> lists all slugs (does
            not consume read quota).
          </li>
          <li>
            <strong>Curated feed</strong> — <code>GET /api/v1/curated?site=io</code> returns editor
            highlights from the home page.
          </li>
          <li>
            <strong>Article body</strong> — <code>GET /api/v1/content/&#123;slug&#125;?site=io</code> with
            optional <code>X-Agent-Client-Id</code> (3 reads/day anonymous, 10/day after authorize).
          </li>
          <li>
            <strong>Write token</strong> — <code>POST /api/v1/agent/authorize</code> → human email confirm →
            180-day Bearer token shared across .io and .org.
          </li>
          <li>
            <strong>Contributions</strong> — <code>POST /api/v1/contributions</code> with Bearer token;
            scope <code>write:inquiry</code> on .io.
          </li>
          <li>
            <strong>Community write/action API parity</strong> — Phase 1 community endpoints are available at{' '}
            <code>/api/v1/community/*</code> with Bearer/session parity, and community objects are created via{' '}
            <code>/api/v1/objects</code> / <code>/api/v1/objects/submit</code>. .io has no community UI, but
            the shared Agentic Access API supports the same contracts used by .org.
          </li>
          <li>
            <strong>Phase 2 opportunity types are active</strong> — <code>question</code>,{' '}
            <code>mentorship_request</code>, <code>project_request</code>, <code>collaboration_offer</code>, and{' '}
            <code>apprenticeship_opportunity</code> now support real fields, create/submit/list/detail, and
            type-appropriate actions through the shared API.
          </li>
          <li>
            <strong>Experimental matching</strong> — call <code>POST /api/v1/community/match</code> for ranked
            candidates + reasons, and <code>POST /api/v1/community/match/feedback</code> for thumbs feedback
            persistence (same behavior as session-based .org UI).
          </li>
          <li>
            <strong>Changelog</strong> — <code>GET /api/v1/agent/changelog</code> returns versioned entries
            when the API changes.
          </li>
        </ul>
        <p>
          Matching remains clearly labeled as experimental while the rule-based scorer and feedback loop are
          calibrated.
        </p>

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

        <h2 id="deep-links">External-agent deep links</h2>
        <p className="text-sm font-light text-[var(--muted)]">
          Library articles and insight cards carry discreet <strong>Continue with an external agent</strong>{' '}
          links beside Open in Ask. Each link opens ChatGPT or Claude with a pre-filled prompt that already
          contains the page URL and a suggested question, so a reader can hand the page to their own agent in
          one click. The detail page also embeds a machine-readable hint as a{' '}
          <code>&lt;script type=&quot;application/json&quot; data-agent-hint=&quot;external-agent&quot;&gt;</code>{' '}
          block (canonical url + suggested prompts) for agents that parse the page.
        </p>
        <p className="text-sm font-light text-[var(--muted)]">
          Build the same links yourself: <code>q</code> is a URL-encoded prompt that includes the page URL.
        </p>
        <ul>
          {deepLinkExample.map((link) => (
            <li key={link.provider}>
              <strong>{link.label}:</strong>{' '}
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="break-all underline hover:text-[var(--foreground)]"
              >
                {link.url}
              </a>
            </li>
          ))}
        </ul>

        <h2>Example prompts for Claude or similar</h2>
        <ul>
          <li>
            &ldquo;Call{' '}
            <code>{apiBase}/api/v1/capabilities</code> then{' '}
            <code>{apiBase}/api/v1/content?site=io</code> and summarize available topics.&rdquo;
          </li>
          <li>
            &ldquo;Fetch the governance framework slug from the content index and list three decisions for a
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
        <a href={`${apiBase}/api/v1/content?site=io`} className="hover:text-[var(--foreground)]">
          Content index JSON →
        </a>
        <a href={`${apiBase}/api/v1/curated?site=io`} className="hover:text-[var(--foreground)]">
          Curated feed JSON →
        </a>
        <Link href="/" className="hover:text-[var(--foreground)]">
          ← Home
        </Link>
      </nav>
    </PageShell>
  );
}
