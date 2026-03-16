# 01 Architecture

## System Overview

Fluxypy is a multi-tenant chatbot platform.

High-level responsibilities:
- `apps/dashboard` lets an organization configure bot settings, upload knowledge, monitor usage, and get widget embed code.
- `apps/superadmin` lets platform operators manage organizations and trial approvals.
- `apps/api` handles all business logic, storage, auth, AI orchestration, and billing.
- `widget/chatbot.js` is served as a static script for customer websites.

## Runtime Components

### Backend (`apps/api`)

Core runtime path:
1. Request enters Nest app (`main.ts`) with global prefix `api/v1`.
2. Guards/decorators decide public vs JWT-protected access.
3. Controllers delegate to module services.
4. Services use Prisma for DB access and external integrations (Gemini, Pinecone, Razorpay, SMTP).
5. Responses are returned as JSON.

Static assets:
- API serves folder `widget` at `/widget` URL prefix.

### Dashboard (`apps/dashboard`)

Client-side app with:
- Auth state in Zustand.
- API calls via Axios with token interceptor.
- React Query provider for server-state caching.

### Superadmin (`apps/superadmin`)

Separate Next.js app on port `3002` with:
- Dedicated auth cookies (`sa_accessToken`, `sa_refreshToken`).
- Admin-only endpoint consumption (`/admin/*`).

## Request Flows

## A) Organization User Auth Flow

1. `POST /api/v1/auth/register` creates org + admin user + OTP.
2. OTP sent using SMTP service.
3. `POST /api/v1/auth/verify-otp` verifies account and issues tokens.
4. Dashboard stores access/refresh tokens in cookies.
5. Authenticated dashboard calls send Bearer token.

## B) Knowledge Ingestion Flow (RAG index build)

1. User uploads file or text from dashboard.
2. Backend creates `KnowledgeSource` with status `PROCESSING`.
3. Async pipeline parses content, chunks text, generates embeddings, and upserts vectors to Pinecone namespace `org_<orgId>`.
4. Source marked `READY` with chunk/token counts.
5. Failed processing marks source `FAILED` with error message.

## C) Chat Retrieval Flow

1. Chat request includes message + session id (or backend generates one).
2. Conversation is looked up/created in DB.
3. User message saved in `Message` table.
4. User message embedded via Gemini embedding model.
5. Similar chunks retrieved from Pinecone org namespace.
6. Prompt composed from org settings + retrieved context + recent history.
7. Gemini generates answer.
8. Assistant message persisted with token estimate and source metadata.

## D) Billing + Trial Flow

1. Org checks plans/subscription status via `/billing/*`.
2. Trial requests pass anti-abuse checks (IP/domain/history).
3. Superadmin approves/rejects trial requests via `/admin/trial-requests/*`.
4. Paid activation uses Razorpay order/subscription verification.

## E) Widget Flow (Current and Target)

Legacy active flow in code wiring:
- `GET /api/v1/chat/config?apiKey=...`
- `POST /api/v1/chat/message` with `x-api-key`

New secured flow implemented in code:
- Widget init with API key, receive short-lived session token, then chat with `x-session-token`.
- Verify exact effective routes in runtime because controller path currently includes `api/v1` explicitly while global prefix is also configured.

## Multi-Tenancy Boundaries

Tenant isolation mechanisms:
- All primary data is keyed by `orgId` in DB relations.
- Vector index operations are namespace-scoped as `org_<orgId>`.
- Dashboard auth token carries `orgId` claim.
- Organization settings are stored as JSON per tenant.

## Security Controls in Place

- JWT auth guards for protected endpoints.
- Role guard for superadmin endpoints (`SUPER_ADMIN`).
- ValidationPipe with whitelist and forbid-non-whitelisted enabled globally.
- CORS enabled with broad origin allowance (domain controls handled in widget security service).
- File upload type/size validation in knowledge upload controller.
- OTP verification and attempt limits.

## Architectural Risks / Caveats

- Widget stack currently has parallel legacy and secure flows; intern work should avoid assuming one canonical path without runtime verification.
- Session tokens in widget security service are in-memory; not horizontally scalable unless moved to shared cache (Redis).
- Existing docs mention secured widget rollout, but dashboard embed currently points to legacy endpoint behavior in root widget script.
