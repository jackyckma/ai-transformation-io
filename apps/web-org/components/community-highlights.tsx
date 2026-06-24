'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { CommunityObjectRecord } from '@ai-transformation/shared';

import { useAuthUser } from '@/lib/use-auth-user';
import { useBookmarks } from '@/lib/use-bookmarks';
import { communityActions } from '@/lib/ask-prefill';
import { getApiClient } from '@/lib/api-client';
import { SaveButton } from '@/components/save-button';
import {
  COMMUNITY_TYPE_LABEL,
  COMMUNITY_TYPE_VERBS,
  VISIBILITY_LABEL,
  formatDate,
  objectExcerpt,
  objectTarget,
  objectTitle,
} from '@/lib/object-display';
import {
  COMMUNITY_HIGHLIGHTS,
  COMMUNITY_TYPE_META,
  type CommunityHighlight,
} from '@/lib/community-highlights';

type LoadState = 'loading' | 'ready' | 'error';

export function CommunityHighlights() {
  const { audience } = useAuthUser();
  const isMember = audience === 'member';
  const [objects, setObjects] = useState<CommunityObjectRecord[]>([]);
  const [state, setState] = useState<LoadState>('loading');
  const bookmarks = useBookmarks(isMember);

  useEffect(() => {
    let cancelled = false;
    setState('loading');
    void (async () => {
      try {
        const response = await getApiClient().objects.list({
          site: 'org',
          objectType: 'community',
          status: 'published',
        });
        if (cancelled) return;
        setObjects(
          response.objects.filter(
            (object): object is CommunityObjectRecord => object.objectType === 'community',
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

  const hasLiveObjects = state === 'ready' && objects.length > 0;

  return (
    <div>
      <header className="mb-8">
        <p className="text-xs font-normal uppercase tracking-[0.12em] text-[var(--secondary)]">
          Community
        </p>
        <h1 className="font-serif mt-2 text-2xl font-normal tracking-tight md:text-[1.85rem]">
          Community highlights
        </h1>
        <p className="mt-3 max-w-2xl text-sm font-light leading-relaxed text-[var(--muted)]">
          The opportunity and interaction layer — discussions, help requests, events, and notices.
          {isMember
            ? ' Signed in, you see the fuller opportunity layer including members-only items.'
            : ' Public highlights are shown here; sign in for the full opportunity layer.'}
        </p>
      </header>

      {state === 'loading' ? (
        <p className="text-sm font-light text-[var(--muted)]">Loading community…</p>
      ) : null}

      {hasLiveObjects ? (
        <ul className="grid gap-4 sm:grid-cols-2">
          {objects.map((object) => (
            <ObjectCard
              key={object.id}
              object={object}
              isMember={isMember}
              bookmarks={bookmarks}
            />
          ))}
        </ul>
      ) : null}

      {state === 'ready' && !hasLiveObjects ? (
        <>
          <p className="mb-4 text-sm font-light text-[var(--muted)]">
            No live community items yet. Here is the kind of activity that lives here:
          </p>
          <ul className="grid gap-4 sm:grid-cols-2">
            {COMMUNITY_HIGHLIGHTS.map((item) => (
              <SampleCard key={item.id} item={item} />
            ))}
          </ul>
        </>
      ) : null}

      {state === 'error' ? (
        <ul className="grid gap-4 sm:grid-cols-2">
          {COMMUNITY_HIGHLIGHTS.map((item) => (
            <SampleCard key={item.id} item={item} />
          ))}
        </ul>
      ) : null}

      {bookmarks.error ? (
        <p role="alert" className="mt-4 text-sm text-red-700 dark:text-red-200">
          {bookmarks.error}
        </p>
      ) : null}

      <section className="mt-10 rounded-xl border border-dashed border-[var(--border)] bg-[var(--card)] p-6 md:p-8">
        <h2 className="font-serif text-lg font-normal tracking-tight">
          {isMember ? 'Your opportunity layer' : 'Want to take part?'}
        </h2>
        <p className="mt-2 max-w-xl text-sm font-light leading-relaxed text-[var(--muted)]">
          {isMember
            ? 'Save items to your library and use Ask to draft a reply or contribution. Full reply and follow actions arrive with the community types in Wave 13.'
            : 'Posting and one-click actions require an account. Until then, use Ask to draft replies and contributions, or open the help request flow.'}
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <Link
            href="/ask?mode=find-help"
            className="inline-flex min-h-9 items-center rounded-lg bg-[var(--accent)] px-4 py-2 font-medium text-[var(--accent-fg)] transition hover:opacity-90"
          >
            Find help
          </Link>
          <Link
            href="/ask?mode=submit"
            className="inline-flex min-h-9 items-center rounded-lg border border-[var(--border)] px-4 py-2 text-[var(--foreground)] transition hover:border-[var(--accent)]"
          >
            Draft a contribution
          </Link>
        </div>
      </section>
    </div>
  );
}

function ObjectCard({
  object,
  isMember,
  bookmarks,
}: {
  object: CommunityObjectRecord;
  isMember: boolean;
  bookmarks: ReturnType<typeof useBookmarks>;
}) {
  const title = objectTitle(object);
  const target = objectTarget(object);
  const typeLabel = COMMUNITY_TYPE_LABEL[object.type] ?? object.type;
  const verbs = (COMMUNITY_TYPE_VERBS[object.type] ?? ['Save']).filter((verb) => verb !== 'Save');
  const actions = communityActions(title, typeLabel.toLowerCase(), object.id);

  return (
    <li className="flex flex-col rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-[var(--accent)]/40 bg-[var(--accent)]/10 px-2.5 py-0.5 text-[11px] font-normal uppercase tracking-wide text-[var(--accent)]">
          {typeLabel}
        </span>
        <span className="text-[11px] font-normal uppercase tracking-wide text-[var(--secondary)]">
          {VISIBILITY_LABEL[object.visibility]}
        </span>
      </div>
      <h3 className="font-serif mt-3 text-base font-normal leading-snug tracking-tight text-[var(--foreground)]">
        {title}
      </h3>
      <p className="mt-2 flex-1 text-sm font-light leading-relaxed text-[var(--muted)]">
        {objectExcerpt(object.body)}
      </p>
      <p className="mt-3 text-xs font-light text-[var(--secondary)]">{formatDate(object.updatedAt)}</p>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[var(--border)] pt-3">
        {isMember ? (
          <SaveButton
            target={target}
            title={title}
            saved={bookmarks.isSaved(target)}
            pending={bookmarks.isPending(target)}
            onToggle={bookmarks.toggle}
          />
        ) : null}
        {verbs.map((verb) => (
          <span
            key={verb}
            title="Available with community types (Wave 13)"
            aria-disabled="true"
            className="cursor-default rounded-full border border-[var(--border)] px-3 py-1 text-xs font-light text-[var(--muted)]/70"
          >
            {verb}
          </span>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs">
        {actions.map((action) => (
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

function SampleCard({ item }: { item: CommunityHighlight }) {
  const typeMeta = COMMUNITY_TYPE_META[item.type];
  const actions = communityActions(item.title, typeMeta.label.toLowerCase(), item.id);

  return (
    <li className="flex flex-col rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
      <div className="flex items-center gap-2">
        <span className="rounded-full border border-[var(--accent)]/40 bg-[var(--accent)]/10 px-2.5 py-0.5 text-[11px] font-normal uppercase tracking-wide text-[var(--accent)]">
          {typeMeta.label}
        </span>
        <span className="text-[11px] font-normal uppercase tracking-wide text-[var(--secondary)]">
          public
        </span>
      </div>
      <h3 className="font-serif mt-3 text-base font-normal leading-snug tracking-tight text-[var(--foreground)]">
        {item.title}
      </h3>
      <p className="mt-2 flex-1 text-sm font-light leading-relaxed text-[var(--muted)]">{item.summary}</p>
      <p className="mt-3 text-xs font-light text-[var(--secondary)]">{item.meta}</p>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[var(--border)] pt-3">
        {item.verbs.map((verb) => (
          <span
            key={verb}
            title="Available with community types (Wave 13)"
            aria-disabled="true"
            className="cursor-default rounded-full border border-[var(--border)] px-3 py-1 text-xs font-light text-[var(--muted)]/70"
          >
            {verb}
          </span>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs">
        {actions.map((action) => (
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
