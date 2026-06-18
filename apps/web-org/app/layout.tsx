import type { Metadata } from 'next';
import { Geist, Lora } from 'next/font/google';
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

export const metadata: Metadata = {
  title: {
    default: 'AI Transformation · Harvest Hub',
    template: '%s · AI Transformation',
  },
  description: 'Community space to share AI transformation experiences — stories, prompts, and curated learning.',
  metadataBase: new URL('https://ai-transformation.org'),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${lora.variable} flex min-h-screen flex-col font-light antialiased`}
      >
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
