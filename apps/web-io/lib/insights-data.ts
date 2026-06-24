import type { AssessmentGapId } from '@ai-transformation/shared';

export type InsightKind = 'benchmark' | 'dataset' | 'survey';

export type InsightCard = {
  id: string;
  kind: InsightKind;
  title: string;
  source: string;
  href: string;
  summary: string;
  /** "What this means for {role}" — Phase 1 interpretation template (§10). */
  interpretation: string;
  /** Three Gaps dimensions this insight speaks to — feeds §10 personal reorder. */
  gaps: AssessmentGapId[];
};

export const INSIGHT_KIND_LABEL: Record<InsightKind, string> = {
  benchmark: 'Benchmark',
  dataset: 'Open dataset',
  survey: 'Survey',
};

/**
 * Phase 1 placeholder Insights (§10): curated external benchmarks, datasets,
 * and surveys with short interpretation copy. No interactive charts yet.
 */
export const IO_INSIGHTS: InsightCard[] = [
  {
    id: 'mckinsey-state-of-ai',
    kind: 'survey',
    title: 'The state of AI in the enterprise',
    source: 'McKinsey Global Survey',
    href: 'https://www.mckinsey.com/capabilities/quantumblack/our-insights/the-state-of-ai',
    summary:
      'Adoption keeps rising, but value concentrates in organizations that redesign workflows and govern autonomy — not those that bolt copilots onto existing processes.',
    interpretation:
      'If most teams report adoption without measurable value, treat the gap as a work-redesign problem before a tooling one.',
    gaps: ['work_redesign', 'value_measurement'],
  },
  {
    id: 'stanford-ai-index',
    kind: 'benchmark',
    title: 'AI Index annual report',
    source: 'Stanford HAI',
    href: 'https://aiindex.stanford.edu/report/',
    summary:
      'Capability benchmarks improve faster than enterprise readiness. Model performance is rarely the binding constraint for transformation outcomes.',
    interpretation:
      'Use capability trendlines to set ambition, but anchor your roadmap to governance and value measurement maturity.',
    gaps: ['governance', 'value_measurement'],
  },
  {
    id: 'oecd-ai-policy',
    kind: 'dataset',
    title: 'AI policy and adoption indicators',
    source: 'OECD.AI',
    href: 'https://oecd.ai/en/data',
    summary:
      'Cross-country indicators on AI investment, skills, and policy — useful for sizing where your industry and region sit relative to peers.',
    interpretation:
      'Benchmark your sector against regional baselines to pressure-test whether your pace matches the competitive context.',
    gaps: ['governance', 'value_measurement'],
  },
];

export function getInsightById(id: string): InsightCard | undefined {
  return IO_INSIGHTS.find((card) => card.id === id);
}
