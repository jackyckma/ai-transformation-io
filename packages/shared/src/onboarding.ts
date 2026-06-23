import { z } from 'zod';

export const onboardingProfileSchema = z.object({
  role: z.string().trim().min(1).max(120),
  industry: z.string().trim().min(1).max(120),
  projectFocus: z.string().trim().min(1).max(240).optional(),
});

export type OnboardingProfile = z.infer<typeof onboardingProfileSchema>;
