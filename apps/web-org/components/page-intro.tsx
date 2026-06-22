import { CuratedVisual, DECORATIVE_ASPECT } from '@/components/curated-cards';

type PageIntroProps = {
  title: string;
  description: string;
  seed?: string;
  image?: string;
};

export function PageIntro({ title, description, seed, image }: PageIntroProps) {
  const visualSeed = seed ?? title;

  return (
    <header className="mb-10 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)]">
      <CuratedVisual
        seed={visualSeed}
        image={image}
        aspectClass={`${DECORATIVE_ASPECT.pageBand} w-full`}
        flush
      />
      <div className="border-t border-[var(--border)] p-5 md:p-6">
        <h1 className="font-serif text-2xl font-normal tracking-tight md:text-[1.75rem]">{title}</h1>
        <p className="mt-4 max-w-2xl text-sm font-light leading-relaxed text-[var(--muted)]">
          {description}
        </p>
      </div>
    </header>
  );
}
