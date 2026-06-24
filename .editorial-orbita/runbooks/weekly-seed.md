# Runbook — weekly content seed (Orbita client)

**When:** After L12 draft API + Orbita `content-ai-transformation-org` configured  
**Operator:** Founder or agent with Orbita API key

---

## Preconditions

- [ ] Wave 15 UI polish shipped
- [ ] L12 `POST /api/internal/editorial/drafts` live (or v1 objects draft via Bearer)
- [ ] Orbita vault `atx_write_org` set
- [ ] HTTP allow-list includes ai-transformation domains

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
