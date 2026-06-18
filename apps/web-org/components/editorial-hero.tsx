import Link from 'next/link';
import { SectionLabel } from '@/components/section-label';

type EditorialHeroProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  primaryCta?: { href: string; label: string };
  secondaryCta?: { href: string; label: string };
};

export function EditorialHero({
  eyebrow,
  title,
  subtitle,
  primaryCta,
  secondaryCta,
}: EditorialHeroProps) {
  return (
    <section className="hero-mesh relative overflow-hidden border-b border-[var(--border)]">
      <div className="relative mx-auto max-w-5xl px-6 py-20 md:py-28">
        <SectionLabel>{eyebrow}</SectionLabel>
        <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-[1.1] tracking-tight md:text-6xl">
          {title}
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[var(--muted)] md:text-xl">
          {subtitle}
        </p>
        {(primaryCta || secondaryCta) && (
          <div className="mt-10 flex flex-wrap gap-4">
            {primaryCta && (
              <Link
                href={primaryCta.href}
                className="rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-medium text-[var(--accent-fg)] transition hover:opacity-90"
              >
                {primaryCta.label}
              </Link>
            )}
            {secondaryCta && (
              <Link
                href={secondaryCta.href}
                className="rounded-full border border-[var(--border)] bg-[var(--card)]/60 px-6 py-3 text-sm font-medium backdrop-blur transition hover:border-[var(--accent)]"
              >
                {secondaryCta.label}
              </Link>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
