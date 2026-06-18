# L6 — Newsletter INTERFACE

## Purpose
Newsletter infrastructure stub: issues, subscribers, provider abstraction. No public send in v1.

## Owns
- `apps/backend/src/lanes/newsletter/**`

## Provides
- `NewsletterProvider` interface + `NoopNewsletterProvider`
- Tables: `issues`, `subscribers`, `issue_contributions`
- `POST /api/webhooks/inbound-email` — stub (501 until Wave 8)

## Consumes
| Lane | Contract |
|------|----------|
| L5 | contributions for issue compilation |
| L10 | `compile_issue_draft` job |

## Wave
6 (stub), 8 (pilot send)

## Verification
- Fixture: `data/simulators/newsletter/issue-draft.json`
