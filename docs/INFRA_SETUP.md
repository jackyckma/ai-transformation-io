# Infrastructure setup — ai-transformation.io

**Last updated:** 2026-06-18

## Connectivity status

| Service | Status | Details |
|---------|--------|---------|
| GitHub | ✅ Connected | [jackyckma/ai-transformation-io](https://github.com/jackyckma/ai-transformation-io) |
| Zeabur | ✅ Connected | Jacky Ma / jackymama@gmail.com, plan DEVELOPER |
| Cloudflare | ⚠️ Partial | Token valid; **zone API blocked from agent IP** (error 9109) |

## Zeabur (complete)

| Item | Value |
|------|-------|
| Project | ai-transformation-io |
| Project ID | `6a33221c7cea1559991a43e5` |
| Service ID | `6a3322239a194960c7edec34` |
| Server | Ocean (`server-69ea44a68736baad13c7c617`) |
| Server IP | `178.104.245.43` |
| Deploy type | Git (auto-deploy on push to `main`) |
| Dashboard | https://zeabur.com/projects/6a33221c7cea1559991a43e5 |
| Zeabur URL | https://ai-transformation.zeabur.app ✅ (200 OK) |
| Custom domain | ai-transformation.io — bound, status `INVALID_DNS` until DNS updated |

## Cloudflare DNS (manual step required)

**Current DNS:** `ai-transformation.io` → `167.71.58.160` (wrong — needs update)

**Required DNS** (dedicated server Ocean):

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| A | `@` | `178.104.245.43` | DNS only (grey cloud) recommended for dedicated server |
| A or CNAME | `www` | `@` or `ai-transformation.io` | Optional |

### Option A — Cloudflare Dashboard

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select zone **ai-transformation.io**
3. DNS → Records
4. Edit or delete existing A record pointing to `167.71.58.160`
5. Add/update A record: `@` → `178.104.245.43` (proxy off for dedicated Zeabur server)
6. Wait for propagation; Zeabur domain status should change from `INVALID_DNS` to active

### Option B — API (after fixing token IP restriction)

Token verify works but zone list fails with:
```json
{"code":9109,"message":"Cannot use the access token from location: ..."}
```

Fix in Cloudflare Dashboard → My Profile → API Tokens → edit token → remove or update **IP Address Filtering**, then run:

```bash
source .env
ZONE_ID=$(curl -s -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  "https://api.cloudflare.com/client/v4/zones?name=ai-transformation.io" | jq -r '.result[0].id')

# Update root A record
curl -X PUT "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records/{RECORD_ID}" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"type":"A","name":"ai-transformation.io","content":"178.104.245.43","ttl":1,"proxied":false}'
```

## Cloudflare Email Routing (manual step required)

Forward **info@ai-transformation.io** → **multitude.multiplex@gmail.com**

### Dashboard steps

1. Cloudflare Dashboard → **ai-transformation.io** → **Email** → **Email Routing**
2. Enable Email Routing (add required MX/TXT records if prompted)
3. **Destination addresses** → Add `multitude.multiplex@gmail.com` → verify via email link
4. **Routing rules** → Create rule:
   - Custom address: `info@ai-transformation.io`
   - Action: Forward to `multitude.multiplex@gmail.com`

### API steps (after token IP fix)

```bash
# Enable routing
curl -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/email/routing/enable" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN"

# Add destination (triggers verification email)
curl -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/email/routing/addresses" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"email":"multitude.multiplex@gmail.com"}'

# Create routing rule (after destination verified)
curl -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/email/routing/rules" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{
    "name": "info forward",
    "enabled": true,
    "matchers": [{"type": "literal", "field": "to", "value": "info@ai-transformation.io"}],
    "actions": [{"type": "forward", "value": ["multitude.multiplex@gmail.com"]}]
  }'
```

## Verification checklist

- [x] GitHub repo created and pushed
- [x] Zeabur project on Ocean server
- [x] Git deploy linked (auto-deploy on `main`)
- [x] https://ai-transformation.zeabur.app returns 200
- [ ] DNS A record → `178.104.245.43`
- [ ] https://ai-transformation.io serves placeholder
- [ ] Email routing info@ → multitude.multiplex@gmail.com
