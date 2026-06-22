const SITE = {
  name: 'AI Transformation — Harvest Hub',
  url: 'https://ai-transformation.org',
  description:
    'Community stories, prompts, and learning paths for people navigating AI transformation — share experiences, not hype.',
};

export function SiteJsonLd() {
  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE.url}/#website`,
        url: SITE.url,
        name: SITE.name,
        description: SITE.description,
        inLanguage: 'en',
        publisher: { '@id': `${SITE.url}/#organization` },
      },
      {
        '@type': 'Organization',
        '@id': `${SITE.url}/#organization`,
        name: 'AI Transformation',
        url: SITE.url,
        description: SITE.description,
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
