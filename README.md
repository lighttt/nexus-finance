# Nexus Finance

Nuxt app + separate Node/Express backend.

## Project Structure

- `apps/frontend/` Nuxt frontend
- `apps/backend/` backend API (clean architecture)

## Frontend Conventions (Nuxt)

- Pages: `apps/frontend/app/pages/**` in `kebab-case` (`market-overview.vue`)
- Components: `PascalCase.vue` (`MarketOverviewCard.vue`)
- Composables: `useXxx.ts` (`useMarketNews.ts`)
- Plugins/Middleware: `kebab-case.ts` with Nuxt suffixes (`*.client.ts`, `*.server.ts`, `*.global.ts`)

## Backend Conventions

- Domain: `apps/backend/src/domain/**` (entities + interfaces only)
- Use cases: `apps/backend/src/application/use-cases/**`
- Infrastructure adapters: `apps/backend/src/infrastructure/**`
- HTTP layer: `apps/backend/src/presentation/http/**`

Dependency direction:

- `presentation -> application -> domain`
- `infrastructure -> domain` (wired in container/composition)

## Run

Frontend:

```bash
yarn dev:frontend
```

Backend:

```bash
yarn dev:backend
```
