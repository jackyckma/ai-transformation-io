import type {
  CommunityObjectType,
  ObjectRecord,
  ObjectSubtype,
  PersonalTarget,
  Visibility,
} from '@ai-transformation/shared';

export const VISIBILITY_LABEL: Record<Visibility, string> = {
  public: 'Public',
  'members-only': 'Members only',
  private: 'Private',
};

export const KNOWLEDGE_TYPE_LABEL: Record<string, string> = {
  article: 'Article',
  field_note: 'Field note',
  derived_article: 'Derived article',
};

export const COMMUNITY_TYPE_LABEL: Record<string, string> = {
  discussion: 'Discussion',
  help_request: 'Help request',
  event: 'Event',
  community_announcement: 'Announcement',
  question: 'Question',
  mentorship_request: 'Mentorship request',
  project_request: 'Project request',
  collaboration_offer: 'Collaboration offer',
  apprenticeship_opportunity: 'Apprenticeship opportunity',
};

/** Public Phase 1 community types surfaced to anonymous visitors (§5.3). */
export const PUBLIC_COMMUNITY_TYPES: CommunityObjectType[] = [
  'discussion',
  'help_request',
  'event',
  'community_announcement',
];

/** Action verbs per community type (§5.3). Reply/Follow stay Wave 13 stubs. */
export const COMMUNITY_TYPE_VERBS: Record<string, string[]> = {
  discussion: ['Reply', 'Follow', 'Save'],
  help_request: ['Offer help', 'Save'],
  event: ['Join', 'Follow', 'Save'],
  community_announcement: ['Read', 'Save'],
};

export function subtypeLabel(subtype: ObjectSubtype): string {
  return KNOWLEDGE_TYPE_LABEL[subtype] ?? COMMUNITY_TYPE_LABEL[subtype] ?? subtype;
}

export function objectTitle(object: Pick<ObjectRecord, 'title' | 'subject' | 'body'>): string {
  const heading = object.title?.trim() || object.subject?.trim();
  if (heading) {
    return heading;
  }
  const firstLine = object.body.split('\n').find((line) => line.trim().length > 0) ?? '';
  const trimmed = firstLine.trim();
  if (trimmed.length === 0) {
    return 'Untitled';
  }
  return trimmed.length > 80 ? `${trimmed.slice(0, 77)}…` : trimmed;
}

export function objectExcerpt(body: string, max = 220): string {
  const collapsed = body.replace(/\s+/g, ' ').trim();
  if (collapsed.length <= max) {
    return collapsed;
  }
  return `${collapsed.slice(0, max - 1)}…`;
}

export function objectTarget(object: Pick<ObjectRecord, 'id'>): PersonalTarget {
  return { targetType: 'object', targetId: object.id };
}

export function targetKey(target: PersonalTarget): string {
  return `${target.targetType}:${target.targetId}`;
}

export function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}
