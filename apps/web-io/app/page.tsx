import Link from 'next/link';
import { CompanionHomeEntry } from '@ai-transformation/chat-ui';
import { HomeCuratedPreview, loadIoCuratedFeed } from '@/components/curated-sections';

const exploreLinks = [
  { href: '/frameworks', label: 'Frameworks' },
  { href: '/playbook', label: 'Playbook' },
  { href: '/functions', label: 'Role guides' },
  { href: '/assessment', label: 'Assessment' },
  { href: '/for-agents', label: 'For agents' },
];

export default function HomePage() {
  const feed = loadIoCuratedFeed();

  return (
    <div className="layout-shell py-8 md:py-12">
      <section className="max-w-2xl">
        <h1 className="font-serif text-2xl font-normal tracking-tight md:text-3xl">
          Your AI transformation companion
        </h1>
        <p className="mt-3 text-sm font-light leading-relaxed text-[var(--muted)] md:text-base">
          Structured guidance for enterprise leaders — ask first, then read frameworks and playbook
          articles when you need depth.
        </p>
      </section>

      <div className="mt-8 max-w-2xl">
        <CompanionHomeEntry site="io" />
      </div>

      <nav
        aria-label="Explore"
        className="mt-10 flex flex-wrap gap-x-4 gap-y-2 border-y border-[var(--border)] py-4 text-sm font-light"
      >
        {exploreLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-[var(--muted)] underline decoration-[var(--border)] underline-offset-4 hover:text-[var(--foreground)] hover:decoration-[var(--accent)]"
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <HomeCuratedPreview feed={feed} />
    </div>
  );
}
