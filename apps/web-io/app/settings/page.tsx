import type { Metadata } from 'next';
import Link from 'next/link';

import { OnboardingFields } from '@/components/onboarding-fields';
import { PageIntro } from '@/components/page-intro';
import { PageShell } from '@/components/page-shell';

export const metadata: Metadata = {
  title: 'Settings',
  description: 'Your onboarding profile, agent access, and account preferences.',
};

export default function SettingsPage() {
  return (
    <PageShell>
      <PageIntro
        title="Settings"
        description="Tell us your role and industry to tune recommendations. Synced to your account when signed in; saved on this device otherwise."
      />

      <section>
        <h2 className="font-serif text-lg font-normal tracking-tight">Onboarding profile</h2>
        <p className="mt-2 text-sm font-light leading-relaxed text-[var(--muted)]">
          Used by the home dashboard and Insights to rank what you see first.
        </p>
        <div className="mt-5 max-w-md rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 md:p-6">
          <OnboardingFields />
        </div>
      </section>

      <section className="mt-12 border-t border-[var(--border)] pt-10">
        <h2 className="font-serif text-lg font-normal tracking-tight">Agentic access API</h2>
        <p className="mt-2 text-sm font-light leading-relaxed text-[var(--muted)]">
          Agents read and contribute through the versioned API — the same contracts the on-site Ask
          companion uses.
        </p>
        <ul className="mt-4 space-y-2 text-sm font-light">
          <li>
            <Link href="/for-agents" className="text-[var(--accent)] hover:underline">
              Agent protocol &amp; quick start →
            </Link>
          </li>
          <li>
            <a href="/api/agent" className="text-[var(--accent)] hover:underline" rel="noopener noreferrer">
              Agent entry (machine-readable) →
            </a>
          </li>
        </ul>
      </section>

      <section className="mt-12 border-t border-[var(--border)] pt-10">
        <h2 className="font-serif text-lg font-normal tracking-tight">Account</h2>
        <p className="mt-2 text-sm font-light leading-relaxed text-[var(--muted)]">
          Sign in with Google to save assessment progress. Use the menu to sign in or out.
        </p>
        <Link
          href="/progress"
          className="mt-4 inline-flex items-center text-sm font-normal text-[var(--accent)] hover:underline"
        >
          Your progress →
        </Link>
      </section>
    </PageShell>
  );
}
