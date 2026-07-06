import { describe, expect, it } from 'vitest';

import {
  hasEditorialGatekeeperFlags,
  resolveEditorialReviewProfile,
  substanceTierForProfile,
} from '@ai-transformation/shared';

describe('editorial review profiles', () => {
  it('maps knowledge and community types to distinct profiles', () => {
    expect(resolveEditorialReviewProfile('knowledge', 'article').id).toBe('knowledge_article');
    expect(resolveEditorialReviewProfile('knowledge', 'field_note').id).toBe('knowledge_field_note');
    expect(resolveEditorialReviewProfile('community', 'discussion').id).toBe('community_discussion');
    expect(resolveEditorialReviewProfile('community', 'help_request').id).toBe('community_help');
  });

  it('uses lighter substance bands for community discussion', () => {
    const discussion = resolveEditorialReviewProfile('community', 'discussion');
    const article = resolveEditorialReviewProfile('knowledge', 'article');
    expect(substanceTierForProfile(7, discussion)).toBe('strong');
    expect(substanceTierForProfile(7, article)).toBe('caution');
  });

  it('detects marketing gatekeeper flags', () => {
    expect(hasEditorialGatekeeperFlags(['vendor-marketing', 'padding'])).toBe(true);
    expect(hasEditorialGatekeeperFlags(['padding', 'low-claim-density'])).toBe(false);
  });
});
