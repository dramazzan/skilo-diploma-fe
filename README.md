# Skillo Frontend

Vue 3 + Vite frontend for the Skillo platform.

## Architecture

The project uses a **feature-based structure**:

- `src/app` - app-level bootstrap concerns (router setup).
- `src/features/*` - domain modules (views, stores, feature API layer, feature components/utils).
- `src/shared/*` - reusable cross-feature modules (UI primitives, base API client, mocks, shared types).

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
    mocks/
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

## Build (prod)

```sh
npm run build
```
