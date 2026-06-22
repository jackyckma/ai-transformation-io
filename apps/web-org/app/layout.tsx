import type { Metadata } from 'next';
import { Geist, Lora } from 'next/font/google';
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
    default: 'AI Transformation · Harvest Hub',
    template: '%s · AI Transformation',
  },
  description: 'Community space to share AI transformation experiences — stories, prompts, and curated learning.',
  metadataBase: new URL('https://ai-transformation.org'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'AI Transformation',
    title: 'AI Transformation · Harvest Hub',
    description: 'Community space to share AI transformation experiences — stories, prompts, and curated learning.',
    images: [{ url: '/curation/cornerstone.jpg', width: 1200, height: 630, alt: 'AI Transformation Harvest Hub' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Transformation · Harvest Hub',
    description: 'Community space to share AI transformation experiences — stories, prompts, and curated learning.',
    images: ['/curation/cornerstone.jpg'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${lora.variable} flex min-h-screen flex-col font-light antialiased`}
      >
        <SiteJsonLd />
        <AuthErrorBanner />
        <SiteHeader />
        <main className="flex-1 pb-24">{children}</main>
        <SiteFooter />
        <SiteCompanion />
      </body>
    </html>
  );
}
