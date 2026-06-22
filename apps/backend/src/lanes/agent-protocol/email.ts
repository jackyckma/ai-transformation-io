type SendAuthorizeEmailInput = {
  to: string;
  confirmUrl: string;
  clientId: string;
};

export type AuthorizeEmailResult = {
  sent: boolean;
  /** When transport is noop (dev/test), surface URL for agents/tests. */
  confirmUrl?: string;
};

export async function sendAuthorizeEmail(input: SendAuthorizeEmailInput): Promise<AuthorizeEmailResult> {
  const apiKey = process.env.ZSEND_API_KEY;
  const from = process.env.AGENT_AUTHORIZE_FROM ?? 'pulse@ai-transformation.io';

  if (!apiKey) {
    if (process.env.NODE_ENV === 'production') {
      console.warn('[agent-authorize] ZSEND_API_KEY not set — email not sent');
      return { sent: false };
    }
    console.info(`[agent-authorize] noop email to ${input.to}: ${input.confirmUrl}`);
    return { sent: false, confirmUrl: input.confirmUrl };
  }

  const response = await fetch('https://api.zeabur.com/api/v1/zsend/emails', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from,
      to: [input.to],
      subject: 'Confirm agent access — AI Transformation',
      text: [
        `An agent (${input.clientId}) requested write access on your behalf.`,
        '',
        'Confirm once to issue a 180-day write token (shared across .io and .org):',
        input.confirmUrl,
        '',
        'If you did not request this, ignore this email.',
      ].join('\n'),
    }),
  });

  if (!response.ok) {
    console.error('[agent-authorize] ZSend failed', response.status);
    return { sent: false, confirmUrl: process.env.NODE_ENV === 'production' ? undefined : input.confirmUrl };
  }

  return { sent: true };
}
