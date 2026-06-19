import type { AssessmentAnswer } from '@ai-transformation/shared';
import { describe, expect, it } from 'vitest';

import { getQuestionBank } from './bank.js';
import { scoreAssessment, validateAssessmentAnswers } from './scoring.js';

const bank = getQuestionBank();

function buildAnswers(
  getValue: (question: (typeof bank.questions)[number]) => number,
): AssessmentAnswer[] {
  return bank.questions.map((question) => ({
    questionId: question.id,
    value: getValue(question),
  }));
}

describe('scoreAssessment', () => {
  it('returns all 5s when every answer is 5', () => {
    const answers = buildAnswers(() => 5);
    const result = scoreAssessment(bank, answers);

    expect(result.ok).toBe(true);
    expect(result.overall).toBe(5);
    expect(result.gaps).toHaveLength(3);
    expect(result.radar).toHaveLength(3);
    expect(result.gaps.every((gap) => gap.score === 5)).toBe(true);
    expect(
      result.gaps.every((gap) => gap.subDimensions.every((subDimension) => subDimension.score === 5)),
    ).toBe(true);
    expect(result.weakestGap.id).toBe('work_redesign');
    expect(result.weakestGap.score).toBe(5);
  });

  it('computes mixed scores with expected weakest gap and sub-dimension breakdown', () => {
    const valuesBySubDimension: Record<string, number[]> = {
      workflow_ownership: [1, 2, 3, 4],
      metrics: [2, 2, 3, 3],
      end_to_end_pilots: [4, 4, 5, 5],
      autonomy_level: [2, 2, 2, 2],
      accountability: [3, 3, 3, 3],
      monitoring: [1, 1, 2, 2],
      outcome_hypotheses: [4, 4, 4, 4],
      multidimensional_roi: [3, 4, 3, 4],
      board_reporting: [2, 3, 2, 3],
    };

    const perSubDimensionIndex: Record<string, number> = {};
    const answers = buildAnswers((question) => {
      const idx = perSubDimensionIndex[question.subDimension] ?? 0;
      perSubDimensionIndex[question.subDimension] = idx + 1;
      return valuesBySubDimension[question.subDimension][idx] ?? 1;
    });

    const result = scoreAssessment(bank, answers);
    const gapMap = new Map(result.gaps.map((gap) => [gap.id, gap]));

    expect(result.overall).toBe(2.9);
    expect(result.weakestGap.id).toBe('governance');
    expect(result.weakestGap.score).toBe(2.2);

    expect(gapMap.get('work_redesign')?.score).toBe(3.2);
    expect(gapMap.get('governance')?.score).toBe(2.2);
    expect(gapMap.get('value_measurement')?.score).toBe(3.3);

    const governance = gapMap.get('governance');
    const governanceSubScores = new Map(
      governance?.subDimensions.map((subDimension) => [subDimension.id, subDimension.score]),
    );
    expect(governanceSubScores.get('autonomy_level')).toBe(2);
    expect(governanceSubScores.get('accountability')).toBe(3);
    expect(governanceSubScores.get('monitoring')).toBe(1.5);
  });

  it('uses required tie-break order when lowest gap scores are equal', () => {
    const answers = buildAnswers((question) =>
      question.gap === 'value_measurement' ? 4 : 2,
    );

    const result = scoreAssessment(bank, answers);
    expect(result.weakestGap.id).toBe('work_redesign');
    expect(result.weakestGap.score).toBe(2);
  });
});

describe('validateAssessmentAnswers', () => {
  it('rejects incomplete answer sets', () => {
    const answers = buildAnswers(() => 4);
    const incomplete = { answers: answers.slice(0, answers.length - 1) };
    const validation = validateAssessmentAnswers(bank, incomplete);

    expect(validation.ok).toBe(false);
    if (!validation.ok) {
      expect(validation.error).toBe('All 36 questions must be answered');
    }
  });

  it('rejects unknown question ids', () => {
    const answers = buildAnswers(() => 4);
    const withUnknown = {
      answers: [
        ...answers.slice(0, answers.length - 1),
        { questionId: 'not_a_real_question', value: 4 },
      ],
    };
    const validation = validateAssessmentAnswers(bank, withUnknown);

    expect(validation.ok).toBe(false);
    if (!validation.ok) {
      expect(validation.error).toBe('Unknown questionId: not_a_real_question');
    }
  });
});
