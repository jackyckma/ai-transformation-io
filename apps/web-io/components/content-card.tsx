import Link from 'next/link';
import type { ContentPageMeta } from '@ai-transformation/content';

type ContentCardProps = {
  page: ContentPageMeta;
  index?: number;
};

export function ContentCard({ page, index }: ContentCardProps) {
  return (
    <Link
      href={page.pathname}
      className="group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 transition hover:border-[var(--accent)] hover:shadow-[var(--glow)]"
    >
      {index !== undefined && (
        <span className="font-mono text-xs text-[var(--muted)]">
          {String(index).padStart(2, '0')} ·
        </span>
      )}
      <h2 className="mt-2 text-lg font-semibold tracking-tight group-hover:text-[var(--accent)]">
        {page.title}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{page.description}</p>
    </Link>
  );
}
