import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllPages } from '@ai-transformation/content';

export const metadata: Metadata = {
  title: 'Frameworks',
  description: 'Cross-cutting AI transformation frameworks — roadmap, governance, and definitions.',
};

export default function FrameworksHubPage() {
  const pages = getAllPages().filter((p) => p.pillar === 'framework');

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold">Frameworks</h1>
      <p className="mt-4 text-[var(--muted)]">
        Cross-functional language for enterprise AI transformation — grounded in research, free of hype.
      </p>
      <ul className="mt-10 space-y-4">
        {pages.map((page) => (
          <li key={page.slug}>
            <Link
              href={page.pathname}
              className="block rounded-lg border border-[var(--border)] px-4 py-4 hover:border-[var(--accent)]"
            >
              <span className="font-medium">{page.title}</span>
              <p className="mt-1 text-sm text-[var(--muted)]">{page.description}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
