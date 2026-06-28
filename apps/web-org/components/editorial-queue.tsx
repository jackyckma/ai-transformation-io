'use client';

import { useEffect, useState } from 'react';
import type { EditorialAgentReview, ObjectSubtype } from '@ai-transformation/shared';
import { editorialAgentReviewSchema, resolveClientApiUrl } from '@ai-transformation/shared';

import { formatDate, subtypeLabel } from '@/lib/object-display';
import {
  DIMENSION_LABEL,
  SUBSTANCE_DIMENSION_ORDER,
  dimensionTier,
  isTechnicalFlag,
  reviewHeadlineTier,
  substanceBandHint,
  tierCardBorderClass,
  tierPillClass,
  tierTextClass,
} from '@/lib/editorial-review-display';

type EditorialDraft = {
  id: string;
  objectType: string;
  type: string;
  site: string;
  title: string | null;
  bodyExcerpt: string;
  status: string;
  visibility: string;
  publishedSlug: string | null;
  createdAt: string;
  metadata?: Record<string, unknown> | null;
};

type EditorialDraftDetail = EditorialDraft & {
  body: string;
  updatedAt: string;
};

const ACCESS_DENIED = /\b40[13]\b/;

const SITE_LABEL: Record<string, string> = {
  io: 'ai-transformation.io',
  org: 'ai-transformation.org',
};

const OBJECT_TYPE_LABEL: Record<string, string> = {
  knowledge: 'Knowledge',
  community: 'Community',
};

const SOURCE_LABEL: Record<string, string> = {
  admin_session: 'Admin draft',
  bearer: 'Agent draft',
};

function apiBase(): string {
  return resolveClientApiUrl('/').replace(/\/$/, '');
}

function draftHeading(draft: EditorialDraft): string {
  const heading = draft.title?.trim();
  if (heading) {
    return heading;
  }
  const excerpt = draft.bodyExcerpt.trim();
  if (!excerpt) {
    return 'Untitled draft';
  }
  return excerpt.length > 80 ? `${excerpt.slice(0, 79)}…` : excerpt;
}

function sourceLabel(metadata: EditorialDraft['metadata']): string | null {
  const source = metadata?.editorial_source;
  if (typeof source !== 'string') {
    return null;
  }
  return SOURCE_LABEL[source] ?? source;
}

function readAgentReview(metadata: EditorialDraft['metadata']): EditorialAgentReview | null {
  const raw = metadata?.editorial_agent;
  if (!raw || typeof raw !== 'object') {
    return null;
  }
  const parsed = editorialAgentReviewSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}

