# AI Governance & Operating Model

> Website content — governance framework and autonomy guidance

## Why Governance Is a Transformation Issue, Not a Compliance Checkbox

Most organizations are comfortable with AI in a supporting role. Far fewer are ready to let it run autonomously. The governance challenge isn't only how much autonomy to allow — it's whether the boundaries were intentionally designed, or whether they're emerging by default as teams experiment.

Deloitte's 2026 research found:
- **69%** of organizations operate at the most conservative end (no autonomy, or low-risk/reversible only)
- Only **12%** report the most mature state: AI runs end-to-end, humans audit outcomes
- Governance is becoming a **competitive signal** — customers and partners ask not just whether AI is used, but how decisions are made, monitored, and owned

## The Autonomy Maturity Ladder

Organizations progress through four levels of AI autonomy:

### Level 0: No Autonomy
- AI provides suggestions; humans decide and act on everything
- Example: Copilot drafts email; human sends
- Governance need: Usage policies, data access controls

### Level 1: Assisted Autonomy
- AI acts on low-risk, reversible actions within defined boundaries
- Humans approve exceptions and high-stakes decisions
- Example: AI auto-categorizes support tickets; human handles escalations
- Governance need: Action boundaries, escalation paths, monitoring

### Level 2: Supervised Autonomy
- AI executes multi-step workflows; humans review outcomes periodically
- Example: AI agent processes material master data requests; human audits weekly
- Governance need: Outcome auditing, performance SLAs, rollback procedures

### Level 3: Audited Autonomy
- AI runs end-to-end within governance guardrails; humans audit outcomes, not steps
- Example: Autonomous order processing with exception-only human involvement
- Governance need: Continuous monitoring, decision evidence, accountability framework

**Most organizations should aim for Level 1 first**, prove reliability, then advance. Skipping levels creates unmanaged risk.

## Five Components of an AI Governance Operating Model

An AI governance operating model translates principles into a running operational system. Five structural components:

### 1. Decision Rights & Ownership
- Who approves new AI use cases?
- Who owns outcomes when AI-driven actions go wrong?
- Who can change autonomy levels?
- Who monitors model behavior?

**Key principle:** Unclear accountability does not scale. Ownership must be explicit before autonomy expands.

### 2. Risk Classification & Action Boundaries
- Classify use cases by risk tier (low / medium / high / critical)
- Define action boundaries: what AI can do autonomously vs. what requires human approval
- Document which risks are truly reversible and which require escalation

**Key principle:** Document reversibility before AI goes live in a workflow, not after the first exception.

### 3. Policy & Standards
- Acceptable use policies
- Data handling requirements (PII, proprietary, regulated)
- Model selection and evaluation criteria
- Bias and fairness standards
- Regulatory compliance (EU AI Act, sector-specific rules)

**Key principle:** Policies must be enforceable, not just documented. Only ~14% of enterprises enforce AI governance enterprise-wide today.

### 4. Monitoring & Observability
- Model performance tracking (accuracy, drift, latency)
- Decision logging and audit trails
- Anomaly detection and alerting
- User feedback loops

**Key principle:** Governance should evolve with evidence. Define what evidence would justify changing guardrails.

### 5. Incident Response & Escalation
- Defined escalation paths for AI failures
- Rollback and reversibility procedures
- Root cause analysis process
- Communication protocols for stakeholders

**Key principle:** The first AI failure should test a pre-designed response, not create an ad hoc crisis.

## Decision Architecture

AI transforms enterprise architecture from **system design** to **decision architecture**:

| Traditional EA | Decision Architecture |
|----------------|----------------------|
| Maps systems and integrations | Maps decision points and accountability |
| Optimizes data flow | Optimizes judgment flow |
| Documents process steps | Defines human-AI boundaries per decision |
| Change management for go-live | Continuous learning and recalibration |

Every AI-enabled workflow should explicitly document:
- **Decision points** — Where judgment is required
- **Human-AI boundary** — Who/what decides at each point
- **Action boundary** — What AI can do without approval
- **Decision evidence** — What inputs, policies, and model outputs justify each decision
- **Reversibility** — Can this action be undone? How quickly?

## AI Operating Model Options

How AI delivery is organized affects transformation speed and governance quality:

### Centralized
- Single AI center of excellence (CoE) owns strategy, standards, and delivery
- **Pros:** Consistent governance, shared platforms, economies of scale
- **Cons:** Bottleneck risk, slow response to business needs

### Federated
- Business units own AI delivery within central standards
- **Pros:** Business proximity, faster iteration
- **Cons:** Inconsistent quality, governance fragmentation, duplication

### Hybrid (Recommended for Most Enterprises)
- Central team sets standards, platforms, and governance
- Federated teams deliver use cases within the framework
- **Pros:** Balance of speed and control
- **Cons:** Requires clear decision rights and strong central leadership

## Governance Questions Every Leader Should Answer Now

1. **Which risks are truly reversible, and which require escalation?**
2. **Who owns the outcome when an AI-driven action goes wrong?**
3. **What evidence would justify changing the guardrails?**
4. **Are we measuring autonomy maturity, or just counting deployments?**
5. **Would our governance survive an audit or a visible AI failure today?**

## Regulatory Landscape (2026)

Key frameworks shaping enterprise AI governance:
- **EU AI Act** — Risk-based classification, transparency requirements
- **NIST AI RMF** — Voluntary risk management framework (widely adopted in US)
- **ISO/IEC 42001** — AI management system standard
- **Sector-specific** — FDA (healthcare), financial regulators, etc.

Governance operating models should align with applicable frameworks but go beyond compliance to enable confident scaling.

---

*Related: [Transformation Roadmap](transformation-roadmap.md) · [Measuring AI Value](measuring-ai-value.md) · [Glossary](glossary.md)*
