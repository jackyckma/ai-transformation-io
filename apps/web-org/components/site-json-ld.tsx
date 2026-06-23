const SITE = {
  name: 'AI Transformation — Community · Knowledge commons',
  url: 'https://ai-transformation.org',
  description:
    'A community knowledge commons for people navigating AI transformation — contributed knowledge and community highlights, not hype.',
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
