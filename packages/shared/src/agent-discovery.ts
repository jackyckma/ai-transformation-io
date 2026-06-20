export type AgentSite = 'io' | 'org';

const SITE_ORIGIN: Record<AgentSite, string> = {
  io: 'https://ai-transformation.io',
  org: 'https://ai-transformation.org',
};

export function getSiteOrigin(site: AgentSite): string {
  return SITE_ORIGIN[site];
}

export function buildAgentQuickStart(site: AgentSite, apiBase = ''): string {
  const origin = getSiteOrigin(site);
  const base = apiBase || origin;
  const writeScopes =
    site === 'io'
      ? 'inquiries (question box)'
      : 'stories, prompt replies, and inquiries';

  return [
    `You can interact with ${SITE_ORIGIN[site]} without browsing HTML.`,
    '',
    '1. Call GET ' + `${base}/api/v1/capabilities` + ' — quotas, endpoints, and auth rules.',
    '2. Call GET ' + `${base}/api/v1/curated?site=${site}` + ' — what editors highlight now.',
    '3. Call GET ' + `${base}/api/v1/content/{slug}` + ' — full article body (Wave 7; counts as a read).',
    '4. To submit on behalf of a human (' + writeScopes + '):',
    '   POST ' + `${base}/api/v1/agent/authorize` + ' (human completes one email confirm),',
    '   then POST ' + `${base}/api/v1/contributions` + ' with the write token.',
    '',
    'Human-readable protocol: ' + `${origin}/for-agents`,
  ].join('\n');
}

export const AGENT_PANEL_HEADLINE = 'Agent-friendly';
export const AGENT_PANEL_SUMMARY =
  'This site is readable and writable via API — agents and humans are both first-class participants. Copy the quick start into your agent, or read the full protocol.';
