'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  getCommunityActions,
  type CommunityActionVerb,
  type CommunityObjectRecord,
  type CommunityObjectType,
} from '@ai-transformation/shared';
import { CompanionAskStrip } from '@ai-transformation/chat-ui';

import { useAuthUser } from '@/lib/use-auth-user';
import { useBookmarks } from '@/lib/use-bookmarks';
import { useCommunityInteractions } from '@/lib/use-community-interactions';
import { getApiClient } from '@/lib/api-client';
import { SaveButton } from '@/components/save-button';
import {
  COMMUNITY_TYPE_LABEL,
  VISIBILITY_LABEL,
  communityHref,
  communityVerbLabel,
  formatDate,
  isMatchEligible,
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

/**
 * Verbs that point the reader to the detail page's primary action, in priority
 * order. Phase 2 intent verbs (request_mentor, apply, ask_for_intro) surface as
 * a primary affordance on the card; `reply` covers discussions and questions.
 */
const CARD_PRIMARY_VERBS: CommunityActionVerb[] = ['reply', 'request_mentor', 'apply', 'ask_for_intro'];

function cardPrimaryVerb(type: CommunityObjectType): CommunityActionVerb | null {
  const verbs = getCommunityActions(type);
  return CARD_PRIMARY_VERBS.find((verb) => verbs.includes(verb)) ?? null;
}

export function CommunityHighlights() {
  const { user, audience } = useAuthUser();
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

      <div className="mb-8">
        <CompanionAskStrip site="org" />
      </div>

      {state === 'loading' ? <CommunitySkeleton /> : null}

      {hasLiveObjects ? (
        <ul className="grid gap-4 sm:grid-cols-2">
          {objects.map((object) => (
            <ObjectCard
              key={object.id}
              object={object}
              isMember={isMember}
              userId={user?.id}
              bookmarks={bookmarks}
            />
          ))}
        </ul>
      ) : null}

      {state === 'ready' && !hasLiveObjects ? (
        <FallbackHighlights
          note="No live community posts yet. These editor's picks show the kind of activity that lives here:"
        />
      ) : null}

      {state === 'error' ? (
        <FallbackHighlights
          note="The live community feed is unavailable right now. In the meantime, here are editor's picks:"
        />
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
            ? 'Open any item to reply, follow, offer help, join, request a mentor, or apply. Use Find Help to post a request, or Ask to draft a contribution. Opportunity items also have experimental rule-based matching.'
            : 'Posting and one-click actions require an account. Until then, browse highlights, or use Ask to draft a reply or contribution.'}
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
  userId,
  bookmarks,
}: {
  object: CommunityObjectRecord;
  isMember: boolean;
  userId?: string | null;
  bookmarks: ReturnType<typeof useBookmarks>;
}) {
  const title = objectTitle(object);
  const target = objectTarget(object);
  const typeLabel = COMMUNITY_TYPE_LABEL[object.type] ?? object.type;
  const verbs = getCommunityActions(object.type);
  const interactions = useCommunityInteractions(object.id, {
    enabled: isMember,
    userId,
  });
  const detailHref = communityHref(object.id);
  const primaryVerb = cardPrimaryVerb(object.type);
  const openLabel = primaryVerb ? communityVerbLabel(primaryVerb) : 'Open';
  const primaryIsIntent =
    primaryVerb === 'request_mentor' || primaryVerb === 'apply' || primaryVerb === 'ask_for_intro';
  const matchEligible = isMatchEligible(object.type);

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
        <Link href={detailHref} className="hover:text-[var(--accent)]">
          {title}
        </Link>
      </h3>
      <p className="mt-2 flex-1 text-sm font-light leading-relaxed text-[var(--muted)]">
        {objectExcerpt(object.body)}
      </p>
      <p className="mt-3 text-xs font-light text-[var(--secondary)]">
        Updated {formatDate(object.updatedAt)}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[var(--border)] pt-3">
        {isMember && verbs.includes('save') ? (
          <SaveButton
            target={target}
            title={title}
            saved={bookmarks.isSaved(target)}
            pending={bookmarks.isPending(target)}
            onToggle={bookmarks.toggle}
          />
        ) : null}
        {isMember && verbs.includes('follow') ? (
          <CardActionButton
            active={interactions.isDone('follow')}
            pending={interactions.isPending('follow')}
            activeLabel="Following"
            idleLabel="Follow"
            onClick={() => void interactions.toggle('follow')}
          />
        ) : null}
        {isMember && verbs.includes('join') ? (
          <CardActionButton
            active={interactions.isDone('join')}
            pending={interactions.isPending('join')}
            activeLabel="Leave"
            idleLabel="Join"
            onClick={() => void interactions.toggle('join')}
          />
        ) : null}
        {isMember && verbs.includes('offer_help') ? (
          <CardActionButton
            active={interactions.isDone('offer_help')}
            pending={interactions.isPending('offer_help')}
            activeLabel="Help offered"
            idleLabel="Offer help"
            onClick={() => void interactions.offerHelp()}
            disabledWhenActive
          />
        ) : null}
        <Link
          href={detailHref}
          className={
            primaryIsIntent
              ? 'rounded-full bg-[var(--accent)] px-3 py-1 text-xs font-medium text-[var(--accent-fg)] transition hover:opacity-90'
              : 'rounded-full border border-[var(--border)] px-3 py-1 text-xs font-medium text-[var(--foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]'
          }
        >
          {openLabel}
        </Link>
        {matchEligible ? (
          <Link
            href={`${detailHref}#community-match`}
            title="Experimental rule-based matching"
            className="rounded-full border border-dashed border-[var(--accent)]/50 px-3 py-1 text-xs font-medium text-[var(--accent)] transition hover:bg-[var(--accent)]/10"
          >
            Find matches · experimental
          </Link>
        ) : null}
      </div>

      {interactions.error ? (
        <p role="alert" className="mt-3 text-xs text-red-700 dark:text-red-200">
          {interactions.error}
        </p>
      ) : null}
    </li>
  );
}

