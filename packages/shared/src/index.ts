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
  'agent',
]);

export const AGENT_READ_QUOTA_ANONYMOUS = 3;
export const AGENT_READ_QUOTA_VERIFIED = 10;
export const AGENT_WRITE_TOKEN_TTL_DAYS = 180;

export const agentClientIdSchema = z.string().min(1).max(120);

export const agentAuthorizeRequestSchema = z.object({
  email: z.string().email(),
  client_id: agentClientIdSchema,
  agent_name: z.string().max(120).optional(),
});

export type AgentAuthorizeRequest = z.infer<typeof agentAuthorizeRequestSchema>;

export const agentAuthorizePendingResponseSchema = z.object({
  ok: z.literal(true),
  message: z.string(),
  /** Present in dev/test when email transport is noop — omit in production send. */
  confirm_url: z.string().url().optional(),
});

export type AgentAuthorizePendingResponse = z.infer<typeof agentAuthorizePendingResponseSchema>;

export const agentWriteTokenResponseSchema = z.object({
  ok: z.literal(true),
  token: z.string(),
  token_id: z.string(),
  expires_at: z.string(),
  email: z.string().email(),
  client_id: z.string(),
  scopes: z.array(z.string()),
});

export type AgentWriteTokenResponse = z.infer<typeof agentWriteTokenResponseSchema>;

export const agentContributionTypeSchema = z.enum(['inquiry', 'story', 'prompt_reply']);

export type AgentContributionType = z.infer<typeof agentContributionTypeSchema>;

export const agentContributionWriteSchema = z.object({
  type: agentContributionTypeSchema,
  site: z.enum(['io', 'org']).optional(),
  body: z.string().min(10).max(8000),
  title: z.string().min(4).max(160).optional(),
  name: z.string().max(120).optional(),
  prompt_id: z.string().max(120).optional(),
});

export type AgentContributionWrite = z.infer<typeof agentContributionWriteSchema>;

export const agentContributionResponseSchema = z.object({
  ok: z.literal(true),
  id: z.string(),
  status: z.string(),
});

export type AgentContributionResponse = z.infer<typeof agentContributionResponseSchema>;

export const agentContentIndexEntrySchema = z.object({
  slug: z.string(),
  title: z.string(),
  description: z.string(),
  pillar: z.string(),
  pathname: z.string(),
});

export type AgentContentIndexEntry = z.infer<typeof agentContentIndexEntrySchema>;

export const agentContentDocumentSchema = agentContentIndexEntrySchema.extend({
  markdown: z.string(),
});

export type AgentContentDocument = z.infer<typeof agentContentDocumentSchema>;

export const newsletterListSchema = z.enum(['io_pulse', 'org_harvest']);

export type NewsletterList = z.infer<typeof newsletterListSchema>;

export const issueStatusSchema = z.enum(['draft', 'scheduled', 'sent', 'archived']);

export type IssueStatus = z.infer<typeof issueStatusSchema>;

export const compileIssueDraftRequestSchema = z.object({
  site: z.enum(['io', 'org']),
  list: newsletterListSchema.optional(),
  since: z.string().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

export type CompileIssueDraftRequest = z.infer<typeof compileIssueDraftRequestSchema>;

export const compileIssueDraftResponseSchema = z.object({
  ok: z.literal(true),
  job: z.literal('compile_issue_draft'),
  issue: z.object({
    id: z.string(),
    site: z.enum(['io', 'org']),
    list: newsletterListSchema,
    slug: z.string(),
    title: z.string(),
    status: issueStatusSchema,
    replyToToken: z.string(),
    draftMd: z.string(),
    createdAt: z.string(),
  }),
  contributionCount: z.number().int(),
});

export type CompileIssueDraftResponse = z.infer<typeof compileIssueDraftResponseSchema>;

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

export const CHAT_QUOTA_ANONYMOUS = 8;
export const CHAT_QUOTA_REGISTERED = 25;

export const chatMessageRoleSchema = z.enum(['user', 'assistant']);

export const chatLinkSchema = z.object({
  label: z.string(),
  href: z.string(),
});

export type ChatLink = z.infer<typeof chatLinkSchema>;

export const chatMessageSchema = z.object({
  id: z.string(),
  role: chatMessageRoleSchema,
  content: z.string(),
  links: z.array(chatLinkSchema).optional(),
  createdAt: z.string(),
});

export type ChatMessage = z.infer<typeof chatMessageSchema>;

export const chatQuotaSchema = z.object({
  limit: z.number().int(),
  remaining: z.number().int(),
  reset: z.string(),
});

export type ChatQuota = z.infer<typeof chatQuotaSchema>;

export const chatSessionResponseSchema = z.object({
  ok: z.literal(true),
  session: z.object({
    id: z.string(),
    site: z.enum(['io', 'org']),
    messages: z.array(chatMessageSchema),
    quota: chatQuotaSchema,
  }),
});

export type ChatSessionResponse = z.infer<typeof chatSessionResponseSchema>;

export const chatSendMessageRequestSchema = z.object({
  content: z.string().min(1).max(2000),
});

export type ChatSendMessageRequest = z.infer<typeof chatSendMessageRequestSchema>;

export const chatSendMessageResponseSchema = z.object({
  ok: z.literal(true),
  userMessage: chatMessageSchema,
  assistantMessage: chatMessageSchema,
  quota: chatQuotaSchema,
});

export type ChatSendMessageResponse = z.infer<typeof chatSendMessageResponseSchema>;

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
    async getChatSession(site: 'io' | 'org'): Promise<ChatSessionResponse> {
      const res = await fetch(`${base}/api/chat/session?site=${site}`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error(`Chat session request failed: ${res.status}`);
      return chatSessionResponseSchema.parse(await res.json());
    },
    async sendChatMessage(content: string): Promise<ChatSendMessageResponse> {
      const res = await fetch(`${base}/api/chat/session/messages`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error(`Chat message failed: ${res.status}`);
      return chatSendMessageResponseSchema.parse(await res.json());
    },
  };
}

export const SITE_IO = 'ai-transformation.io' as const;
export const SITE_ORG = 'ai-transformation.org' as const;

export type AgentSite = 'io' | 'org';

const SITE_ORIGIN: Record<AgentSite, string> = {
  io: 'https://ai-transformation.io',
  org: 'https://ai-transformation.org',
};

export function getSiteOrigin(site: AgentSite): string {
  return SITE_ORIGIN[site];
}

/** Browser-safe API path — avoids localhost env base on production domains. */
export function resolveClientApiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const envBase = process.env.NEXT_PUBLIC_API_BASE_URL?.trim().replace(/\/$/, '') ?? '';
  if (!envBase) {
    return normalizedPath;
  }

  const browserHost = getBrowserHostname();
  if (browserHost) {
    const isLocalEnvBase = /^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/i.test(envBase);
    const onLocalHost = /^(localhost|127\.0\.0\.1)$/i.test(browserHost);
    if (isLocalEnvBase && !onLocalHost) {
      return normalizedPath;
    }
  }

  return `${envBase}${normalizedPath}`;
}

function getBrowserHostname(): string | null {
  if (typeof globalThis === 'undefined') {
    return null;
  }
  const maybeWindow = (globalThis as { window?: { location?: { hostname?: string } } }).window;
  return maybeWindow?.location?.hostname ?? null;
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
  'Readable and writable via API — agents and humans are both first-class. Give your agent the quick start below, or send them the link to the full protocol.';
