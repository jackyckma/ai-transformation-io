# L3 — Auth INTERFACE

## Purpose
Google OAuth v1, session management, users table. Shared identity for .io and .org.

## Owns
- `apps/backend/src/lanes/auth/**`

## Provides
- `GET /api/auth/google`, `GET /api/auth/callback/google`
- `POST /api/auth/logout`, `GET /api/auth/me`

## Consumes
| Lane | Contract |
|------|----------|
| L2 | App mount, DB |
| L0 | User/session types |

## Wave
4

## Verification
- OAuth flow manual test
- Fixture: `data/simulators/auth/session.json`
