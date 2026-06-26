'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getCommunityActions,
  getSiteOrigin,
  type Comment,
  type CommunityActionKind,
  type CommunityActionVerb,
  type CommunityObjectRecord,
  type CommunityObjectType,
  type MatchCandidate,
} from '@ai-transformation/shared';

import { getApiClient } from '@/lib/api-client';
import { AgentDeepLinks, AgentHintScript } from '@/components/agent-deep-links';
import { useAuthUser } from '@/lib/use-auth-user';
import { useBookmarks } from '@/lib/use-bookmarks';
import { useCommunityInteractions } from '@/lib/use-community-interactions';
import { askPrefillHref } from '@/lib/ask-prefill';
import { PageShell } from '@/components/page-shell';
import { SaveButton } from '@/components/save-button';
import {
  COMMUNITY_TYPE_LABEL,
  VISIBILITY_LABEL,
  communityTypeFieldEntries,
  communityVerbLabel,
  formatDate,
  isMatchEligible,
  objectTarget,
  objectTitle,
} from '@/lib/object-display';

type LoadState = 'loading' | 'ready' | 'not-found' | 'error';

/**
 * Phase 2 intent verbs that are REAL persisted community actions via
 * `community.actions()`. The on-site Ask companion stays available as a
 * secondary "Draft via Ask" affordance next to each.
 */
const INTENT_ACTION_KINDS = ['offer_help', 'request_mentor', 'ask_for_intro', 'apply'] as const;
type IntentActionKind = (typeof INTENT_ACTION_KINDS)[number];

function isIntentActionKind(verb: CommunityActionVerb): verb is IntentActionKind {
  return (INTENT_ACTION_KINDS as readonly string[]).includes(verb);
}

/** Verbs that only route to the on-site Ask companion with a prefilled prompt (§6). */
const SECONDARY_ASK_VERBS: CommunityActionVerb[] = ['draft_reply', 'turn_into_field_note', 'draft_via_ask'];

const INTENT_DONE_LABEL: Record<IntentActionKind, string> = {
  offer_help: 'Help offered',
  request_mentor: 'Mentor requested',
  ask_for_intro: 'Intro requested',
  apply: 'Applied',
};

const INTENT_PLACEHOLDER: Record<IntentActionKind, string> = {
  offer_help: 'Add a short note about how you can help (optional)',
  request_mentor: "Add a short note about what you're looking for (optional)",
  ask_for_intro: 'Add a short note about the introduction you need (optional)',
  apply: 'Add a short note about your interest (optional)',
};

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
    case 'apply':
      return askPrefillHref('ask', `Help me apply to "${title}" — draft a short expression of interest.`, id);
    case 'request_mentor':
      return askPrefillHref(
        'ask',
        `Help me request mentorship on "${title}" — draft a short note about what I'm looking for.`,
        id,
      );
    case 'ask_for_intro':
      return askPrefillHref('ask', `Help me ask for an introduction related to "${title}".`, id);
    case 'offer_help':
      return askPrefillHref('ask', `Help me offer help on "${title}" — draft a short note about what I can contribute.`, id);
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
  const verbs = getCommunityActions(object.type);
  const intentVerbs = verbs.filter(isIntentActionKind);
  const secondaryAskLinks = verbs.filter((verb) => SECONDARY_ASK_VERBS.includes(verb));
  const fieldEntries = communityTypeFieldEntries(object.type, object.metadata);
  const matchEligible = isMatchEligible(object.type);
  const canonicalUrl = `${getSiteOrigin('org')}/community/${encodeURIComponent(object.id)}`;

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
        </div>
        <h1 className="font-serif mt-3 text-2xl font-normal leading-snug tracking-tight md:text-[1.85rem]">
          {title}
        </h1>
        <p className="mt-3 text-xs font-light text-[var(--secondary)]">Updated {formatDate(object.updatedAt)}</p>

        {fieldEntries.length > 0 ? <TypeFields entries={fieldEntries} /> : null}

        <ActiveActions
          verbs={verbs}
          intentVerbs={intentVerbs}
          secondaryAskLinks={secondaryAskLinks}
          title={title}
          typeLabel={typeLabel}
          objectId={object.id}
          isMember={isMember}
          isLoadingAuth={isLoading}
          target={target}
          bookmarks={bookmarks}
          interactions={interactions}
        />

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

        <div className="mt-4 border-t border-[var(--border)] pt-3 text-xs">
          <AgentDeepLinks title={title} canonicalUrl={canonicalUrl} />
        </div>
      </header>

      <AgentHintScript title={title} canonicalUrl={canonicalUrl} />

      <div className="markdown-body">
        <p className="whitespace-pre-wrap text-[15px] font-light leading-relaxed text-[var(--foreground)]">
          {object.body}
        </p>
      </div>

      {matchEligible ? (
        <MatchPanel
          objectId={object.id}
          type={object.type}
          typeLabel={typeLabel}
          isMember={isMember}
          isLoadingAuth={isLoading}
        />
      ) : null}

      {verbs.includes('reply') ? (
        <ReplyComposer objectId={object.id} isMember={isMember} onPosted={addReply} />
      ) : null}

      <RepliesList replies={replies} />

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

