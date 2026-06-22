import Link from 'next/link';
import type { ExploreLink } from '@/lib/explore-links';

type HubExploreNavProps = {
  links: ExploreLink[];
  className?: string;
};

export function HubExploreNav({ links, className = '' }: HubExploreNavProps) {
  return (
    <nav
      aria-label="Explore"
      className={`flex flex-wrap gap-x-4 gap-y-2 border-t border-[var(--border)] pt-8 text-sm font-light ${className}`.trim()}
    >
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="text-[var(--muted)] underline decoration-[var(--border)] underline-offset-4 hover:text-[var(--foreground)] hover:decoration-[var(--accent)]"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
