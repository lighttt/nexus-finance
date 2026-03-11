# Backend Architecture

This backend uses a clean, feature-first Node.js structure:

- `src/modules/public`: public API module (routes, controller, service, dto)
- `src/providers`: external integrations (Finnhub)
- `src/shared`: shared types/utilities
- `src/config`: environment configuration

## Flow

`routes -> controller -> service -> provider`

## API Endpoints

- `GET /api/public/health`
- `GET /api/public/market-overview`
- `GET /api/public/news`

## Running

```bash
cd apps/backend
npm run dev
```

Required env:

- `PORT`
- `FINNHUB_API_KEY`
