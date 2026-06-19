import type {
  AssessmentAnswer,
  AssessmentGapId,
  AssessmentQuestionBank,
  AssessmentScoreRequest,
  AssessmentScoreResponse,
} from '@ai-transformation/shared';

const GAP_TIE_BREAK_ORDER: AssessmentGapId[] = [
  'work_redesign',
  'governance',
  'value_measurement',
];

type ValidationSuccess = { ok: true; answers: AssessmentAnswer[] };
type ValidationFailure = { ok: false; error: string };

export type AssessmentAnswerValidationResult = ValidationSuccess | ValidationFailure;

function roundToOneDecimal(value: number): number {
  return Math.round(value * 10) / 10;
}

function computeAverage(values: number[]): number {
  if (values.length === 0) {
    throw new Error('Cannot compute average for empty values');
  }
  return values.reduce((sum, current) => sum + current, 0) / values.length;
}

export function validateAssessmentAnswers(
  bank: AssessmentQuestionBank,
  request: AssessmentScoreRequest,
): AssessmentAnswerValidationResult {
  const bankQuestionIds = new Set(bank.questions.map((question) => question.id));
  const seenQuestionIds = new Set<string>();

  for (const answer of request.answers) {
    if (!bankQuestionIds.has(answer.questionId)) {
      return { ok: false, error: `Unknown questionId: ${answer.questionId}` };
    }
    if (seenQuestionIds.has(answer.questionId)) {
      return { ok: false, error: `Duplicate answer for questionId: ${answer.questionId}` };
    }
    seenQuestionIds.add(answer.questionId);
  }

  if (seenQuestionIds.size !== bank.questions.length) {
    return { ok: false, error: `All ${bank.questions.length} questions must be answered` };
  }

  return { ok: true, answers: request.answers };
}

export function scoreAssessment(
  bank: AssessmentQuestionBank,
  answers: AssessmentAnswer[],
): AssessmentScoreResponse {
  const answersByQuestionId = new Map(answers.map((answer) => [answer.questionId, answer.value]));

  const getQuestionScore = (questionId: string): number => {
    const value = answersByQuestionId.get(questionId);
    if (value === undefined) {
      throw new Error(`Missing answer for questionId: ${questionId}`);
    }
    return value;
  };

  const gaps = bank.gaps.map((gap) => {
    const gapQuestions = bank.questions.filter((question) => question.gap === gap.id);
    const gapScore = roundToOneDecimal(
      computeAverage(gapQuestions.map((question) => getQuestionScore(question.id))),
    );

    const subDimensions = gap.subDimensions.map((subDimension) => {
      const subDimensionQuestions = gapQuestions.filter(
        (question) => question.subDimension === subDimension.id,
      );
      const subDimensionScore = roundToOneDecimal(
        computeAverage(subDimensionQuestions.map((question) => getQuestionScore(question.id))),
      );

      return {
        id: subDimension.id,
        label: subDimension.label,
        score: subDimensionScore,
      };
    });

    return {
      id: gap.id,
      label: gap.label,
      score: gapScore,
      subDimensions,
    };
  });

  const overall = roundToOneDecimal(computeAverage(answers.map((answer) => answer.value)));

  const weakestGap = [...gaps]
    .sort((a, b) => {
      if (a.score !== b.score) {
        return a.score - b.score;
      }
      return GAP_TIE_BREAK_ORDER.indexOf(a.id) - GAP_TIE_BREAK_ORDER.indexOf(b.id);
    })
    .at(0);

  if (!weakestGap) {
    throw new Error('No gaps available for scoring');
  }

  const radar = gaps.map((gap) => ({
    axis: gap.label,
    gap: gap.id,
    value: gap.score,
  }));

  return {
    ok: true,
    overall,
    gaps,
    weakestGap: {
      id: weakestGap.id,
      label: weakestGap.label,
      score: weakestGap.score,
    },
    radar,
  };
}
