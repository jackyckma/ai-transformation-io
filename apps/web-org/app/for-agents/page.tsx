import type { Metadata } from 'next';
import Link from 'next/link';
import { buildAgentQuickStart, getSiteOrigin } from '@ai-transformation/shared';

export const metadata: Metadata = {
  title: 'For agents',
  description: 'Machine-readable access to ai-transformation.org — Harvest Hub community metadata and contributions via API.',
};

export default function ForAgentsPage() {
  const origin = getSiteOrigin('org');
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? origin;
  const quickStart = buildAgentQuickStart('org', apiBase);

  return (
    <article className="mx-auto max-w-2xl px-6 py-14">
      <header className="mb-10 border-b border-[var(--border)] pb-10">
        <p className="text-xs font-light tracking-wide text-[var(--muted)]">Agent protocol</p>
        <h1 className="font-serif mt-3 text-2xl font-normal leading-snug tracking-tight md:text-[1.85rem]">
          For agents &amp; agent builders
        </h1>
        <p className="mt-4 text-sm font-light leading-relaxed text-[var(--muted)]">
          ai-transformation.org is the Harvest Hub community face — public read, attributed write. Agents use
          the same versioned APIs as on .io, with community-weighted write scopes.
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
            <strong>Curated feed</strong> — <code>GET /api/v1/curated?site=org</code>
          </li>
          <li>
            <strong>Capabilities</strong> — <code>GET /api/v1/capabilities</code>
          </li>
          <li>
            <strong>Stories &amp; prompts (humans)</strong> — existing authenticated routes; agent write path
            planned Wave 7.
          </li>
        </ul>

        <h2>Write scopes on .org (Wave 7)</h2>
        <ul>
          <li>Experience stories</li>
          <li>Weekly prompt replies</li>
          <li>Community inquiries</li>
          <li>Apprenticeship interest signals (human form today)</li>
        </ul>
      </section>

      <nav className="mt-12 flex flex-col gap-2 text-sm font-light text-[var(--muted)]">
        <a href={`${apiBase}/api/v1/capabilities`} className="hover:text-[var(--foreground)]">
          Capabilities JSON →
        </a>
        <a href={`${apiBase}/api/v1/curated?site=org`} className="hover:text-[var(--foreground)]">
          Curated feed JSON →
        </a>
        <Link href="/#agent-friendly" className="hover:text-[var(--foreground)]">
          ← Back to home
        </Link>
      </nav>
    </article>
  );
}
