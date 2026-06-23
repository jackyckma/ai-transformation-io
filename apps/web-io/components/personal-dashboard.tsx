'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import type { ContentPageMeta } from '@ai-transformation/content';

import { OpenInAsk } from '@/components/open-in-ask';
import { OnboardingFields } from '@/components/onboarding-fields';
import { libraryAskActions } from '@/lib/ask-actions';
import { useOnboardingProfile } from '@/lib/onboarding-profile';
import { rankArticles } from '@/lib/recommendations';
import { useRecentlyViewed } from '@/lib/recently-viewed';
import type { AuthUser } from '@/lib/use-auth-user';

type PersonalDashboardProps = {
  user: AuthUser;
  pages: ContentPageMeta[];
  curatedSlugs: string[];
};

export function PersonalDashboard({ user, pages, curatedSlugs }: PersonalDashboardProps) {
  const { profile, isLoaded } = useOnboardingProfile();
  const recent = useRecentlyViewed();

  const recommended = useMemo(() => {
    const recentPillars = recent
      .map((entry) => pages.find((page) => page.slug === entry.slug)?.pillar)
      .filter((value): value is ContentPageMeta['pillar'] => Boolean(value));
    return rankArticles(pages, { profile, curatedSlugs, recentPillars }).slice(0, 5);
  }, [pages, profile, curatedSlugs, recent]);

  const greetingName = user.name?.trim() || user.email.split('@')[0];

  return (
    <div className="space-y-10">
      <header>
        <p className="text-xs font-normal uppercase tracking-[0.12em] text-[var(--secondary)]">
          Personal dashboard
        </p>
        <h1 className="font-serif mt-2 text-2xl font-normal tracking-tight md:text-[1.85rem]">
          Welcome back, {greetingName}
        </h1>
        <p className="mt-3 max-w-2xl text-sm font-light leading-relaxed text-[var(--muted)]">
          {profile
            ? `Recommendations tuned for ${profile.role} in ${profile.industry}.`
            : 'Add your role and industry to tune what we surface first.'}
        </p>
      </header>

      {isLoaded && !profile ? (
        <section className="rounded-xl border border-[var(--accent)]/30 bg-[var(--card)] p-5 md:p-6">
          <h2 className="font-serif text-lg font-normal tracking-tight">
            Personalize your recommendations
          </h2>
          <p className="mt-2 text-sm font-light leading-relaxed text-[var(--muted)]">
            Two quick fields. We use them to rank the library and insights for you.
          </p>
          <div className="mt-5 max-w-md">
            <OnboardingFields submitLabel="Save and personalize" />
          </div>
        </section>
      ) : null}

      <section>
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="font-serif text-lg font-normal tracking-tight">Recommended for you</h2>
          <Link
            href="/library"
            className="text-sm font-light text-[var(--secondary)] hover:text-[var(--foreground)]"
          >
            All library →
          </Link>
        </div>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {recommended.map(({ page }) => (
            <li
              key={page.slug}
              className="flex flex-col rounded-xl border border-[var(--border)] bg-[var(--card)] p-4"
            >
              <Link href={page.pathname} className="group">
                <h3 className="font-serif text-base font-normal leading-snug tracking-tight text-[var(--foreground)] transition group-hover:text-[var(--accent)]">
                  {page.title}
                </h3>
                <p className="mt-2 text-sm font-light leading-relaxed text-[var(--muted)]">
                  {page.description}
                </p>
              </Link>
              <OpenInAsk
                contextId={page.slug}
                actions={libraryAskActions(page.title).slice(0, 1)}
                className="mt-3"
              />
            </li>
          ))}
        </ul>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <DashboardCard
          title="Three Gaps assessment"
          body="Measure work redesign, governance, and value. Saved progress lives in Your progress."
          href="/insights/assessment"
          cta="Open assessment"
        />
        <DashboardCard
          title="Your progress"
          body="Pick up a saved assessment or review your latest radar."
          href="/progress"
          cta="View progress"
        />
      </section>
    </div>
  );
}

function DashboardCard({
  title,
  body,
  href,
  cta,
}: {
  title: string;
  body: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
      <h3 className="font-serif text-base font-normal tracking-tight">{title}</h3>
      <p className="mt-2 text-sm font-light leading-relaxed text-[var(--muted)]">{body}</p>
      <Link
        href={href}
        className="mt-4 inline-flex items-center text-sm font-normal text-[var(--accent)] hover:underline"
      >
        {cta} →
      </Link>
    </div>
  );
}
