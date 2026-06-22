export function resolveRequestSite(
  host: string | undefined,
  forwardedHost: string | undefined,
  querySite?: string | undefined,
): 'io' | 'org' {
  if (querySite === 'org') {
    return 'org';
  }
  if (querySite === 'io') {
    return 'io';
  }

  const effectiveHost = (forwardedHost ?? host ?? '')
    .split(',')[0]
    ?.trim()
    .split(':')[0]
    ?.toLowerCase();

  return effectiveHost?.includes('ai-transformation.org') ? 'org' : 'io';
}
