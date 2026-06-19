# Traceability index — lanes → packages → skills

**Last updated:** 2026-06-19

| Lane | Name | Package / path | INTERFACE | Agent skill | Simulator fixtures |
|------|------|----------------|-----------|-------------|-------------------|
| L0 | shared | `packages/shared/` | [INTERFACE.md](../packages/shared/INTERFACE.md) | [.agents/skills/lane-shared/SKILL.md](../.agents/skills/lane-shared/SKILL.md) | — |
| L1 | platform | `apps/combined/` | [INTERFACE.md](../apps/combined/INTERFACE.md) | [.agents/skills/lane-platform/SKILL.md](../.agents/skills/lane-platform/SKILL.md) | — |
| L2 | backend-core | `apps/backend/` | [INTERFACE.md](../apps/backend/INTERFACE.md) | [.agents/skills/lane-backend-core/SKILL.md](../.agents/skills/lane-backend-core/SKILL.md) | [data/simulators/backend/](../data/simulators/backend/) |
| L3 | auth | `apps/backend/src/lanes/auth/` | [INTERFACE.md](../apps/backend/src/lanes/auth/INTERFACE.md) | [.agents/skills/lane-auth/SKILL.md](../.agents/skills/lane-auth/SKILL.md) | [data/simulators/auth/](../data/simulators/auth/) |
| L4 | assessment | `apps/backend/src/lanes/assessment/` | [INTERFACE.md](../apps/backend/src/lanes/assessment/INTERFACE.md) | [.agents/skills/lane-assessment/SKILL.md](../.agents/skills/lane-assessment/SKILL.md) | [data/simulators/assessment/](../data/simulators/assessment/) |
| L5 | harvest | `apps/backend/src/lanes/harvest/` | [INTERFACE.md](../apps/backend/src/lanes/harvest/INTERFACE.md) | [.agents/skills/lane-harvest/SKILL.md](../.agents/skills/lane-harvest/SKILL.md) | [data/simulators/harvest/](../data/simulators/harvest/) |
| L6 | newsletter | `apps/backend/src/lanes/newsletter/` | [INTERFACE.md](../apps/backend/src/lanes/newsletter/INTERFACE.md) | [.agents/skills/lane-newsletter/SKILL.md](../.agents/skills/lane-newsletter/SKILL.md) | [data/simulators/newsletter/](../data/simulators/newsletter/) |
| L7 | content | `packages/content/` | [INTERFACE.md](../packages/content/INTERFACE.md) | [.agents/skills/lane-content/SKILL.md](../.agents/skills/lane-content/SKILL.md) | — |
| L8 | web-io | `apps/web-io/` | [INTERFACE.md](../apps/web-io/INTERFACE.md) | [.agents/skills/lane-web-io/SKILL.md](../.agents/skills/lane-web-io/SKILL.md) | — |
| L9 | web-org | `apps/web-org/` | [INTERFACE.md](../apps/web-org/INTERFACE.md) | [.agents/skills/lane-web-org/SKILL.md](../.agents/skills/lane-web-org/SKILL.md) | — |
| L10 | agent | `apps/backend/src/lanes/agent/` | [INTERFACE.md](../apps/backend/src/lanes/agent/INTERFACE.md) | [.agents/skills/lane-agent/SKILL.md](../.agents/skills/lane-agent/SKILL.md) | [data/simulators/agent/](../data/simulators/agent/) |
| L11 | agent-protocol | `apps/backend/src/lanes/agent-protocol/` (planned) | — (Wave 7) | — (Wave 7) | [data/simulators/agent-protocol/](../data/simulators/agent-protocol/) (planned) |

## API route map (target)

| Route | Lane | Wave |
|-------|------|------|
| `GET /api/health` | L2 | 0 |
| `POST /api/inquiries` | L5 | 2 ✅ |
| `POST /api/stories` | L5 | 5 |
| `GET /api/stories` | L5 | 5 |
| `GET /api/prompts/current` | L5 | 5 |
| `GET /api/assessment/questions` | L4 | 3 ✅ |
| `POST /api/assessment/score` | L4 | 3 ✅ |
| `GET/POST /api/assessment/session` | L4 | 4 |
| `GET/POST /api/auth/*` | L3 | 4 |
| `GET /api/v1/curated` | L7 | 6 |
| `GET /api/v1/capabilities` | L11 | 6 stub · 7 live |
| `GET /api/v1/content` | L11 | 7 |
| `GET /api/v1/content/:slug` | L11 | 7 |
| `POST /api/v1/agent/authorize` | L3 + L11 | 7 |
| `POST /api/v1/agent/token` | L11 | 7 |
| `POST /api/v1/contributions` | L11 | 7 |
| `POST /api/webhooks/inbound-email` | L6 | 8 stub · 10 live (CF Worker) |
| `POST /api/webhooks/zsend` | L6 | 8 (delivery/bounce) |
| `POST /api/agent/compile-draft` | L10 | 8 (admin) |

## Cross-references

- Product IA: [product-architecture.md](./product-architecture.md)
- Wave schedule: [project-progress.md](./project-progress.md)
- Agent protocol v1: [usr/11-agent-first-api-v1.md](../usr/11-agent-first-api-v1.md)
- Harvest + newsletter: [usr/10-harvest-hub-newsletter-infrastructure.md](../usr/10-harvest-hub-newsletter-infrastructure.md)
- Email send/reply: [EMAIL_NEWSLETTER.md](./EMAIL_NEWSLETTER.md)
