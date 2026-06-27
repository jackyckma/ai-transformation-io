'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

import { knowledgeActions } from '@/lib/ask-prefill';
import type { KnowledgeCategory, KnowledgeIndex, KnowledgeItem } from '@/lib/knowledge-index';

const PILLAR_TYPE_LABEL: Record<KnowledgeItem['pillar'], string> = {
  framework: 'Framework',
  function: 'Guide',
  resource: 'Reference',
};

type KnowledgeBrowserProps = {
  index: KnowledgeIndex;
};

export function KnowledgeBrowser({ index }: KnowledgeBrowserProps) {
  const [activeCategoryId, setActiveCategoryId] = useState<string>(index.categories[0]?.id ?? 'all');
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(index.categories.map((category) => [category.id, true])),
  );

  const activeCategory = useMemo(
    () => index.categories.find((category) => category.id === activeCategoryId),
    [index.categories, activeCategoryId],
  );

  const visibleItems = activeCategory?.items ?? [];

  function toggleCategory(categoryId: string) {
    setExpanded((prev) => ({ ...prev, [categoryId]: !prev[categoryId] }));
  }

  return (
    <div className="index-layout mt-2">
      <nav aria-label="Knowledge categories" className="index-tree">
        <p className="index-tree-label">Browse by topic</p>
        <ul className="index-tree-list">
          {index.categories.map((category) => {
            const isActive = activeCategoryId === category.id;
            const isOpen = expanded[category.id] ?? true;
            return (
              <li key={category.id} className="index-tree-category">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`tree-items-${category.id}`}
                    onClick={() => toggleCategory(category.id)}
                    className="index-tree-toggle"
                  >
                    {isOpen ? '−' : '+'}
                  </button>
                  <button
                    type="button"
                    aria-current={isActive ? 'true' : undefined}
                    onClick={() => setActiveCategoryId(category.id)}
                    className={`index-tree-branch flex-1 text-left ${isActive ? 'index-tree-branch-active' : ''}`}
                  >
                    <span>{category.title}</span>
                    <span className="index-tree-count">{category.items.length}</span>
                  </button>
                </div>
                {isOpen ? (
                  <ul id={`tree-items-${category.id}`} className="index-tree-children">
                    {category.items.map((item) => (
                      <li key={item.slug}>
                        <Link
                          href={item.href}
                          className={`index-tree-leaf ${isActive ? '' : 'opacity-80'}`}
                        >
                          {item.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="min-w-0 flex-1">
        {activeCategory ? (
          <section aria-labelledby={`kb-panel-${activeCategory.id}`}>
            <header className="mb-4 border-b border-[var(--border)] pb-4">
              <p className="text-[11px] font-normal uppercase tracking-[0.12em] text-[var(--secondary)]">
                {activeCategory.title}
              </p>
              <h2
                id={`kb-panel-${activeCategory.id}`}
                className="font-serif mt-1 text-xl font-normal tracking-tight text-[var(--foreground)]"
              >
                {visibleItems.length}{' '}
                {visibleItems.length === 1 ? 'entry' : 'entries'}
              </h2>
            </header>
            <ul className="list-rows">
              {visibleItems.map((item) => (
                <KnowledgeListRow key={item.slug} item={item} />
              ))}
            </ul>
          </section>
        ) : (
          <p className="text-sm font-light text-[var(--muted)]">No knowledge categories yet.</p>
        )}
      </div>
    </div>
  );
}

function KnowledgeListRow({ item }: { item: KnowledgeItem }) {
  return (
    <li className="list-row">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-normal uppercase tracking-wide">
            <span className="rounded-sm bg-[var(--brand)]/12 px-2 py-0.5 text-[var(--brand)]">
              {PILLAR_TYPE_LABEL[item.pillar]}
            </span>
            <span className="text-[var(--secondary)]">public</span>
          </div>
          <h3 className="font-serif mt-2 text-lg font-normal leading-snug tracking-tight">
            <Link href={item.href} className="text-[var(--foreground)] hover:text-[var(--accent)]">
              {item.title}
            </Link>
          </h3>
          <p className="mt-2 max-w-2xl text-sm font-light leading-relaxed text-[var(--muted)]">
            {item.description}
          </p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs">
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
  );
}
