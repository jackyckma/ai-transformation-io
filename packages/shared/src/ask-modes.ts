export const askModeValues = ['ask', 'capture', 'submit', 'find-help'] as const;

export type AskMode = (typeof askModeValues)[number];
export type AskModeAudience = 'guest' | 'member';
export type AskModeSite = 'io' | 'org';

export type AskModeMetadata = {
  label: string;
  placeholder: string;
};

export const ASK_MODE_METADATA: Record<AskMode, AskModeMetadata> = {
  ask: {
    label: 'Ask',
    placeholder: 'Ask a question about the knowledge base and get a grounded answer.',
  },
  capture: {
    label: 'Capture',
    placeholder: 'Capture a rough thought, project context, or private note.',
  },
  submit: {
    label: 'Submit',
    placeholder: 'Describe your contribution and we will shape it into a draft.',
  },
  'find-help': {
    label: 'Find Help',
    placeholder: 'Describe what you need help with and the context that matters.',
  },
};

export const ASK_MODE_ACCESS: Record<AskModeSite, Record<AskModeAudience, readonly AskMode[]>> = {
  io: {
    guest: ['ask'],
    member: ['ask', 'capture'],
  },
  org: {
    guest: ['ask'],
    member: ['ask', 'capture', 'submit', 'find-help'],
  },
};

export function getAllowedAskModes(site: AskModeSite, audience: AskModeAudience): readonly AskMode[] {
  return ASK_MODE_ACCESS[site][audience];
}

export function isAskModeAllowed(
  site: AskModeSite,
  audience: AskModeAudience,
  mode: AskMode,
): boolean {
  return ASK_MODE_ACCESS[site][audience].includes(mode);
}
