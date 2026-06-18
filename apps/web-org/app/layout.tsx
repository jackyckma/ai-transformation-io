import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import { SiteFooter, SiteHeader } from '@/components/site-chrome';
import './globals.css';

const geistSans = Geist({ subsets: ['latin'], variable: '--font-geist-sans' });

export const metadata: Metadata = {
  title: {
    default: 'Learn Together · AI Transformation',
    template: '%s · Learn Together',
  },
  description: 'Community space to share AI transformation experiences — Harvest Hub.',
  metadataBase: new URL('https://ai-transformation.org'),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} flex min-h-screen flex-col antialiased`}>
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
