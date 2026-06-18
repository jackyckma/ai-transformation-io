type PageIntroProps = {
  title: string;
  description: string;
};

export function PageIntro({ title, description }: PageIntroProps) {
  return (
    <header className="mb-10 border-b border-[var(--border)] pb-10">
      <h1 className="font-serif text-2xl font-normal tracking-tight md:text-[1.75rem]">{title}</h1>
      <p className="mt-4 max-w-xl text-sm font-light leading-relaxed text-[var(--muted)]">
        {description}
      </p>
    </header>
  );
}
