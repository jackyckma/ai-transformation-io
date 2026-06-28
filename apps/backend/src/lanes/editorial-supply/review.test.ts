import { describe, expect, it } from 'vitest';

import { extractJsonObject, parseReviewFromAssistantMessage } from './review.js';

const SAMPLE_SUBSTANCE_REVIEW = {
  substance_score: 12,
  dimensions: {
    claim_density: 2,
    specificity: 3,
    argument_coherence: 2,
    falsifiable_stance: 2,
    first_hand: 3,
  },
  score: 80,
  flags: ['padding'],
  summary: 'Mechanisms are strong; trim consensus opener.',
};

describe('editorial review parsing', () => {
  it('parses substance-first JSON in content', () => {
    const review = parseReviewFromAssistantMessage(
      { content: JSON.stringify(SAMPLE_SUBSTANCE_REVIEW) },
      'MiniMax-M3',
    );
    expect(review).toMatchObject({
      substance_score: 12,
      score: 80,
      summary: SAMPLE_SUBSTANCE_REVIEW.summary,
      flags: ['padding'],
    });
    expect(review && 'dimensions' in review && review.dimensions?.specificity).toBe(3);
  });

  it('parses legacy score-only JSON in content', () => {
    const review = parseReviewFromAssistantMessage(
      {
        content: JSON.stringify({
          score: 82,
          flags: ['tone'],
          summary: 'Solid draft.',
        }),
      },
      'MiniMax-M3',
    );
    expect(review).toMatchObject({ score: 82, flags: ['tone'], summary: 'Solid draft.' });
  });

  it('parses JSON after MiniMax thinking tags in content', () => {
    const review = parseReviewFromAssistantMessage(
      {
        content: `<think>Plan review.</think>\n${JSON.stringify(SAMPLE_SUBSTANCE_REVIEW)}`,
      },
      'MiniMax-M3',
    );
    expect(review?.substance_score).toBe(12);
  });

  it('parses JSON from reasoning_content when content is empty', () => {
    const review = parseReviewFromAssistantMessage(
      {
        content: '',
        reasoning_content: JSON.stringify(SAMPLE_SUBSTANCE_REVIEW),
      },
      'MiniMax-M3',
    );
    expect(review?.substance_score).toBe(12);
    expect(review?.flags).toEqual(['padding']);
  });

  it('extracts JSON embedded in prose', () => {
    const json = extractJsonObject(
      `Here is the review:\n\`\`\`json\n${JSON.stringify(SAMPLE_SUBSTANCE_REVIEW)}\n\`\`\``,
    );
    expect(json).toContain('"substance_score":12');
    const review = parseReviewFromAssistantMessage({ content: json ?? '' }, 'MiniMax-M3');
    expect(review?.score).toBe(80);
  });

  it('derives score from substance_score when score omitted', () => {
    const review = parseReviewFromAssistantMessage(
      {
        content: JSON.stringify({
          substance_score: 9,
          dimensions: {
            claim_density: 2,
            specificity: 2,
            argument_coherence: 1,
            falsifiable_stance: 2,
            first_hand: 2,
          },
          flags: [],
          summary: 'Needs enrichment.',
        }),
      },
      'MiniMax-M3',
    );
    expect(review?.substance_score).toBe(9);
    expect(review?.score).toBe(60);
  });

  it('returns null for non-JSON prose', () => {
    expect(parseReviewFromAssistantMessage({ content: 'not json at all' }, 'MiniMax-M3')).toBeNull();
  });
});
