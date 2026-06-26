import { z } from 'zod';
import * as wave12 from './wave12-objects';
import * as wave13 from './wave13-community';
import * as wave14 from './wave14-community';
import * as wave18 from './wave18-ranking';

export * from './ask-modes';
export * from './onboarding';
export * from './recommendation';
export * from './wave12-objects';
export * from './wave13-community';
export * from './wave14-community';
export * from './wave18-external-agent';
export * from './wave18-ranking';

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
  /** Full URL for GET /api/v1/content/{slug} — use this on content reads. */
  api_url: z.string().url(),
  /** Human-facing page on this site. */
  human_url: z.string().url(),
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
  const jsonContentType = 'application/json';

  type AgentRequestOptions = {
    token?: string;
    clientId?: string;
  };

  type PersonalListRequest = {
    site?: wave12.Site;
    targetType?: wave12.PersonalTarget['targetType'];
    targetId?: string;
    mine?: boolean;
  };

  function buildQuery(params: Record<string, unknown>): string {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null || value === '') {
        continue;
      }
      query.set(key, String(value));
    }
    const raw = query.toString();
    return raw ? `?${raw}` : '';
  }

  function withJsonBody(payload: unknown, init: RequestInit = {}): RequestInit {
    const headers = new Headers(init.headers ?? {});
    if (!headers.has('content-type')) {
      headers.set('content-type', jsonContentType);
    }
    return {
      ...init,
      headers,
      body: JSON.stringify(payload),
    };
  }

  function withAgentAuth(options: AgentRequestOptions | undefined, init: RequestInit = {}): RequestInit {
    const headers = new Headers(init.headers ?? {});
    if (options?.token) {
      headers.set('authorization', `Bearer ${options.token}`);
    }
    if (options?.clientId) {
      headers.set('x-agent-client-id', options.clientId);
    }
    return {
      ...init,
      headers,
    };
  }

  async function requestJson<T>(path: string, schema: z.ZodType<T>, init?: RequestInit): Promise<T> {
    const res = await fetch(`${base}${path}`, init);
    if (!res.ok) {
      throw new Error(`Request failed (${init?.method ?? 'GET'} ${path}): ${res.status}`);
    }
    return schema.parse(await res.json());
  }

  async function requestSessionJson<T>(
    path: string,
    schema: z.ZodType<T>,
    init: RequestInit = {},
  ): Promise<T> {
    return requestJson(path, schema, {
      credentials: 'include',
      ...init,
    });
  }

  async function requestAgentJson<T>(
    path: string,
    schema: z.ZodType<T>,
    options?: AgentRequestOptions,
    init: RequestInit = {},
  ): Promise<T> {
    return requestJson(path, schema, withAgentAuth(options, init));
  }

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
    objects: {
      async list(request: wave12.ObjectListRequest = {}): Promise<wave12.ObjectListResponse> {
        const query = wave12.objectListRequestSchema.parse(request);
        return requestSessionJson(
          `/api/objects${buildQuery(query)}`,
          wave12.objectListResponseSchema,
        );
      },
      async get(id: string): Promise<wave12.ObjectGetResponse> {
        const request = wave12.objectGetRequestSchema.parse({ id });
        return requestSessionJson(
          `/api/objects/${encodeURIComponent(request.id)}`,
          wave12.objectGetResponseSchema,
        );
      },
      async create(payload: wave12.ObjectCreateRequest): Promise<wave12.ObjectWriteResponse> {
        const request = wave12.objectCreateRequestSchema.parse(payload);
        return requestSessionJson(
          '/api/objects',
          wave12.objectWriteResponseSchema,
          withJsonBody(request, { method: 'POST' }),
        );
      },
      async saveDraft(payload: wave12.ObjectDraftRequest): Promise<wave12.ObjectWriteResponse> {
        const request = wave12.objectDraftRequestSchema.parse(payload);
        return requestSessionJson(
          '/api/objects/drafts',
          wave12.objectWriteResponseSchema,
          withJsonBody(request, { method: 'POST' }),
        );
      },
      async submit(payload: wave12.ObjectSubmitRequest): Promise<wave12.ObjectWriteResponse> {
        const request = wave12.objectSubmitRequestSchema.parse(payload);
        return requestSessionJson(
          '/api/objects/submit',
          wave12.objectWriteResponseSchema,
          withJsonBody(request, { method: 'POST' }),
        );
      },
      async draftDerivedArticle(
        payload: wave12.DerivedArticleDraftRequest,
      ): Promise<wave12.DerivedArticleDraftResponse> {
        const request = wave12.derivedArticleDraftRequestSchema.parse(payload);
        return requestSessionJson(
          '/api/objects/derive-article',
          wave12.derivedArticleDraftResponseSchema,
          withJsonBody(request, { method: 'POST' }),
        );
      },
    },
    contributions: {
      async create(
        payload: wave12.ContributionCreateRequest,
      ): Promise<wave12.ContributionWriteResponse> {
        const request = wave12.contributionCreateRequestSchema.parse(payload);
        return requestSessionJson(
          '/api/contributions',
          wave12.contributionWriteResponseSchema,
          withJsonBody(request, { method: 'POST' }),
        );
      },
      async saveDraft(
        payload: wave12.ContributionDraftRequest,
      ): Promise<wave12.ContributionWriteResponse> {
        const request = wave12.contributionDraftRequestSchema.parse(payload);
        return requestSessionJson(
          '/api/contributions/drafts',
          wave12.contributionWriteResponseSchema,
          withJsonBody(request, { method: 'POST' }),
        );
      },
      async submit(
        payload: wave12.ContributionSubmitRequest,
      ): Promise<wave12.ContributionWriteResponse> {
        const request = wave12.contributionSubmitRequestSchema.parse(payload);
        return requestSessionJson(
          '/api/contributions/submit',
          wave12.contributionWriteResponseSchema,
          withJsonBody(request, { method: 'POST' }),
        );
      },
    },
    moderation: {
      async list(
        request: wave12.ModerationQueueListRequest = {},
      ): Promise<wave12.ModerationQueueListResponse> {
        const query = wave12.moderationQueueListRequestSchema.parse(request);
        return requestSessionJson(
          `/api/moderation/queue${buildQuery(query)}`,
          wave12.moderationQueueListResponseSchema,
        );
      },
      async transition(
        id: string,
        payload: wave12.ModerationTransitionRequest,
      ): Promise<wave12.ModerationTransitionResponse> {
        const requestId = z.string().min(1).parse(id);
        const request = wave12.moderationTransitionRequestSchema.parse(payload);
        return requestSessionJson(
          `/api/moderation/queue/${encodeURIComponent(requestId)}`,
          wave12.moderationTransitionResponseSchema,
          withJsonBody(request, { method: 'PATCH' }),
        );
      },
    },
    publishPreference: {
      async get(): Promise<wave12.PublishPreferenceGetResponse> {
        return requestSessionJson(
          '/api/settings/publish-preference',
          wave12.publishPreferenceGetResponseSchema,
        );
      },
      async set(
        payload: wave12.PublishPreferenceSetRequest,
      ): Promise<wave12.PublishPreferenceSetResponse> {
        const request = wave12.publishPreferenceSetRequestSchema.parse(payload);
        return requestSessionJson(
          '/api/settings/publish-preference',
          wave12.publishPreferenceSetResponseSchema,
          withJsonBody(request, { method: 'PUT' }),
        );
      },
    },
    profile: {
      async get(): Promise<wave12.ProfileGetResponse> {
        return requestSessionJson('/api/profile', wave12.profileGetResponseSchema);
      },
      async set(payload: wave12.ProfileSetRequest): Promise<wave12.ProfileSetResponse> {
        const request = wave12.profileSetRequestSchema.parse(payload);
        return requestSessionJson(
          '/api/profile',
          wave12.profileSetResponseSchema,
          withJsonBody(request, { method: 'PUT' }),
        );
      },
    },
    bookmarks: {
      async list(request: PersonalListRequest = {}): Promise<wave12.BookmarkListResponse> {
        return requestSessionJson(
          `/api/personal/bookmarks${buildQuery(request)}`,
          wave12.bookmarkListResponseSchema,
        );
      },
      async create(payload: wave12.BookmarkCreateRequest): Promise<wave12.BookmarkWriteResponse> {
        const request = wave12.bookmarkCreateRequestSchema.parse(payload);
        return requestSessionJson(
          '/api/personal/bookmarks',
          wave12.bookmarkWriteResponseSchema,
          withJsonBody(request, { method: 'POST' }),
        );
      },
      async update(
        id: string,
        payload: wave12.BookmarkUpdateRequest,
      ): Promise<wave12.BookmarkWriteResponse> {
        const requestId = z.string().min(1).parse(id);
        const request = wave12.bookmarkUpdateRequestSchema.parse(payload);
        return requestSessionJson(
          `/api/personal/bookmarks/${encodeURIComponent(requestId)}`,
          wave12.bookmarkWriteResponseSchema,
          withJsonBody(request, { method: 'PATCH' }),
        );
      },
      async delete(id: string): Promise<wave12.DeleteResponse> {
        const requestId = z.string().min(1).parse(id);
        return requestSessionJson(
          `/api/personal/bookmarks/${encodeURIComponent(requestId)}`,
          wave12.deleteResponseSchema,
          { method: 'DELETE' },
        );
      },
    },
    notes: {
      async list(request: PersonalListRequest = {}): Promise<wave12.NoteListResponse> {
        return requestSessionJson(`/api/personal/notes${buildQuery(request)}`, wave12.noteListResponseSchema);
      },
      async create(payload: wave12.NoteCreateRequest): Promise<wave12.NoteWriteResponse> {
        const request = wave12.noteCreateRequestSchema.parse(payload);
        return requestSessionJson(
          '/api/personal/notes',
          wave12.noteWriteResponseSchema,
          withJsonBody(request, { method: 'POST' }),
        );
      },
      async update(id: string, payload: wave12.NoteUpdateRequest): Promise<wave12.NoteWriteResponse> {
        const requestId = z.string().min(1).parse(id);
        const request = wave12.noteUpdateRequestSchema.parse(payload);
        return requestSessionJson(
          `/api/personal/notes/${encodeURIComponent(requestId)}`,
          wave12.noteWriteResponseSchema,
          withJsonBody(request, { method: 'PATCH' }),
        );
      },
      async delete(id: string): Promise<wave12.DeleteResponse> {
        const requestId = z.string().min(1).parse(id);
        return requestSessionJson(
          `/api/personal/notes/${encodeURIComponent(requestId)}`,
          wave12.deleteResponseSchema,
          { method: 'DELETE' },
        );
      },
    },
    annotations: {
      async list(request: PersonalListRequest = {}): Promise<wave12.AnnotationListResponse> {
        return requestSessionJson(
          `/api/personal/annotations${buildQuery(request)}`,
          wave12.annotationListResponseSchema,
        );
      },
      async create(
        payload: wave12.AnnotationCreateRequest,
      ): Promise<wave12.AnnotationWriteResponse> {
        const request = wave12.annotationCreateRequestSchema.parse(payload);
        return requestSessionJson(
          '/api/personal/annotations',
          wave12.annotationWriteResponseSchema,
          withJsonBody(request, { method: 'POST' }),
        );
      },
      async update(
        id: string,
        payload: wave12.AnnotationUpdateRequest,
      ): Promise<wave12.AnnotationWriteResponse> {
        const requestId = z.string().min(1).parse(id);
        const request = wave12.annotationUpdateRequestSchema.parse(payload);
        return requestSessionJson(
          `/api/personal/annotations/${encodeURIComponent(requestId)}`,
          wave12.annotationWriteResponseSchema,
          withJsonBody(request, { method: 'PATCH' }),
        );
      },
      async delete(id: string): Promise<wave12.DeleteResponse> {
        const requestId = z.string().min(1).parse(id);
        return requestSessionJson(
          `/api/personal/annotations/${encodeURIComponent(requestId)}`,
          wave12.deleteResponseSchema,
          { method: 'DELETE' },
        );
      },
    },
    comments: {
      async list(request: PersonalListRequest = {}): Promise<wave12.CommentListResponse> {
        return requestSessionJson(
          `/api/personal/comments${buildQuery(request)}`,
          wave12.commentListResponseSchema,
        );
      },
      async create(payload: wave12.CommentCreateRequest): Promise<wave12.CommentWriteResponse> {
        const request = wave12.commentCreateRequestSchema.parse(payload);
        return requestSessionJson(
          '/api/personal/comments',
          wave12.commentWriteResponseSchema,
          withJsonBody(request, { method: 'POST' }),
        );
      },
      async update(
        id: string,
        payload: wave12.CommentUpdateRequest,
      ): Promise<wave12.CommentWriteResponse> {
        const requestId = z.string().min(1).parse(id);
        const request = wave12.commentUpdateRequestSchema.parse(payload);
        return requestSessionJson(
          `/api/personal/comments/${encodeURIComponent(requestId)}`,
          wave12.commentWriteResponseSchema,
          withJsonBody(request, { method: 'PATCH' }),
        );
      },
      async delete(id: string): Promise<wave12.DeleteResponse> {
        const requestId = z.string().min(1).parse(id);
        return requestSessionJson(
          `/api/personal/comments/${encodeURIComponent(requestId)}`,
          wave12.deleteResponseSchema,
          { method: 'DELETE' },
        );
      },
    },
    recentlyViewed: {
      async list(request: PersonalListRequest = {}): Promise<wave12.RecentlyViewedListResponse> {
        return requestSessionJson(
          `/api/personal/recently-viewed${buildQuery(request)}`,
          wave12.recentlyViewedListResponseSchema,
        );
      },
      async create(
        payload: wave12.RecentlyViewedCreateRequest,
      ): Promise<wave12.RecentlyViewedWriteResponse> {
        const request = wave12.recentlyViewedCreateRequestSchema.parse(payload);
        return requestSessionJson(
          '/api/personal/recently-viewed',
          wave12.recentlyViewedWriteResponseSchema,
          withJsonBody(request, { method: 'POST' }),
        );
      },
      async update(
        id: string,
        payload: wave12.RecentlyViewedUpdateRequest,
      ): Promise<wave12.RecentlyViewedWriteResponse> {
        const requestId = z.string().min(1).parse(id);
        const request = wave12.recentlyViewedUpdateRequestSchema.parse(payload);
        return requestSessionJson(
          `/api/personal/recently-viewed/${encodeURIComponent(requestId)}`,
          wave12.recentlyViewedWriteResponseSchema,
          withJsonBody(request, { method: 'PATCH' }),
        );
      },
      async delete(id: string): Promise<wave12.DeleteResponse> {
        const requestId = z.string().min(1).parse(id);
        return requestSessionJson(
          `/api/personal/recently-viewed/${encodeURIComponent(requestId)}`,
          wave12.deleteResponseSchema,
          { method: 'DELETE' },
        );
      },
    },
    personalization: {
      async getActivitySummary(
        request: wave14.ActivitySummaryRequest,
      ): Promise<wave14.ActivitySummaryResponse> {
        const query = wave14.activitySummaryRequestSchema.parse(request);
        return requestSessionJson(
          `/api/personal/activity-summary${buildQuery(query)}`,
          wave14.activitySummaryResponseSchema,
        );
      },
    },
    personal: {
      async rankSuggestions(
        payload: wave18.RankSuggestionsRequest,
      ): Promise<wave18.RankSuggestionsResponse> {
        const request = wave18.rankSuggestionsRequestSchema.parse(payload);
        return requestSessionJson(
          '/api/personal/rank-suggestions',
          wave18.rankSuggestionsResponseSchema,
          withJsonBody(request, { method: 'POST' }),
        );
      },
    },
    community: {
      async listByType(
        request: wave13.CommunityListByTypeRequest = {},
      ): Promise<wave13.CommunityListByTypeResponse> {
        const query = wave13.communityListByTypeRequestSchema.parse(request);
        return requestSessionJson(
          `/api/community/objects${buildQuery(query)}`,
          wave13.communityListByTypeResponseSchema,
        );
      },
      async getWithReplies(id: string): Promise<wave13.CommunityGetWithRepliesResponse> {
        const request = wave13.communityGetWithRepliesRequestSchema.parse({ id });
        return requestSessionJson(
          `/api/community/objects/${encodeURIComponent(request.id)}/replies`,
          wave13.communityGetWithRepliesResponseSchema,
        );
      },
      async reply(payload: wave13.CommunityReplyRequest): Promise<wave12.CommentWriteResponse> {
        const commentRequest = wave13.toCommunityReplyCommentRequest(payload);
        return requestSessionJson(
          '/api/community/replies',
          wave12.commentWriteResponseSchema,
          withJsonBody(commentRequest, { method: 'POST' }),
        );
      },
      async follow(
        payload: wave13.CommunityFollowRequest,
      ): Promise<wave13.CommunityInteractionWriteResponse> {
        const request = wave13.communityFollowRequestSchema.parse(payload);
        return requestSessionJson(
          '/api/community/follows',
          wave13.communityInteractionWriteResponseSchema,
          withJsonBody(request, { method: 'POST' }),
        );
      },
      async unfollow(
        payload: wave13.CommunityUnfollowRequest,
      ): Promise<wave13.CommunityInteractionUndoResponse> {
        const request = wave13.communityUnfollowRequestSchema.parse(payload);
        return requestSessionJson(
          '/api/community/follows',
          wave13.communityInteractionUndoResponseSchema,
          withJsonBody(request, { method: 'DELETE' }),
        );
      },
      async offerHelp(
        payload: wave13.CommunityOfferHelpRequest,
      ): Promise<wave13.CommunityInteractionWriteResponse> {
        const request = wave13.communityOfferHelpRequestSchema.parse(payload);
        return requestSessionJson(
          '/api/community/offers',
          wave13.communityInteractionWriteResponseSchema,
          withJsonBody(request, { method: 'POST' }),
        );
      },
      async actions(payload: wave14.CommunityActionRequest): Promise<wave14.CommunityActionResponse> {
        const request = wave14.communityActionRequestSchema.parse(payload);
        return requestSessionJson(
          '/api/community/actions',
          wave14.communityActionResponseSchema,
          withJsonBody(request, { method: 'POST' }),
        );
      },
      async join(payload: wave13.CommunityJoinRequest): Promise<wave13.CommunityInteractionWriteResponse> {
        const request = wave13.communityJoinRequestSchema.parse(payload);
        return requestSessionJson(
          '/api/community/joins',
          wave13.communityInteractionWriteResponseSchema,
          withJsonBody(request, { method: 'POST' }),
        );
      },
      async leave(payload: wave13.CommunityLeaveRequest): Promise<wave13.CommunityInteractionUndoResponse> {
        const request = wave13.communityLeaveRequestSchema.parse(payload);
        return requestSessionJson(
          '/api/community/joins',
          wave13.communityInteractionUndoResponseSchema,
          withJsonBody(request, { method: 'DELETE' }),
        );
      },
      async listInteractions(
        request: wave13.CommunityInteractionListRequest = {},
      ): Promise<wave13.CommunityInteractionListResponse> {
        const query = wave13.communityInteractionListRequestSchema.parse(request);
        return requestSessionJson(
          `/api/community/interactions${buildQuery(query)}`,
          wave13.communityInteractionListResponseSchema,
        );
      },
      async match(payload: wave14.MatchExperimentRequest): Promise<wave14.MatchExperimentResponse> {
        const request = wave14.matchExperimentRequestSchema.parse(payload);
        return requestSessionJson(
          '/api/community/match',
          wave14.matchExperimentResponseSchema,
          withJsonBody(request, { method: 'POST' }),
        );
      },
      async matchFeedback(
        payload: wave14.MatchFeedbackRequest,
      ): Promise<wave14.MatchFeedbackResponse> {
        const request = wave14.matchFeedbackRequestSchema.parse(payload);
        return requestSessionJson(
          '/api/community/match/feedback',
          wave14.matchFeedbackResponseSchema,
          withJsonBody(request, { method: 'POST' }),
        );
      },
      async matchStub(payload: wave13.CommunityMatchRequest): Promise<wave13.CommunityMatchResponse> {
        const request = wave13.communityMatchRequestSchema.parse(payload);
        return requestSessionJson(
          '/api/community/match',
          wave13.communityMatchResponseSchema,
          withJsonBody(request, { method: 'POST' }),
        );
      },
    },
    v1: {
      objects: {
        async list(
          request: wave12.ObjectListRequest = {},
          options?: AgentRequestOptions,
        ): Promise<wave12.ObjectListResponse> {
          const query = wave12.objectListRequestSchema.parse(request);
          return requestAgentJson(
            `/api/v1/objects${buildQuery(query)}`,
            wave12.objectListResponseSchema,
            options,
          );
        },
        async get(id: string, options?: AgentRequestOptions): Promise<wave12.ObjectGetResponse> {
          const request = wave12.objectGetRequestSchema.parse({ id });
          return requestAgentJson(
            `/api/v1/objects/${encodeURIComponent(request.id)}`,
            wave12.objectGetResponseSchema,
            options,
          );
        },
        async create(
          payload: wave12.ObjectCreateRequest,
          options?: AgentRequestOptions,
        ): Promise<wave12.ObjectWriteResponse> {
          const request = wave12.objectCreateRequestSchema.parse(payload);
          return requestAgentJson(
            '/api/v1/objects',
            wave12.objectWriteResponseSchema,
            options,
            withJsonBody(request, { method: 'POST' }),
          );
        },
        async saveDraft(
          payload: wave12.ObjectDraftRequest,
          options?: AgentRequestOptions,
        ): Promise<wave12.ObjectWriteResponse> {
          const request = wave12.objectDraftRequestSchema.parse(payload);
          return requestAgentJson(
            '/api/v1/objects/drafts',
            wave12.objectWriteResponseSchema,
            options,
            withJsonBody(request, { method: 'POST' }),
          );
        },
        async submit(
          payload: wave12.ObjectSubmitRequest,
          options?: AgentRequestOptions,
        ): Promise<wave12.ObjectWriteResponse> {
          const request = wave12.objectSubmitRequestSchema.parse(payload);
          return requestAgentJson(
            '/api/v1/objects/submit',
            wave12.objectWriteResponseSchema,
            options,
            withJsonBody(request, { method: 'POST' }),
          );
        },
      },
      contributions: {
        async create(
          payload: wave12.ContributionCreateRequest,
          options?: AgentRequestOptions,
        ): Promise<wave12.ContributionWriteResponse> {
          const request = wave12.contributionCreateRequestSchema.parse(payload);
          return requestAgentJson(
            '/api/v1/contributions',
            wave12.contributionWriteResponseSchema,
            options,
            withJsonBody(request, { method: 'POST' }),
          );
        },
        async saveDraft(
          payload: wave12.ContributionDraftRequest,
          options?: AgentRequestOptions,
        ): Promise<wave12.ContributionWriteResponse> {
          const request = wave12.contributionDraftRequestSchema.parse(payload);
          return requestAgentJson(
            '/api/v1/contributions/drafts',
            wave12.contributionWriteResponseSchema,
            options,
            withJsonBody(request, { method: 'POST' }),
          );
        },
        async submit(
          payload: wave12.ContributionSubmitRequest,
          options?: AgentRequestOptions,
        ): Promise<wave12.ContributionWriteResponse> {
          const request = wave12.contributionSubmitRequestSchema.parse(payload);
          return requestAgentJson(
            '/api/v1/contributions/submit',
            wave12.contributionWriteResponseSchema,
            options,
            withJsonBody(request, { method: 'POST' }),
          );
        },
      },
      moderation: {
        async list(
          request: wave12.ModerationQueueListRequest = {},
          options?: AgentRequestOptions,
        ): Promise<wave12.ModerationQueueListResponse> {
          const query = wave12.moderationQueueListRequestSchema.parse(request);
          return requestAgentJson(
            `/api/v1/moderation/queue${buildQuery(query)}`,
            wave12.moderationQueueListResponseSchema,
            options,
          );
        },
        async transition(
          id: string,
          payload: wave12.ModerationTransitionRequest,
          options?: AgentRequestOptions,
        ): Promise<wave12.ModerationTransitionResponse> {
          const requestId = z.string().min(1).parse(id);
          const request = wave12.moderationTransitionRequestSchema.parse(payload);
          return requestAgentJson(
            `/api/v1/moderation/queue/${encodeURIComponent(requestId)}`,
            wave12.moderationTransitionResponseSchema,
            options,
            withJsonBody(request, { method: 'PATCH' }),
          );
        },
      },
      publishPreference: {
        async get(options?: AgentRequestOptions): Promise<wave12.PublishPreferenceGetResponse> {
          return requestAgentJson(
            '/api/v1/settings/publish-preference',
            wave12.publishPreferenceGetResponseSchema,
            options,
          );
        },
        async set(
          payload: wave12.PublishPreferenceSetRequest,
          options?: AgentRequestOptions,
        ): Promise<wave12.PublishPreferenceSetResponse> {
          const request = wave12.publishPreferenceSetRequestSchema.parse(payload);
          return requestAgentJson(
            '/api/v1/settings/publish-preference',
            wave12.publishPreferenceSetResponseSchema,
            options,
            withJsonBody(request, { method: 'PUT' }),
          );
        },
      },
      profile: {
        async get(options?: AgentRequestOptions): Promise<wave12.ProfileGetResponse> {
          return requestAgentJson('/api/v1/profile', wave12.profileGetResponseSchema, options);
        },
        async set(
          payload: wave12.ProfileSetRequest,
          options?: AgentRequestOptions,
        ): Promise<wave12.ProfileSetResponse> {
          const request = wave12.profileSetRequestSchema.parse(payload);
          return requestAgentJson(
            '/api/v1/profile',
            wave12.profileSetResponseSchema,
            options,
            withJsonBody(request, { method: 'PUT' }),
          );
        },
      },
      bookmarks: {
        async list(
          request: PersonalListRequest = {},
          options?: AgentRequestOptions,
        ): Promise<wave12.BookmarkListResponse> {
          return requestAgentJson(
            `/api/v1/personal/bookmarks${buildQuery(request)}`,
            wave12.bookmarkListResponseSchema,
            options,
          );
        },
        async create(
          payload: wave12.BookmarkCreateRequest,
          options?: AgentRequestOptions,
        ): Promise<wave12.BookmarkWriteResponse> {
          const request = wave12.bookmarkCreateRequestSchema.parse(payload);
          return requestAgentJson(
            '/api/v1/personal/bookmarks',
            wave12.bookmarkWriteResponseSchema,
            options,
            withJsonBody(request, { method: 'POST' }),
          );
        },
        async update(
          id: string,
          payload: wave12.BookmarkUpdateRequest,
          options?: AgentRequestOptions,
        ): Promise<wave12.BookmarkWriteResponse> {
          const requestId = z.string().min(1).parse(id);
          const request = wave12.bookmarkUpdateRequestSchema.parse(payload);
          return requestAgentJson(
            `/api/v1/personal/bookmarks/${encodeURIComponent(requestId)}`,
            wave12.bookmarkWriteResponseSchema,
            options,
            withJsonBody(request, { method: 'PATCH' }),
          );
        },
        async delete(id: string, options?: AgentRequestOptions): Promise<wave12.DeleteResponse> {
          const requestId = z.string().min(1).parse(id);
          return requestAgentJson(
            `/api/v1/personal/bookmarks/${encodeURIComponent(requestId)}`,
            wave12.deleteResponseSchema,
            options,
            { method: 'DELETE' },
          );
        },
      },
      notes: {
        async list(
          request: PersonalListRequest = {},
          options?: AgentRequestOptions,
        ): Promise<wave12.NoteListResponse> {
          return requestAgentJson(
            `/api/v1/personal/notes${buildQuery(request)}`,
            wave12.noteListResponseSchema,
            options,
          );
        },
        async create(
          payload: wave12.NoteCreateRequest,
          options?: AgentRequestOptions,
        ): Promise<wave12.NoteWriteResponse> {
          const request = wave12.noteCreateRequestSchema.parse(payload);
          return requestAgentJson(
            '/api/v1/personal/notes',
            wave12.noteWriteResponseSchema,
            options,
            withJsonBody(request, { method: 'POST' }),
          );
        },
        async update(
          id: string,
          payload: wave12.NoteUpdateRequest,
          options?: AgentRequestOptions,
        ): Promise<wave12.NoteWriteResponse> {
          const requestId = z.string().min(1).parse(id);
          const request = wave12.noteUpdateRequestSchema.parse(payload);
          return requestAgentJson(
            `/api/v1/personal/notes/${encodeURIComponent(requestId)}`,
            wave12.noteWriteResponseSchema,
            options,
            withJsonBody(request, { method: 'PATCH' }),
          );
        },
        async delete(id: string, options?: AgentRequestOptions): Promise<wave12.DeleteResponse> {
          const requestId = z.string().min(1).parse(id);
          return requestAgentJson(
            `/api/v1/personal/notes/${encodeURIComponent(requestId)}`,
            wave12.deleteResponseSchema,
            options,
            { method: 'DELETE' },
          );
        },
      },
      annotations: {
        async list(
          request: PersonalListRequest = {},
          options?: AgentRequestOptions,
        ): Promise<wave12.AnnotationListResponse> {
          return requestAgentJson(
            `/api/v1/personal/annotations${buildQuery(request)}`,
            wave12.annotationListResponseSchema,
            options,
          );
        },
        async create(
          payload: wave12.AnnotationCreateRequest,
          options?: AgentRequestOptions,
        ): Promise<wave12.AnnotationWriteResponse> {
          const request = wave12.annotationCreateRequestSchema.parse(payload);
          return requestAgentJson(
            '/api/v1/personal/annotations',
            wave12.annotationWriteResponseSchema,
            options,
            withJsonBody(request, { method: 'POST' }),
          );
        },
        async update(
          id: string,
          payload: wave12.AnnotationUpdateRequest,
          options?: AgentRequestOptions,
        ): Promise<wave12.AnnotationWriteResponse> {
          const requestId = z.string().min(1).parse(id);
          const request = wave12.annotationUpdateRequestSchema.parse(payload);
          return requestAgentJson(
            `/api/v1/personal/annotations/${encodeURIComponent(requestId)}`,
            wave12.annotationWriteResponseSchema,
            options,
            withJsonBody(request, { method: 'PATCH' }),
          );
        },
        async delete(id: string, options?: AgentRequestOptions): Promise<wave12.DeleteResponse> {
          const requestId = z.string().min(1).parse(id);
          return requestAgentJson(
            `/api/v1/personal/annotations/${encodeURIComponent(requestId)}`,
            wave12.deleteResponseSchema,
            options,
            { method: 'DELETE' },
          );
        },
      },
      comments: {
        async list(
          request: PersonalListRequest = {},
          options?: AgentRequestOptions,
        ): Promise<wave12.CommentListResponse> {
          return requestAgentJson(
            `/api/v1/personal/comments${buildQuery(request)}`,
            wave12.commentListResponseSchema,
            options,
          );
        },
        async create(
          payload: wave12.CommentCreateRequest,
          options?: AgentRequestOptions,
        ): Promise<wave12.CommentWriteResponse> {
          const request = wave12.commentCreateRequestSchema.parse(payload);
          return requestAgentJson(
            '/api/v1/personal/comments',
            wave12.commentWriteResponseSchema,
            options,
            withJsonBody(request, { method: 'POST' }),
          );
        },
        async update(
          id: string,
          payload: wave12.CommentUpdateRequest,
          options?: AgentRequestOptions,
        ): Promise<wave12.CommentWriteResponse> {
          const requestId = z.string().min(1).parse(id);
          const request = wave12.commentUpdateRequestSchema.parse(payload);
          return requestAgentJson(
            `/api/v1/personal/comments/${encodeURIComponent(requestId)}`,
            wave12.commentWriteResponseSchema,
            options,
            withJsonBody(request, { method: 'PATCH' }),
          );
        },
        async delete(id: string, options?: AgentRequestOptions): Promise<wave12.DeleteResponse> {
          const requestId = z.string().min(1).parse(id);
          return requestAgentJson(
            `/api/v1/personal/comments/${encodeURIComponent(requestId)}`,
            wave12.deleteResponseSchema,
            options,
            { method: 'DELETE' },
          );
        },
      },
      recentlyViewed: {
        async list(
          request: PersonalListRequest = {},
          options?: AgentRequestOptions,
        ): Promise<wave12.RecentlyViewedListResponse> {
          return requestAgentJson(
            `/api/v1/personal/recently-viewed${buildQuery(request)}`,
            wave12.recentlyViewedListResponseSchema,
            options,
          );
        },
        async create(
          payload: wave12.RecentlyViewedCreateRequest,
          options?: AgentRequestOptions,
        ): Promise<wave12.RecentlyViewedWriteResponse> {
          const request = wave12.recentlyViewedCreateRequestSchema.parse(payload);
          return requestAgentJson(
            '/api/v1/personal/recently-viewed',
            wave12.recentlyViewedWriteResponseSchema,
            options,
            withJsonBody(request, { method: 'POST' }),
          );
        },
        async update(
          id: string,
          payload: wave12.RecentlyViewedUpdateRequest,
          options?: AgentRequestOptions,
        ): Promise<wave12.RecentlyViewedWriteResponse> {
          const requestId = z.string().min(1).parse(id);
          const request = wave12.recentlyViewedUpdateRequestSchema.parse(payload);
          return requestAgentJson(
            `/api/v1/personal/recently-viewed/${encodeURIComponent(requestId)}`,
            wave12.recentlyViewedWriteResponseSchema,
            options,
            withJsonBody(request, { method: 'PATCH' }),
          );
        },
        async delete(id: string, options?: AgentRequestOptions): Promise<wave12.DeleteResponse> {
          const requestId = z.string().min(1).parse(id);
          return requestAgentJson(
            `/api/v1/personal/recently-viewed/${encodeURIComponent(requestId)}`,
            wave12.deleteResponseSchema,
            options,
            { method: 'DELETE' },
          );
        },
      },
      personalization: {
        async getActivitySummary(
          request: wave14.ActivitySummaryRequest,
          options?: AgentRequestOptions,
        ): Promise<wave14.ActivitySummaryResponse> {
          const query = wave14.activitySummaryRequestSchema.parse(request);
          return requestAgentJson(
            `/api/v1/personal/activity-summary${buildQuery(query)}`,
            wave14.activitySummaryResponseSchema,
            options,
          );
        },
      },
      personal: {
        async rankSuggestions(
          payload: wave18.RankSuggestionsRequest,
          options?: AgentRequestOptions,
        ): Promise<wave18.RankSuggestionsResponse> {
          const request = wave18.rankSuggestionsRequestSchema.parse(payload);
          return requestAgentJson(
            '/api/v1/personal/rank-suggestions',
            wave18.rankSuggestionsResponseSchema,
            options,
            withJsonBody(request, { method: 'POST' }),
          );
        },
      },
      community: {
        async listByType(
          request: wave13.CommunityListByTypeRequest = {},
          options?: AgentRequestOptions,
        ): Promise<wave13.CommunityListByTypeResponse> {
          const query = wave13.communityListByTypeRequestSchema.parse(request);
          return requestAgentJson(
            `/api/v1/community/objects${buildQuery(query)}`,
            wave13.communityListByTypeResponseSchema,
            options,
          );
        },
        async getWithReplies(
          id: string,
          options?: AgentRequestOptions,
        ): Promise<wave13.CommunityGetWithRepliesResponse> {
          const request = wave13.communityGetWithRepliesRequestSchema.parse({ id });
          return requestAgentJson(
            `/api/v1/community/objects/${encodeURIComponent(request.id)}/replies`,
            wave13.communityGetWithRepliesResponseSchema,
            options,
          );
        },
        async reply(
          payload: wave13.CommunityReplyRequest,
          options?: AgentRequestOptions,
        ): Promise<wave12.CommentWriteResponse> {
          const commentRequest = wave13.toCommunityReplyCommentRequest(payload);
          return requestAgentJson(
            '/api/v1/community/replies',
            wave12.commentWriteResponseSchema,
            options,
            withJsonBody(commentRequest, { method: 'POST' }),
          );
        },
        async follow(
          payload: wave13.CommunityFollowRequest,
          options?: AgentRequestOptions,
        ): Promise<wave13.CommunityInteractionWriteResponse> {
          const request = wave13.communityFollowRequestSchema.parse(payload);
          return requestAgentJson(
            '/api/v1/community/follows',
            wave13.communityInteractionWriteResponseSchema,
            options,
            withJsonBody(request, { method: 'POST' }),
          );
        },
        async unfollow(
          payload: wave13.CommunityUnfollowRequest,
          options?: AgentRequestOptions,
        ): Promise<wave13.CommunityInteractionUndoResponse> {
          const request = wave13.communityUnfollowRequestSchema.parse(payload);
          return requestAgentJson(
            '/api/v1/community/follows',
            wave13.communityInteractionUndoResponseSchema,
            options,
            withJsonBody(request, { method: 'DELETE' }),
          );
        },
        async offerHelp(
          payload: wave13.CommunityOfferHelpRequest,
          options?: AgentRequestOptions,
        ): Promise<wave13.CommunityInteractionWriteResponse> {
          const request = wave13.communityOfferHelpRequestSchema.parse(payload);
          return requestAgentJson(
            '/api/v1/community/offers',
            wave13.communityInteractionWriteResponseSchema,
            options,
            withJsonBody(request, { method: 'POST' }),
          );
        },
        async actions(
          payload: wave14.CommunityActionRequest,
          options?: AgentRequestOptions,
        ): Promise<wave14.CommunityActionResponse> {
          const request = wave14.communityActionRequestSchema.parse(payload);
          return requestAgentJson(
            '/api/v1/community/actions',
            wave14.communityActionResponseSchema,
            options,
            withJsonBody(request, { method: 'POST' }),
          );
        },
        async join(
          payload: wave13.CommunityJoinRequest,
          options?: AgentRequestOptions,
        ): Promise<wave13.CommunityInteractionWriteResponse> {
          const request = wave13.communityJoinRequestSchema.parse(payload);
          return requestAgentJson(
            '/api/v1/community/joins',
            wave13.communityInteractionWriteResponseSchema,
            options,
            withJsonBody(request, { method: 'POST' }),
          );
        },
        async leave(
          payload: wave13.CommunityLeaveRequest,
          options?: AgentRequestOptions,
        ): Promise<wave13.CommunityInteractionUndoResponse> {
          const request = wave13.communityLeaveRequestSchema.parse(payload);
          return requestAgentJson(
            '/api/v1/community/joins',
            wave13.communityInteractionUndoResponseSchema,
            options,
            withJsonBody(request, { method: 'DELETE' }),
          );
        },
        async listInteractions(
          request: wave13.CommunityInteractionListRequest = {},
          options?: AgentRequestOptions,
        ): Promise<wave13.CommunityInteractionListResponse> {
          const query = wave13.communityInteractionListRequestSchema.parse(request);
          return requestAgentJson(
            `/api/v1/community/interactions${buildQuery(query)}`,
            wave13.communityInteractionListResponseSchema,
            options,
          );
        },
        async match(
          payload: wave14.MatchExperimentRequest,
          options?: AgentRequestOptions,
        ): Promise<wave14.MatchExperimentResponse> {
          const request = wave14.matchExperimentRequestSchema.parse(payload);
          return requestAgentJson(
            '/api/v1/community/match',
            wave14.matchExperimentResponseSchema,
            options,
            withJsonBody(request, { method: 'POST' }),
          );
        },
        async matchFeedback(
          payload: wave14.MatchFeedbackRequest,
          options?: AgentRequestOptions,
        ): Promise<wave14.MatchFeedbackResponse> {
          const request = wave14.matchFeedbackRequestSchema.parse(payload);
          return requestAgentJson(
            '/api/v1/community/match/feedback',
            wave14.matchFeedbackResponseSchema,
            options,
            withJsonBody(request, { method: 'POST' }),
          );
        },
        async matchStub(
          payload: wave13.CommunityMatchRequest,
          options?: AgentRequestOptions,
        ): Promise<wave13.CommunityMatchResponse> {
          const request = wave13.communityMatchRequestSchema.parse(payload);
          return requestAgentJson(
            '/api/v1/community/match',
            wave13.communityMatchResponseSchema,
            options,
            withJsonBody(request, { method: 'POST' }),
          );
        },
      },
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
    'Start at GET ' + `${base}/api/agent` + ' — holistic site intro and API orientation (text).',
    'Set a stable X-Agent-Client-Id header (e.g. "your-agent/1.0") on content reads — 3/day anonymous, 10/day after authorize.',
    '',
    '1. Call GET ' + `${base}/api/v1/capabilities` + ' — quotas, endpoints, error codes, and auth rules.',
    '2. Call GET ' + `${base}/api/v1/content?site=${site}` + ' — article index with api_url per entry (no read quota).',
    '3. Call GET ' + `${base}/api/v1/curated?site=${site}` + ' — what editors highlight now.',
    '4. Call GET ' + `${base}/api/v1/content/{slug}?site=${site}` + ' — full article body (counts as a read).',
    '5. To submit on behalf of a human (' + writeScopes + '):',
    '   POST ' + `${base}/api/v1/agent/authorize` + ' (human completes one email confirm),',
    '   then POST ' + `${base}/api/v1/contributions` + ' with Authorization: Bearer <token>.',
    '',
    'Errors return JSON: { ok: false, error: "machine_code", message?: "..." }.',
    'Human-readable protocol: ' + `${origin}/for-agents`,
  ].join('\n');
}

