---
name: lane-harvest
description: L5 Harvest — contributions pipeline. Load before editing harvest lane or inquiry/story APIs.
---

# L5 — Harvest

- INTERFACE: `apps/backend/src/lanes/harvest/INTERFACE.md`
- Fixtures: `data/simulators/harvest/`

## Rules
1. All inputs → `contributions` table with correct `source` enum.
2. See usr/10-harvest-hub-newsletter-infrastructure.md for schema.
3. Do not implement newsletter send here — L6 owns provider.

## Verify
POST inquiry fixture; check DB or response.
