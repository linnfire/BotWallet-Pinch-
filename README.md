# BotWallet (Pinch)
https://botnews-pinch.vercel.app/

BotWallet is an AI customer wallet demo for autonomous commerce.

This repository contains:
- BotWallet: React frontend plus Node/Express backend in the repo root.
- BotNews: merchant demo app in BotNews/.
- agent.ts: terminal demo for the full HTTP 402 flow.

Core flow:
1. Agent requests premium content from BotNews.
2. BotNews returns HTTP 402 Payment Required with a machine-readable offer.
3. BotWallet validates Bot Limit budget rules.
4. BotWallet charges through Pinch.
5. BotWallet settles purchase with BotNews.
6. Agent retries and receives premium content.

## Local development

### 1) BotWallet setup

Copy env template:

```bash
cp .env.example .env
```

Set Pinch test credentials in .env:
- PINCH_CLIENT_ID
- PINCH_CLIENT_SECRET
- PINCH_PUBLISHABLE_KEY
- VITE_PINCH_PUBLISHABLE_KEY
- PINCH_ENV=test

Install and run BotWallet:

```bash
npm install
npm run dev
```

BotWallet frontend: http://localhost:5173
BotWallet backend: http://localhost:8000

### 2) BotNews setup

In a second terminal:

```bash
cd BotNews
npm install
npm run dev
```

BotNews: http://localhost:3001
Dashboard: http://localhost:3001/dashboard

### 3) CLI demo

From repo root:

```bash
npm run demo:agent
npm run demo:agent -- --pay
```

Optional CLI environment overrides:
- BOTNEWS_URL
- BOTWALLET_URL
- REPORT_ID
- AGENT_ID
- WALLET_USER_ID

### 4) Pinch Merch storefront

The supplied-image merch site is in [`pinchmerch/`](./pinchmerch). With BotWallet running, start it with:

```bash
npm run dev:pinchmerch
```

Open http://localhost:5174. The three shirt buttons make a $50.00 AUD purchase through the connected Bot Limit; increase its daily and auto-approve rules first if necessary.

## API routes (BotWallet)

- GET /api/pinch/wallet
- POST /api/pinch/connect-wallet
- PATCH /api/pinch/wallet
- POST /api/agent/purchase-premium
- POST /api/agent/unlock-premium

unlock-premium performs the end-to-end BotNews integration:
- Reads the BotNews offer (402)
- Applies budget/approval rules
- Charges via Pinch
- Calls BotNews settlement endpoint
- Retries and returns unlocked content

## Environment variables

Root .env uses:
- PINCH_CLIENT_ID
- PINCH_CLIENT_SECRET
- PINCH_PUBLISHABLE_KEY
- VITE_PINCH_PUBLISHABLE_KEY
- PINCH_ENV
- BOTNEWS_BASE_URL (default http://localhost:3001)
- BOTNEWS_DEFAULT_REPORT_ID (default market-report-001)
- BOTWALLET_ALLOWED_ORIGINS (optional)
- BOTWALLET_DEV_API_PROXY (optional local dev proxy override)
- VITE_BOTWALLET_API_BASE_URL (optional when frontend and backend are hosted separately)
- PORT

Never expose PINCH_CLIENT_SECRET in frontend variables.

## Deploy to Vercel

Deploy as two Vercel projects from the same GitHub repository.

### Project A: BotWallet

- Root directory: repository root
- Uses vercel.json at root
- Build command: npm run build
- Output directory: dist

Set BotWallet environment variables in Vercel:
- PINCH_CLIENT_ID
- PINCH_CLIENT_SECRET
- PINCH_ENV=test
- VITE_PINCH_PUBLISHABLE_KEY
- BOTNEWS_BASE_URL=https://YOUR-BOTNEWS-URL.vercel.app
- BOTWALLET_ALLOWED_ORIGINS=https://YOUR-BOTWALLET-URL.vercel.app

### Project B: BotNews

- Root directory: BotNews
- Uses BotNews/vercel.json
- No secrets required for current demo implementation

After deploy:
1. Copy public BotNews URL.
2. Set BOTNEWS_BASE_URL in BotWallet Vercel project.
3. Redeploy BotWallet.

## Notes for judges/demo

- BotWallet web UI can run the premium unlock flow publicly.
- BotNews is publicly browsable and exposes premium report APIs.
- CLI demo still works locally with default localhost URLs or public URL overrides.
- Wallet persistence is file-based locally and memory-backed when deployed on read-only serverless filesystem.
