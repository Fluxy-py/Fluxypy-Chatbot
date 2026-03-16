# Fluxypy

Fluxypy is a pnpm + Turborepo monorepo for an AI chatbot SaaS platform.

It includes:
- A NestJS API for auth, organization management, knowledge ingestion, chat, billing, and superadmin operations.
- A Next.js dashboard for customer organizations.
- A Next.js superadmin panel for platform operations.
- A website-embeddable chat widget script.

## Monorepo Layout

- `apps/api` NestJS backend + Prisma + PostgreSQL integration
- `apps/dashboard` Customer-facing dashboard
- `apps/superadmin` Platform superadmin panel
- `widget` Static embeddable widget assets served by API
- `packages/types` Shared package placeholder (currently empty)
- `docs` Full technical and onboarding documentation

## Tech Stack

- Monorepo: Turborepo + pnpm workspaces
- Backend: NestJS 11, Prisma 5, PostgreSQL, JWT auth
- AI/RAG: Google Gemini + Pinecone
- Frontend: Next.js 16, React 19, Zustand, React Query, Axios
- Billing: Razorpay
- Infra (local): Docker Compose for Postgres + Redis

## Quick Start

### 1) Prerequisites

- Node.js 20+
- pnpm 9+
- Docker Desktop (for local Postgres/Redis)

### 2) Install dependencies

```bash
pnpm install
```

### 3) Start local infrastructure

```bash
docker compose up -d
```

### 4) Configure environment files

Create environment files for each app before running. See `docs/02-development-workflow.md` and `docs/07-env-reference.md`.

### 5) Run apps

Run all workspace apps:

```bash
pnpm dev
```

Or run individually:

```bash
pnpm --filter api start:dev
pnpm --filter dashboard dev
pnpm --filter superadmin dev
```

Default ports in this repo:
- API: `3001` (from `apps/api/src/main.ts`)
- Dashboard: `3000` (Next default)
- Superadmin: `3002` (script configured)

## Documentation Map

- `docs/01-architecture.md` System architecture and request flows
- `docs/02-development-workflow.md` Local setup, scripts, and daily workflow
- `docs/03-backend-codebase.md` Backend module-by-module breakdown
- `docs/04-api-reference.md` Endpoint-level API contract summary
- `docs/05-frontend-codebase.md` Dashboard and superadmin architecture
- `docs/06-data-model.md` Prisma entities and relationships
- `docs/07-env-reference.md` Environment variables by app
- `docs/08-intern-onboarding.md` Knowledge transfer plan for new interns

## Current-State Notes

- The codebase currently contains both legacy widget chat endpoints (`/chat/*` using `x-api-key`) and newer session-token widget endpoints under `WidgetSecurityController`.
- Existing widget embed snippets in dashboard pages point to `https://fluxypy-chat-api.onrender.com/widget/chatbot.js` and use the legacy chat flow.
- `WidgetSecurityController` currently uses `@Controller('api/v1/widget')` while a global prefix `api/v1` is also configured, so verify effective route paths in runtime before rollout.

These are documented intentionally so interns understand what is implemented versus what is actively wired.
