import { z } from 'zod';

export const healthResponseSchema = z.object({
  ok: z.boolean(),
  service: z.string(),
  version: z.string().optional(),
});

export type HealthResponse = z.infer<typeof healthResponseSchema>;

export const contributionSourceSchema = z.enum([
  'web_story',
  'web_inquiry',
  'web_prompt_reply',
  'assessment_reflection',
  'newsletter_reply',
  'linkedin_manual',
]);

export type ContributionSource = z.infer<typeof contributionSourceSchema>;

export const inquiryPayloadSchema = z.object({
  email: z.string().email(),
  question: z.string().min(10).max(5000),
  name: z.string().max(120).optional(),
  site: z.enum(['io', 'org']).optional(),
});

export type InquiryPayload = z.infer<typeof inquiryPayloadSchema>;

export function createApiClient(baseUrl: string) {
  const base = baseUrl.replace(/\/$/, '');

  return {
    async health(): Promise<HealthResponse> {
      const res = await fetch(`${base}/api/health`);
      if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
      return healthResponseSchema.parse(await res.json());
    },
  };
}

export const SITE_IO = 'ai-transformation.io' as const;
export const SITE_ORG = 'ai-transformation.org' as const;
