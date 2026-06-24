'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { KnowledgeObjectRecord } from '@ai-transformation/shared';

import { getApiClient } from '@/lib/api-client';
import { useBookmarks } from '@/lib/use-bookmarks';
import { SaveButton } from '@/components/save-button';
import {
  VISIBILITY_LABEL,
  formatDate,
  objectExcerpt,
  objectTarget,
  objectTitle,
  subtypeLabel,
} from '@/lib/object-display';

type LoadState = 'loading' | 'ready' | 'error';

export function KnowledgeObjects({ isMember }: { isMember: boolean }) {
  const [objects, setObjects] = useState<KnowledgeObjectRecord[]>([]);
  const [state, setState] = useState<LoadState>('loading');
  const bookmarks = useBookmarks(isMember);

  useEffect(() => {
    let cancelled = false;
    setState('loading');
    void (async () => {
      try {
        const response = await getApiClient().objects.list({
          site: 'org',
          objectType: 'knowledge',
          status: 'published',
        });
        if (cancelled) return;
        setObjects(
          response.objects.filter(
            (object): object is KnowledgeObjectRecord => object.objectType === 'knowledge',
          ),
        );
        setState('ready');
      } catch {
        if (!cancelled) {
          setState('error');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isMember]);

  if (state === 'loading') {
    return (
      <section aria-labelledby="kb-objects" className="mt-12">
        <SectionHeading />
        <p className="mt-4 text-sm font-light text-[var(--muted)]">Loading contributed knowledge…</p>
      </section>
    );
  }

  if (state === 'error') {
    return (
      <section aria-labelledby="kb-objects" className="mt-12">
        <SectionHeading />
        <p className="mt-4 text-sm font-light text-[var(--muted)]">
          Contributed knowledge is unavailable right now. The articles above are still here.
        </p>
      </section>
    );
  }

  if (objects.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="kb-objects" className="mt-12 border-t border-[var(--border)] pt-10">
      <SectionHeading />
      <p className="mt-2 max-w-2xl text-sm font-light leading-relaxed text-[var(--muted)]">
        Field notes, derived articles, and references contributed by the community.
        {isMember ? ' You also see members-only knowledge here.' : ''}
      </p>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {objects.map((object) => {
          const target = objectTarget(object);
          const title = objectTitle(object);
          return (
            <li
              key={object.id}
              className="flex flex-col rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 transition hover:border-[var(--accent)]/40"
            >
              <Link href={`/knowledge/${encodeURIComponent(object.id)}`} className="group">
                <span className="flex flex-wrap items-center gap-2 text-[11px] font-normal uppercase tracking-wide text-[var(--secondary)]">
                  <span>{subtypeLabel(object.type)}</span>
                  <span aria-hidden>·</span>
                  <span>{VISIBILITY_LABEL[object.visibility]}</span>
                </span>
                <h3 className="font-serif mt-1 text-base font-normal leading-snug tracking-tight text-[var(--foreground)] transition group-hover:text-[var(--accent)]">
                  {title}
                </h3>
                <p className="mt-2 text-sm font-light leading-relaxed text-[var(--muted)]">
                  {objectExcerpt(object.body)}
                </p>
              </Link>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--border)] pt-3">
                <span className="text-xs font-light text-[var(--secondary)]">
                  {formatDate(object.updatedAt)}
                </span>
                {isMember ? (
                  <SaveButton
                    target={target}
                    title={title}
                    saved={bookmarks.isSaved(target)}
                    pending={bookmarks.isPending(target)}
                    onToggle={bookmarks.toggle}
                  />
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
      {bookmarks.error ? (
        <p role="alert" className="mt-3 text-sm text-red-700 dark:text-red-200">
          {bookmarks.error}
        </p>
      ) : null}
    </section>
  );
}

function SectionHeading() {
  return (
    <h2 id="kb-objects" className="text-xs font-normal uppercase tracking-[0.12em] text-[var(--secondary)]">
      Contributed knowledge
    </h2>
  );
}
