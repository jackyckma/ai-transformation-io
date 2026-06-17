# AI Implementation Patterns: Copilots, RAG, Agents & Automation

> Website content — pattern selection guide

## Overview

Enterprise AI systems in 2026 fall into four primary patterns. Choosing the right pattern for each use case is one of the most important decisions in AI transformation — and one of the most commonly gotten wrong.

The wrong pattern leads to over-engineering (building agents when a copilot suffices) or under-delivering (deploying copilots when the workflow needs autonomous execution).

## The Four Patterns

```
                    Human Involvement
                    High ←──────────→ Low
                    
Copilots ──────── RAG Systems ──────── Agents ──────── Automation
(Assist)          (Retrieve)          (Execute)        (Rules)
```

---

## Pattern 1: Copilots

**What:** AI assists a human who remains in control of every action.

**How it works:** AI generates suggestions, drafts, analyses, or recommendations. The human reviews, edits, and decides whether to act.

**Best for:**
- Content creation (emails, reports, proposals)
- Code assistance and review
- Analysis support (summarize, compare, highlight)
- Learning and exploration
- Any task where human judgment is essential for every output

**Not good for:**
- High-volume repetitive tasks (too slow — human bottleneck remains)
- Real-time decision-making at scale
- Tasks requiring grounded enterprise knowledge (use RAG instead)

**Governance level:** Level 0 (No Autonomy) — AI suggests, human acts

**Example:** Microsoft 365 Copilot drafting emails, analyzing spreadsheets, summarizing meetings. The user decides what to send, publish, or act on.

**Transformation signal:** Copilots alone rarely transform — they accelerate existing work. Transformation happens when copilot-assisted workflows are redesigned (Stage 6 of the roadmap).

---

## Pattern 2: RAG (Retrieval-Augmented Generation)

**What:** AI retrieves relevant information from enterprise knowledge bases, then generates grounded responses.

**How it works:** User query → retrieve relevant documents/data → AI generates answer grounded in retrieved context → response with source citations.

**Best for:**
- Enterprise Q&A (policies, procedures, product info)
- Customer support with accurate, sourced answers
- Legal/compliance document search
- Technical documentation lookup
- Any task requiring answers grounded in specific organizational knowledge

**Not good for:**
- Multi-step workflows requiring action (use agents)
- Tasks where the knowledge base doesn't exist or is outdated
- Real-time data requiring live system integration

**Governance level:** Level 0–1 — AI generates responses; human validates for high-stakes decisions

**Architecture requirements:**
- Vector database for semantic search
- Document ingestion and chunking pipeline
- Source attribution and citation
- Knowledge base freshness monitoring

**Example:** An HR policy assistant that answers employee questions by retrieving from the current employee handbook, benefits documents, and org policies — with citations.

**Transformation signal:** RAG transforms when it replaces manual knowledge search entirely, not when it's an additional tool alongside existing search.

---

## Pattern 3: Agentic Workflows

**What:** AI autonomously executes multi-step tasks within defined governance boundaries.

**How it works:** Agent receives a goal → plans steps → executes actions (API calls, data updates, notifications) → reports outcome. Human supervises outcomes, not steps.

**Best for:**
- Multi-step business processes (order processing, data creation, procurement)
- Cross-system workflows requiring coordination
- Tasks with clear success criteria and reversible actions
- Processes currently requiring manual handoffs between systems/people

**Not good for:**
- Ambiguous tasks without clear success criteria
- High-stakes irreversible decisions without human approval
- Tasks where the workflow itself isn't well understood yet

**Governance level:** Level 1–3 — Depends on risk tier and proven track record

**Architecture requirements:**
- Tool/API integration layer
- Action logging and audit trail
- Guardrails and action boundaries
- Human escalation paths
- Performance monitoring and rollback capability

**Example:** Covestro's MARIS agent that guides users through material master data creation via conversational AI, integrated with SAP MDG — reducing cycle time from 12 hours to 6 minutes.

**Transformation signal:** Agents transform when they replace entire workflow segments, not when they assist within existing workflows.

---

## Pattern 4: Deterministic Automation

**What:** Rules-based automation with AI-enhanced decision points. Same input produces same output.

**How it works:** Defined rules and logic process inputs. AI may enhance specific decision points (classification, extraction, matching) but the overall flow is predictable.

**Best for:**
- Invoice processing and matching
- Compliance checks and validation
- Data extraction from structured/semi-structured documents
- Routing and categorization
- Quality inspection (computer vision)
- Any process with clear rules and predictable outcomes

**Not good for:**
- Tasks requiring contextual judgment or creative output
- Novel situations not covered by rules
- Processes that change frequently

**Governance level:** Level 1–2 — Predictable behavior enables higher autonomy with lower risk

**Example:** Automated invoice matching against purchase orders with exception flagging for human review. AI extracts data from invoices; rules engine matches and routes.

**Transformation signal:** Automation transforms when it eliminates entire manual process steps, not when it speeds up individual steps.

---

## Pattern Selection Matrix

| If the business need is... | Choose... |
|---------------------------|-----------|
| Help humans do work faster | **Copilot** |
| Answer questions from enterprise knowledge | **RAG** |
| Execute multi-step workflows autonomously | **Agent** |
| Process high-volume predictable tasks | **Automation** |
| Human support + grounded knowledge | **Copilot + RAG** |
| Autonomous execution + knowledge grounding | **Agent + RAG** |
| Classification + routing + action | **Automation + Agent** |

## Common Pattern Mistakes

| Mistake | Problem | Fix |
|---------|---------|-----|
| Copilot for everything | Human bottleneck remains; no transformation | Assess if workflow needs autonomous execution |
| Agent before workflow is understood | Agent fails unpredictably; trust erodes | Map workflow first; start with copilot or automation |
| RAG without knowledge base hygiene | Garbage in, garbage out; hallucinated answers | Invest in data quality before RAG deployment |
| Automation with AI at every step | Over-engineered, fragile | Use AI only at decision points that benefit from it |
| Skipping to agents for hype | Governance gaps, unmanaged risk | Progress through autonomy ladder |

## Combining Patterns

Most production AI systems combine patterns:

**Copilot + RAG:** AI assistant grounded in enterprise knowledge (most common enterprise pattern today)

**Agent + RAG:** Autonomous agent that retrieves context before acting (emerging pattern for complex workflows)

**Automation + Agent:** Rules handle predictable steps; agent handles exceptions and edge cases

**All four in a value stream:** Different patterns for different stages of the same end-to-end workflow

## Maturity Progression

Organizations typically progress through patterns:

```
Year 1: Copilots + RAG (human-in-the-loop, low risk)
         ↓
Year 2: Automation + Agent pilots (bounded autonomy, proven workflows)
         ↓
Year 3: Agentic workflows at scale (governed autonomy, audited outcomes)
```

Don't skip to agents because they're trending. Build organizational confidence and governance through copilots and RAG first.

---

*Related: [Use Cases by Industry](use-cases-by-industry.md) · [Governance & Operating Model](governance-and-operating-model.md) · [Transformation Roadmap](transformation-roadmap.md)*
