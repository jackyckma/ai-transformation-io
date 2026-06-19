import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  assessmentQuestionBankSchema,
  type AssessmentQuestionBank,
} from '@ai-transformation/shared';

let cachedQuestionBank: AssessmentQuestionBank | null = null;

function resolveRepoRoot(): string {
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../../../');
}

export function getQuestionBank(): AssessmentQuestionBank {
  if (cachedQuestionBank) {
    return cachedQuestionBank;
  }

  const bankPath = path.resolve(resolveRepoRoot(), 'data/simulators/assessment/questions.json');
  const raw = readFileSync(bankPath, 'utf-8');
  const parsed = JSON.parse(raw);
  cachedQuestionBank = assessmentQuestionBankSchema.parse(parsed);
  return cachedQuestionBank;
}
