import type { Metadata } from 'next';
import { ORG_KNOWLEDGE_SLUGS, getPage } from '@ai-transformation/content';
import { ContentPageLayout } from '@/components/content-page-layout';
import { KnowledgeObjectView } from '@/components/knowledge-object-view';
import { knowledgeActions } from '@/lib/ask-prefill';

type PageProps = {
  params: Promise<{ slug: string }>;
};

function isKnowledgeSlug(slug: string): slug is (typeof ORG_KNOWLEDGE_SLUGS)[number] {
  return (ORG_KNOWLEDGE_SLUGS as readonly string[]).includes(slug);
}

export async function generateStaticParams() {
  return ORG_KNOWLEDGE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (!isKnowledgeSlug(slug)) return {};
  const doc = getPage(slug);
  if (!doc) return {};
  return {
    title: doc.title,
    description: doc.description,
  };
}

export default async function KnowledgeArticlePage({ params }: PageProps) {
  const { slug } = await params;

  if (isKnowledgeSlug(slug)) {
    const doc = getPage(slug);
    if (doc) {
      return (
        <ContentPageLayout
          doc={doc}
          backHref="/knowledge"
          backLabel="← All knowledge"
          eyebrow="Knowledge"
          actions={knowledgeActions(doc.title, doc.slug)}
        />
      );
    }
  }

  return <KnowledgeObjectView id={slug} />;
}
