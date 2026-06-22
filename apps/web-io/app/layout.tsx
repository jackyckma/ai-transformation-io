import type { Metadata } from 'next';
import { Lora, Geist } from 'next/font/google';
import { SiteJsonLd } from '@/components/site-json-ld';
import { AuthErrorBanner } from '@/components/auth-error-banner';
import { SiteFooter, SiteHeader } from '@/components/site-chrome';
import { SiteCompanion } from '@/components/site-companion';
import './globals.css';

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
  weight: ['300', '400', '500'],
});

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-serif',
  weight: ['400', '500'],
});

export const metadata: Metadata = {
  title: {
    default: 'AI Transformation',
    template: '%s · AI Transformation',
  },
  description: 'Organized knowledge for enterprise AI transformation — frameworks, assessment, and playbooks.',
  metadataBase: new URL('https://ai-transformation.io'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'AI Transformation',
    title: 'AI Transformation',
    description: 'Organized knowledge for enterprise AI transformation — frameworks, assessment, and playbooks.',
    images: [{ url: '/curation/cornerstone.jpg', width: 1200, height: 630, alt: 'AI Transformation' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Transformation',
    description: 'Organized knowledge for enterprise AI transformation — frameworks, assessment, and playbooks.',
    images: ['/curation/cornerstone.jpg'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${lora.variable} flex min-h-screen flex-col font-light antialiased lg:flex-row`}
      >
        <SiteJsonLd />
        <AuthErrorBanner />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </div>
        <div className="border-t border-[var(--border)] lg:w-[var(--chat-panel-w)] lg:shrink-0 lg:border-t-0 lg:border-l">
          <SiteCompanion />
        </div>
      </body>
    </html>
  );
}
