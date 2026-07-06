'use client';

import { useEffect, useMemo, useState } from 'react';
import type { EditorialAgentReview, ObjectSubtype } from '@ai-transformation/shared';
import { editorialAgentReviewSchema, resolveClientApiUrl } from '@ai-transformation/shared';

import { formatDate, subtypeLabel } from '@/lib/object-display';
import {
  DIMENSION_LABEL,
  SUBSTANCE_DIMENSION_ORDER,
  dimensionTier,
  formatAgentReviewComment,
  hasEditorialGatekeeperFlags,
  isMarketingFlag,
  isTechnicalFlag,
  resolveEditorialReviewProfile,
  reviewBarBannerClass,
  reviewBarLevelPillClass,
  reviewHeadlineHint,
  reviewHeadlineTier,
  REVIEW_BAR_LEVEL_LABEL,
  tierCardBorderClass,
  tierPillClass,
  tierTextClass,
  type EditorialReviewProfile,
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

type EditorialQueueFilter =
  | 'all'
  | 'knowledge'
  | 'community'
  | 'discussion'
  | 'gatekeeper'
  | 'needs_agent_review';

type SiteFilter = 'all' | 'io' | 'org';

const QUEUE_FILTERS: Array<{ id: EditorialQueueFilter; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'knowledge', label: 'Knowledge' },
  { id: 'community', label: 'Community' },
  { id: 'discussion', label: 'Discussions' },
  { id: 'gatekeeper', label: 'Gatekeeper' },
  { id: 'needs_agent_review', label: 'Needs agent review' },
];

const SITE_FILTERS: Array<{ id: SiteFilter; label: string }> = [
  { id: 'all', label: 'Both sites' },
  { id: 'org', label: '.org' },
  { id: 'io', label: '.io' },
];

function matchesQueueFilter(draft: EditorialDraft, filter: EditorialQueueFilter): boolean {
  const review = readAgentReview(draft.metadata);
  switch (filter) {
    case 'all':
      return true;
    case 'knowledge':
      return draft.objectType === 'knowledge';
    case 'community':
      return draft.objectType === 'community';
    case 'discussion':
      return draft.objectType === 'community' && draft.type === 'discussion';
    case 'gatekeeper':
      return Boolean(review && !('skipped' in review) && hasEditorialGatekeeperFlags(review.flags));
    case 'needs_agent_review':
      return !review || 'skipped' in review;
    default:
      return true;
  }
}

function matchesSiteFilter(draft: EditorialDraft, site: SiteFilter): boolean {
  if (site === 'all') {
    return true;
  }
  return draft.site === site;
}

