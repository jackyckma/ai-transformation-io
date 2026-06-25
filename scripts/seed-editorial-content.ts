import { pathToFileURL } from 'node:url';

import type { CommunityObjectType, KnowledgeObjectType, Site } from '@ai-transformation/shared';

import { closeDbForTests } from '../apps/backend/src/db/index.js';
import {
  createObject,
  createPublishedSlug,
  findEditorialSeedObject,
} from '../apps/backend/src/db/objects.js';

type KnowledgeSeed = {
  seedKey: string;
  slug: string;
  type: KnowledgeObjectType;
  title: string;
  body: string;
};

type CommunitySeed = {
  seedKey: string;
  type: CommunityObjectType;
  title: string;
  body: string;
};

const SEED_SITE: Site = 'org';

const KNOWLEDGE_SEEDS: KnowledgeSeed[] = [
  {
    seedKey: 'wave16-knowledge-what-is-ai-transformation',
    slug: 'what-is-ai-transformation',
    type: 'article',
    title: 'What is AI transformation?',
    body: 'AI transformation is the shift from deploying AI tools to redesigning how an organization decides, operates, and creates value. Where digital transformation asked "how do we digitize what we already do?", AI transformation asks "how do we make every decision smarter, faster, and more consistent?" It is an operating-model change owned at the CEO and board level — not an IT project — and it stalls in three predictable gaps: work redesign, governance, and value measurement.',
  },
  {
    seedKey: 'wave16-knowledge-transformation-roadmap',
    slug: 'transformation-roadmap',
    type: 'article',
    title: 'The AI transformation roadmap',
    body: 'A seven-stage roadmap moves an organization from scattered pilots to governed, scaled AI: business alignment, readiness assessment, use-case portfolio, foundation building, pilot execution, workflow redesign, and governed scaling. The stages overlap and iterate rather than running as a rigid waterfall. Stage 6 — redesigning the workflow around AI instead of bolting AI onto the existing one — is the most underestimated and the stage where real transformation happens.',
  },
  {
    seedKey: 'wave16-knowledge-common-pitfalls',
    slug: 'common-pitfalls',
    type: 'article',
    title: 'Why AI transformation fails: common pitfalls',
    body: 'Most enterprise AI investments fail because organizations apply an adoption playbook to a transformation challenge. The recurring pitfalls: confusing adoption with transformation, skipping workflow redesign, pilot purgatory, technology-first thinking, ignoring the 70% that is people and process, treating governance as an afterthought, measuring cost instead of capability, chasing agentic AI too early, shadow AI, and missing executive sponsorship. Every pitfall shares one root cause — treating AI as a deployment instead of an operating-model change.',
  },
  {
    seedKey: 'wave16-knowledge-ai-patterns-copilots-agents-automation',
    slug: 'ai-patterns-copilots-agents-automation',
    type: 'article',
    title: 'AI patterns: copilots, RAG, agents, and automation',
    body: 'Enterprise AI systems fall into four patterns: copilots (assist a human in control), RAG (retrieve grounded knowledge before answering), agentic workflows (execute multi-step tasks within governance boundaries), and deterministic automation (rules-based with AI-enhanced decision points). Choosing the right pattern per use case is one of the most important — and most commonly mishandled — decisions in transformation. Progress through the autonomy ladder: prove reliability with copilots and RAG before expanding to agents in bounded, reversible workflows.',
  },
  {
    seedKey: 'wave16-knowledge-governance-and-operating-model',
    slug: 'governance-and-operating-model',
    type: 'article',
    title: 'Governance and the AI operating model',
    body: 'Governance is the discipline that lets autonomy expand without accountability falling behind. Design it before deployment, not after the first incident: define risk tiers, action boundaries, ownership, and escalation paths, then advance autonomy based on evidence rather than enthusiasm. The operating model — centralized, federated, or hybrid AI delivery — decides who builds, who approves, and who is accountable for AI-driven outcomes as workflows scale across functions.',
  },
  {
    seedKey: 'wave16-knowledge-measuring-ai-value',
    slug: 'measuring-ai-value',
    type: 'article',
    title: 'Measuring AI value beyond cost savings',
    body: 'Cost-based ROI misses the strategic value of AI: new capabilities, faster decisions, better quality, and competitive positioning. Adopt multi-dimensional value measurement — track Return on Autonomy alongside ROI, instrument workflows before deployment so you have a baseline, and treat measurement as a learning system that evolves. Organizations that can only report FTE hours saved cannot justify the increasing investment that transformation requires.',
  },
  {
    seedKey: 'wave16-knowledge-use-cases-by-industry',
    slug: 'use-cases-by-industry',
    type: 'article',
    title: 'AI transformation use cases by industry',
    body: 'High-value AI use cases cluster differently by sector: financial services prioritize risk, fraud, and the finance close; manufacturing focuses on quality inspection, maintenance, and supply-chain planning; healthcare on documentation, triage, and operations; retail on demand forecasting and service. Across industries the pattern repeats — start where data is available and the workflow is well understood, redesign the workflow rather than speed the old one, and sequence from quick wins toward complex, governed transformations.',
  },
  {
    seedKey: 'wave16-knowledge-ai-transformation-vs-digital-transformation',
    slug: 'ai-transformation-vs-digital-transformation',
    type: 'article',
    title: 'AI transformation vs. digital transformation',
    body: 'Digital transformation digitized existing processes — moving paper to systems and connecting data for visibility. AI transformation goes further: it embeds intelligence into decisions so workflows are structurally redesigned, not just faster. Digital transformation is largely deterministic and IT-led; AI transformation is probabilistic, continuously governed, and owned by the business. The two are layered — mature digital foundations make AI transformation possible, but they do not make it happen automatically.',
  },
];

