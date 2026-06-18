import Link from 'next/link';
import { getOrgLearnPages } from '@ai-transformation/content';
import { ArticleList } from '@/components/article-list';
import { PageIntro } from '@/components/page-intro';

const contribute = [
  { href: '/stories/submit', label: 'Share a story', note: 'Wins, failures, surprises from the field.' },
  { href: '/prompts', label: 'Weekly prompt', note: 'One open question per week.' },
  { href: '/ask', label: 'Ask anything', note: 'We read every message.' },
];

export default function HomePage() {
  const learnPages = getOrgLearnPages();

  return (
    <div className="mx-auto max-w-2xl px-6 py-14">
      <PageIntro
        title="Harvest Hub"
        description="A community space on ai-transformation.org — read first, contribute when you have something to share. No forum, no noise."
      />

      <ArticleList pages={learnPages} />

      <section className="mt-14 border-t border-[var(--border)] pt-10">
        <h2 className="font-serif text-lg font-normal tracking-tight">Contribute</h2>
        <ul className="mt-5 space-y-4">
          {contribute.map((item) => (
            <li key={item.href} className="text-sm font-light">
              <Link href={item.href} className="text-[var(--foreground)] underline decoration-[var(--border)] underline-offset-4 hover:decoration-[var(--accent)]">
                {item.label}
              </Link>
              <span className="text-[var(--muted)]"> — {item.note}</span>
            </li>
          ))}
        </ul>
      </section>

      <nav className="mt-12 text-sm font-light text-[var(--muted)]">
        <Link href="/learn" className="hover:text-[var(--foreground)]">
          All guides →
        </Link>
        <span className="mx-3">·</span>
        <a href="https://ai-transformation.io" className="hover:text-[var(--foreground)]">
          Frameworks on .io
        </a>
      </nav>
    </div>
  );
}
