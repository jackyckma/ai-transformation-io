# L6 — Newsletter INTERFACE

## Purpose
Newsletter infrastructure: issues, subscribers, provider abstraction, and Wave 17 pilot send/webhook flows.

## Owns
- `apps/backend/src/lanes/newsletter/**`
- `apps/backend/src/db/newsletter.ts`

## Provides
- `NewsletterProvider` — `NoopNewsletterProvider` + `ZeaburZSendProvider` (when `ZSEND_API_KEY` set)
- Tables: `issues`, `subscribers`, `issue_contributions`
- `POST /api/webhooks/zsend` — accept + log (Wave 8)
- `POST /api/webhooks/inbound-email` — Wave 17 secret-gated contribution ingest (`source=newsletter_reply`)
- `POST /api/newsletter/subscribe|unsubscribe` — live subscriber writes (single opt-in pilot)
- `POST /api/internal/newsletter/send-issue` — admin-gated pilot send with recipient cap
- DB helpers in `db/newsletter.ts`: subscriber upsert/list/unsubscribe, issue send markers, recent issue list, reply token lookup

## Consumes
| Lane | Contract |
|------|----------|
| L5 | contributions for issue compilation |
| L10 | `compile_issue_draft` job writes `issues`; admin list reads recent issues |

## Wave
8 (infra) · Wave 17 send pilot shipped (legacy Wave 10 scope)

## Verification
- Fixture: `data/simulators/newsletter/issue-draft.json`
- Tests: `apps/backend/src/lanes/newsletter/newsletter.test.ts`
