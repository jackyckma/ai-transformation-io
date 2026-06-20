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
  'apprenticeship_interest',
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

export const apprenticeshipInterestPayloadSchema = z.object({
  email: z.string().email(),
  name: z.string().max(120).optional(),
  note: z.string().max(1000).optional(),
});

export type ApprenticeshipInterestPayload = z.infer<typeof apprenticeshipInterestPayloadSchema>;

export const apprenticeshipInterestResponseSchema = z.object({
  ok: z.literal(true),
  id: z.string(),
});

export type ApprenticeshipInterestResponse = z.infer<typeof apprenticeshipInterestResponseSchema>;

export const storyPayloadSchema = z.object({
  title: z.string().min(4).max(160),
  body: z.string().min(50).max(8000),
  name: z.string().max(120).optional(),
});

export type StoryPayload = z.infer<typeof storyPayloadSchema>;

export const storyStatusSchema = z.enum([
  'new',
  'reviewed',
  'published',
  'featured',
  'archived',
  'spam',
]);

export type StoryStatus = z.infer<typeof storyStatusSchema>;

export const storySchema = z.object({
  id: z.string(),
  title: z.string(),
  body: z.string(),
  name: z.string().nullable(),
  publishedSlug: z.string().nullable(),
  createdAt: z.string(),
  featured: z.boolean(),
});

export type Story = z.infer<typeof storySchema>;

export const storyModerationSchema = z.object({
  id: z.string(),
  title: z.string(),
  body: z.string(),
  name: z.string().nullable(),
  email: z.string().email(),
  status: storyStatusSchema,
  publishedSlug: z.string().nullable(),
  createdAt: z.string(),
});

export type StoryModeration = z.infer<typeof storyModerationSchema>;

export const storiesResponseSchema = z.object({
  ok: z.literal(true),
  stories: z.array(storySchema),
});

export type StoriesResponse = z.infer<typeof storiesResponseSchema>;

export const storyModerationListResponseSchema = z.object({
  ok: z.literal(true),
  stories: z.array(storyModerationSchema),
});

export type StoryModerationListResponse = z.infer<typeof storyModerationListResponseSchema>;

export const storyModerationResponseSchema = z.object({
  ok: z.literal(true),
  story: storyModerationSchema,
});

export type StoryModerationResponse = z.infer<typeof storyModerationResponseSchema>;

export const promptSchema = z.object({
  id: z.string(),
  question: z.string(),
  weekOf: z.string().nullable(),
});

export type Prompt = z.infer<typeof promptSchema>;

export const currentPromptResponseSchema = z.object({
  ok: z.literal(true),
  prompt: promptSchema.nullable(),
});

export type CurrentPromptResponse = z.infer<typeof currentPromptResponseSchema>;

export const promptReplyPayloadSchema = z.object({
  body: z.string().min(10).max(5000),
});

export type PromptReplyPayload = z.infer<typeof promptReplyPayloadSchema>;

const storyModerationRequestSchema = z.object({
  status: z.enum(['reviewed', 'published', 'featured', 'archived', 'spam']),
  publishedSlug: z.string().min(1).max(200).optional(),
});

export type StoryModerationRequest = z.infer<typeof storyModerationRequestSchema>;

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

export const authUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().nullable().optional(),
  picture: z.string().nullable().optional(),
  createdAt: z.string(),
});

export type AuthUser = z.infer<typeof authUserSchema>;

export const authMeResponseSchema = z.object({
  ok: z.literal(true),
  user: authUserSchema.nullable(),
});

export type AuthMeResponse = z.infer<typeof authMeResponseSchema>;

export const assessmentSessionStateSchema = z.object({
  answers: z.record(z.string(), z.number().int().min(1).max(5)),
  stepIndex: z.number().int().min(0),
  lastScore: assessmentScoreResponseSchema.nullable().optional(),
});

export type AssessmentSessionState = z.infer<typeof assessmentSessionStateSchema>;

export const assessmentSessionResponseSchema = z.object({
  ok: z.literal(true),
  session: assessmentSessionStateSchema.extend({
    updatedAt: z.string(),
  }).nullable(),
});

export type AssessmentSessionResponse = z.infer<typeof assessmentSessionResponseSchema>;

export const assessmentSessionSaveRequestSchema = assessmentSessionStateSchema;
export type AssessmentSessionSaveRequest = z.infer<typeof assessmentSessionSaveRequestSchema>;

const logoutResponseSchema = z.object({
  ok: z.literal(true),
});

const assessmentSessionSaveResponseSchema = z.object({
  ok: z.literal(true),
  updatedAt: z.string(),
});

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
    async submitStory(payload: StoryPayload): Promise<InquiryResponse> {
      const res = await fetch(`${base}/api/stories`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Story submission failed: ${res.status}`);
      return inquiryResponseSchema.parse(await res.json());
    },
    async getStories(): Promise<StoriesResponse> {
      const res = await fetch(`${base}/api/stories`);
      if (!res.ok) throw new Error(`Stories request failed: ${res.status}`);
      return storiesResponseSchema.parse(await res.json());
    },
    async getCurrentPrompt(): Promise<CurrentPromptResponse> {
      const res = await fetch(`${base}/api/prompts/current`);
      if (!res.ok) throw new Error(`Current prompt request failed: ${res.status}`);
      return currentPromptResponseSchema.parse(await res.json());
    },
    async submitPromptReply(promptId: string, payload: PromptReplyPayload): Promise<InquiryResponse> {
      const res = await fetch(`${base}/api/prompts/${encodeURIComponent(promptId)}/replies`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Prompt reply submission failed: ${res.status}`);
      return inquiryResponseSchema.parse(await res.json());
    },
    async getStoriesForModeration(): Promise<StoryModerationListResponse> {
      const res = await fetch(`${base}/api/stories/moderation`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error(`Stories moderation request failed: ${res.status}`);
      return storyModerationListResponseSchema.parse(await res.json());
    },
    async moderateStory(id: string, body: StoryModerationRequest): Promise<StoryModerationResponse> {
      const payload = storyModerationRequestSchema.parse(body);
      const res = await fetch(`${base}/api/stories/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Story moderation update failed: ${res.status}`);
      return storyModerationResponseSchema.parse(await res.json());
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
    async getAuthMe(): Promise<AuthMeResponse> {
      const res = await fetch(`${base}/api/auth/me`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error(`Auth me request failed: ${res.status}`);
      return authMeResponseSchema.parse(await res.json());
    },
    async logout(): Promise<{ ok: true }> {
      const res = await fetch(`${base}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) throw new Error(`Logout request failed: ${res.status}`);
      return logoutResponseSchema.parse(await res.json());
    },
    async getAssessmentSession(): Promise<AssessmentSessionResponse> {
      const res = await fetch(`${base}/api/assessment/session`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error(`Assessment session request failed: ${res.status}`);
      return assessmentSessionResponseSchema.parse(await res.json());
    },
    async saveAssessmentSession(
      state: AssessmentSessionSaveRequest,
    ): Promise<{ ok: true; updatedAt: string }> {
      const res = await fetch(`${base}/api/assessment/session`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(state),
      });
      if (!res.ok) throw new Error(`Assessment session save failed: ${res.status}`);
      return assessmentSessionSaveResponseSchema.parse(await res.json());
    },
  };
}

export const SITE_IO = 'ai-transformation.io' as const;
export const SITE_ORG = 'ai-transformation.org' as const;

export {
  AGENT_PANEL_HEADLINE,
  AGENT_PANEL_SUMMARY,
  buildAgentQuickStart,
  getSiteOrigin,
  type AgentSite,
} from './agent-discovery';
