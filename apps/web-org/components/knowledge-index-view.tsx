'use client';

import { useState } from 'react';

import { useAuthUser } from '@/lib/use-auth-user';
import type { KnowledgeIndex } from '@/lib/knowledge-index';
import { formatDate } from '@/lib/object-display';
import { KnowledgeBrowser } from '@/components/knowledge-browser';
import { KnowledgeObjects } from '@/components/knowledge-objects';
import { MyLibraryPanel } from '@/components/my-library-panel';
import { MyArticlesPanel, MyCommentsPanel } from '@/components/my-articles-panel';

type Tab = 'browse' | 'library' | 'articles' | 'comments';

const MEMBER_TABS: { id: Tab; label: string }[] = [
  { id: 'browse', label: 'Browse' },
  { id: 'library', label: 'My Library' },
  { id: 'articles', label: 'My articles' },
  { id: 'comments', label: 'My comments' },
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
        {index.updatedAt ? (
          <p className="mt-3 text-xs font-light text-[var(--secondary)]">
            Updated {formatDate(index.updatedAt)}
          </p>
        ) : null}
      </header>

      {isMember ? (
        <div role="tablist" aria-label="Knowledge views" className="mb-8 flex flex-wrap gap-1 border-b border-[var(--border)]">
          {MEMBER_TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={activeTab === item.id}
              onClick={() => setTab(item.id)}
              className={`-mb-px border-b-2 px-3 pb-2.5 pt-1 text-sm transition ${
                activeTab === item.id
                  ? 'border-[var(--accent)] font-normal text-[var(--foreground)]'
                  : 'border-transparent font-light text-[var(--secondary)] hover:text-[var(--foreground)]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}

      {activeTab === 'browse' ? (
        <>
          <KnowledgeBrowser index={index} />
          <KnowledgeObjects isMember={isMember} />
        </>
      ) : null}
      {activeTab === 'library' ? <MyLibraryPanel /> : null}
      {activeTab === 'articles' ? <MyArticlesPanel /> : null}
      {activeTab === 'comments' ? <MyCommentsPanel /> : null}
    </div>
  );
}
