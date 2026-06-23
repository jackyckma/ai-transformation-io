'use client';

import Link from 'next/link';
import { useState } from 'react';

import { useAuthUser } from '@/lib/use-auth-user';
import { knowledgeActions } from '@/lib/ask-prefill';
import type { KnowledgeIndex } from '@/lib/knowledge-index';

type Tab = 'browse' | 'library' | 'mine';

const MEMBER_TABS: { id: Tab; label: string }[] = [
  { id: 'browse', label: 'Browse' },
  { id: 'library', label: 'My Library' },
  { id: 'mine', label: 'My articles & comments' },
];

export function KnowledgeIndexView({ index }: { index: KnowledgeIndex }) {
  const { audience } = useAuthUser();
  const [tab, setTab] = useState<Tab>('browse');
  const isMember = audience === 'member';
  const activeTab = isMember ? tab : 'browse';

  return (
    <div>
      <header className="mb-8">
        <p className="text-xs font-normal uppercase tracking-[0.12em] text-[var(--secondary)]">
          Community · Knowledge commons
        </p>
        <h1 className="font-serif mt-2 text-2xl font-normal tracking-tight md:text-[1.85rem]">
          {index.title}
        </h1>
        <p className="mt-3 max-w-2xl text-sm font-light leading-relaxed text-[var(--muted)]">
          {index.description}
        </p>
      </header>

      {isMember ? (
        <div role="tablist" aria-label="Knowledge views" className="mb-8 flex flex-wrap gap-2 text-sm">
          {MEMBER_TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={activeTab === item.id}
              onClick={() => setTab(item.id)}
              className={`rounded-full border px-4 py-1.5 transition ${
                activeTab === item.id
                  ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--foreground)]'
                  : 'border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)]/40'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}

      {activeTab === 'browse' ? <BrowseCategories index={index} /> : null}
      {activeTab === 'library' ? (
        <PlaceholderPanel
          title="My Library"
          body="Bookmarks, saved articles, and private notes will live here once the object model ships."
        />
      ) : null}
      {activeTab === 'mine' ? (
        <PlaceholderPanel
          title="My articles & comments"
          body="Articles you author and public comments you leave on the commons will appear here."
        />
      ) : null}
    </div>
  );
}

function BrowseCategories({ index }: { index: KnowledgeIndex }) {
  return (
    <div className="space-y-10">
      {index.categories.map((category) => (
        <section key={category.id} aria-labelledby={`kb-${category.id}`}>
          <h2
            id={`kb-${category.id}`}
            className="text-xs font-normal uppercase tracking-[0.12em] text-[var(--secondary)]"
          >
            {category.title}
          </h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {category.items.map((item) => (
              <li
                key={item.slug}
                className="flex flex-col rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 transition hover:border-[var(--accent)]/40"
              >
                <Link href={item.href} className="group">
                  <span className="text-[11px] font-normal uppercase tracking-wide text-[var(--secondary)]">
                    public
                  </span>
                  <h3 className="font-serif mt-1 text-base font-normal leading-snug tracking-tight text-[var(--foreground)] transition group-hover:text-[var(--accent)]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm font-light leading-relaxed text-[var(--muted)]">
                    {item.description}
                  </p>
                </Link>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-[var(--border)] pt-3 text-xs">
                  {knowledgeActions(item.title, item.slug).map((action) => (
                    <Link
                      key={action.label}
                      href={action.href}
                      className="text-[var(--muted)] underline decoration-[var(--border)] underline-offset-4 hover:text-[var(--accent)] hover:decoration-[var(--accent)]"
                    >
                      {action.label}
                    </Link>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function PlaceholderPanel({ title, body }: { title: string; body: string }) {
  return (
    <section className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--card)] p-6 md:p-8">
      <h2 className="font-serif text-lg font-normal tracking-tight">{title}</h2>
      <p className="mt-2 max-w-xl text-sm font-light leading-relaxed text-[var(--muted)]">{body}</p>
      <p className="mt-4 text-xs font-light uppercase tracking-[0.12em] text-[var(--secondary)]">
        Coming with the object model (Wave 12)
      </p>
    </section>
  );
}