function countForFilter(drafts: EditorialDraft[], filter: EditorialQueueFilter, site: SiteFilter): number {
  return drafts.filter((draft) => matchesSiteFilter(draft, site) && matchesQueueFilter(draft, filter)).length;
}

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
  const [queueFilter, setQueueFilter] = useState<EditorialQueueFilter>('all');
  const [siteFilter, setSiteFilter] = useState<SiteFilter>('all');

  const filteredDrafts = useMemo(
    () =>
      drafts.filter(
        (draft) => matchesSiteFilter(draft, siteFilter) && matchesQueueFilter(draft, queueFilter),
      ),
    [drafts, queueFilter, siteFilter],
  );

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

  async function act(draft: EditorialDraft, action: 'approve' | 'reject', comment: string) {
    setActingId(draft.id);
    setActionError('');
    try {
      const trimmed = comment.trim();
      const res = await fetch(
        `${apiBase()}/api/internal/editorial/drafts/${encodeURIComponent(draft.id)}/${action}`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(trimmed ? { comment: trimmed } : {}),
        },
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
          Run agent review to score pending drafts and surface flags. Review bars differ by type —
          knowledge articles are strict; community discussions are lighter. Vendor or product marketing
          copy is a gatekeeper reject. Agent review never changes publish state.
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
              <>
                <EditorialQueueFilters
                  drafts={drafts}
                  queueFilter={queueFilter}
                  siteFilter={siteFilter}
                  onQueueFilterChange={setQueueFilter}
                  onSiteFilterChange={setSiteFilter}
                  showingCount={filteredDrafts.length}
                />
                {filteredDrafts.length === 0 ? (
                  <p className="text-sm font-light text-[var(--muted)]">
                    No drafts match this filter. Try another batch or clear filters.
                  </p>
                ) : (
                  <ul className="space-y-4">
                    {filteredDrafts.map((draft) => (
                      <DraftCard
                        key={draft.id}
                        draft={draft}
                        acting={actingId === draft.id}
                        onApprove={(comment) => void act(draft, 'approve', comment)}
                        onReject={(comment) => void act(draft, 'reject', comment)}
                      />
                    ))}
                  </ul>
                )}
              </>
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
  onApprove: (comment: string) => void;
  onReject: (comment: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [detail, setDetail] = useState<EditorialDraftDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [comment, setComment] = useState('');
  const [commentTouched, setCommentTouched] = useState(false);

  const agentReview = readAgentReview(draft.metadata);
  const reviewProfile = resolveEditorialReviewProfile(draft.objectType, draft.type);

  useEffect(() => {
    setComment('');
    setCommentTouched(false);
  }, [draft.id]);

  useEffect(() => {
    if (commentTouched) {
      return;
    }
    if (!agentReview || 'skipped' in agentReview || !agentReview.summary.trim()) {
      return;
    }
    setComment(formatAgentReviewComment(agentReview));
  }, [agentReview, commentTouched, draft.id]);

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
  const cardTier =
    agentReview && !('skipped' in agentReview)
      ? reviewHeadlineTier(agentReview, reviewProfile)
      : null;

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
              <ReviewHeadlineBadge review={agentReview} profile={reviewProfile} />
            ) : null}
          </div>
          <p className="text-xs font-light tracking-wide text-[var(--muted)]">
            {OBJECT_TYPE_LABEL[draft.objectType] ?? draft.objectType} ·{' '}
            {subtypeLabel(draft.type as ObjectSubtype)} · {SITE_LABEL[draft.site] ?? draft.site} ·{' '}
            {formatDate(draft.createdAt)}
            {sourceLabel(draft.metadata) ? ` · ${sourceLabel(draft.metadata)}` : ''}
          </p>
          <ReviewProfileBanner profile={reviewProfile} />
        </header>
        {agentReview ? (
          <AgentReviewBlock review={agentReview} profile={reviewProfile} />
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
        <div className="mt-5">
          <label
            htmlFor={`editorial-comment-${draft.id}`}
            className="text-[11px] font-normal uppercase tracking-wide text-[var(--muted)]"
          >
            Editorial comment
          </label>
          <p className="mt-1 text-xs font-light text-[var(--muted)]">
            Optional feedback for the submitting agent. Run agent review to pre-fill from the model
            summary — edit before you approve or reject.
          </p>
          <textarea
            id={`editorial-comment-${draft.id}`}
            value={comment}
            onChange={(event) => {
              setCommentTouched(true);
              setComment(event.target.value);
            }}
            rows={5}
            disabled={acting}
            placeholder="Notes for the author agent (e.g. what to fix, what worked)…"
            className="mt-2 w-full resize-y rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm font-light leading-relaxed text-[var(--foreground)] placeholder:text-[var(--secondary)] focus:border-[var(--accent)] focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <ActionButton
            label={detailLoading ? 'Loading…' : expanded ? 'Show excerpt' : 'View full article'}
            onClick={() => void toggleExpanded()}
            disabled={acting || detailLoading}
          />
          <ActionButton label="Approve" onClick={() => onApprove(comment)} disabled={acting} />
          <ActionButton label="Reject" onClick={() => onReject(comment)} disabled={acting} danger />
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

function EditorialQueueFilters({
  drafts,
  queueFilter,
  siteFilter,
  onQueueFilterChange,
  onSiteFilterChange,
  showingCount,
}: {
  drafts: EditorialDraft[];
  queueFilter: EditorialQueueFilter;
  siteFilter: SiteFilter;
  onQueueFilterChange: (filter: EditorialQueueFilter) => void;
  onSiteFilterChange: (site: SiteFilter) => void;
  showingCount: number;
}) {
  return (
    <div className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--background)] p-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-normal uppercase tracking-wide text-[var(--muted)]">
            Batch filter
          </p>
          <p className="mt-1 text-sm font-light text-[var(--foreground)]">
            Showing {showingCount} of {drafts.length} draft{drafts.length === 1 ? '' : 's'}
          </p>
        </div>
        {(queueFilter !== 'all' || siteFilter !== 'all') && (
          <button
            type="button"
            onClick={() => {
              onQueueFilterChange('all');
              onSiteFilterChange('all');
            }}
            className="text-xs font-light text-[var(--accent)] underline-offset-2 hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {QUEUE_FILTERS.map((item) => {
          const count = countForFilter(drafts, item.id, siteFilter);
          const active = queueFilter === item.id;
          return (
            <FilterChip
              key={item.id}
              label={item.label}
              count={count}
              active={active}
              onClick={() => onQueueFilterChange(item.id)}
            />
          );
        })}
      </div>
      <div className="flex flex-wrap items-center gap-2 border-t border-[var(--border)] pt-3">
        <span className="text-[11px] font-normal uppercase tracking-wide text-[var(--muted)]">Site</span>
        {SITE_FILTERS.map((item) => {
          const active = siteFilter === item.id;
          const displayCount =
            item.id === 'all'
              ? drafts.length
              : drafts.filter((draft) => draft.site === item.id).length;
          return (
            <FilterChip
              key={item.id}
              label={item.label}
              count={displayCount}
              active={active}
              onClick={() => onSiteFilterChange(item.id)}
              compact
            />
          );
        })}
      </div>
    </div>
  );
}

