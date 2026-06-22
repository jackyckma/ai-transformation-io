# L6 — Newsletter INTERFACE

## Purpose
Newsletter infrastructure: issues, subscribers, provider abstraction. No public subscribe/send UI until Wave 10 pilot.

## Owns
- `apps/backend/src/lanes/newsletter/**`
- `apps/backend/src/db/newsletter.ts`

## Provides
- `NewsletterProvider` — `NoopNewsletterProvider` + `ZeaburZSendProvider` (when `ZSEND_API_KEY` set)
- Tables: `issues`, `subscribers`, `issue_contributions`
- `POST /api/webhooks/zsend` — accept + log (Wave 8)
- `POST /api/webhooks/inbound-email` — 501 until Wave 10
- `POST /api/newsletter/subscribe|unsubscribe` — 501 until Wave 10

## Consumes
| Lane | Contract |
|------|----------|
| L5 | contributions for issue compilation |
| L10 | `compile_issue_draft` job writes `issues` |

## Wave
8 (infra) · public send pilot Wave 10

## Verification
- Fixture: `data/simulators/newsletter/issue-draft.json`
- Tests: `apps/backend/src/lanes/newsletter/newsletter.test.ts`
