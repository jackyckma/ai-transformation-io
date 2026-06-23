'use client';

import { useEffect, useMemo, useState } from 'react';

type StoryStatus = 'reviewed' | 'published' | 'featured' | 'archived' | 'spam';

type ModerationStory = {
  id: string;
  title: string;
  body: string;
  name?: string | null;
  email: string;
  status: StoryStatus;
  publishedSlug?: string | null;
  createdAt: string;
};

type ModerationResponse = {
  ok: true;
  stories: ModerationStory[];
};

type StoryPatchResponse = {
  ok?: boolean;
  story?: ModerationStory;
  error?: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

const STATUS_LABELS: Record<StoryStatus, string> = {
  reviewed: 'Reviewed',
  published: 'Published',
  featured: 'Featured',
  archived: 'Archived',
  spam: 'Spam',
};

const STATUS_ORDER: StoryStatus[] = ['reviewed', 'published', 'featured', 'archived', 'spam'];

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

function slugify(text: string): string {
  const normalized = text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 72)
    .replace(/^-+|-+$/g, '');
  return normalized || 'story';
}

export function ModerationPanel() {
  const [stories, setStories] = useState<ModerationStory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [accessDenied, setAccessDenied] = useState(false);
  const [actingStoryId, setActingStoryId] = useState<string | null>(null);
  const [actionError, setActionError] = useState('');

  async function loadModerationQueue() {
    setIsLoading(true);
    setError('');
    setAccessDenied(false);

    try {
      const authResponse = await fetch(`${API_BASE}/api/auth/me`, {
        credentials: 'include',
      });
      if (authResponse.ok) {
        await authResponse.json().catch(() => null);
      }

      const response = await fetch(`${API_BASE}/api/stories/moderation`, {
        credentials: 'include',
      });

      if (response.status === 401 || response.status === 403) {
        setAccessDenied(true);
        setStories([]);
        return;
      }

      if (!response.ok) {
        setError('Unable to load moderation queue right now. Please try again shortly.');
        return;
      }

      const payload = (await response.json()) as ModerationResponse;
      setStories(payload.stories ?? []);
    } catch {
      setError('Unable to reach the server. Please try again shortly.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadModerationQueue();
  }, []);

  const groupedStories = useMemo(() => {
    const groups: Record<StoryStatus, ModerationStory[]> = {
      reviewed: [],
      published: [],
      featured: [],
      archived: [],
      spam: [],
    };

    for (const story of stories) {
      groups[story.status].push(story);
    }

    return groups;
  }, [stories]);

  async function updateStatus(story: ModerationStory, status: StoryStatus) {
    setActingStoryId(story.id);
    setActionError('');

    try {
      const patchBody: { status: StoryStatus; publishedSlug?: string } = { status };
      if (status === 'published' || status === 'featured') {
        patchBody.publishedSlug = story.publishedSlug ?? slugify(story.title);
      }

      const response = await fetch(`${API_BASE}/api/stories/${story.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(patchBody),
      });

      if (response.status === 401 || response.status === 403) {
        setAccessDenied(true);
        return;
      }

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as StoryPatchResponse | null;
        setActionError(payload?.error ?? 'Failed to update story status. Please try again.');
        return;
      }

      const payload = (await response.json()) as StoryPatchResponse;
      if (!payload.ok || !payload.story) {
        setActionError('Failed to update story status. Please try again.');
        return;
      }

      const nextStory = payload.story;
      setStories((prev) => prev.map((item) => (item.id === story.id ? nextStory : item)));
    } catch {
      setActionError('Unable to reach the server. Please try again shortly.');
    } finally {
      setActingStoryId(null);
    }
  }

  return (
    <section className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 md:p-8">
      <header className="border-b border-[var(--border)] pb-6">
        <p className="text-xs font-light tracking-wide text-[var(--muted)]">Community</p>
        <h1 className="mt-3 font-serif text-3xl font-normal tracking-tight md:text-4xl">Moderation</h1>
        <p className="mt-4 max-w-2xl text-sm font-light leading-relaxed text-[var(--muted)]">
          Review submissions, curate what is highlighted, and keep the hub useful for everyone.
        </p>
      </header>

      <div className="mt-8">
        {isLoading ? (
          <p className="text-sm font-light text-[var(--muted)]">Loading moderation queue…</p>
        ) : null}

        {!isLoading && accessDenied ? (
          <p className="text-sm font-light text-[var(--muted)]">You do not have moderation access.</p>
        ) : null}

        {!isLoading && !accessDenied && error ? (
          <div className="space-y-4">
            <p role="alert" className="text-sm text-red-700 dark:text-red-200">
              {error}
            </p>
            <button
              type="button"
              onClick={() => void loadModerationQueue()}
              className="inline-flex items-center rounded-full border border-[var(--border)] px-4 py-2 text-sm font-light text-[var(--foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              Retry
            </button>
          </div>
        ) : null}

        {!isLoading && !accessDenied && !error ? (
          <div className="space-y-8">
            {actionError ? (
              <p role="alert" className="text-sm text-red-700 dark:text-red-200">
                {actionError}
              </p>
            ) : null}

            {STATUS_ORDER.map((status) => {
              const items = groupedStories[status];
              return (
                <section key={status} className="space-y-4">
                  <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
                    <h2 className="font-serif text-xl font-normal tracking-tight">{STATUS_LABELS[status]}</h2>
                    <span className="text-xs font-light tracking-wide text-[var(--muted)]">
                      {items.length}
                    </span>
                  </div>

                  {items.length === 0 ? (
                    <p className="text-sm font-light text-[var(--muted)]">No stories in this status.</p>
                  ) : (
                    <ul className="space-y-4">
                      {items.map((story) => (
                        <li
                          key={story.id}
                          className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-5"
                        >
                          <article>
                            <header className="space-y-2">
                              <h3 className="font-serif text-lg font-normal tracking-tight">{story.title}</h3>
                              <p className="text-xs font-light tracking-wide text-[var(--muted)]">
                                {story.name?.trim() || 'Community member'} · {story.email} ·{' '}
                                {formatDate(story.createdAt)} · {STATUS_LABELS[story.status]}
                              </p>
                            </header>
                            <p className="mt-4 whitespace-pre-wrap text-sm font-light leading-relaxed text-[var(--muted)]">
                              {story.body}
                            </p>
                            <div className="mt-5 flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => void updateStatus(story, 'published')}
                                disabled={actingStoryId === story.id}
                                className="rounded-full border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                Publish
                              </button>
                              <button
                                type="button"
                                onClick={() => void updateStatus(story, 'featured')}
                                disabled={actingStoryId === story.id}
                                className="rounded-full border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                Feature
                              </button>
                              <button
                                type="button"
                                onClick={() => void updateStatus(story, 'archived')}
                                disabled={actingStoryId === story.id}
                                className="rounded-full border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                Archive
                              </button>
                              <button
                                type="button"
                                onClick={() => void updateStatus(story, 'spam')}
                                disabled={actingStoryId === story.id}
                                className="rounded-full border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--foreground)] transition hover:border-red-400 hover:text-red-700 dark:hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                Mark spam
                              </button>
                            </div>
                          </article>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              );
            })}
          </div>
        ) : null}
      </div>
    </section>
  );
}
