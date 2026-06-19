'use client';

import Link from 'next/link';
import { useCallback, useMemo, useRef, useState } from 'react';
import type {
  AssessmentGapId,
  AssessmentQuestion,
  AssessmentQuestionBank,
  AssessmentScoreResponse,
} from '@ai-transformation/shared';
import { RadarChart } from './radar-chart';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

type Phase = 'intro' | 'questions' | 'results';
type Answers = Record<string, number>;

type GapCta = { label: string; href: string; internal: boolean };

const WEAKEST_GAP_CTAS: Record<AssessmentGapId, GapCta[]> = {
  work_redesign: [
    { label: 'Transformation roadmap framework', href: '/frameworks/roadmap', internal: true },
    { label: 'AI patterns playbook', href: '/playbook/patterns', internal: true },
  ],
  governance: [
    { label: 'Governance & operating model framework', href: '/frameworks/governance', internal: true },
  ],
  value_measurement: [
    { label: 'Measuring value framework', href: '/frameworks/measuring-value', internal: true },
  ],
};

const WEAKEST_GAP_INTERPRETATION: Record<AssessmentGapId, string> = {
  work_redesign:
    'AI is not yet embedded into end-to-end workflow redesign — start by giving priority workflows named owners and outcome metrics.',
  governance:
    'Autonomy boundaries and accountability need sharper definition before scaling — clarify decision rights and controls first.',
  value_measurement:
    'Value is not consistently linked to measured outcomes — define outcome hypotheses and multi-dimensional reporting.',
};

function scoreTone(score: number): string {
  if (score >= 4) return 'Systematic';
  if (score >= 3) return 'Defined';
  if (score >= 2) return 'Emerging';
  return 'Early';
}

