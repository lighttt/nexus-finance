# Nexus Finance

Real-time NASDAQ dashboard using **Nuxt 4 + Tailwind + Clerk** on the frontend and **Node/Express + Finnhub** on the backend.

## What is implemented

- Open landing page (`/`)
- Top 5 NASDAQ gainers and top 5 losers
- Latest market news cards (image, summary, source, read more)
- Full NASDAQ table (`/market`, signed-in only)
- Clerk authentication (sign in / sign up)
- Sticky/sortable NASDAQ table with symbol row action
- Symbol detail page (`/symbol/[symbol]`, signed-in only) with quote, news, earnings, and analyst signals
- Optional AWS Bedrock AI insight on the symbol detail page
- Shared top navigation with market open/closed status
- Page metadata and canonical tags for landing, market, and symbol pages

## Monorepo structure

- `apps/frontend` - Nuxt 4 app (UI + server API routes)
- `apps/backend` - Express API (Finnhub integration + Clerk token verification)

## API overview

Backend base routes:

- Public: `/api/public`
- Protected: `/api/protected`

Public endpoints:

- `GET /api/public/health`
- `GET /api/public/market-status`
- `GET /api/public/market-overview`
- `GET /api/public/news`

Protected endpoints (Bearer token required):

- `GET /api/protected/symbols?limit=300`
- `GET /api/protected/symbol-intelligence?symbol=AAPL`

Nuxt server routes that proxy protected backend calls:

- `GET /api/nasdaq-table`
- `GET /api/symbol-intelligence`

## Environment variables

Frontend (`apps/frontend/.env`):

```bash
NUXT_PUBLIC_API_BASE=http://localhost:4000/api/public
NUXT_PUBLIC_API_PROTECTED_BASE=http://localhost:4000/api/protected
NUXT_PUBLIC_SITE_URL=http://localhost:3000
NUXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NUXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NUXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
NUXT_CLERK_SECRET_KEY=sk_test_...
```

Backend (`apps/backend/.env`):

```bash
PORT=4000
FINNHUB_API_KEY=...
CLERK_SECRET_KEY=sk_test_...
AWS_REGION=ap-southeast-2
AWS_BEARER_TOKEN_BEDROCK=your_bedrock_api_key
```

## Run locally

Install dependencies:

```bash
yarn install
```

Start frontend:

```bash
yarn dev-frontend
```

Start backend:

```bash
yarn dev-backend
```

## Notes

- Use Node LTS (recommended: latest Node 20/22).
- If protected routes return `401`, check Clerk keys and token flow first.
- Bedrock is configured with a bearer token via `AWS_BEARER_TOKEN_BEDROCK`.
