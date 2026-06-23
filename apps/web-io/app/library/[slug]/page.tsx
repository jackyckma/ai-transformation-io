import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPage, getParamSlugMap } from '@ai-transformation/content';
import { ContentPageLayout } from '@/components/content-page-layout';

const SLUG_BY_PARAM = getParamSlugMap('/library');

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return Object.keys(SLUG_BY_PARAM).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const contentSlug = SLUG_BY_PARAM[slug];
  const doc = contentSlug ? getPage(contentSlug) : null;
  if (!doc) return {};
  return {
    title: doc.title,
    description: doc.description,
  };
}

export default async function LibraryArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const contentSlug = SLUG_BY_PARAM[slug];
  if (!contentSlug) notFound();

  const doc = getPage(contentSlug);
  if (!doc) notFound();

  return <ContentPageLayout doc={doc} backHref="/library" backLabel="← All library" />;
}
