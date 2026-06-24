import type { Metadata } from 'next';
import Link from 'next/link';

import { OnboardingProfileForm } from '@/components/onboarding-profile-form';
import { PublishPreferenceForm } from '@/components/publish-preference-form';
import { PageIntro } from '@/components/page-intro';
import { PageShell } from '@/components/page-shell';

export const metadata: Metadata = {
  title: 'Settings',
  description: 'Your profile and onboarding fields — role, industry, and project focus.',
  robots: { index: false, follow: false },
};

export default function SettingsPage() {
  return (
    <PageShell>
      <PageIntro
        title="Settings"
        description="Tell us your role, industry, and current focus. These fields feed your Home recommendations and personalize Knowledge."
        seed="settings"
      />

      <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 md:p-8">
        <h2 className="font-serif text-lg font-normal tracking-tight">Your profile</h2>
        <p className="mt-2 text-sm font-light leading-relaxed text-[var(--muted)]">
          Saved to your account when signed in, or on this device otherwise. Feeds your Home
          recommendations and personalizes Knowledge.
        </p>
        <div className="mt-6">
          <OnboardingProfileForm />
        </div>
      </section>

      <section className="mt-8 rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 md:p-8">
        <h2 className="font-serif text-lg font-normal tracking-tight">Publishing</h2>
        <p className="mt-2 max-w-xl text-sm font-light leading-relaxed text-[var(--muted)]">
          Choose how your contributions publish. Auto-publish stays within visibility rules and never
          elevates members-only content to public on its own.
        </p>
        <PublishPreferenceForm />
      </section>

      <nav className="mt-10 text-sm font-light text-[var(--muted)]">
        <Link href="/for-agents" className="hover:text-[var(--foreground)]">
          Agentic Access API
        </Link>
        <span className="mx-3">·</span>
        <Link href="/knowledge" className="hover:text-[var(--foreground)]">
          Knowledge commons
        </Link>
      </nav>
    </PageShell>
  );
}
