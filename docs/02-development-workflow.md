# 02 Development Workflow

## Prerequisites

- Node.js 20+
- pnpm 9+
- Docker Desktop

## Install

```bash
pnpm install
```

## Local Infra

Use Docker Compose in repo root:

```bash
docker compose up -d
```

Services:
- Postgres on `5432`
- Redis on `6379`

## Environment Setup

Create app-level environment files before starting.

Recommended file locations:
- `apps/api/.env`
- `apps/dashboard/.env.local`
- `apps/superadmin/.env.local`

Variable catalog is in `docs/07-env-reference.md`.

## Run Modes

## Option A: Run all apps (recommended)

```bash
pnpm dev
```

This triggers `turbo run dev` across apps.

## Option B: Run each app separately

```bash
pnpm --filter api start:dev
pnpm --filter dashboard dev
pnpm --filter superadmin dev
```

Expected local URLs:
- Dashboard: `http://localhost:3000`
- API: `http://localhost:3001`
- Superadmin: `http://localhost:3002`
- Widget test page (served by API static assets): `http://localhost:3001/widget/test.html`

## Build and Validation Commands

Workspace-level:

```bash
pnpm build
pnpm lint
pnpm test
```

API-specific:

```bash
pnpm --filter api build
pnpm --filter api test
pnpm --filter api test:e2e
```

## Database Workflow (Prisma)

Inside `apps/api`:

```bash
pnpm prisma generate
pnpm prisma migrate dev
pnpm prisma db seed
```

Notes:
- Prisma schema is in `apps/api/prisma/schema.prisma`.
- Seed script entry exists in API package config (`prisma.seed`).

## Daily Engineering Workflow

1. Pull latest branch and install dependencies.
2. Start Postgres/Redis with Docker Compose.
3. Run API + dashboard + superadmin.
4. Verify auth flows and role-based pages.
5. Test knowledge upload + processing status.
6. Test chat from dashboard and/or widget.
7. Validate billing/trial workflows when touching those modules.
8. Run lint/tests before raising PR.

## Debugging Checklist

- If API fails at startup, check missing env keys first (Gemini, Pinecone, JWT, DB).
- If dashboard requests fail with 401, verify token cookies and refresh flow.
- If vector search returns weak answers, inspect chunking + embedding + source status.
- If widget issues occur, verify which flow is being exercised: legacy `/chat/*` vs session-token widget controller.

## Git and PR Hygiene for Interns

- Keep branches small and module-focused.
- Include API contract changes in documentation update.
- Add migration files when schema changes.
- Include at least one manual test checklist in PR description.
