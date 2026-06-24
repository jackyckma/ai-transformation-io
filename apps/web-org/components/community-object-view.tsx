'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getCommunityActions,
  isCommunityPhase2ReservedType,
  type Comment,
  type CommunityActionVerb,
  type CommunityObjectRecord,
} from '@ai-transformation/shared';

import { getApiClient } from '@/lib/api-client';
import { useAuthUser } from '@/lib/use-auth-user';
import { useBookmarks } from '@/lib/use-bookmarks';
import { useCommunityInteractions } from '@/lib/use-community-interactions';
import { askPrefillHref } from '@/lib/ask-prefill';
import { PageShell } from '@/components/page-shell';
import { SaveButton } from '@/components/save-button';
import {
  COMMUNITY_TYPE_LABEL,
  VISIBILITY_LABEL,
  communityVerbLabel,
  formatDate,
  objectTarget,
  objectTitle,
} from '@/lib/object-display';

type LoadState = 'loading' | 'ready' | 'not-found' | 'error';

const ASK_VERBS: CommunityActionVerb[] = ['draft_reply', 'turn_into_field_note', 'draft_via_ask'];

function askLinkFor(verb: CommunityActionVerb, title: string, typeLabel: string, id: string) {
  switch (verb) {
    case 'turn_into_field_note':
      return askPrefillHref(
        'submit',
        `Turn the ${typeLabel} "${title}" into a field note for the knowledge commons.`,
        id,
      );
    case 'draft_via_ask':
      return askPrefillHref('ask', `Help me draft a response to "${title}" and submit it via the agent.`, id);
    default:
      return askPrefillHref('ask', `Draft a thoughtful reply to the community ${typeLabel} "${title}".`, id);
  }
}

