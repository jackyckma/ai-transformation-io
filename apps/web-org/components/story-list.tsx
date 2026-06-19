'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

type Story = {
  id: string;
  title: string;
  body: string;
  name?: string | null;
  publishedSlug?: string | null;
  createdAt: string;
  featured: boolean;
};

type StoriesResponse = {
  ok: true;
  stories: Story[];
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
const EXCERPT_LIMIT = 420;

function excerpt(body: string): string {
  const normalized = body.trim();
  if (normalized.length <= EXCERPT_LIMIT) {
    return normalized;
  }
  return `${normalized.slice(0, EXCERPT_LIMIT - 1).trimEnd()}…`;
}

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

export function StoryList() {
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadStories() {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE}/api/stories`);
      if (!response.ok) {
        setError('Unable to load stories right now. Please try again shortly.');
        return;
      }

      const payload = (await response.json()) as StoriesResponse;
      setStories(payload.stories ?? []);
    } catch {
      setError('Unable to reach the server. Please try again shortly.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadStories();
  }, []);

  const storyCountLabel = useMemo(() => {
    if (stories.length === 1) {
      return '1 published story';
    }
    return `${stories.length} published stories`;
  }, [stories.length]);

  return (
    <section className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 md:p-8">
      <header className="border-b border-[var(--border)] pb-6">
        <p className="text-xs font-light tracking-wide text-[var(--muted)]">Harvest Hub</p>
        <h1 className="mt-3 font-serif text-3xl font-normal tracking-tight md:text-4xl">
          Community stories
        </h1>
        <p className="mt-4 max-w-2xl text-sm font-light leading-relaxed text-[var(--muted)]">
          Field notes from teams navigating AI transformation in real work.
        </p>
      </header>

      <div className="mt-8">
        {isLoading ? (
          <p className="text-sm font-light text-[var(--muted)]">Loading stories…</p>
        ) : null}

        {!isLoading && error ? (
          <div className="space-y-4">
            <p role="alert" className="text-sm text-red-700 dark:text-red-200">
              {error}
            </p>
            <button
              type="button"
              onClick={() => void loadStories()}
              className="inline-flex items-center rounded-full border border-[var(--border)] px-4 py-2 text-sm font-light text-[var(--foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              Retry
            </button>
          </div>
        ) : null}

        {!isLoading && !error && stories.length === 0 ? (
          <div className="space-y-4">
            <p className="text-sm font-light text-[var(--muted)]">
              No stories published yet — be the first to share.
            </p>
            <Link
              href="/stories/submit"
              className="inline-flex items-center rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--accent-fg)] transition hover:opacity-90"
            >
              Share your story
            </Link>
          </div>
        ) : null}

        {!isLoading && !error && stories.length > 0 ? (
          <div className="space-y-6">
            <p className="text-xs font-light tracking-wide text-[var(--muted)]">{storyCountLabel}</p>
            <ul className="space-y-5">
              {stories.map((story) => (
                <li key={story.id} className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-5">
                  <article>
                    <header className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-serif text-xl font-normal tracking-tight">{story.title}</h2>
                        {story.featured ? (
                          <span className="rounded-full border border-[var(--accent)] bg-[var(--accent)]/10 px-2.5 py-0.5 text-xs font-medium text-[var(--accent)]">
                            Featured
                          </span>
                        ) : null}
                      </div>
                      <p className="text-xs font-light tracking-wide text-[var(--muted)]">
                        {story.name?.trim() || 'Community member'} · {formatDate(story.createdAt)}
                      </p>
                    </header>
                    <p className="mt-4 whitespace-pre-wrap text-sm font-light leading-relaxed text-[var(--muted)]">
                      {excerpt(story.body)}
                    </p>
                  </article>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      <footer className="mt-10 border-t border-[var(--border)] pt-6 text-sm font-light text-[var(--muted)]">
        Want to contribute your own perspective?{' '}
        <Link href="/stories/submit" className="text-[var(--accent)] underline underline-offset-4">
          Submit a story
        </Link>
        .
      </footer>
    </section>
  );
}
