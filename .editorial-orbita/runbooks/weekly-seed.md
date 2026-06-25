# Runbook — weekly content seed (Orbita client)

**When:** After L12 draft API + Orbita `content-ai-transformation-org` configured  
**Operator:** Founder or agent with Orbita API key

---

## Preconditions

- [ ] Wave 15 UI polish shipped
- [ ] L12 `POST /api/internal/editorial/drafts` live (or `POST /api/v1/objects/drafts` via Bearer)
- [ ] Orbita vault `atx_write_org` set
- [ ] HTTP allow-list includes ai-transformation domains

---

## API paths (live, Wave 16)

Bearer (Orbita vault token) create-draft — pick either:

```bash
# Wave 12 object store draft (recommended for external agents)
curl -X POST https://ai-transformation.io/api/v1/objects/drafts \
  -H "authorization: Bearer $ATX_WRITE_ORG" \
  -H "content-type: application/json" \
  -d '{"objectType":"knowledge","type":"article","site":"org","visibility":"public","title":"…","body":"…"}'

# Editorial lane (same payload; also accepts an admin session)
curl -X POST https://ai-transformation.io/api/internal/editorial/drafts \
  -H "authorization: Bearer $ATX_WRITE_ORG" \
  -H "content-type: application/json" \
  -d '{"objectType":"community","type":"community_announcement","site":"org","visibility":"public","title":"…","body":"…"}'
```

Admin review + publish (ADMIN_EMAILS session cookie):

```bash
GET  /api/internal/editorial/drafts?site=org      # list pending
POST /api/internal/editorial/drafts/:id/approve   # publish → /knowledge or /community
POST /api/internal/editorial/drafts/:id/reject    # archive
```

Idempotent local seed (founder fallback — no Orbita):

```bash
pnpm tsx scripts/seed-editorial-content.ts   # or: pnpm seed:editorial
```

---

## Steps

1. **Review brief** — [content-brief.md](../content-brief.md) + [brand-voice.md](../brand-voice.md)
2. **Start Orbita session** (example — adjust to your Orbita CLI/UI):

   ```bash
   # Pseudocode — use Orbita API or admin UI
   POST /v1/sessions { "agent_profile": "default" }
   POST /v1/sessions/{id}/messages {
     "input": { "type": "text", "text": "Draft one .org knowledge object + one community_announcement per content-brief. POST drafts only." }
   }
   ```

3. **Verify drafts** — admin list or DB; no public visibility until approved
4. **Founder approve** — publish via internal approve endpoint or moderation UI
5. **Spot-check** — `/knowledge`, `/community`, home curated slots
6. **Log gaps** — Orbita issues → orbita repo feedback file

---

## Fallback (Orbita down)

- Manual object create via admin curl or future UI
- Curated JSON-only home updates (no new objects)

---

## Do not

- Auto-publish without review
- Spam public community with test `[acceptance-test]` posts (use draft or members-only)
