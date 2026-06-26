'use client';

import { useCallback, useEffect, useState } from 'react';
import type { CommunityActionKind, CommunityInteractionKind } from '@ai-transformation/shared';

import { getApiClient } from '@/lib/api-client';

type ToggleKind = Extract<CommunityInteractionKind, 'follow' | 'join'>;

/** Every kind whose done/pending state this hook tracks: the Wave 13 interactions plus Wave 14 intent actions. */
type TrackedKind = CommunityInteractionKind | CommunityActionKind;

type CommunityInteractionsState = {
  ready: boolean;
  isDone: (kind: TrackedKind) => boolean;
  isPending: (kind: TrackedKind) => boolean;
  toggle: (kind: ToggleKind) => Promise<void>;
  offerHelp: (body?: string) => Promise<void>;
  act: (kind: CommunityActionKind, body?: string) => Promise<void>;
  error: string;
};

/**
 * Loads the signed-in member's follow/join/offer state for one community object
 * and exposes optimistic toggles via the shared community client. Inert when
 * `enabled` is false so guest UI can omit the actions without extra branching.
 * `userId` distinguishes the member's own interactions from others returned by
 * the listing endpoint.
 */
export function useCommunityInteractions(
  objectId: string,
  { enabled, userId }: { enabled: boolean; userId?: string | null },
): CommunityInteractionsState {
  const [done, setDone] = useState<Set<TrackedKind>>(new Set());
  const [pending, setPending] = useState<Set<TrackedKind>>(new Set());
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!enabled || !objectId) {
      setReady(false);
      setDone(new Set());
      return;
    }
    let cancelled = false;
    setReady(false);
    void (async () => {
      try {
        const response = await getApiClient().community.listInteractions({ site: 'org', objectId });
        if (cancelled) return;
        const next = new Set<TrackedKind>();
        for (const interaction of response.interactions) {
          if (!userId || interaction.userId === userId) {
            next.add(interaction.kind);
          }
        }
        setDone(next);
      } catch {
        if (!cancelled) setDone(new Set());
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [objectId, enabled, userId]);

  const isDone = useCallback((kind: TrackedKind) => done.has(kind), [done]);
  const isPending = useCallback((kind: TrackedKind) => pending.has(kind), [pending]);

  const startPending = useCallback((kind: TrackedKind) => {
    setPending((prev) => new Set(prev).add(kind));
    setError('');
  }, []);

  const endPending = useCallback((kind: TrackedKind) => {
    setPending((prev) => {
      const next = new Set(prev);
      next.delete(kind);
      return next;
    });
  }, []);

  const toggle = useCallback(
    async (kind: ToggleKind) => {
      if (!enabled) return;
      startPending(kind);
      const currentlyDone = done.has(kind);
      try {
        const client = getApiClient().community;
        if (kind === 'follow') {
          if (currentlyDone) {
            await client.unfollow({ site: 'org', objectId, kind: 'follow' });
          } else {
            await client.follow({ site: 'org', objectId, kind: 'follow' });
          }
        } else if (currentlyDone) {
          await client.leave({ site: 'org', objectId, kind: 'join' });
        } else {
          await client.join({ site: 'org', objectId, kind: 'join' });
        }
        setDone((prev) => {
          const next = new Set(prev);
          if (currentlyDone) {
            next.delete(kind);
          } else {
            next.add(kind);
          }
          return next;
        });
      } catch {
        setError('Could not update that action. Try again shortly.');
      } finally {
        endPending(kind);
      }
    },
    [done, enabled, objectId, startPending, endPending],
  );

  const offerHelp = useCallback(
    async (body?: string) => {
      if (!enabled || done.has('offer_help')) return;
      startPending('offer_help');
      try {
        const trimmed = body?.trim();
        await getApiClient().community.offerHelp({
          site: 'org',
          objectId,
          kind: 'offer_help',
          ...(trimmed ? { body: trimmed } : {}),
        });
        setDone((prev) => new Set(prev).add('offer_help'));
      } catch {
        setError('Could not record your offer. Try again shortly.');
      } finally {
        endPending('offer_help');
      }
    },
    [done, enabled, objectId, startPending, endPending],
  );

  /**
   * Posts a Phase 2 intent verb (request_mentor, ask_for_intro, apply, …) as a
   * real persisted community action. The listing endpoint only returns
   * follow/offer_help/join, so the done state for the other kinds is tracked
   * optimistically for this session.
   */
  const act = useCallback(
    async (kind: CommunityActionKind, body?: string) => {
      if (!enabled || done.has(kind)) return;
      startPending(kind);
      try {
        const trimmed = body?.trim();
        await getApiClient().community.actions({
          site: 'org',
          objectId,
          kind,
          ...(trimmed ? { body: trimmed } : {}),
        });
        setDone((prev) => new Set(prev).add(kind));
      } catch {
        setError('Could not record that action. Try again shortly.');
      } finally {
        endPending(kind);
      }
    },
    [done, enabled, objectId, startPending, endPending],
  );

  return { ready, isDone, isPending, toggle, offerHelp, act, error };
}
