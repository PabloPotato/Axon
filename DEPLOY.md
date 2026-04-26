# DEPLOY.md — Manual deployment commands

⚠️ **Prerequisite: You need to be at your machine with a browser.**

Vercel and Railway CLIs require browser-based login flows. This file contains the exact commands to run after you authenticate.

---

## 0. Login (run these first)

```bash
npx vercel login
# → Opens browser. Auth with your Vercel account.
# → Run `vercel switch --personal` if needed (not team)

npx railway login
# → Opens browser. Auth with your Railway account.
```

---

## 1. Dashboard → Vercel

```bash
cd dashboard

# Set environment variables (secrets, never in git)
npx vercel env add NEXT_PUBLIC_SUPABASE_URL
# Paste: https://wrbaygxtqrtvpzxnrkni.supabase.co

npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# Paste: (from Supabase Dashboard → Settings → API → anon public key)

npx vercel env add NEXT_PUBLIC_SITE_URL
# Paste: https://axon-dashboard.vercel.app
# (or whatever Vercel assigns after first deploy — update this after deploy)

# Deploy
npx vercel --prod
```

**Expected output:** deployment URL (e.g., `https://axon-dashboard-xxxx.vercel.app`)

---

## 2. Landing page → Vercel

```bash
cd landing

# No env vars needed — landing is static

npx vercel --prod
```

**Expected output:** deployment URL (e.g., `https://axon-landing-xxxx.vercel.app`)

---

## 3. Proxy → Railway

```bash
cd services/x402-proxy

# Railway uses `railway.json` or the `start` command from package.json
# The proxy's start script is: `bun run src/index.ts`
# Railway supports Bun natively — no Dockerfile needed.

# Set environment variables
npx railway variables set DATABASE_URL="REPLACE_ME_IN_RAILWAY"
# Actual value: the Supabase Postgres connection string
# Get from: Supabase Dashboard → Project Settings → Database → Connection string (PSQL)
# Format: postgresql://postgres:[PASSWORD]@db.[PROJECT_ID].supabase.co:6543/postgres

npx railway variables set AXON_SIMULATOR_BYPASS=1

npx railway variables set AXON_CORS_ORIGINS="https://axon-dashboard.vercel.app"

npx railway variables set SOLANA_RPC_URL="https://api.devnet.solana.com"

# Deploy
npx railway up
```

**Expected output:** deployment URL (e.g., `https://axon-proxy.up.railway.app`)

---

## 4. Verification

```bash
# Check dashboard loads
curl -s https://axon-dashboard-xxxx.vercel.app | head -5
# Should contain "<title>Axon" or similar

# Check proxy health
curl -s https://axon-proxy.up.railway.app/healthz
# Should return: {"ok":true,"chain_head":"sha256:..."}

# Check landing page loads
curl -s https://axon-landing-xxxx.vercel.app | head -5
# Should contain HTML
```

---

## 5. Post-deploy ENV updates

After you know the Vercel dashboard URL, update the proxy's CORS origins:

```bash
cd services/x402-proxy
npx railway variables set AXON_CORS_ORIGINS="https://axon-dashboard-xxxx.vercel.app"
```

And update the landing page's site URL if it's used for any redirects:

```bash
cd landing
npx vercel env add NEXT_PUBLIC_SITE_URL
# Paste: https://axon-landing-xxxx.vercel.app
```

---

## Troubleshooting

| Problem | Likely fix |
|---|---|
| Railway build fails on `@axon/engine` import | Railway doesn't support workspace `file:` deps natively. Solution: copy `axon-engine/` into `services/x402-proxy/` or publish `@axon/engine` to npm, or use a Dockerfile that runs `bun install` at the monorepo root |
| Vercel build fails on `@axon/engine` or `@axon/audit` | Same issue — workspace deps. Solution: configure `vercel.json` build command to run `bun install` from root, or inline the dependencies |
| Proxy health returns `503` | Supabase DB is not reachable from Railway. Check `DATABASE_URL` is correct and Railway's IP isn't blocked by Supabase's IP restrictions |
