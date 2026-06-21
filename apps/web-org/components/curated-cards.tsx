import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { ResolvedCuratedArticle } from '@ai-transformation/content';

type CuratedVisualProps = {
  seed: string;
  image?: string;
  aspectClass?: string;
  compact?: boolean;
};

const PLACEHOLDER_TONES = [
  'from-[#e8e4dc] to-[#f5f2eb] dark:from-[#2a2824] dark:to-[#1a1917]',
  'from-[#dce8e0] to-[#f0f7f3] dark:from-[#1e2a24] dark:to-[#141916]',
  'from-[#e5dfe8] to-[#f3eff5] dark:from-[#252028] dark:to-[#18161a]',
  'from-[#dfe4ea] to-[#eef1f5] dark:from-[#1e2228] dark:to-[#121416]',
] as const;

function toneForSeed(seed: string): (typeof PLACEHOLDER_TONES)[number] {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash + seed.charCodeAt(i)) % PLACEHOLDER_TONES.length;
  }
  return PLACEHOLDER_TONES[hash] ?? PLACEHOLDER_TONES[0];
}

function initialForSeed(seed: string): string {
  const trimmed = seed.trim();
  if (!trimmed) return '·';
  return trimmed.charAt(0).toUpperCase();
}

export function CuratedVisual({
  seed,
  image,
  aspectClass = 'aspect-[2/1]',
  compact = false,
}: CuratedVisualProps) {
  if (image) {
    return (
      <div className={`relative overflow-hidden rounded-lg border border-[var(--border)] ${aspectClass}`}>
        <Image src={image} alt="" fill className="object-cover" sizes="(max-width: 768px) 100vw, 672px" />
      </div>
    );
  }

  if (compact) {
    return (
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-[var(--border)] bg-gradient-to-br ${toneForSeed(seed)} font-serif text-sm text-[var(--foreground)]`}
        aria-hidden
      >
        {initialForSeed(seed)}
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded-lg border border-[var(--border)] bg-gradient-to-br ${aspectClass} ${toneForSeed(seed)}`}
      aria-hidden
    >
      <span className="absolute inset-0 flex items-center justify-center font-serif text-4xl font-normal text-[var(--foreground)]/20 md:text-5xl">
        {initialForSeed(seed)}
      </span>
    </div>
  );
}

type FeatureSpotlightCardProps = {
  article: ResolvedCuratedArticle;
  editorNote: string;
  image?: string;
  category?: string;
};

export function FeatureSpotlightCard({
  article,
  editorNote,
  image,
  category = 'Spotlight',
}: FeatureSpotlightCardProps) {
  return (
    <article className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)]">
      <Link href={article.pathname} className="group block">
        <CuratedVisual seed={article.slug} image={image} aspectClass="aspect-[2/1] w-full" />
        <div className="p-5 md:p-6">
          <p className="text-xs font-light tracking-wide text-[var(--muted)]">{category}</p>
          <h3 className="font-serif mt-2 text-xl font-normal leading-snug tracking-tight text-[var(--foreground)] transition group-hover:text-[var(--accent)] md:text-2xl">
            {article.title}
          </h3>
          <p className="mt-2 text-sm font-light leading-relaxed text-[var(--muted)]">{article.description}</p>
          <p className="mt-4 text-sm font-light text-[var(--muted)]">{editorNote}</p>
        </div>
      </Link>
    </article>
  );
}

type TopicRowCardProps = {
  title: string;
  summary: string;
  href: string | null;
  related: ResolvedCuratedArticle[];
  image?: string;
  seed: string;
};

export function TopicRowCard({ title, summary, href, related, image, seed }: TopicRowCardProps) {
  const inner = (
    <>
      <CuratedVisual seed={seed} image={image} aspectClass="aspect-[3/2] w-full" />
      <div className="flex flex-1 flex-col p-4 md:p-5">
        <h3 className="font-serif text-base font-normal leading-snug tracking-tight text-[var(--foreground)] md:text-lg">
          {title}
        </h3>
        <p className="mt-2 flex-1 text-sm font-light leading-relaxed text-[var(--muted)]">{summary}</p>
        {related.length > 0 ? (
          <p className="mt-3 text-xs font-light text-[var(--muted)]">
            Related:{' '}
            {related.map((article, index) => (
              <span key={article.slug}>
                {index > 0 ? ' · ' : ''}
                <Link href={article.pathname} className="hover:text-[var(--foreground)]">
                  {article.title}
                </Link>
              </span>
            ))}
          </p>
        ) : null}
      </div>
    </>
  );

  if (href) {
    return (
      <article className="flex h-full flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] transition hover:border-[var(--accent)]/40">
        <Link href={href} className="group flex h-full flex-col">
          {inner}
        </Link>
      </article>
    );
  }

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)]">
      {inner}
    </article>
  );
}

type CompactPathCardProps = {
  label: string;
  description: string;
  image?: string;
  seed: string;
  children: ReactNode;
};

export function CompactPathCard({ label, description, image, seed, children }: CompactPathCardProps) {
  return (
    <li className="flex h-full flex-col rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 md:p-5">
      <div className="flex items-start gap-3">
        <CuratedVisual seed={seed} image={image} compact />
        <div>
          <h3 className="font-serif text-base font-normal tracking-tight text-[var(--foreground)]">{label}</h3>
          <p className="mt-2 text-sm font-light leading-relaxed text-[var(--muted)]">{description}</p>
        </div>
      </div>
      <ul className="mt-4 space-y-2 border-t border-[var(--border)] pt-4 text-sm font-light">{children}</ul>
    </li>
  );
}
