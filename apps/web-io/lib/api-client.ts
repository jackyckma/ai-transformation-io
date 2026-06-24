'use client';

import { createApiClient, resolveClientApiUrl } from '@ai-transformation/shared';

export const IO_SITE = 'io' as const;

let cachedClient: ReturnType<typeof createApiClient> | null = null;

/**
 * Browser-only personal-layer client. The backend that serves these endpoints
 * is built in parallel and may be unreachable; every caller must catch and
 * degrade gracefully (localStorage fallback or empty state).
 */
export function getApiClient(): ReturnType<typeof createApiClient> {
  if (!cachedClient) {
    const base = resolveClientApiUrl('/').replace(/\/$/, '');
    cachedClient = createApiClient(base);
  }
  return cachedClient;
}
