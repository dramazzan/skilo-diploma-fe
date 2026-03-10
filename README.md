# Skillo Frontend

Vue 3 + Vite frontend for the Skillo platform.

## Architecture

The project uses a **feature-based structure**:

- `src/app` - app-level bootstrap concerns (router setup).
- `src/features/*` - domain modules (views, stores, feature API layer, feature components/utils).
- `src/shared/*` - reusable cross-feature modules (UI primitives, base API client, shared types).

Current high-level structure:

```text
src/
  app/
    router/
  features/
    auth/
    home/
    leaders/
    company/
    friends/
    community/
    vacancies/
    profile/
    skill-verification/
    skill-levels/
    daily-tasks/
    roadmaps/
  shared/
    api/
    ui/
    types/
```

## Conventions

- Keep business rules in feature `store/`, `api/`, or composables.
- Keep views focused on rendering + orchestration.
- Avoid direct usage of shared base client in views; use feature `api/` wrappers.
- Put cross-feature UI and utilities in `src/shared`.
- Use lazy-loaded routes in `src/app/router/index.ts`.

## Setup

```sh
npm install
```

## Run (dev)

```sh
npm run dev
```

## Backend connection

The frontend expects real backend API responses.

Create `.env` from `.env.example`:

```sh
cp .env.example .env
```

Set API URL:

```env
VITE_API_BASE_URL=http://localhost:4000/api
```

## Build (prod)

```sh
npm run build
```
