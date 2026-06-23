import { NextResponse } from 'next/server';

const BASE = 'https://ai-transformation.io';

export function GET() {
  const body = `# Standard crawlers
User-agent: *
Allow: /

# Machine-readable agent entry (read first — do not scrape HTML for API use)
# ${BASE}/api/agent

# LLM / agent discovery
# ${BASE}/llms.txt

Sitemap: ${BASE}/sitemap.xml
`;

  return new NextResponse(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