function CardActionButton({
  active,
  pending,
  activeLabel,
  idleLabel,
  onClick,
  disabledWhenActive = false,
}: {
  active: boolean;
  pending: boolean;
  activeLabel: string;
  idleLabel: string;
  onClick: () => void;
  disabledWhenActive?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending || (disabledWhenActive && active)}
      aria-pressed={active}
      className={`rounded-full border px-3 py-1 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${
        active
          ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
          : 'border-[var(--border)] text-[var(--foreground)] hover:border-[var(--accent)] hover:text-[var(--accent)]'
      }`}
    >
      {pending ? 'Saving…' : active ? activeLabel : idleLabel}
    </button>
  );
}

function CommunitySkeleton() {
  return (
    <ul className="grid gap-4 sm:grid-cols-2" aria-hidden>
      {Array.from({ length: 4 }).map((_, index) => (
        <li
          key={index}
          className="flex flex-col rounded-xl border border-[var(--border)] bg-[var(--card)] p-5"
        >
          <div className="flex items-center gap-2">
            <span className="h-4 w-20 rounded-full bg-[var(--border)] motion-safe:animate-pulse" />
            <span className="h-4 w-14 rounded-full bg-[var(--border)] motion-safe:animate-pulse" />
          </div>
          <span className="mt-3 h-5 w-3/4 rounded bg-[var(--border)] motion-safe:animate-pulse" />
          <span className="mt-3 h-4 w-full rounded bg-[var(--border)] motion-safe:animate-pulse" />
          <span className="mt-2 h-4 w-5/6 rounded bg-[var(--border)] motion-safe:animate-pulse" />
          <span className="mt-4 h-3 w-24 rounded bg-[var(--border)] motion-safe:animate-pulse" />
        </li>
      ))}
    </ul>
  );
}

function FallbackHighlights({ note }: { note: string }) {
  return (
    <section aria-labelledby="community-editors-picks">
      <div className="mb-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2
          id="community-editors-picks"
          className="text-xs font-normal uppercase tracking-[0.12em] text-[var(--secondary)]"
        >
          Editor&rsquo;s picks
        </h2>
        <p className="text-sm font-light text-[var(--muted)]">{note}</p>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2">
        {COMMUNITY_HIGHLIGHTS.map((item) => (
          <SampleCard key={item.id} item={item} />
        ))}
      </ul>
    </section>
  );
}

function SampleCard({ item }: { item: CommunityHighlight }) {
  const typeMeta = COMMUNITY_TYPE_META[item.type];

  return (
    <li className="flex flex-col rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
      <div className="flex items-center gap-2">
        <span className="rounded-full border border-[var(--accent)]/40 bg-[var(--accent)]/10 px-2.5 py-0.5 text-[11px] font-normal uppercase tracking-wide text-[var(--accent)]">
          {typeMeta.label}
        </span>
        <span className="text-[11px] font-normal uppercase tracking-wide text-[var(--secondary)]">
          public
        </span>
        <span className="text-[11px] font-normal uppercase tracking-wide text-[var(--secondary)]">
          featured
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
            aria-disabled="true"
            title="Example action — appears on live items"
            className="cursor-default rounded-full border border-[var(--border)] px-3 py-1 text-xs font-light text-[var(--muted)]/70"
          >
            {verb}
          </span>
        ))}
      </div>
    </li>
  );
}