function TypeFields({ entries }: { entries: ReturnType<typeof communityTypeFieldEntries> }) {
  return (
    <dl className="mt-4 grid gap-x-6 gap-y-2 border-t border-[var(--border)] pt-4 sm:grid-cols-[auto_1fr]">
      {entries.map((entry) => (
        <div key={entry.key} className="contents">
          <dt className="text-[11px] font-normal uppercase tracking-wide text-[var(--secondary)] sm:pt-0.5">
            {entry.label}
          </dt>
          <dd className="text-sm font-light text-[var(--foreground)]">
            {entry.key === 'tags' || entry.values.length > 1 ? (
              <span className="flex flex-wrap gap-1.5">
                {entry.values.map((value) => (
                  <span
                    key={value}
                    className="rounded-full border border-[var(--border)] px-2 py-0.5 text-xs font-light text-[var(--muted)]"
                  >
                    {value}
                  </span>
                ))}
              </span>
            ) : (
              <span className="whitespace-pre-wrap">{entry.values[0]}</span>
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function ActiveActions({
  verbs,
  intentVerbs,
  secondaryAskLinks,
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
  intentVerbs: IntentActionKind[];
  secondaryAskLinks: CommunityActionVerb[];
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
            to save, follow, reply, and respond.
          </p>
        ) : null}
      </div>

      {isMember && intentVerbs.length > 0 ? (
        <div className="mt-4 space-y-3">
          {intentVerbs.map((verb) => (
            <IntentAction
              key={verb}
              verb={verb}
              done={interactions.isDone(verb)}
              pending={interactions.isPending(verb)}
              onSubmit={(body) => interactions.act(verb, body)}
              askHref={askLinkFor(verb, title, lowerType, objectId)}
            />
          ))}
        </div>
      ) : null}

      {secondaryAskLinks.length > 0 ? (
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
          <span className="text-[var(--secondary)]">With the on-site agent</span>
          {secondaryAskLinks.map((verb) => (
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

/**
 * A Phase 2 intent verb rendered as a real persisted action. Collapsed to a
 * single button until clicked, then reveals an optional short body field before
 * posting via `community.actions()`. A "Draft via Ask" link stays as a
 * secondary affordance for members who want the agent to write it for them.
 */
function IntentAction({
  verb,
  done,
  pending,
  onSubmit,
  askHref,
}: {
  verb: IntentActionKind;
  done: boolean;
  pending: boolean;
  onSubmit: (body?: string) => Promise<void>;
  askHref: string;
}) {
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState('');
  const label = communityVerbLabel(verb);

  if (done) {
    return (
      <p className="text-sm font-light text-[var(--accent)]">{INTENT_DONE_LABEL[verb]}. The author can follow up with you.</p>
    );
  }

  if (!open) {
    return (
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex min-h-9 items-center rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--accent-fg)] transition hover:opacity-90"
        >
          {label}
        </button>
        <Link
          href={askHref}
          className="text-xs text-[var(--muted)] underline decoration-[var(--border)] underline-offset-4 hover:text-[var(--accent)] hover:decoration-[var(--accent)]"
        >
          Draft via Ask
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-3">
      <label htmlFor={`intent-${verb}`} className="text-xs font-normal uppercase tracking-wide text-[var(--secondary)]">
        {label}
      </label>
      <textarea
        id={`intent-${verb}`}
        value={body}
        onChange={(event) => setBody(event.target.value)}
        rows={3}
        placeholder={INTENT_PLACEHOLDER[verb]}
        className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm outline-none ring-[var(--accent)] transition focus:ring-2"
      />
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void onSubmit(body)}
          disabled={pending}
          className="inline-flex min-h-9 items-center rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--accent-fg)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? 'Sending…' : `Send ${label.toLowerCase()}`}
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setBody('');
          }}
          disabled={pending}
          className="text-xs text-[var(--muted)] underline underline-offset-4 hover:text-[var(--foreground)] disabled:opacity-60"
        >
          Cancel
        </button>
        <Link
          href={askHref}
          className="text-xs text-[var(--muted)] underline decoration-[var(--border)] underline-offset-4 hover:text-[var(--accent)] hover:decoration-[var(--accent)]"
        >
          Draft via Ask
        </Link>
      </div>
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

function MatchPanel({
  objectId,
  type,
  typeLabel,
  isMember,
  isLoadingAuth,
}: {
  objectId: string;
  type: CommunityObjectType;
  typeLabel: string;
  isMember: boolean;
  isLoadingAuth: boolean;
}) {
  const [state, setState] = useState<'idle' | 'loading' | 'ready' | 'empty' | 'error'>('idle');
  const [candidates, setCandidates] = useState<MatchCandidate[]>([]);
  const [note, setNote] = useState('');
  const [llmAssisted, setLlmAssisted] = useState(false);
  const [rerankModel, setRerankModel] = useState('');

  const runMatch = useCallback(async () => {
    setState('loading');
    try {
      const response = await getApiClient().community.match({
        site: 'org',
        objectId,
        type,
        limit: 5,
        useLlmRerank: true,
      });
      setCandidates(response.candidates);
      setNote(response.note ?? '');
      setLlmAssisted(response.llmAssisted);
      setRerankModel(response.rerankModel ?? '');
      setState(response.candidates.length > 0 ? 'ready' : 'empty');
    } catch {
      setState('error');
    }
  }, [objectId, type]);

  return (
    <section
      className="mt-10 rounded-xl border border-dashed border-[var(--accent)]/50 bg-[var(--accent)]/5 p-5 md:p-6"
      aria-labelledby="community-match"
    >
      <div className="flex flex-wrap items-center gap-2">
        <h2 id="community-match" className="font-serif text-lg font-normal tracking-tight">
          Find matches
        </h2>
        <span className="rounded-full border border-[var(--accent)]/50 bg-[var(--accent)]/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[var(--accent)]">
          Experimental
        </span>
      </div>
      <p className="mt-2 max-w-2xl text-sm font-light leading-relaxed text-[var(--muted)]">
        Rule-based suggestions — we rank other community items by shared tags, skills, and type
        compatibility, with a plain-language reason for each. Not a vetted recommendation; use your
        judgment.
      </p>

      {!isMember ? (
        !isLoadingAuth ? (
          <p className="mt-4 text-sm font-light text-[var(--muted)]">
            <Link href="/join" className="text-[var(--accent)] underline underline-offset-4">
              Sign in
            </Link>{' '}
            to find matches for this {typeLabel.toLowerCase()}.
          </p>
        ) : null
      ) : (
        <>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => void runMatch()}
              disabled={state === 'loading'}
              className="inline-flex min-h-9 items-center rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--accent-fg)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {state === 'loading'
                ? 'Finding matches…'
                : state === 'idle'
                  ? 'Find matches'
                  : 'Refresh matches'}
            </button>
            {state === 'error' ? (
              <span role="alert" className="text-sm text-red-700 dark:text-red-200">
                Could not run matching right now. Try again shortly.
              </span>
            ) : null}
          </div>

          {state === 'empty' ? (
            <p className="mt-4 text-sm font-light text-[var(--muted)]">
              No candidate matches yet. As more community items are posted, suggestions will appear here.
            </p>
          ) : null}

          {state === 'ready' ? (
            <>
              {llmAssisted ? (
                <p className="mt-4">
                  <span
                    title={
                      rerankModel
                        ? `Ordering refreshed by ${rerankModel}`
                        : 'Ordering refreshed by a language model'
                    }
                    className="inline-flex items-center gap-1.5 rounded-full border border-[var(--accent)]/50 bg-[var(--accent)]/10 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[var(--accent)]"
                  >
                    Experimental · LLM assist
                    {rerankModel ? (
                      <span className="font-normal normal-case tracking-normal text-[var(--secondary)]">
                        {rerankModel}
                      </span>
                    ) : null}
                  </span>
                </p>
              ) : null}
              {note ? (
                <p className="mt-4 text-xs font-light italic text-[var(--secondary)]">{note}</p>
              ) : null}
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {candidates.map((candidate) => (
                  <MatchCandidateCard key={candidate.objectId} objectId={objectId} candidate={candidate} />
                ))}
              </ul>
            </>
          ) : null}
        </>
      )}
    </section>
  );
}

function MatchCandidateCard({
  objectId,
  candidate,
}: {
  objectId: string;
  candidate: MatchCandidate;
}) {
  const [verdict, setVerdict] = useState<'up' | 'down' | null>(null);
  const candidateTypeLabel = COMMUNITY_TYPE_LABEL[candidate.type] ?? candidate.type;
  const scorePct = Math.round(candidate.score * 100);

  const sendFeedback = useCallback(
    async (next: 'up' | 'down') => {
      setVerdict(next);
      try {
        await getApiClient().community.matchFeedback({
          site: 'org',
          objectId,
          candidateObjectId: candidate.objectId,
          verdict: next,
        });
      } catch {
        // Feedback is best-effort; keep the optimistic state so the user isn't nagged.
      }
    },
    [objectId, candidate.objectId],
  );

  return (
    <li className="flex flex-col rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-normal uppercase tracking-wide text-[var(--secondary)]">
          {candidateTypeLabel}
        </span>
        <span className="text-[11px] font-normal text-[var(--accent)]">{scorePct}% match</span>
      </div>
      <h3 className="font-serif mt-1 text-base font-normal leading-snug tracking-tight text-[var(--foreground)]">
        <Link href={`/community/${encodeURIComponent(candidate.objectId)}`} className="hover:text-[var(--accent)]">
          {candidate.title}
        </Link>
      </h3>
      {candidate.reasons.length > 0 ? (
        <ul className="mt-2 flex-1 space-y-1 text-sm font-light text-[var(--muted)]">
          {candidate.reasons.map((reason) => (
            <li key={reason} className="flex gap-1.5">
              <span aria-hidden className="text-[var(--accent)]">
                •
              </span>
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-3 flex items-center gap-2 border-t border-[var(--border)] pt-3">
        <span className="text-xs font-light text-[var(--secondary)]">Was this useful?</span>
        <FeedbackButton
          label="Mark match helpful"
          symbol="👍"
          active={verdict === 'up'}
          onClick={() => void sendFeedback('up')}
        />
        <FeedbackButton
          label="Mark match unhelpful"
          symbol="👎"
          active={verdict === 'down'}
          onClick={() => void sendFeedback('down')}
        />
      </div>
    </li>
  );
}

function FeedbackButton({
  label,
  symbol,
  active,
  onClick,
}: {
  label: string;
  symbol: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      title={label}
      className={`rounded-full border px-2.5 py-1 text-xs transition ${
        active
          ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
          : 'border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)]'
      }`}
    >
      {symbol}
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

function RepliesList({ replies }: { replies: Comment[] }) {
  return (
    <section className="mt-10 border-t border-[var(--border)] pt-8" aria-labelledby="community-replies">
      <h2 id="community-replies" className="font-serif text-lg font-normal tracking-tight">
        Replies
      </h2>
      {replies.length === 0 ? (
        <p className="mt-3 text-sm font-light text-[var(--muted)]">No replies yet.</p>
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
