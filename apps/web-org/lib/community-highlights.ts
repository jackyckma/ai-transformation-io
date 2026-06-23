export type CommunityType = 'discussion' | 'help_request' | 'event' | 'community_announcement';

export type CommunityHighlight = {
  id: string;
  type: CommunityType;
  title: string;
  summary: string;
  meta: string;
  /** Human verbs shown as non-functional affordances in Phase 1 (wiring in Wave 13). */
  verbs: string[];
};

export const COMMUNITY_TYPE_META: Record<CommunityType, { label: string; blurb: string }> = {
  discussion: { label: 'Discussion', blurb: 'Threads and conversation starters' },
  help_request: { label: 'Help request', blurb: 'Output of Find Help — someone needs a hand' },
  event: { label: 'Event', blurb: 'Community sessions and office hours' },
  community_announcement: { label: 'Announcement', blurb: 'Official and community notices' },
};

/** Public-only sample highlights for the Phase 1 placeholder (no posting backend yet). */
export const COMMUNITY_HIGHLIGHTS: CommunityHighlight[] = [
  {
    id: 'disc-agent-approvals',
    type: 'discussion',
    title: 'How are you handling agent approval workflows?',
    summary:
      'A few teams compare human-in-the-loop gates vs. auto-publish within visibility rules. What is working in practice?',
    meta: '12 replies · started by a community member',
    verbs: ['Reply', 'Follow', 'Save'],
  },
  {
    id: 'help-governance-review',
    type: 'help_request',
    title: 'Looking for a reviewer on our governance policy draft',
    summary:
      'Mid-size insurer drafting autonomy boundaries for a claims copilot. Would value a second set of eyes before sign-off.',
    meta: 'Open · posted this week',
    verbs: ['Offer help', 'Save'],
  },
  {
    id: 'event-office-hours',
    type: 'event',
    title: 'Community office hours: agent operating models',
    summary:
      'Open discussion on RoA, accountability, and where automation patterns fit. Bring a real decision you are working through.',
    meta: 'Next session announced soon',
    verbs: ['Join', 'Follow', 'Save'],
  },
  {
    id: 'ann-knowledge-commons',
    type: 'community_announcement',
    title: 'The knowledge commons is now the home for durable contributions',
    summary:
      'Field notes, derived articles, and references now live under Knowledge. Discussions stay here in Community with a back-link.',
    meta: 'Posted by the community team',
    verbs: ['Read', 'Save'],
  },
];
