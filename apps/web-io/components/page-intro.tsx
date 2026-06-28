type PageIntroProps = {
  title: string;
  description: string;
  eyebrow?: string;
};

export function PageIntro({ title, description, eyebrow }: PageIntroProps) {
  return (
    <header className="mb-10">
      {eyebrow ? (
        <p className="text-xs font-normal uppercase tracking-[0.12em] text-[var(--brand)]">{eyebrow}</p>
      ) : null}
      <h1 className="font-serif mt-2 text-2xl font-normal tracking-tight md:text-[1.75rem]">{title}</h1>
      <p className="mt-3 max-w-2xl text-sm font-light leading-relaxed text-[var(--muted)]">{description}</p>
    </header>
  );
}
