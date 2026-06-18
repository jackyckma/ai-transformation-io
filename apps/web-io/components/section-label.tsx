type SectionLabelProps = {
  children: React.ReactNode;
};

export function SectionLabel({ children }: SectionLabelProps) {
  return (
    <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-[var(--accent)]">
      {children}
    </p>
  );
}
