# 08 Intern Onboarding Playbook

## Goal

Bring a new intern from zero context to productive contribution in 3 to 5 days.

## Day 0: Access and Setup

1. Clone repository and run `pnpm install`.
2. Start local infra with `docker compose up -d`.
3. Create env files using `docs/07-env-reference.md`.
4. Start all apps and verify routes:
   - Dashboard: `http://localhost:3000`
   - API: `http://localhost:3001`
   - Superadmin: `http://localhost:3002`

Success criteria:
- All apps boot without crashes.
- Dashboard login page loads.
- API health root responds.

## Day 1: Product and Architecture Walkthrough

Read in this order:
1. `README.md`
2. `docs/01-architecture.md`
3. `docs/03-backend-codebase.md`
4. `docs/05-frontend-codebase.md`
5. `docs/06-data-model.md`

Hands-on task:
- Trace one full request from dashboard page action to controller to service to DB update.

## Day 2: Core Flow Familiarization

Practice these flows:
1. Register org admin + OTP verify.
2. Upload a small text document in knowledge module.
3. Poll processing status until READY.
4. Send chat message and inspect stored messages/sources.
5. Open superadmin and inspect organization records.

Success criteria:
- Intern can explain data written in each table for these flows.

## Day 3: First Safe Contribution

Recommended starter tasks:
- Improve input validation in one endpoint.
- Add one dashboard UI empty-state improvement.
- Add logging or error message clarity in knowledge/chat flow.
- Write/update docs for any behavior found unclear.

PR checklist:
- Changes are scoped to one module.
- Lint/build pass.
- Manual test notes included.
- Documentation updated if behavior changed.

## Day 4-5: Deeper Ownership

Pick one area to own:
- Auth and session lifecycle
- Knowledge ingestion and retrieval quality
- Billing and trial moderation
- Widget embedding and security rollout
- Admin operations and reporting

Deliverable:
- One short internal demo explaining architecture, known gaps, and next improvements.

## Required Knowledge for Handover Readiness

An intern should be able to explain:
- How tenant isolation is enforced.
- How embeddings are generated and searched.
- Why there are two widget flows and what is currently wired.
- Which endpoints are public vs JWT-protected.
- How trial approval impacts organization billing status.

## Known Gaps to Keep in Mind

- Widget implementation has both legacy and newer secure tracks in code.
- Session-token widget path route prefix must be runtime-verified.
- Shared package `packages/types` is empty and can be a future consolidation area.

## Suggested Next Improvements for Intern Projects

1. Unify widget architecture into one canonical secure flow.
2. Move widget session tokens from memory to Redis.
3. Add OpenAPI/Swagger generation for endpoint discoverability.
4. Add automated integration tests for auth, knowledge, and billing flows.
5. Populate `packages/types` with shared request/response interfaces.
