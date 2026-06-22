export type FunctionPlaybookLink = {
  label: string;
  href: string;
};

export type FunctionCasePattern = {
  title: string;
  body: string;
};

export type FunctionNextStep = {
  label: string;
  href: string;
  external?: boolean;
};

export type FunctionPageContent = {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  youOwn: string[];
  threeGapsLens: Array<{ gap: string; insight: string }>;
  keyDecisions: string[];
  checklist: string[];
  playbookLinks: FunctionPlaybookLink[];
  casePatterns: FunctionCasePattern[];
  nextSteps: FunctionNextStep[];
};

export const FUNCTION_PAGES: Record<string, FunctionPageContent> = {
  executive: {
    slug: 'executive',
    title: 'Executive / Board',
    subtitle: 'Function guide',
    description:
      'Strategy, sponsorship, and the board narrative — how AI transformation shows up in your lane.',
    youOwn: [
      'Portfolio prioritization — which workflows and bets get funded, paused, or stopped.',
      'Risk appetite — where autonomy is allowed, where human judgment stays mandatory.',
      'Operating model sponsorship — who owns cross-functional change beyond the pilot team.',
      'Value narrative — how the board and executive team hear progress (not just deployment counts).',
    ],
    threeGapsLens: [
      {
        gap: 'Work redesign',
        insight:
          'Executives often approve copilots without naming which workflows must change — pilots succeed in demos but stall in operations.',
      },
      {
        gap: 'Governance',
        insight:
          'Boards ask for AI policy before anyone has evidence from redesigned work — policy without workflow proof becomes compliance theater.',
      },
      {
        gap: 'Value measurement',
        insight:
          'ROI slides lean on cost savings while autonomy expands — Return on Autonomy and outcome metrics need the same airtime as efficiency.',
      },
    ],
    keyDecisions: [
      'Which 2–3 business outcomes (not tools) define success in the next 12 months?',
      'Where will you accept agent autonomy vs require human-in-the-loop — and who signs that boundary?',
      'How often does leadership review transformation progress as operating-model change, not IT status?',
      'What gets stopped if a program cannot show workflow-level evidence within two quarters?',
    ],
    checklist: [
      'We can name priority workflows with executive sponsors, not only IT owners.',
      'Board or exec forum receives outcome + autonomy metrics, not only usage stats.',
      'Governance forum exists with authority to pause deployments that lack controls.',
      'Investment cases tie to workflow redesign, not only license or model spend.',
      'We distinguish pilot learning from scaled operating commitments.',
      'Ethical and regulatory boundaries are documented per domain, not one generic policy.',
      'Cross-functional leaders (legal, risk, HR, ops) are accountable, not advisory only.',
      'We have a public narrative for employees on why transformation is operating-model work.',
      'Failed experiments are reviewed for learning — not hidden to protect sponsor optics.',
      'External agent or vendor claims are validated against internal workflow evidence.',
    ],
    playbookLinks: [
      { label: 'What is AI transformation?', href: '/frameworks/what-is-ai-transformation' },
      { label: 'Transformation roadmap', href: '/frameworks/roadmap' },
      { label: 'Governance & operating model', href: '/frameworks/governance' },
      { label: 'Measuring AI value', href: '/frameworks/measuring-value' },
      { label: 'Common pitfalls', href: '/playbook/common-pitfalls' },
    ],
    casePatterns: [
      {
        title: 'Board asks for AI strategy in 90 days',
        body:
          'Anchor the narrative on three gaps and named workflows — not a vendor roadmap. Pair every autonomy expansion with a control and an outcome metric the board already tracks.',
      },
      {
        title: 'Competing executive sponsors',
        body:
          'Use a single transformation council with stop/start authority. Require shared evidence format from each function before the next funding gate.',
      },
    ],
    nextSteps: [
      { label: 'Organizational diagnostic (36 questions)', href: '/assessment' },
      { label: 'Ask a question', href: '/ask' },
      { label: 'Share a field experience on .org', href: 'https://ai-transformation.org/stories/submit', external: true },
    ],
  },
  cio: {
    slug: 'cio',
    title: 'CIO / Technology',
    subtitle: 'Function guide',
    description:
      'Platform, patterns, and enablement — making AI transformation implementable without owning every workflow yourself.',
    youOwn: [
      'Reference architecture — copilot, RAG, agent, and automation patterns with clear fit criteria.',
      'Enablement — standards, guardrails, and reusable components teams can adopt without shadow IT.',
      'Integration — data, identity, and observability so agents do not become fragile one-offs.',
      'Capacity model — who builds, who maintains, and how production support works after the demo.',
    ],
    threeGapsLens: [
      {
        gap: 'Work redesign',
        insight:
          'Technology teams deliver platforms while business teams never redesign tasks — enablement without workflow owners produces shelfware APIs.',
      },
      {
        gap: 'Governance',
        insight:
          'Security and compliance reviews arrive late because autonomy boundaries were not designed into the pattern library from day one.',
      },
      {
        gap: 'Value measurement',
        insight:
          'Engineering metrics (latency, uptime) dominate while business outcome instrumentation is an afterthought on the backlog.',
      },
    ],
    keyDecisions: [
      'Which patterns are approved by default vs require architecture review?',
      'How do product teams request autonomy level changes — and who approves?',
      'What is the minimum observability pack for any agent touching production data?',
      'When does IT refuse a use case until a workflow owner and success metric exist?',
    ],
    checklist: [
      'Pattern library covers copilot, RAG, agent, and automation with when-not-to-use guidance.',
      'Every production agent has an owner outside IT and a rollback path.',
      'Data classification rules are enforced in retrieval and tool access layers.',
      'Identity and secrets handling is standardized — no per-team OAuth hacks.',
      'Sandbox and prod environments are separated with realistic evaluation data.',
      'Incident response includes agent behavior, not only infrastructure outages.',
      'Platform team measures adoption by workflow outcomes, not API call volume alone.',
      'Vendor components map to internal patterns — no duplicate stacks per department.',
      'Technical debt from pilots is tracked before scale-up funding.',
      'Developers and operators have runbooks for model and prompt change management.',
    ],
    playbookLinks: [
      { label: 'AI patterns — copilots, agents, automation', href: '/playbook/patterns' },
      { label: 'Use cases by industry', href: '/playbook/use-cases' },
      { label: 'Transformation roadmap', href: '/frameworks/roadmap' },
      { label: 'Governance & operating model', href: '/frameworks/governance' },
      { label: 'Glossary', href: '/playbook/glossary' },
    ],
    casePatterns: [
      {
        title: 'Every department wants its own agent',
        body:
          'Publish a tiered pattern catalog: self-serve within guardrails, architecture review above a data-sensitivity threshold, council approval for customer-facing autonomy.',
      },
      {
        title: 'RAG pilot works; operations do not',
        body:
          'Require workflow owner sign-off on evaluation sets tied to real tasks. Block production until monitoring covers hallucination rate on top user journeys.',
      },
    ],
    nextSteps: [
      { label: 'Organizational diagnostic (36 questions)', href: '/assessment' },
      { label: 'Ask a question', href: '/ask' },
      { label: 'Weekly prompt on .org', href: 'https://ai-transformation.org/prompts', external: true },
    ],
  },
};

export const FUNCTION_SLUGS = Object.keys(FUNCTION_PAGES);

export function getFunctionPage(slug: string): FunctionPageContent | null {
  return FUNCTION_PAGES[slug] ?? null;
}

export const FUNCTION_RESOURCE_LINKS = [
  { label: 'Glossary', href: '/playbook/glossary', description: 'Autonomy, RoA, workflow redesign, and more.' },
  { label: 'FAQ', href: '/playbook/faq', description: 'First questions leaders ask.' },
  { label: 'Use cases by industry', href: '/playbook/use-cases', description: 'Patterns grounded in sector context.' },
] as const;
