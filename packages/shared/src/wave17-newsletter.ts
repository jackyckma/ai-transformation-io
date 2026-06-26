import { z } from 'zod';

export const newsletterListSchema = z.enum(['io_pulse', 'org_harvest']);

export const subscribeRequestSchema = z.object({
  email: z.string().email(),
  list: newsletterListSchema,
});

export const sendIssueRequestSchema = z.object({
  issueId: z.string(),
});

export type NewsletterList = z.infer<typeof newsletterListSchema>;
export type SubscribeRequest = z.infer<typeof subscribeRequestSchema>;
export type SendIssueRequest = z.infer<typeof sendIssueRequestSchema>;