async function readJsonSafe(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export function AssessmentWizard() {
  const [phase, setPhase] = useState<Phase>('intro');
  const [bank, setBank] = useState<AssessmentQuestionBank | null>(null);
  const [loadingBank, setLoadingBank] = useState(false);
  const [bankError, setBankError] = useState('');

  const [answers, setAnswers] = useState<Answers>({});
  const [stepIndex, setStepIndex] = useState(0);
  const [showStepError, setShowStepError] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [result, setResult] = useState<AssessmentScoreResponse | null>(null);

  const liveRef = useRef<HTMLDivElement>(null);

  const questionsByGap = useMemo(() => {
    const map = new Map<string, AssessmentQuestion[]>();
    if (!bank) return map;
    for (const question of bank.questions) {
      const list = map.get(question.gap) ?? [];
      list.push(question);
      map.set(question.gap, list);
    }
    return map;
  }, [bank]);

  const totalQuestions = bank?.questions.length ?? 0;
  const answeredCount = useMemo(
    () => (bank ? bank.questions.filter((q) => answers[q.id] != null).length : 0),
    [bank, answers],
  );

  const loadBank = useCallback(async () => {
    setLoadingBank(true);
    setBankError('');
    try {
      const response = await fetch(`${API_BASE}/api/assessment/questions`);
      if (!response.ok) {
        throw new Error(`status ${response.status}`);
      }
      const payload = (await response.json()) as AssessmentQuestionBank;
      setBank(payload);
      setPhase('questions');
      setStepIndex(0);
    } catch {
      setBankError('We could not load the assessment. Please try again in a moment.');
    } finally {
      setLoadingBank(false);
    }
  }, []);

  function setAnswer(questionId: string, value: number) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    setShowStepError(false);
  }

  const gaps = bank?.gaps ?? [];
  const currentGap = gaps[stepIndex];
  const currentQuestions = currentGap ? questionsByGap.get(currentGap.id) ?? [] : [];
  const currentAllAnswered = currentQuestions.every((q) => answers[q.id] != null);
  const isLastStep = stepIndex === gaps.length - 1;

  function handleNext() {
    if (!currentAllAnswered) {
      setShowStepError(true);
      return;
    }
    setShowStepError(false);
    if (!isLastStep) {
      setStepIndex((i) => i + 1);
      liveRef.current?.focus();
    }
  }

  function handleBack() {
    setShowStepError(false);
    setStepIndex((i) => Math.max(0, i - 1));
    liveRef.current?.focus();
  }

  async function handleSubmit() {
    if (!bank) return;
    if (answeredCount < totalQuestions) {
      setShowStepError(true);
      return;
    }
    setSubmitting(true);
    setSubmitError('');
    try {
      const response = await fetch(`${API_BASE}/api/assessment/score`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          answers: bank.questions.map((q) => ({ questionId: q.id, value: answers[q.id] })),
        }),
      });
      const payload = (await readJsonSafe(response)) as
        | (AssessmentScoreResponse & { error?: string })
        | { ok?: false; error?: string }
        | null;
      if (response.ok && payload && 'ok' in payload && payload.ok) {
        setResult(payload as AssessmentScoreResponse);
        setPhase('results');
        return;
      }
      const message =
        payload && 'error' in payload && payload.error
          ? payload.error
          : 'Something went wrong scoring your answers. Please try again.';
      setSubmitError(message);
    } catch {
      setSubmitError('Unable to reach the server. Please try again in a moment.');
    } finally {
      setSubmitting(false);
    }
  }

  function restart() {
    setPhase('intro');
    setAnswers({});
    setStepIndex(0);
    setResult(null);
    setSubmitError('');
    setShowStepError(false);
  }

  if (phase === 'intro') {
    return (
      <IntroView
        loading={loadingBank}
        error={bankError}
        onStart={loadBank}
      />
    );
  }

  if (phase === 'results' && result && bank) {
    return <ResultsView result={result} onRestart={restart} />;
  }

  const progressPct = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  return (
    <section aria-labelledby="assessment-step-heading">
      <div className="mb-8">
        <div className="flex items-center justify-between text-sm text-[var(--muted)]">
          <span>
            Step {stepIndex + 1} of {gaps.length}
          </span>
          <span>
            {answeredCount} / {totalQuestions} answered ({progressPct}%)
          </span>
        </div>
        <div
          className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[var(--border)]"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progressPct}
          aria-label="Assessment progress"
        >
          <div
            className="h-full rounded-full bg-[var(--accent)] transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <div ref={liveRef} tabIndex={-1} aria-live="polite" className="outline-none">
        {currentGap ? (
          <div>
            <h2
              id="assessment-step-heading"
              className="font-serif text-2xl font-medium tracking-tight"
            >
              {currentGap.label}
            </h2>
            <p className="mt-2 text-[var(--muted)]">{currentGap.description}</p>
          </div>
        ) : null}
      </div>

      <ol className="mt-8 space-y-6">
        {currentQuestions.map((question, index) => (
          <LikertRow
            key={question.id}
            question={question}
            index={index}
            scaleLabels={bank?.scale.labels ?? {}}
            value={answers[question.id]}
            onChange={(value) => setAnswer(question.id, value)}
            invalid={showStepError && answers[question.id] == null}
          />
        ))}
      </ol>

      {showStepError ? (
        <p role="alert" className="mt-6 text-sm text-red-600 dark:text-red-300">
          Please answer every question in this section before continuing.
        </p>
      ) : null}

      {submitError ? (
        <p role="alert" className="mt-6 text-sm text-red-600 dark:text-red-300">
          {submitError}
        </p>
      ) : null}

      <div className="mt-10 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={handleBack}
          disabled={stepIndex === 0 || submitting}
          className="inline-flex items-center rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium transition hover:border-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Back
        </button>

        {isLastStep ? (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center rounded-lg bg-[var(--accent)] px-5 py-2 text-sm font-medium text-[var(--accent-fg)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? 'Scoring…' : 'See my results'}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleNext}
            disabled={submitting}
            className="inline-flex items-center rounded-lg bg-[var(--accent)] px-5 py-2 text-sm font-medium text-[var(--accent-fg)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            Next
          </button>
        )}
      </div>
    </section>
  );
}

function IntroView({
  loading,
  error,
  onStart,
}: {
  loading: boolean;
  error: string;
  onStart: () => void;
}) {
  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 md:p-10">
      <h1 className="font-serif text-3xl font-medium tracking-tight md:text-4xl">
        Three Gaps Assessment
      </h1>
      <p className="mt-4 max-w-2xl text-[var(--muted)]">
        A structured read on where AI transformation tends to stall — across three gaps:{' '}
        <strong className="font-medium text-[var(--foreground)]">work redesign</strong>,{' '}
        <strong className="font-medium text-[var(--foreground)]">governance</strong>, and{' '}
        <strong className="font-medium text-[var(--foreground)]">value measurement</strong>.
      </p>
      <ul className="mt-6 space-y-2 text-sm text-[var(--muted)]">
        <li>· 36 questions, grouped into three short sections.</li>
        <li>· Each rated 1 (ad hoc) to 5 (systematic) maturity.</li>
        <li>· Takes a few minutes. Anonymous — nothing is saved.</li>
      </ul>

      <button
        type="button"
        onClick={onStart}
        disabled={loading}
        className="mt-8 inline-flex items-center rounded-lg bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-[var(--accent-fg)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? 'Loading…' : 'Start assessment'}
      </button>

      {error ? (
        <p role="alert" className="mt-4 text-sm text-red-600 dark:text-red-300">
          {error}
        </p>
      ) : null}
    </section>
  );
}

