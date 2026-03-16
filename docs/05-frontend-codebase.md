# 05 Frontend Codebase Guide

## Applications

- `apps/dashboard` Organization dashboard
- `apps/superadmin` Platform admin panel

Both apps use Next.js App Router and client-heavy pages with Zustand + Axios.

## Dashboard (`apps/dashboard`)

## Route Structure

- `(auth)/login`
- `(auth)/register`
- `(dashboard)/dashboard`
- `(dashboard)/dashboard/knowledge`
- `(dashboard)/dashboard/chat`
- `(dashboard)/dashboard/billing`
- `(dashboard)/dashboard/widget`
- `(dashboard)/dashboard/settings`
- `(dashboard)/dashboard/analytics`

## State and API Layer

- Auth store: `store/auth.store.ts`
  - Holds user, organization, token, loading/auth flags
  - Clears auth cookies on logout

- Theme store: `store/theme.store.ts`
  - Drives light/dark tokenized UI styles

- API client: `lib/api.ts`
  - Base URL from `NEXT_PUBLIC_API_URL`
  - Request interceptor adds `Authorization: Bearer <accessToken>`
  - Response interceptor attempts token refresh on 401

## Providers and Utilities

- `app/providers.tsx` initializes React Query + Sonner toaster
- `components` folders are organized by domain:
  - `chat`
  - `knowledge`
  - `settings`
  - `layout`
  - `ui`

## Widget Management in Dashboard

Widget page allows:
- Branding configuration (`botName`, `welcomeMessage`, `primaryColor`, `showBranding`)
- Domain whitelist management via `DomainSettings`
- Copy embed script to clipboard

Current embed script points to hosted widget JS URL and includes `data-api-key`.

## Superadmin (`apps/superadmin`)

## Route Structure

- `(auth)/login`
- `(admin)/dashboard`
- `(admin)/organizations`
- `(admin)/organizations/[id]`
- `(admin)/trial-requests`

## State and API

- Auth store: `store/auth.store.ts`
  - Uses separate superadmin cookie keys (`sa_*`)

- API client: `lib/api.ts`
  - Adds `sa_accessToken` bearer token
  - Redirects to login on 401

## Operational Responsibilities

- View platform metrics
- Search and inspect organizations
- Suspend/activate/delete organizations
- Approve or reject trial requests

## Frontend Development Workflow

1. Confirm API base URL in `.env.local`.
2. Login with appropriate role (org admin vs superadmin).
3. Validate cookie issuance and interceptor behavior.
4. Exercise feature flows with Network tab open.
5. Match frontend payload names with backend controller expectations.

## Common Integration Pitfalls

- Mismatched payload key names (`orgName` vs `companyName`) can break registration flow.
- Refresh token flow depends on backend token secret consistency.
- Widget docs may reflect secure flow while actual script integration still uses legacy chat endpoints.