function FilterChip({
  label,
  count,
  active,
  onClick,
  compact = false,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
        active
          ? 'border-[var(--accent)] bg-[var(--accent)]/12 text-[var(--foreground)]'
          : 'border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)]/50 hover:text-[var(--foreground)]'
      } ${compact ? 'py-1' : ''}`}
    >
      <span>{label}</span>
      <span
        className={`rounded-full px-1.5 py-0.5 text-[10px] font-normal tabular-nums ${
          active ? 'bg-[var(--background)]/80' : 'bg-[var(--card)]'
        }`}
      >
        {count}
      </span>
    </button>
  );
}

function ReviewProfileBanner({ profile }: { profile: EditorialReviewProfile }) {
  return (
    <div
      className={`mt-3 rounded-xl border-2 px-4 py-3.5 ${reviewBarBannerClass(profile.barLevel)}`}
      role="note"
      aria-label={`Review bar: ${profile.label}`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${reviewBarLevelPillClass(profile.barLevel)}`}
        >
          {REVIEW_BAR_LEVEL_LABEL[profile.barLevel]}
        </span>
        <span className="font-serif text-base font-normal tracking-tight text-[var(--foreground)]">
          {profile.label}
        </span>
      </div>
      <p className="mt-2 text-sm font-medium leading-snug text-[var(--foreground)]">{profile.barSummary}</p>
      <p className="mt-1.5 text-xs font-light leading-relaxed text-[var(--muted)]">{profile.founderNote}</p>
    </div>
  );
}

function ReviewHeadlineBadge({
  review,
  profile,
}: {
  review: Exclude<EditorialAgentReview, { skipped: true }>;
  profile: EditorialReviewProfile;
}) {
  const tier = reviewHeadlineTier(review, profile);
  const label =
    review.substance_score !== undefined
      ? `${review.substance_score}/15`
      : `${review.score}/100`;

  return (
    <span
      className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium ${tierPillClass(tier)}`}
      title={reviewHeadlineHint(review, profile)}
    >
      {review.substance_score !== undefined ? `Substance ${label}` : `Score ${label}`}
    </span>
  );
}

function AgentReviewBlock({
  review,
  profile,
}: {
  review: EditorialAgentReview;
  profile: EditorialReviewProfile;
}) {
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

  const tier = reviewHeadlineTier(review, profile);
  const hasDimensions = Boolean(review.dimensions);
  const gatekeeper = hasEditorialGatekeeperFlags(review.flags);

  return (
    <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3">
      {gatekeeper ? (
        <p
          role="status"
          className="mb-3 rounded-lg border border-red-600/35 bg-red-50 px-3 py-2 text-xs font-light text-red-800 dark:border-red-500/40 dark:bg-red-950/30 dark:text-red-200"
        >
          Gatekeeper — vendor or product marketing detected. We are not a vendor marketplace; reject
          unless you strip promotional copy.
        </p>
      ) : null}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] font-normal uppercase tracking-wide text-[var(--secondary)]">Agent review</p>
        <ReviewHeadlineBadge review={review} profile={profile} />
      </div>
      <p className={`mt-1 text-xs font-light ${tierTextClass(tier)}`}>{reviewHeadlineHint(review, profile)}</p>
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
            const marketing = isMarketingFlag(flag);
            return (
              <li
                key={flag}
                className={`rounded-full border px-2 py-0.5 text-[11px] font-light ${
                  severe
                    ? tierPillClass('weak')
                    : 'border-[var(--border)] text-[var(--secondary)]'
                }`}
              >
                {marketing ? `Gatekeeper: ${flag}` : flag}
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