const COMMUNITY_SEEDS: CommunitySeed[] = [
  {
    seedKey: 'wave16-community-welcome-announcement',
    type: 'community_announcement',
    title: 'Welcome to the Knowledge Commons',
    body: 'This is a community for sharing real field experience about enterprise AI transformation — wins, failures, and surprises — not hype or vendor pitches. Read the knowledge guides before contributing if you are still finding your footing, then share what actually worked (or did not) in your organization. Replies, follows, and offers of help are all first-class here.',
  },
  {
    seedKey: 'wave16-community-pilot-purgatory-discussion',
    type: 'discussion',
    title: 'How did you escape pilot purgatory?',
    body: 'We have run more than a dozen AI pilots that demoed well but never reached production. What finally moved one pilot into a repeatable operating model for you — defining the production path before the pilot, assigning a scaling owner instead of a pilot owner, or time-boxing with explicit go/no-go criteria? Looking for concrete patterns, not theory.',
  },
  {
    seedKey: 'wave16-community-return-on-autonomy-discussion',
    type: 'discussion',
    title: 'How are you measuring Return on Autonomy?',
    body: 'Cost-savings ROI keeps undercounting the value our AI workflows actually create — faster decisions and better quality do not show up in FTE-hours saved. For those tracking Return on Autonomy or other multi-dimensional measures: which metrics earned board attention, and how did you baseline workflows before deployment so the numbers held up under scrutiny?',
  },
  {
    seedKey: 'wave16-community-governance-office-hours-event',
    type: 'event',
    title: 'Community office hours: governance for agentic workflows',
    body: 'Open office hours to compare notes on governing agentic workflows: risk tiers, action boundaries, escalation paths, and how to advance autonomy based on evidence rather than enthusiasm. Bring a real scenario from your organization. Format is discussion, not presentation — come to ask and to share what is working.',
  },
  {
    seedKey: 'wave16-community-finance-redesign-help-request',
    type: 'help_request',
    title: 'Looking for examples of workflow redesign in the finance close',
    body: 'We are redesigning our monthly finance close around AI rather than layering copilots onto the existing steps, and we want to learn from people who have done it. If you have redesigned reconciliation, variance analysis, or reporting end-to-end — what disappeared, what shifted to AI, and where did you keep humans in the loop? Happy to trade notes on our manufacturing context in return.',
  },
];

export type EditorialSeedResult = {
  knowledge: number;
  community: number;
  communityByType: Record<string, number>;
  created: number;
  skipped: number;
};

export function runEditorialSeed(): EditorialSeedResult {
  let created = 0;
  let skipped = 0;
  let knowledge = 0;
  let community = 0;
  const communityByType: Record<string, number> = {};

  for (const seed of KNOWLEDGE_SEEDS) {
    knowledge += 1;
    const existing = findEditorialSeedObject({ site: SEED_SITE, seedKey: seed.seedKey });
    if (existing) {
      skipped += 1;
      continue;
    }
    createObject({
      payload: {
        objectType: 'knowledge',
        type: seed.type,
        site: SEED_SITE,
        visibility: 'public',
        title: seed.title,
        body: seed.body,
        status: 'published',
        publishedSlug: seed.slug,
        metadata: {
          editorial_seed: true,
          seed_wave: 'wave16',
          seed_key: seed.seedKey,
          editorial_source: 'seed',
        },
      },
      ownerUserId: null,
    });
    created += 1;
  }

  for (const seed of COMMUNITY_SEEDS) {
    community += 1;
    communityByType[seed.type] = (communityByType[seed.type] ?? 0) + 1;
    const existing = findEditorialSeedObject({ site: SEED_SITE, seedKey: seed.seedKey });
    if (existing) {
      skipped += 1;
      continue;
    }
    createObject({
      payload: {
        objectType: 'community',
        type: seed.type,
        site: SEED_SITE,
        visibility: 'public',
        title: seed.title,
        body: seed.body,
        status: 'published',
        publishedSlug: createPublishedSlug(seed.seedKey),
        metadata: {
          editorial_seed: true,
          seed_wave: 'wave16',
          seed_key: seed.seedKey,
          editorial_source: 'seed',
        },
      },
      ownerUserId: null,
    });
    created += 1;
  }

  return { knowledge, community, communityByType, created, skipped };
}

const isMain =
  typeof process.argv[1] === 'string' && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  const result = runEditorialSeed();
  const byType = Object.entries(result.communityByType)
    .map(([type, count]) => `${type}=${count}`)
    .join(', ');
  console.log('[seed-editorial-content] done');
  console.log(`  knowledge published: ${result.knowledge}`);
  console.log(`  community published: ${result.community} (${byType})`);
  console.log(`  created this run: ${result.created}, skipped (already present): ${result.skipped}`);
  closeDbForTests();
}