export function CommunityObjectView({ id }: { id: string }) {
  const { user, audience, isLoading } = useAuthUser();
  const isMember = audience === 'member';
  const [object, setObject] = useState<CommunityObjectRecord | null>(null);
  const [replies, setReplies] = useState<Comment[]>([]);
  const [state, setState] = useState<LoadState>('loading');
  const bookmarks = useBookmarks(isMember);
  const interactions = useCommunityInteractions(id, { enabled: isMember, userId: user?.id });
  const recordedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    setState('loading');
    void (async () => {
      try {
        const response = await getApiClient().community.getWithReplies(id);
        if (cancelled) return;
        setObject(response.object);
        setReplies(response.replies);
        setState('ready');
      } catch (error) {
        if (cancelled) return;
        const message = error instanceof Error ? error.message : '';
        setState(/\b40[34]\b/.test(message) ? 'not-found' : 'error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!isMember || state !== 'ready' || recordedRef.current) {
      return;
    }
    recordedRef.current = true;
    void getApiClient()
      .recentlyViewed.create({ site: 'org', target: { targetType: 'object', targetId: id } })
      .catch(() => undefined);
  }, [id, isMember, state]);

  const addReply = useCallback((comment: Comment) => {
    setReplies((prev) => [comment, ...prev]);
  }, []);

  if (state === 'loading') {
    return (
      <PageShell>
        <p className="text-sm font-light text-[var(--muted)]">Loading…</p>
      </PageShell>
    );
  }

  if (state === 'not-found') {
    return (
      <PageShell>
        <h1 className="font-serif text-2xl font-normal tracking-tight">Not available</h1>
        <p className="mt-3 text-sm font-light text-[var(--muted)]">
          This item is not public, or you need to sign in to view it.
        </p>
        <BackLink />
      </PageShell>
    );
  }

  if (state === 'error' || !object) {
    return (
      <PageShell>
        <h1 className="font-serif text-2xl font-normal tracking-tight">Community</h1>
        <p className="mt-3 text-sm font-light text-[var(--muted)]">
          We could not load this item right now. Please try again shortly.
        </p>
        <BackLink />
      </PageShell>
    );
  }

  const title = objectTitle(object);
  const target = objectTarget(object);
  const typeLabel = COMMUNITY_TYPE_LABEL[object.type] ?? object.type;
  const reserved = isCommunityPhase2ReservedType(object.type);
  const verbs = getCommunityActions(object.type);
  const askLinks = verbs.filter((verb) => ASK_VERBS.includes(verb));

  return (
    <PageShell as="article">
      <header className="mb-8 rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 md:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-[var(--accent)]/40 bg-[var(--accent)]/10 px-2.5 py-0.5 text-[11px] font-normal uppercase tracking-wide text-[var(--accent)]">
            {typeLabel}
          </span>
          <span className="text-[11px] font-normal uppercase tracking-wide text-[var(--secondary)]">
            {VISIBILITY_LABEL[object.visibility]}
          </span>
          {reserved ? (
            <span className="rounded-full border border-[var(--border)] px-2.5 py-0.5 text-[11px] font-normal uppercase tracking-wide text-[var(--secondary)]">
              Reserved
            </span>
          ) : null}
        </div>
        <h1 className="font-serif mt-3 text-2xl font-normal leading-snug tracking-tight md:text-[1.85rem]">
          {title}
        </h1>
        <p className="mt-3 text-xs font-light text-[var(--secondary)]">Updated {formatDate(object.updatedAt)}</p>

        {reserved ? (
          <ReservedActions verbs={verbs} />
        ) : (
          <ActiveActions
            verbs={verbs}
            askLinks={askLinks}
            title={title}
            typeLabel={typeLabel}
            objectId={object.id}
            isMember={isMember}
            isLoadingAuth={isLoading}
            target={target}
            bookmarks={bookmarks}
            interactions={interactions}
          />
        )}

        {bookmarks.error ? (
          <p role="alert" className="mt-3 text-sm text-red-700 dark:text-red-200">
            {bookmarks.error}
          </p>
        ) : null}
        {interactions.error ? (
          <p role="alert" className="mt-3 text-sm text-red-700 dark:text-red-200">
            {interactions.error}
          </p>
        ) : null}
      </header>

      <div className="markdown-body">
        <p className="whitespace-pre-wrap text-[15px] font-light leading-relaxed text-[var(--foreground)]">
          {object.body}
        </p>
      </div>

      {!reserved && verbs.includes('reply') ? (
        <ReplyComposer objectId={object.id} isMember={isMember} onPosted={addReply} />
      ) : null}

      {!reserved && verbs.includes('offer_help') ? (
        <OfferHelpComposer
          isMember={isMember}
          offered={interactions.isDone('offer_help')}
          pending={interactions.isPending('offer_help')}
          onOffer={interactions.offerHelp}
        />
      ) : null}

      <RepliesList replies={replies} reserved={reserved} />

      <BackLink />
    </PageShell>
  );
}

function BackLink() {
  return (
    <Link
      href="/community"
      className="mt-12 inline-block text-sm font-light text-[var(--muted)] hover:text-[var(--foreground)]"
    >
      ← All community
    </Link>
  );
}

function ReservedActions({ verbs }: { verbs: readonly CommunityActionVerb[] }) {
  return (
    <div className="mt-5 border-t border-[var(--border)] pt-4">
      <p className="text-xs font-light text-[var(--secondary)]">
        This community type is reserved. These actions are coming soon and are not active yet.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {verbs.map((verb) => (
          <span
            key={verb}
            aria-disabled="true"
            title="Reserved · coming soon"
            className="cursor-default rounded-full border border-dashed border-[var(--border)] px-3 py-1 text-xs font-light text-[var(--muted)]/70"
          >
            {communityVerbLabel(verb)} · coming soon
          </span>
        ))}
      </div>
    </div>
  );
}

function ActiveActions({
  verbs,
  askLinks,
  title,
  typeLabel,
  objectId,
  isMember,
  isLoadingAuth,
  target,
  bookmarks,
  interactions,
}: {
  verbs: readonly CommunityActionVerb[];
  askLinks: CommunityActionVerb[];
  title: string;
  typeLabel: string;
  objectId: string;
  isMember: boolean;
  isLoadingAuth: boolean;
  target: ReturnType<typeof objectTarget>;
  bookmarks: ReturnType<typeof useBookmarks>;
  interactions: ReturnType<typeof useCommunityInteractions>;
}) {
  const lowerType = typeLabel.toLowerCase();
  return (
    <div className="mt-5 border-t border-[var(--border)] pt-4">
      <div className="flex flex-wrap items-center gap-2">
        {isMember ? (
          <>
            {verbs.includes('save') ? (
              <SaveButton
                target={target}
                title={title}
                saved={bookmarks.isSaved(target)}
                pending={bookmarks.isPending(target)}
                onToggle={bookmarks.toggle}
              />
            ) : null}
            {verbs.includes('follow') ? (
              <InteractionButton
                active={interactions.isDone('follow')}
                pending={interactions.isPending('follow')}
                activeLabel="Following"
                idleLabel="Follow"
                onClick={() => void interactions.toggle('follow')}
              />
            ) : null}
            {verbs.includes('join') ? (
              <InteractionButton
                active={interactions.isDone('join')}
                pending={interactions.isPending('join')}
                activeLabel="Leave"
                idleLabel="Join"
                onClick={() => void interactions.toggle('join')}
              />
            ) : null}
          </>
        ) : !isLoadingAuth ? (
          <p className="text-sm font-light text-[var(--muted)]">
            <Link href="/join" className="text-[var(--accent)] underline underline-offset-4">
              Sign in
            </Link>{' '}
            to save, follow, and reply.
          </p>
        ) : null}
      </div>

      {askLinks.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs">
          {askLinks.map((verb) => (
            <Link
              key={verb}
              href={askLinkFor(verb, title, lowerType, objectId)}
              className="text-[var(--muted)] underline decoration-[var(--border)] underline-offset-4 hover:text-[var(--accent)] hover:decoration-[var(--accent)]"
            >
              {communityVerbLabel(verb)}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function InteractionButton({
  active,
  pending,
  activeLabel,
  idleLabel,
  onClick,
}: {
  active: boolean;
  pending: boolean;
  activeLabel: string;
  idleLabel: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
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

function ReplyComposer({
  objectId,
  isMember,
  onPosted,
}: {
  objectId: string;
  isMember: boolean;
  onPosted: (comment: Comment) => void;
}) {
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function submit() {
    const trimmed = body.trim();
    if (trimmed.length === 0) {
      setError('Write a reply before posting.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const response = await getApiClient().community.reply({ site: 'org', objectId, body: trimmed });
      onPosted(response.comment);
      setBody('');
    } catch {
      setError('Could not post your reply. Please try again shortly.');
    } finally {
      setSubmitting(false);
    }
  }

  if (!isMember) {
    return (
      <section className="mt-10 border-t border-[var(--border)] pt-8">
        <h2 className="font-serif text-lg font-normal tracking-tight">Reply</h2>
        <p className="mt-3 text-sm font-light text-[var(--muted)]">
          <Link href="/join" className="text-[var(--accent)] underline underline-offset-4">
            Sign in
          </Link>{' '}
          to join the conversation.
        </p>
      </section>
    );
  }

  return (
    <section className="mt-10 border-t border-[var(--border)] pt-8" aria-labelledby="community-reply">
      <h2 id="community-reply" className="font-serif text-lg font-normal tracking-tight">
        Reply
      </h2>
      <div className="mt-4 space-y-3">
        <label htmlFor="community-reply-input" className="sr-only">
          Add a public reply
        </label>
        <textarea
          id="community-reply-input"
          value={body}
          onChange={(event) => {
            setBody(event.target.value);
            setError('');
          }}
          rows={4}
          placeholder="Add a public reply"
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none ring-[var(--accent)] transition focus:ring-2"
        />
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => void submit()}
            disabled={submitting}
            className="inline-flex min-h-9 items-center rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--accent-fg)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Posting…' : 'Post reply'}
          </button>
          {error ? (
            <span role="alert" className="text-sm text-red-700 dark:text-red-200">
              {error}
            </span>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function OfferHelpComposer({
  isMember,
  offered,
  pending,
  onOffer,
}: {
  isMember: boolean;
  offered: boolean;
  pending: boolean;
  onOffer: (body?: string) => Promise<void>;
}) {
  const [body, setBody] = useState('');

  if (!isMember) {
    return (
      <section className="mt-10 border-t border-[var(--border)] pt-8">
        <h2 className="font-serif text-lg font-normal tracking-tight">Offer help</h2>
        <p className="mt-3 text-sm font-light text-[var(--muted)]">
          <Link href="/join" className="text-[var(--accent)] underline underline-offset-4">
            Sign in
          </Link>{' '}
          to offer help on this request.
        </p>
      </section>
    );
  }

  return (
    <section className="mt-10 border-t border-[var(--border)] pt-8" aria-labelledby="community-offer">
      <h2 id="community-offer" className="font-serif text-lg font-normal tracking-tight">
        Offer help
      </h2>
      {offered ? (
        <p className="mt-3 text-sm font-light text-[var(--accent)]">
          You offered to help. The author can follow up with you.
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          <label htmlFor="community-offer-input" className="sr-only">
            How can you help?
          </label>
          <textarea
            id="community-offer-input"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            rows={3}
            placeholder="Add a short note about how you can help (optional)"
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none ring-[var(--accent)] transition focus:ring-2"
          />
          <button
            type="button"
            onClick={() => void onOffer(body)}
            disabled={pending}
            className="inline-flex min-h-9 items-center rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--accent-fg)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? 'Sending…' : 'Offer help'}
          </button>
        </div>
      )}
    </section>
  );
}

function RepliesList({ replies, reserved }: { replies: Comment[]; reserved: boolean }) {
  return (
    <section className="mt-10 border-t border-[var(--border)] pt-8" aria-labelledby="community-replies">
      <h2 id="community-replies" className="font-serif text-lg font-normal tracking-tight">
        Replies
      </h2>
      {replies.length === 0 ? (
        <p className="mt-3 text-sm font-light text-[var(--muted)]">
          {reserved ? 'Replies open when this type ships.' : 'No replies yet.'}
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {replies.map((reply) => (
            <li
              key={reply.id}
              className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 text-sm font-light text-[var(--muted)]"
            >
              <p className="whitespace-pre-wrap">{reply.body}</p>
              <p className="mt-2 text-xs font-light text-[var(--secondary)]">{formatDate(reply.createdAt)}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