function LikertRow({
  question,
  index,
  scaleLabels,
  value,
  onChange,
  invalid,
}: {
  question: AssessmentQuestion;
  index: number;
  scaleLabels: Record<string, string>;
  value: number | undefined;
  onChange: (value: number) => void;
  invalid: boolean;
}) {
  const options = [1, 2, 3, 4, 5];
  const legendId = `q-${question.id}-legend`;
  return (
    <li
      className={`rounded-xl border bg-[var(--card)] p-5 transition ${
        invalid ? 'border-red-400 dark:border-red-500' : 'border-[var(--border)]'
      }`}
    >
      <fieldset aria-describedby={legendId}>
        <legend id={legendId} className="mb-4 text-sm leading-relaxed">
          <span className="mr-2 text-[var(--muted)]">{index + 1}.</span>
          {question.prompt}
        </legend>
        <div className="grid grid-cols-5 gap-2" role="radiogroup" aria-label={question.prompt}>
          {options.map((option) => {
            const selected = value === option;
            return (
              <label
                key={option}
                className={`flex cursor-pointer flex-col items-center gap-1 rounded-lg border px-1 py-2 text-center transition ${
                  selected
                    ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-fg)]'
                    : 'border-[var(--border)] hover:border-[var(--accent)]'
                }`}
              >
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={selected}
                  onChange={() => onChange(option)}
                  className="sr-only"
                />
                <span className="text-base font-medium">{option}</span>
                <span
                  className={`text-[10px] leading-tight ${
                    selected ? 'text-[var(--accent-fg)]' : 'text-[var(--muted)]'
                  }`}
                >
                  {scaleLabels[String(option)] ?? ''}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>
    </li>
  );
}

function ResultsView({
  result,
  onRestart,
}: {
  result: AssessmentScoreResponse;
  onRestart: () => void;
}) {
  const weakestCtas = WEAKEST_GAP_CTAS[result.weakestGap.id] ?? [];

  return (
    <section aria-labelledby="results-heading" className="space-y-10">
      <div>
        <h1 id="results-heading" className="font-serif text-3xl font-medium tracking-tight md:text-4xl">
          Your Three Gaps results
        </h1>
        <p className="mt-3 text-[var(--muted)]">
          Overall maturity{' '}
          <strong className="font-medium text-[var(--foreground)]">{result.overall.toFixed(1)} / 5</strong>{' '}
          ({scoreTone(result.overall)}). Anonymous — these results are not saved.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 md:items-center">
        <div className="flex justify-center rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
          <RadarChart points={result.radar} max={5} />
        </div>

        <div className="rounded-2xl border border-[var(--accent)] bg-[var(--card)] p-6">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--accent)]">
            Weakest gap
          </p>
          <h2 className="mt-2 font-serif text-2xl font-medium tracking-tight">
            {result.weakestGap.label}
          </h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Score {result.weakestGap.score.toFixed(1)} / 5 ({scoreTone(result.weakestGap.score)})
          </p>
          <p className="mt-4 text-sm leading-relaxed text-[var(--foreground)]">
            {WEAKEST_GAP_INTERPRETATION[result.weakestGap.id]}
          </p>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {result.gaps.map((gap) => (
          <div
            key={gap.id}
            className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6"
          >
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="font-serif text-lg font-medium tracking-tight">{gap.label}</h3>
              <span className="text-sm font-medium text-[var(--accent)]">
                {gap.score.toFixed(1)}
              </span>
            </div>
            <dl className="mt-4 space-y-2 text-sm">
              {gap.subDimensions.map((sub) => (
                <div key={sub.id} className="flex items-center justify-between gap-2">
                  <dt className="text-[var(--muted)]">{sub.label}</dt>
                  <dd className="font-medium">{sub.score.toFixed(1)}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
        <h2 className="font-serif text-xl font-medium tracking-tight">Suggested next steps</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Provisional pointers based on your weakest gap. We are still refining these.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          {weakestCtas.map((cta) => (
            <Link
              key={cta.href}
              href={cta.href}
              className="inline-flex items-center rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--accent-fg)] transition hover:opacity-90"
            >
              {cta.label}
            </Link>
          ))}
          <Link
            href="/ask"
            className="inline-flex items-center rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium transition hover:border-[var(--accent)]"
          >
            Ask a question
          </Link>
          <a
            href="https://ai-transformation.org"
            className="inline-flex items-center rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium transition hover:border-[var(--accent)]"
          >
            Reflect with the community
          </a>
        </div>
      </div>

      <div className="border-t border-[var(--border)] pt-6">
        <button
          type="button"
          onClick={onRestart}
          className="inline-flex items-center rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium transition hover:border-[var(--accent)]"
        >
          Retake assessment
        </button>
      </div>
    </section>
  );
}
