import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export type ApprenticeshipDocument = {
  title: string;
  description: string;
  markdown: string;
};

const moduleDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(moduleDir, '../../..');

const OVERVIEW_FILE = path.join(moduleDir, '../content/apprenticeship-overview-EN.md');
const RATIONALE_FILE = path.join(repoRoot, 'usr/12-apprenticeship-program-design-rationale-EN.md');

function readMarkdownFile(filePath: string): string {
  return fs.readFileSync(filePath, 'utf-8');
}

function extractTitle(markdown: string, fallback: string): string {
  const match = markdown.match(/^#\s+(.+)$/m);
  return match?.[1]?.trim() ?? fallback;
}

function extractDescription(markdown: string, fallback: string): string {
  const blockquote = markdown.match(/^>\s+(.+)$/m);
  if (blockquote?.[1]) {
    return blockquote[1].trim();
  }

  const paragraphs = markdown
    .replace(/^#[^\n]+\n+/m, '')
    .split('\n\n')
    .map((block) => block.trim())
    .filter((block) => block && !block.startsWith('#') && !block.startsWith('>') && !block.startsWith('---'));

  const first = paragraphs[0];
  if (first) {
    return first.replace(/\*\*/g, '').slice(0, 200);
  }

  return fallback;
}

function stripLeadingHeading(markdown: string): string {
  return markdown.replace(/^#[^\n]+\n+/m, '').trim();
}

function loadDocument(filePath: string, fallbackTitle: string, fallbackDescription: string): ApprenticeshipDocument {
  const markdown = readMarkdownFile(filePath);
  const title = extractTitle(markdown, fallbackTitle);
  return {
    title,
    description: extractDescription(markdown, fallbackDescription),
    markdown,
  };
}

/** Public overview on .org — "we" voice; adapted from usr/13. */
export function getApprenticeshipOverviewContent(): ApprenticeshipDocument {
  return loadDocument(
    OVERVIEW_FILE,
    'AI-Era Apprenticeship',
    'Rebuilding the training mechanism that entry-level work used to provide.',
  );
}

export function getApprenticeshipRationaleContent(): ApprenticeshipDocument {
  return loadDocument(
    RATIONALE_FILE,
    'Design Rationale',
    'The reasoning behind the apprenticeship project — for mentors, collaborators, and anyone who wants to interrogate the argument.',
  );
}

export function getApprenticeshipOverviewBody(): string {
  return stripLeadingHeading(getApprenticeshipOverviewContent().markdown);
}

export function getApprenticeshipRationaleBody(): string {
  return stripLeadingHeading(getApprenticeshipRationaleContent().markdown);
}

/** @deprecated Use getApprenticeshipOverviewContent */
export function getApprenticeshipThesisContent(): ApprenticeshipDocument {
  return getApprenticeshipOverviewContent();
}

/** @deprecated Use getApprenticeshipOverviewBody */
export function getApprenticeshipThesisBody(): string {
  return getApprenticeshipOverviewBody();
}

/** @deprecated Use getApprenticeshipOverviewContent */
export function getApprenticeshipContent(): ApprenticeshipDocument {
  return getApprenticeshipOverviewContent();
}
