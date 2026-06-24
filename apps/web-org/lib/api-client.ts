'use client';

import { createApiClient, resolveClientApiUrl } from '@ai-transformation/shared';

type ApiClient = ReturnType<typeof createApiClient>;

let cached: ApiClient | null = null;

/**
 * Browser-safe shared API client. `resolveClientApiUrl('/')` resolves the API
 * origin (relative path on production domains, env base elsewhere); we strip the
 * trailing slash so the client's `${base}${path}` joins cleanly.
 */
export function getApiClient(): ApiClient {
  if (cached) {
    return cached;
  }
  const base = resolveClientApiUrl('/').replace(/\/$/, '');
  cached = createApiClient(base);
  return cached;
}
