'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { ContentPageMeta } from '@ai-transformation/content';

import { OpenInAsk } from '@/components/open-in-ask';
import { SaveToContext } from '@/components/save-to-context';
import { libraryAskActions } from '@/lib/ask-actions';
import { useAuthUser } from '@/lib/use-auth-user';
import { useBookmarks } from '@/lib/bookmarks';
import { useCapturedNotes } from '@/lib/captured-notes';
import { useRecentlyViewed } from '@/lib/recently-viewed';
import type { LibraryCollection } from '@/lib/library-index';

type Pillar = ContentPageMeta['pillar'];

const PILLAR_LABEL: Record<Pillar, string> = {
  framework: 'Framework',
  function: 'Role guide',
  resource: 'Playbook',
};

const PILLAR_FILTER_LABEL: Record<Pillar, string> = {
  framework: 'Frameworks',
  function: 'Role guides',
  resource: 'Playbook',
};

type Tab = 'all' | 'mine';

type LibraryBrowserProps = {
  pages: ContentPageMeta[];
  collections: LibraryCollection[];
};

export function LibraryBrowser({ pages, collections }: LibraryBrowserProps) {
  const { user, isLoading } = useAuthUser();
  const [tab, setTab] = useState<Tab>('all');
  const [pillar, setPillar] = useState<Pillar | 'all'>('all');
  const [collectionId, setCollectionId] = useState<string | 'all'>('all');

  const pillars = useMemo(() => {
    const present = new Set(pages.map((page) => page.pillar));
    return (['framework', 'resource', 'function'] as Pillar[]).filter((value) => present.has(value));
  }, [pages]);

  const activeCollection = collections.find((collection) => collection.id === collectionId);

  const filtered = useMemo(() => {
    return pages.filter((page) => {
      if (pillar !== 'all' && page.pillar !== pillar) return false;
      if (activeCollection && !activeCollection.slugs.includes(page.slug)) return false;
      return true;
    });
  }, [pages, pillar, activeCollection]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-1 border-b border-[var(--border)]">
        <TabButton active={tab === 'all'} onClick={() => setTab('all')}>
          All library
        </TabButton>
        {!isLoading && user ? (
          <TabButton active={tab === 'mine'} onClick={() => setTab('mine')}>
            My library
          </TabButton>
        ) : null}
      </div>

      {tab === 'all' ? (
        <div className="mt-6">
          <Filters
            pillars={pillars}
            pillar={pillar}
            onPillar={setPillar}
            collections={collections}
            collectionId={collectionId}
            onCollection={setCollectionId}
          />

          <p className="mt-6 text-xs font-light text-[var(--muted)]">
            {filtered.length} {filtered.length === 1 ? 'article' : 'articles'}
          </p>

          <ul className="mt-2 divide-y divide-[var(--border)]">
            {filtered.map((page) => (
              <li key={page.slug} className="py-6 first:pt-2">
                <Link href={page.pathname} className="group block">
                  <p className="text-xs font-light tracking-wide text-[var(--muted)]">
                    {PILLAR_LABEL[page.pillar]}
                  </p>
                  <h2 className="font-serif mt-2 text-xl font-normal leading-snug tracking-tight text-[var(--foreground)] transition group-hover:text-[var(--accent)]">
                    {page.title}
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm font-light leading-relaxed text-[var(--muted)]">
                    {page.description}
                  </p>
                </Link>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <OpenInAsk contextId={page.slug} actions={libraryAskActions(page.title)} />
                  <SaveToContext
                    target={{ targetType: 'library_article', targetId: page.slug }}
                    title={page.title}
                  />
                </div>
              </li>
            ))}
          </ul>

          {filtered.length === 0 ? (
            <p className="mt-8 text-sm font-light text-[var(--muted)]">
              No articles match this filter. Clear it to see the full library.
            </p>
          ) : null}
        </div>
      ) : (
        <MyLibrary pages={pages} />
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'true' : undefined}
      className={`-mb-px border-b-2 px-1 pb-3 pt-1 text-sm transition ${
        active
          ? 'border-[var(--accent)] font-normal text-[var(--foreground)]'
          : 'border-transparent font-light text-[var(--secondary)] hover:text-[var(--foreground)]'
      }`}
    >
      {children}
    </button>
  );
}

function Filters({
  pillars,
  pillar,
  onPillar,
  collections,
  collectionId,
  onCollection,
}: {
  pillars: Pillar[];
  pillar: Pillar | 'all';
  onPillar: (value: Pillar | 'all') => void;
  collections: LibraryCollection[];
  collectionId: string | 'all';
  onCollection: (value: string | 'all') => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-[11px] font-normal uppercase tracking-[0.12em] text-[var(--secondary)]">Type</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Chip active={pillar === 'all'} onClick={() => onPillar('all')}>
            All
          </Chip>
          {pillars.map((value) => (
            <Chip key={value} active={pillar === value} onClick={() => onPillar(value)}>
              {PILLAR_FILTER_LABEL[value]}
            </Chip>
          ))}
        </div>
      </div>

      {collections.length > 0 ? (
        <div>
          <p className="text-[11px] font-normal uppercase tracking-[0.12em] text-[var(--secondary)]">
            Collection
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Chip active={collectionId === 'all'} onClick={() => onCollection('all')}>
              All
            </Chip>
            {collections.map((collection) => (
              <Chip
                key={collection.id}
                active={collectionId === collection.id}
                onClick={() => onCollection(collection.id)}
              >
                {collection.title}
              </Chip>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-3 py-1.5 text-xs font-normal transition ${
        active
          ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--foreground)]'
          : 'border-[var(--border)] text-[var(--secondary)] hover:border-[var(--accent)]/40 hover:text-[var(--foreground)]'
      }`}
    >
      {children}
    </button>
  );
}

function MyLibrary({ pages }: { pages: ContentPageMeta[] }) {
  const pageBySlug = useMemo(() => {
    const map = new Map<string, ContentPageMeta>();
    pages.forEach((page) => map.set(page.slug, page));
    return map;
  }, [pages]);

  const recent = useRecentlyViewed();
  const { bookmarks } = useBookmarks();
  const { notes, remove } = useCapturedNotes();

  return (
    <div className="mt-6 space-y-10">
      <section>
        <h2 className="font-serif text-lg font-normal tracking-tight">Saved articles</h2>
        {bookmarks.length === 0 ? (
          <p className="mt-3 text-sm font-light text-[var(--muted)]">
            No bookmarks yet. Use Save to my context on any library article or insight.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {bookmarks.map((bookmark) => {
              const page =
                bookmark.target.targetType === 'library_article'
                  ? pageBySlug.get(bookmark.target.targetId)
                  : undefined;
              const label = page?.title ?? bookmark.title ?? bookmark.target.targetId;
              return (
                <li key={bookmark.id}>
                  {page ? (
                    <Link
                      href={page.pathname}
                      className="text-sm font-light text-[var(--foreground)] underline decoration-[var(--border)] underline-offset-4 hover:decoration-[var(--accent)]"
                    >
                      {label}
                    </Link>
                  ) : (
                    <span className="text-sm font-light text-[var(--foreground)]">{label}</span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section>
        <h2 className="font-serif text-lg font-normal tracking-tight">Recently viewed</h2>
        {recent.length === 0 ? (
          <p className="mt-3 text-sm font-light text-[var(--muted)]">
            Articles you open will appear here. Start in the All library tab.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {recent.map((entry) => {
              const page = pageBySlug.get(entry.slug);
              if (!page) return null;
              return (
                <li key={entry.slug}>
                  <Link
                    href={page.pathname}
                    className="text-sm font-light text-[var(--foreground)] underline decoration-[var(--border)] underline-offset-4 hover:decoration-[var(--accent)]"
                  >
                    {page.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section>
        <h2 className="font-serif text-lg font-normal tracking-tight">Private notes</h2>
        {notes.length === 0 ? (
          <p className="mt-3 text-sm font-light text-[var(--muted)]">
            No notes yet. Capture a private note in Ask.{' '}
            <Link href="/ask?mode=capture" className="text-[var(--accent)] hover:underline">
              Open Capture
            </Link>
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {notes.map((note) => (
              <li
                key={note.id}
                className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4"
              >
                <p className="whitespace-pre-wrap text-sm font-light leading-relaxed text-[var(--foreground)]">
                  {note.body}
                </p>
                <div className="mt-3 flex items-center justify-between text-xs font-light text-[var(--muted)]">
                  <span>{new Date(note.createdAt).toLocaleString()}</span>
                  <button
                    type="button"
                    onClick={() => remove(note.id)}
                    className="text-[var(--secondary)] underline-offset-2 hover:text-[var(--foreground)] hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
