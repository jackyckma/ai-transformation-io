const SITE = {
  name: 'AI Transformation',
  url: 'https://ai-transformation.io',
  description:
    'Enterprise AI transformation frameworks, playbook, and readiness assessment — beyond deployment to operating model change.',
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
        name: SITE.name,
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