const AGENT_ENTRY_API_VERSION = '1.0.0';

function agentEntryQuickStartLines(site: AgentSite, origin: string): string {
  const writeScopes =
    site === 'io'
      ? 'inquiries (question box)'
      : 'stories, prompt replies, and inquiries';

  return [
    'Set a stable X-Agent-Client-Id header (e.g. "your-agent/1.0") on content reads — 3/day anonymous, 10/day after authorize.',
    '',
    `1. GET ${origin}/api/v1/capabilities — quotas, endpoints, error codes.`,
    `2. GET ${origin}/api/v1/content?site=${site} — article index with api_url per entry (no read quota).`,
    `3. GET ${origin}/api/v1/curated?site=${site} — editor highlights.`,
    `4. GET ${origin}/api/v1/content/{slug}?site=${site} — full article (counts as a read).`,
    `5. To submit on behalf of a human (${writeScopes}): POST ${origin}/api/v1/agent/authorize, then POST ${origin}/api/v1/contributions with Bearer token.`,
    '',
    'Errors: JSON { ok: false, error: "machine_code", message?: "..." }.',
  ].join('\n');
}

export function buildAgentEntryText(site: AgentSite): string {
  const origin = SITE_ORIGIN[site];
  const quickStart = agentEntryQuickStartLines(site, origin);

  if (site === 'org') {
    return [
      '# AI Transformation · Harvest Hub — agent entry',
      '',
      `You are reading the agent entry for ${origin}.`,
      'This is a community site ("Harvest Hub") for sharing field experiences about enterprise AI transformation — not hype, not vendor pitches.',
      '',
      '## What humans do here',
      '',
      '- Read learn guides and curated topics before contributing.',
      '- Share stories and prompt replies when they have something real.',
      '- Use the in-site companion (chat sidebar) when unsure where to start.',
      '',
      '## What agents should do',
      '',
      'Do not scrape HTML. Use the versioned JSON API under `/api/v1/`.',
      'Start with this page for orientation, then follow the machine-readable steps below.',
      '',
      '### Discovery',
      '',
      `- ${origin}/llms.txt — concise machine-readable index of API URLs.`,
      `- ${origin}/robots.txt — includes pointers to this entry and llms.txt.`,
      '',
      '### API version',
      '',
      `- Current protocol: **${AGENT_ENTRY_API_VERSION}** (implementation: wave7_v1)`,
      `- Capabilities (endpoints, quotas, error codes): ${origin}/api/v1/capabilities`,
      `- Changelog (check before caching API knowledge): ${origin}/api/v1/agent/changelog`,
      '',
      'If a future version changes behavior, the changelog and capabilities response will say so first.',
      '',
      '### Interaction flow (summary)',
      '',
      quickStart,
      '',
      '### Write access',
      '',
      'Agents never post without a human in the loop. POST /api/v1/agent/authorize sends a one-time email confirm;',
      'the human clicks the link and you receive a Bearer token (180-day TTL, shared across .io and .org).',
      'On .org you may submit stories, prompt replies, and inquiries. On .io, inquiries only.',
      '',
      '### Human-readable mirror',
      '',
      `${origin}/for-agents — same protocol in editorial form for humans pasting into ChatGPT or Claude.`,
      '',
      '---',
      `api_version: ${AGENT_ENTRY_API_VERSION}`,
      `capabilities: ${origin}/api/v1/capabilities`,
    ].join('\n');
  }

  return [
    '# AI Transformation — agent entry',
    '',
    `You are reading the agent entry for ${origin}.`,
    'This is an executive information portal: structured frameworks, playbook articles, and role guides for enterprise AI transformation.',
    'Assessment (Three Gaps diagnostic) exists but is secondary — the primary human path is ask → read → assess.',
    '',
    '## What humans do here',
    '',
    '- Ask the in-site companion (chat sidebar) for grounded answers.',
    '- Read frameworks, playbook, and role guides for depth.',
    '- Run the organizational assessment when ready to measure progress.',
    '',
    '## What agents should do',
    '',
    'Do not scrape HTML. Use the versioned JSON API under `/api/v1/`.',
    'Start with this page for orientation, then follow the machine-readable steps below.',
    '',
    '### Discovery',
    '',
    `- ${origin}/llms.txt — concise machine-readable index of API URLs.`,
    `- ${origin}/robots.txt — includes pointers to this entry and llms.txt.`,
    '',
    '### API version',
    '',
    `- Current protocol: **${AGENT_ENTRY_API_VERSION}** (implementation: wave7_v1)`,
    `- Capabilities (endpoints, quotas, error codes): ${origin}/api/v1/capabilities`,
    `- Changelog (check before caching API knowledge): ${origin}/api/v1/agent/changelog`,
    '',
    'If a future version changes behavior, the changelog and capabilities response will say so first.',
    '',
    '### Interaction flow (summary)',
    '',
    quickStart,
    '',
    '### Write access',
    '',
    'Agents never post without a human in the loop. POST /api/v1/agent/authorize sends a one-time email confirm;',
    'the human clicks the link and you receive a Bearer token (180-day TTL, shared across .io and .org).',
    'On .io you may submit inquiries via POST /api/v1/contributions.',
    '',
    '### Community site',
    '',
    'Harvest Hub on https://ai-transformation.org — field stories and prompts. Same token, different write scopes.',
    '',
    '### Human-readable mirror',
    '',
    `${origin}/for-agents — same protocol in editorial form for humans pasting into ChatGPT or Claude.`,
    '',
    '---',
    `api_version: ${AGENT_ENTRY_API_VERSION}`,
    `capabilities: ${origin}/api/v1/capabilities`,
  ].join('\n');
}

export function buildAgentEntryJson(site: AgentSite) {
  const origin = SITE_ORIGIN[site];
  return {
    ok: true,
    api_version: AGENT_ENTRY_API_VERSION,
    implementation_status: 'wave7_v1',
    site: site === 'org' ? 'ai-transformation.org' : 'ai-transformation.io',
    entry: `${origin}/api/agent`,
    text: buildAgentEntryText(site),
    capabilities_url: `${origin}/api/v1/capabilities`,
    changelog_url: `${origin}/api/v1/agent/changelog`,
    human_documentation: `${origin}/for-agents`,
  };
}

export const AGENT_PANEL_HEADLINE = 'Agent-friendly';
export const AGENT_PANEL_SUMMARY =
  'Readable and writable via API — agents and humans are both first-class. Give your agent the quick start below, or send them the link to the full protocol.';
