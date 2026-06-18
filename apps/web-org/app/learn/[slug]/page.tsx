import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ORG_LEARN_SLUGS, getPage } from '@ai-transformation/content';
import { ContentPageLayout } from '@/components/content-page-layout';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return ORG_LEARN_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (!ORG_LEARN_SLUGS.includes(slug as (typeof ORG_LEARN_SLUGS)[number])) return {};
  const doc = getPage(slug);
  if (!doc) return {};
  return {
    title: doc.title,
    description: doc.description,
  };
}

export default async function LearnArticlePage({ params }: PageProps) {
  const { slug } = await params;
  if (!ORG_LEARN_SLUGS.includes(slug as (typeof ORG_LEARN_SLUGS)[number])) notFound();

  const doc = getPage(slug);
  if (!doc) notFound();

  return <ContentPageLayout doc={doc} backHref="/learn" backLabel="← All learn articles" />;
}
