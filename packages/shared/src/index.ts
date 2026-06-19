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
export const inquiryResponseSchema = z.object({
  ok: z.literal(true),
  id: z.string(),
});

export type InquiryResponse = z.infer<typeof inquiryResponseSchema>;

export const assessmentGapIdSchema = z.enum([
  'work_redesign',
  'governance',
  'value_measurement',
]);

export type AssessmentGapId = z.infer<typeof assessmentGapIdSchema>;

export const likertValueSchema = z.number().int().min(1).max(5);

export type LikertValue = z.infer<typeof likertValueSchema>;

export const assessmentSubDimensionSchema = z.object({
  id: z.string(),
  label: z.string(),
});

export type AssessmentSubDimension = z.infer<typeof assessmentSubDimensionSchema>;

export const assessmentGapSchema = z.object({
  id: assessmentGapIdSchema,
  label: z.string(),
  description: z.string(),
  subDimensions: z.array(assessmentSubDimensionSchema),
});

export type AssessmentGap = z.infer<typeof assessmentGapSchema>;

export const assessmentQuestionSchema = z.object({
  id: z.string(),
  gap: assessmentGapIdSchema,
  subDimension: z.string(),
  prompt: z.string(),
});

export type AssessmentQuestion = z.infer<typeof assessmentQuestionSchema>;

export const assessmentQuestionBankSchema = z.object({
  version: z.string(),
  scale: z.object({
    min: z.literal(1),
    max: z.literal(5),
    labels: z.record(z.string(), z.string()),
  }),
  gaps: z.array(assessmentGapSchema),
  questions: z.array(assessmentQuestionSchema),
});

export type AssessmentQuestionBank = z.infer<typeof assessmentQuestionBankSchema>;

export const assessmentAnswerSchema = z.object({
  questionId: z.string(),
  value: likertValueSchema,
});

export type AssessmentAnswer = z.infer<typeof assessmentAnswerSchema>;

export const assessmentScoreRequestSchema = z.object({
  answers: z.array(assessmentAnswerSchema).min(1),
});

export type AssessmentScoreRequest = z.infer<typeof assessmentScoreRequestSchema>;

export const assessmentSubScoreSchema = z.object({
  id: z.string(),
  label: z.string(),
  score: z.number(),
});

export type AssessmentSubScore = z.infer<typeof assessmentSubScoreSchema>;

export const assessmentGapScoreSchema = z.object({
  id: assessmentGapIdSchema,
  label: z.string(),
  score: z.number(),
  subDimensions: z.array(assessmentSubScoreSchema),
});

export type AssessmentGapScore = z.infer<typeof assessmentGapScoreSchema>;

export const assessmentRadarPointSchema = z.object({
  axis: z.string(),
  gap: assessmentGapIdSchema,
  value: z.number(),
});

export type AssessmentRadarPoint = z.infer<typeof assessmentRadarPointSchema>;

export const assessmentScoreResponseSchema = z.object({
  ok: z.literal(true),
  overall: z.number(),
  gaps: z.array(assessmentGapScoreSchema),
  weakestGap: z.object({
    id: assessmentGapIdSchema,
    label: z.string(),
    score: z.number(),
  }),
  radar: z.array(assessmentRadarPointSchema),
});

export type AssessmentScoreResponse = z.infer<typeof assessmentScoreResponseSchema>;

export function createApiClient(baseUrl: string) {
  const base = baseUrl.replace(/\/$/, '');

  return {
    async health(): Promise<HealthResponse> {
      const res = await fetch(`${base}/api/health`);
      if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
      return healthResponseSchema.parse(await res.json());
    },
    async submitInquiry(payload: InquiryPayload): Promise<InquiryResponse> {
      const res = await fetch(`${base}/api/inquiries`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Inquiry submission failed: ${res.status}`);
      return inquiryResponseSchema.parse(await res.json());
    },
    async getAssessmentQuestions(): Promise<AssessmentQuestionBank> {
      const res = await fetch(`${base}/api/assessment/questions`);
      if (!res.ok) throw new Error(`Assessment questions request failed: ${res.status}`);
      return assessmentQuestionBankSchema.parse(await res.json());
    },
    async submitAssessmentScore(req: AssessmentScoreRequest): Promise<AssessmentScoreResponse> {
      const res = await fetch(`${base}/api/assessment/score`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(req),
      });
      if (!res.ok) throw new Error(`Assessment score request failed: ${res.status}`);
      return assessmentScoreResponseSchema.parse(await res.json());
    },
  };
}

export const SITE_IO = 'ai-transformation.io' as const;
export const SITE_ORG = 'ai-transformation.org' as const;
