# Server Architecture

This backend follows a lightweight clean architecture split into four layers:

- `src/domain`: core entities and repository contracts (interfaces only)
- `src/application`: use cases with business rules
- `src/infrastructure`: external implementations (Finnhub API) and dependency wiring
- `src/presentation`: HTTP controllers/routes (Express adapters)

## Dependency Direction

Dependencies point inward only:

- `presentation -> application -> domain`
- `infrastructure -> domain` and used only at composition time

The domain layer never imports Express, Axios, or environment-specific code.

## Where Interfaces Live

- `src/domain/repositories/market-data.repository.ts`
  - `MarketDataRepository` is the main port used by use cases.
  - `FinnhubMarketDataRepository` is its adapter implementation in `infrastructure`.

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
