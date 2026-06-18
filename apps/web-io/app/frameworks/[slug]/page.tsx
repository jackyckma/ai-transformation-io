import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CONTENT_REGISTRY, getPage } from '@ai-transformation/content';
import { ContentPageLayout } from '@/components/content-page-layout';

const SLUG_BY_PARAM: Record<string, string> = Object.fromEntries(
  Object.entries(CONTENT_REGISTRY).map(([slug, entry]) => {
    const param = entry.pathname.replace(/^\/frameworks\//, '');
    return [param, slug];
  }),
);

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

export default async function FrameworkPage({ params }: PageProps) {
  const { slug } = await params;
  const contentSlug = SLUG_BY_PARAM[slug];
  if (!contentSlug) notFound();

  const doc = getPage(contentSlug);
  if (!doc) notFound();

  return <ContentPageLayout doc={doc} backHref="/frameworks" backLabel="← All frameworks" />;
}
