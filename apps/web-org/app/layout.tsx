import type { Metadata } from 'next';
import { Geist, Lora } from 'next/font/google';
import { SiteJsonLd } from '@/components/site-json-ld';
import { AuthErrorBanner } from '@/components/auth-error-banner';
import { LayoutCompanion } from '@/components/layout-companion';
import { MobileBottomNav } from '@/components/mobile-bottom-nav';
import { SiteFooter, SiteHeader } from '@/components/site-chrome';
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

const SITE_DESCRIPTION =
  'A community knowledge commons for AI transformation — contributed knowledge and community highlights.';

export const metadata: Metadata = {
  title: {
    default: 'AI Transformation · Community · Knowledge commons',
    template: '%s · AI Transformation',
  },
  description: SITE_DESCRIPTION,
  metadataBase: new URL('https://ai-transformation.org'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'AI Transformation',
    title: 'AI Transformation · Community · Knowledge commons',
    description: SITE_DESCRIPTION,
    images: [
      {
        url: '/curation/cornerstone.jpg',
        width: 1200,
        height: 630,
        alt: 'AI Transformation Community · Knowledge commons',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Transformation · Community · Knowledge commons',
    description: SITE_DESCRIPTION,
    images: ['/curation/cornerstone.jpg'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-site="org" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${lora.variable} flex min-h-screen flex-col font-normal antialiased lg:h-screen lg:flex-row lg:overflow-hidden`}
      >
        <SiteJsonLd />
        <AuthErrorBanner />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col lg:h-full lg:overflow-hidden">
          <SiteHeader />
          <main className="min-h-0 flex-1 overflow-y-auto pb-[var(--mobile-nav-h)] lg:pb-0">{children}</main>
          <SiteFooter />
        </div>
        <LayoutCompanion />
        <MobileBottomNav />
      </body>
    </html>
  );
}
