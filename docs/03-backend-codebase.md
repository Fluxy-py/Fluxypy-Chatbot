# 03 Backend Codebase Guide

Backend root: `apps/api`

## Bootstrapping and Global Config

- Entry point: `src/main.ts`
- Root module: `src/app.module.ts`

Global behavior:
- Prefix: `api/v1`
- ValidationPipe: whitelist, transform, and reject unknown fields
- CORS: enabled for all origins, with custom headers including API/session tokens
- Static widget assets served from repo `widget` folder under `/widget`

## Module Inventory

- `auth` registration, OTP, login, token refresh, user profile
- `organizations` tenant settings updates
- `knowledge` file/text ingestion, parsing, embedding, vector storage
- `chat` retrieval-augmented response generation
- `billing` plans, subscription orders, payment verification, trial requests
- `admin` superadmin organization operations + trial moderation
- `widget` session-token security path for embeddable widget

## Common Services

Located in `src/common/services`:

- `gemini.service.ts`
  - Embedding model: `gemini-embedding-001`
  - Chat model: `gemini-2.5-flash-lite`
  - Methods: `embedText`, `embedBatch`, `generateResponse`

- `pinecone.service.ts`
  - Namespace strategy: `org_<orgId>`
  - Methods: `upsertVectors`, `search`, `deleteBySource`, `deleteOrgNamespace`

- `chunker.service.ts`
  - Splits parsed text into model-friendly chunks with token estimates

- `file-parser.service.ts`
  - Extracts raw text from upload formats

- `email.service.ts`
  - SMTP-backed transactional messages (OTP, trial notifications, payment events)

- `rate-limit.service.ts`
  - Enforces per-plan daily/monthly API/conversation/visitor limits
  - Tracks usage in `UsageRecord`

## Auth Module Details

Primary contract:
- Register creates Organization + User + OTP
- Verify OTP transitions user to verified state and issues JWT tokens
- Login re-sends OTP if account is unverified
- Refresh endpoint issues new tokens
- Guarded `me` endpoint returns user + org details

Important implementation detail:
- Access and refresh secret names should be validated carefully because token signing and verification keys must match expected strategy config.

## Knowledge Module Details

User operations:
- List sources
- Upload file (`PDF`, `DOCX`, `TXT`, `DOC`, up to 10MB)
- Add plain text source
- Poll source status
- Delete source

Processing pipeline:
1. Create source record (`PROCESSING`).
2. Parse text from file or direct text payload.
3. Chunk text.
4. Batch-embed chunks.
5. Upsert vectors with metadata into Pinecone namespace.
6. Mark source `READY` (or `FAILED` on exceptions).

Data cleanup:
- On delete, vectors are removed by `sourceId` filter and uploaded file is deleted from disk if present.

## Chat Module Details

Public routes are currently available under `/chat`.

Flow in `ChatService.chat`:
1. Resolve/create conversation by `sessionId` + `orgId`.
2. Save user message.
3. Load org settings and recent message history.
4. Embed user query.
5. Retrieve relevant vector matches from Pinecone.
6. Compose context with source snippets.
7. Generate constrained response with Gemini prompt rules.
8. Save assistant message and return response metadata.

Response payload includes:
- `sessionId`
- `message`
- top source references
- `responseTime`

## Billing Module Details

Billing uses Razorpay and supports:
- Plan listing
- Subscription status and trial expiration checks
- Trial request submission flow with anti-abuse checks
- Subscription order creation
- One-time order creation
- Signature verification and plan activation
- Cancellation requests

Trial security checks include:
- Existing active/trial org status
- Existing pending/approved request
- Network/IP reuse detection
- Email domain reuse controls (excluding common public domains)

## Admin Module Details

Protected with JWT + role guard (`SUPER_ADMIN`).

Capabilities:
- Platform stats
- Organization search/list/detail
- Suspend, activate, delete organizations
- Trial request pagination
- Approve/reject trial requests and trigger notification emails

## Widget Security Module Details

Implements a stronger session-token flow with domain checks.

Core behavior:
- Init endpoint validates API key + request domain and returns 2-hour session token.
- Message endpoint requires `x-session-token`, validates domain lock + expiry, then delegates to chat service.
- Health endpoint exposes active in-memory session count.

Operational caveat:
- Session tokens live in memory Map and are cleaned periodically, so they do not survive process restart and do not scale across multiple API instances without shared state.
