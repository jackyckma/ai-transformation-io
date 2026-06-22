export type SendNewsletterInput = {
  from: string;
  to: string[];
  subject: string;
  html?: string;
  text: string;
  replyTo?: string;
};

export type SendNewsletterResult = {
  ok: boolean;
  providerId?: string;
  error?: string;
};

export interface NewsletterProvider {
  readonly name: string;
  send(input: SendNewsletterInput): Promise<SendNewsletterResult>;
}

export class NoopNewsletterProvider implements NewsletterProvider {
  readonly name = 'noop';

  async send(input: SendNewsletterInput): Promise<SendNewsletterResult> {
    console.info('[newsletter] noop send', {
      from: input.from,
      toCount: input.to.length,
      subject: input.subject,
    });
    return { ok: true, providerId: 'noop' };
  }
}

export class ZeaburZSendProvider implements NewsletterProvider {
  readonly name = 'zeabur-zsend';

  async send(input: SendNewsletterInput): Promise<SendNewsletterResult> {
    const apiKey = process.env.ZSEND_API_KEY;
    if (!apiKey) {
      return { ok: false, error: 'ZSEND_API_KEY not configured' };
    }

    const payload: Record<string, unknown> = {
      from: input.from,
      to: input.to,
      subject: input.subject,
      text: input.text,
    };
    if (input.html) {
      payload.html = input.html;
    }
    if (input.replyTo) {
      payload.reply_to = input.replyTo;
    }

    const response = await fetch('https://api.zeabur.com/api/v1/zsend/emails', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const body = await response.text();
      return { ok: false, error: `ZSend ${response.status}: ${body.slice(0, 200)}` };
    }

    let providerId = 'zsend';
    try {
      const json = (await response.json()) as { id?: string; messageId?: string };
      providerId = json.id ?? json.messageId ?? providerId;
    } catch {
      // response may be empty
    }

    return { ok: true, providerId };
  }
}

export function getNewsletterProvider(): NewsletterProvider {
  if (process.env.ZSEND_API_KEY) {
    return new ZeaburZSendProvider();
  }
  return new NoopNewsletterProvider();
}
