export type ContentPage = {
  slug: string;
  title: string;
  description: string;
  pillar: 'framework' | 'function' | 'resource';
};

/** Wave 1: static registry until MDX pipeline ships. */
const PAGES: ContentPage[] = [
  {
    slug: 'what-is-ai-transformation',
    title: 'What Is AI Transformation?',
    description: 'Beyond deployment — operating model change for enterprise AI.',
    pillar: 'framework',
  },
  {
    slug: 'transformation-roadmap',
    title: 'Transformation Roadmap',
    description: 'Seven stages from exploration to scaled value.',
    pillar: 'framework',
  },
];

export function getAllPages(): ContentPage[] {
  return PAGES;
}

export function getPage(slug: string): ContentPage | undefined {
  return PAGES.find((p) => p.slug === slug);
}
