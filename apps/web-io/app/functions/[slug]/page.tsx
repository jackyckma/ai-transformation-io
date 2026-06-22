import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { FUNCTION_SLUGS, getFunctionPage } from '@/data/function-pages';
import { FunctionPageLayout } from '@/components/function-page-layout';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return FUNCTION_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getFunctionPage(slug);
  if (!page) return {};
  return {
    title: page.title,
    description: page.description,
  };
}

export default async function FunctionRolePage({ params }: PageProps) {
  const { slug } = await params;
  const page = getFunctionPage(slug);
  if (!page) notFound();

  return <FunctionPageLayout page={page} />;
}
