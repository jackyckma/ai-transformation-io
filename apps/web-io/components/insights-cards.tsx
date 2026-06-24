'use client';

import { useEffect, useMemo, useState } from 'react';
import type { AssessmentGapId } from '@ai-transformation/shared';

import { OpenInAsk } from '@/components/open-in-ask';
import { SaveToContext } from '@/components/save-to-context';
import { getApiClient } from '@/lib/api-client';
import { insightAskActions } from '@/lib/ask-actions';
import { INSIGHT_KIND_LABEL, IO_INSIGHTS } from '@/lib/insights-data';
import {
  canPersonalizeInsights,
  rankInsights,
  type RankedInsight,
} from '@/lib/insights-recommendations';
import { useOnboardingProfile } from '@/lib/onboarding-profile';
import { useAuthUser } from '@/lib/use-auth-user';

/** Curated order used for logged-out, loading, and signal-free states. */
const STATIC_RANKED: RankedInsight[] = IO_INSIGHTS.map((card) => ({
  card,
  score: 0,
  reasons: [],
}));

export function InsightsCards() {
  const { user } = useAuthUser();
  const { profile } = useOnboardingProfile();
  const [weakestGap, setWeakestGap] = useState<AssessmentGapId | null>(null);

  useEffect(() => {
    if (!user) {
      setWeakestGap(null);
      return;
    }
    let cancelled = false;
    void getApiClient()
      .getAssessmentSession()
      .then((res) => {
        if (cancelled) return;
        setWeakestGap(res.session?.lastScore?.weakestGap.id ?? null);
      })
      .catch(() => {
        // Backend unreachable — fall back to profile-only personalization.
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const personalized = Boolean(user) && canPersonalizeInsights({ profile, weakestGap });

  const ranked = useMemo(() => {
    if (!personalized) return STATIC_RANKED;
    return rankInsights(IO_INSIGHTS, { profile, weakestGap });
  }, [personalized, profile, weakestGap]);

  return (
    <div>
      {personalized ? (
        <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/5 px-3 py-1 text-xs font-light text-[var(--secondary)]">
          <span
            className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--accent)]"
            aria-hidden
          />
          Personalized for your role
        </p>
      ) : null}
      <ul className="space-y-5">
        {ranked.map(({ card, reasons }) => (
          <li
            key={card.id}
            className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 md:p-6"
          >
            <div className="flex items-center gap-2 text-[11px] font-normal uppercase tracking-[0.12em] text-[var(--secondary)]">
              <span>{INSIGHT_KIND_LABEL[card.kind]}</span>
              <span aria-hidden>·</span>
              <span>{card.source}</span>
            </div>
            <h2 className="font-serif mt-2 text-xl font-normal leading-snug tracking-tight">
              <a
                href={card.href}
                rel="noopener noreferrer"
                className="text-[var(--foreground)] transition hover:text-[var(--accent)]"
              >
                {card.title}
              </a>
            </h2>
            <p className="mt-3 text-sm font-light leading-relaxed text-[var(--muted)]">
              {card.summary}
            </p>
            <p className="mt-3 border-l-2 border-[var(--accent)]/40 pl-3 text-sm font-light italic leading-relaxed text-[var(--foreground)]">
              What this means: {card.interpretation}
            </p>
            {reasons.length ? (
              <ul className="mt-4 flex flex-wrap gap-1.5">
                {reasons.map((reason) => (
                  <li
                    key={reason}
                    className="rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/5 px-2 py-0.5 text-[11px] font-light text-[var(--secondary)]"
                  >
                    {reason}
                  </li>
                ))}
              </ul>
            ) : null}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <OpenInAsk contextId={card.id} actions={insightAskActions(card.title, card.source)} />
              <SaveToContext target={{ targetType: 'object', targetId: card.id }} title={card.title} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
