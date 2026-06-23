import type { AskMode } from '@ai-transformation/shared';

/** Build an /ask deep link that preselects a mode and prefills the companion input. */
export function askPrefillHref(mode: AskMode, message: string, context?: string): string {
  const params = new URLSearchParams();
  params.set('mode', mode);
  params.set('message', message);
  if (context) {
    params.set('context', context);
  }
  return `/ask?${params.toString()}`;
}

export type ContextualAction = {
  label: string;
  href: string;
};

/** §6 contextual actions for a .org Knowledge item → Ask prefill. */
export function knowledgeActions(title: string, slug: string): ContextualAction[] {
  return [
    {
      label: 'Summarize',
      href: askPrefillHref('ask', `Summarize the key points of "${title}" for someone new to it.`, slug),
    },
    {
      label: 'Cite in my contribution',
      href: askPrefillHref('submit', `Help me cite "${title}" in a contribution I'm drafting.`, slug),
    },
  ];
}

/** §6 contextual actions for a .org Community item → Ask prefill. */
export function communityActions(title: string, type: string, id: string): ContextualAction[] {
  return [
    {
      label: 'Draft reply',
      href: askPrefillHref('ask', `Draft a thoughtful reply to the community ${type} "${title}".`, id),
    },
    {
      label: 'Turn into field note',
      href: askPrefillHref('submit', `Turn the discussion "${title}" into a field note for the knowledge commons.`, id),
    },
    {
      label: 'Submit via Agent',
      href: askPrefillHref('submit', `Help me respond to "${title}" and submit it via the agent.`, id),
    },
  ];
}