export function EditorialQueue() {
  const [drafts, setDrafts] = useState<EditorialDraft[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [accessDenied, setAccessDenied] = useState(false);
  const [actingId, setActingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState('');
  const [reviewing, setReviewing] = useState(false);
  const [reviewError, setReviewError] = useState('');

  async function loadQueue() {
    setIsLoading(true);
    setError('');
    setAccessDenied(false);
    try {
      const res = await fetch(`${apiBase()}/api/internal/editorial/drafts`, {
        credentials: 'include',
      });
      if (!res.ok) {
        throw new Error(`Editorial drafts request failed: ${res.status}`);
      }
      const body = (await res.json()) as { ok: boolean; drafts?: EditorialDraft[] };
      setDrafts(body.drafts ?? []);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : '';
      if (ACCESS_DENIED.test(message)) {
        setAccessDenied(true);
        setDrafts([]);
      } else {
        setError('Unable to load the editorial queue right now. Please try again shortly.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadQueue();
  }, []);

  async function runAgentReview() {
    setReviewing(true);
    setReviewError('');
    try {
      const res = await fetch(`${apiBase()}/api/internal/editorial/review-pending`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) {
        throw new Error(`Agent review failed: ${res.status}`);
      }
      await loadQueue();
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : '';
      if (ACCESS_DENIED.test(message)) {
        setAccessDenied(true);
        return;
      }
      setReviewError("Couldn't run the agent review. Please try again.");
    } finally {
      setReviewing(false);
    }
  }

  async function act(draft: EditorialDraft, action: 'approve' | 'reject') {
    setActingId(draft.id);
    setActionError('');
    try {
      const res = await fetch(
        `${apiBase()}/api/internal/editorial/drafts/${encodeURIComponent(draft.id)}/${action}`,
        { method: 'POST', credentials: 'include' },
      );
      if (!res.ok) {
        throw new Error(`Editorial ${action} failed: ${res.status}`);
      }
      setDrafts((prev) => prev.filter((current) => current.id !== draft.id));
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : '';
      if (ACCESS_DENIED.test(message)) {
        setAccessDenied(true);
        return;
      }
      setActionError(`Couldn't ${action} this draft. Please try again.`);
    } finally {
      setActingId(null);
    }
  }

  return (
    <section className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 md:p-8">
      <header className="border-b border-[var(--border)] pb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-light tracking-wide text-[var(--muted)]">Editorial</p>
            <h1 className="mt-3 font-serif text-3xl font-normal tracking-tight md:text-4xl">Editorial drafts</h1>
          </div>
          <button
            type="button"
            onClick={() => void runAgentReview()}
            disabled={reviewing}
            className="inline-flex items-center rounded-full border border-[var(--border)] px-4 py-2 text-xs font-medium text-[var(--foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {reviewing ? 'Running agent review…' : 'Run agent review'}
          </button>
        </div>
        <p className="mt-4 max-w-2xl text-sm font-light leading-relaxed text-[var(--muted)]">
          Review drafts ingested for the knowledge commons before they go live. Approve to publish, or
          reject to archive — both sites share this queue.
        </p>
        <p className="mt-2 max-w-2xl text-xs font-light leading-relaxed text-[var(--muted)]">
          Run agent review to score pending drafts and surface flags. It never changes publish state.
        </p>
        {reviewError ? (
          <p role="alert" className="mt-3 text-sm text-red-700 dark:text-red-200">
            {reviewError}
          </p>
        ) : null}
      </header>

      <div className="mt-8">
        {isLoading ? (
          <p className="text-sm font-light text-[var(--muted)]">Loading editorial queue…</p>
        ) : null}

        {!isLoading && accessDenied ? (
          <p className="text-sm font-light text-[var(--muted)]">You do not have editorial access.</p>
        ) : null}

        {!isLoading && !accessDenied && error ? (
          <div className="space-y-4">
            <p role="alert" className="text-sm text-red-700 dark:text-red-200">
              {error}
            </p>
            <button
              type="button"
              onClick={() => void loadQueue()}
              className="inline-flex items-center rounded-full border border-[var(--border)] px-4 py-2 text-sm font-light text-[var(--foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              Retry
            </button>
          </div>
        ) : null}

        {!isLoading && !accessDenied && !error ? (
          <div className="space-y-6">
            {actionError ? (
              <p role="alert" className="text-sm text-red-700 dark:text-red-200">
                {actionError}
              </p>
            ) : null}

            {drafts.length === 0 ? (
              <p className="text-sm font-light text-[var(--muted)]">
                No drafts waiting for review. New editorial drafts will appear here.
              </p>
            ) : (
              <ul className="space-y-4">
                {drafts.map((draft) => (
                  <DraftCard
                    key={draft.id}
                    draft={draft}
                    acting={actingId === draft.id}
                    onApprove={() => void act(draft, 'approve')}
                    onReject={() => void act(draft, 'reject')}
                  />
                ))}
              </ul>
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function DraftCard({
  draft,
  acting,
  onApprove,
  onReject,
}: {
  draft: EditorialDraft;
  acting: boolean;
  onApprove: () => void;
  onReject: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [detail, setDetail] = useState<EditorialDraftDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');

  async function loadDetail() {
    if (detail) {
      setExpanded(true);
      return;
    }
    setDetailLoading(true);
    setDetailError('');
    try {
      const res = await fetch(
        `${apiBase()}/api/internal/editorial/drafts/${encodeURIComponent(draft.id)}`,
        { credentials: 'include' },
      );
      if (!res.ok) {
        throw new Error(`Editorial draft detail failed: ${res.status}`);
      }
      const body = (await res.json()) as { ok: boolean; draft?: EditorialDraftDetail };
      if (!body.draft) {
        throw new Error('Missing draft payload');
      }
      setDetail(body.draft);
      setExpanded(true);
    } catch {
      setDetailError('Could not load the full article. Please try again.');
    } finally {
      setDetailLoading(false);
    }
  }

  function toggleExpanded() {
    if (expanded) {
      setExpanded(false);
      return;
    }
    void loadDetail();
  }

  const bodyText = expanded && detail ? detail.body : draft.bodyExcerpt;
  const agentReview = readAgentReview(draft.metadata);
  const cardTier =
    agentReview && !('skipped' in agentReview) ? reviewHeadlineTier(agentReview) : null;

  return (
    <li
      className={`rounded-2xl border bg-[var(--background)] p-5 ${
        cardTier ? tierCardBorderClass(cardTier) : 'border-[var(--border)]'
      }`}
    >
      <article>
        <header className="space-y-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h2 className="font-serif text-lg font-normal tracking-tight">{draftHeading(draft)}</h2>
            {agentReview && !('skipped' in agentReview) ? (
              <ReviewHeadlineBadge review={agentReview} />
            ) : null}
          </div>
          <p className="text-xs font-light tracking-wide text-[var(--muted)]">
            {OBJECT_TYPE_LABEL[draft.objectType] ?? draft.objectType} ·{' '}
            {subtypeLabel(draft.type as ObjectSubtype)} · {SITE_LABEL[draft.site] ?? draft.site} ·{' '}
            {formatDate(draft.createdAt)}
            {sourceLabel(draft.metadata) ? ` · ${sourceLabel(draft.metadata)}` : ''}
          </p>
        </header>
        {agentReview ? (
          <AgentReviewBlock review={agentReview} />
        ) : (
          <p className="mt-4 text-xs font-light text-[var(--muted)]">
            No agent metrics yet — run agent review to score this draft.
          </p>
        )}
        <div
          className={`mt-4 whitespace-pre-wrap text-sm font-light leading-relaxed text-[var(--foreground)] ${
            expanded ? 'max-h-[min(70vh,32rem)] overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--card)] p-4' : 'text-[var(--muted)]'
          }`}
        >
          {bodyText}
        </div>
        {detailError ? (
          <p role="alert" className="mt-2 text-xs text-red-700 dark:text-red-200">
            {detailError}
          </p>
        ) : null}
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <ActionButton
            label={detailLoading ? 'Loading…' : expanded ? 'Show excerpt' : 'View full article'}
            onClick={() => void toggleExpanded()}
            disabled={acting || detailLoading}
          />
          <ActionButton label="Approve" onClick={onApprove} disabled={acting} />
          <ActionButton label="Reject" onClick={onReject} disabled={acting} danger />
        </div>
      </article>
    </li>
  );
}

const DIMENSION_SHORT_LABEL: Record<string, string> = {
  claim_density: 'Claims',
  specificity: 'Specificity',
  argument_coherence: 'Coherence',
  falsifiable_stance: 'Stance',
  first_hand: 'First-hand',
};

function ReviewHeadlineBadge({
  review,
}: {
  review: Exclude<EditorialAgentReview, { skipped: true }>;
}) {
  const tier = reviewHeadlineTier(review);
  const label =
    review.substance_score !== undefined
      ? `${review.substance_score}/15`
      : `${review.score}/100`;

  return (
    <span
      className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium ${tierPillClass(tier)}`}
      title={substanceBandHint(tier)}
    >
      {review.substance_score !== undefined ? `Substance ${label}` : `Score ${label}`}
    </span>
  );
}

function AgentReviewBlock({ review }: { review: EditorialAgentReview }) {
  if ('skipped' in review) {
    return (
      <div className="mt-4 rounded-xl border border-dashed border-[var(--border)] bg-[var(--card)] px-4 py-3">
        <p className="text-[11px] font-normal uppercase tracking-wide text-[var(--muted)]">Agent review</p>
        <p className="mt-1 text-xs font-light text-[var(--muted)]">
          Agent review skipped{review.reason ? ` · ${review.reason}` : ''}
        </p>
      </div>
    );
  }

  const tier = reviewHeadlineTier(review);
  const hasDimensions = Boolean(review.dimensions);

  return (
    <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] font-normal uppercase tracking-wide text-[var(--secondary)]">Agent review</p>
        <ReviewHeadlineBadge review={review} />
      </div>
      <p className={`mt-1 text-xs font-light ${tierTextClass(tier)}`}>{substanceBandHint(tier)}</p>
      {review.substance_score !== undefined ? (
        <p className="mt-1 text-[11px] font-light text-[var(--secondary)]">
          Queue score {review.score}/100
        </p>
      ) : null}

      {hasDimensions && review.dimensions ? (
        <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {SUBSTANCE_DIMENSION_ORDER.map((key) => {
            const value = review.dimensions![key];
            const dimTier = dimensionTier(value);
            return (
              <li
                key={key}
                className={`rounded-lg border px-2 py-1.5 text-center text-[11px] font-medium leading-tight ${tierPillClass(dimTier)}`}
                title={DIMENSION_LABEL[key]}
              >
                <span className="block text-[10px] font-normal uppercase tracking-wide opacity-80">
                  {DIMENSION_SHORT_LABEL[key] ?? key}
                </span>
                <span className="mt-0.5 block text-sm">{value}/3</span>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-2 text-xs font-light text-amber-900 dark:text-amber-200">
          Re-run agent review for per-dimension substance metrics.
        </p>
      )}

      {review.summary ? (
        <p className="mt-3 text-sm font-light leading-relaxed text-[var(--muted)]">{review.summary}</p>
      ) : null}
      {review.flags.length > 0 ? (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {review.flags.map((flag) => {
            const severe = isTechnicalFlag(flag);
            return (
              <li
                key={flag}
                className={`rounded-full border px-2 py-0.5 text-[11px] font-light ${
                  severe
                    ? tierPillClass('weak')
                    : 'border-[var(--border)] text-[var(--secondary)]'
                }`}
              >
                {flag}
              </li>
            );
          })}
        </ul>
      ) : null}
      {review.model ? (
        <p className="mt-2 text-[11px] font-light text-[var(--secondary)]">Reviewed by {review.model}</p>
      ) : null}
    </div>
  );
}

function ActionButton({
  label,
  onClick,
  disabled,
  danger = false,
}: {
  label: string;
  onClick: () => void;
  disabled: boolean;
  danger?: boolean;
}) {
  const hover = danger
    ? 'hover:border-red-400 hover:text-red-700 dark:hover:text-red-300'
    : 'hover:border-[var(--accent)] hover:text-[var(--accent)]';
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-full border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--foreground)] transition ${hover} disabled:cursor-not-allowed disabled:opacity-60`}
    >
      {label}
    </button>
  );
}
