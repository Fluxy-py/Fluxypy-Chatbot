# 06 Data Model (Prisma)

Schema file: `apps/api/prisma/schema.prisma`

## Core Entities

## SubscriptionPlan

Purpose:
- Catalog of available plans and limits

Key fields:
- `name` (unique)
- `priceMonthly`, `priceYearly`
- `limits` (JSON)
- `isActive`

Relations:
- One plan can be linked to many organizations

## Organization

Purpose:
- Tenant boundary for all customer data

Key fields:
- `name`, `slug`, `apiKey`
- `status` (`ACTIVE`, `SUSPENDED`, `DELETED`)
- `settings` JSON
- Billing fields (subscription/trial/period/payment metadata)

Relations:
- `users`
- `knowledgeSources`
- `conversations`
- `usageRecords`
- `analyticsDaily`
- `trialRequests`

## User

Purpose:
- Dashboard and superadmin accounts

Key fields:
- `email` (unique)
- `passwordHash`
- `role` (`SUPER_ADMIN`, `ADMIN`, `MEMBER`, `VIEWER`)
- OTP verification and attempt fields
- Refresh token and last login metadata

## KnowledgeSource

Purpose:
- Tracks uploaded/ingested knowledge corpus metadata

Key fields:
- `type` (`PDF`, `DOCX`, `URL`, `TEXT`, `FAQ`)
- `status` (`PENDING`, `PROCESSING`, `READY`, `FAILED`)
- `chunkCount`, `tokenCount`
- `filePath`, `sourceUrl`, `metadata`, `errorMsg`

## Conversation

Purpose:
- Session grouping for user-assistant exchanges

Key fields:
- `sessionId`
- `visitorIp`
- `startedAt`, `endedAt`

## Message

Purpose:
- Stores each user/assistant utterance

Key fields:
- `role` (`USER`, `ASSISTANT`)
- `content`
- `tokensUsed`
- `sources` JSON (retrieval attribution)

## UsageRecord

Purpose:
- Plan usage counters for rate limiting and reporting

Key fields:
- Daily counters (`apiCallsToday`, `visitorsToday`, `conversationsToday`)
- Month counters (currently represented but daily sums are also aggregated at query time)

Unique key:
- `(orgId, date)`

## AnalyticsDaily

Purpose:
- Pre-aggregated daily analytics snapshots

Key fields:
- `conversations`, `messages`, `uniqueUsers`, `leadsCaptured`
- `avgResponseTime`
- `popularQuestions` JSON

Unique key:
- `(orgId, date)`

## TrialRequest

Purpose:
- Manual trial approval workflow tracking

Key fields:
- Security context (`ipAddress`, `emailDomain`, optional card/payment identifiers)
- `status` (`pending`, `approved`, `rejected`)
- Admin review metadata (`reviewedBy`, `reviewedAt`, `rejectReason`)

## Relationship Summary

- Organization is parent tenant entity.
- Most domain entities carry `orgId` and cascade delete with org deletion.
- Chat messages are nested through conversation and also carry `orgId` for direct indexing/filtering.
- Billing and trial metadata is attached to organization and trial request records.

## Migration and Seed Notes

- Prisma migrations are stored under `apps/api/prisma/migrations`.
- Seed entry exists in API package and points to `prisma/seed.js`.
- Always run migrations before testing flows relying on schema changes.
