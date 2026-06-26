import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllPages, getPage, getParamSlugMap, type ContentDocument } from '@ai-transformation/content';
import { ContentPageLayout, type RelatedLink } from '@/components/content-page-layout';

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

/**
 * Pick a few sibling Library entries for the article footer. Same-pillar
 * articles rank first (closest topical fit), then the rest fill the slots, so
 * even small pillars still surface related reading. Derived from the existing
 * file-backed content registry — no extra fetch.
 */
function getRelatedLinks(current: ContentDocument, limit = 4): RelatedLink[] {
  const others = getAllPages().filter((page) => page.slug !== current.slug);
  const samePillar = others.filter((page) => page.pillar === current.pillar);
  const otherPillar = others.filter((page) => page.pillar !== current.pillar);
  return [...samePillar, ...otherPillar].slice(0, limit).map((page) => ({
    slug: page.slug,
    title: page.title,
    pathname: page.pathname,
    pillar: page.pillar,
  }));
}

export default async function LibraryArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const contentSlug = SLUG_BY_PARAM[slug];
  if (!contentSlug) notFound();

  const doc = getPage(contentSlug);
  if (!doc) notFound();

  return (
    <ContentPageLayout
      doc={doc}
      related={getRelatedLinks(doc)}
      backHref="/library"
      backLabel="← All library"
    />
  );
}
