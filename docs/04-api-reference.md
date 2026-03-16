# 04 API Reference (Current Code)

Base URL locally: `http://localhost:3001/api/v1`

## Auth

- `POST /auth/register`
  - Body: `{ orgName, email, password }`
  - Behavior: creates org and admin user, sends OTP email

- `POST /auth/verify-otp`
  - Body: `{ email, otp }`
  - Behavior: verifies account and returns access/refresh tokens

- `POST /auth/resend-otp`
  - Body: `{ email }`

- `POST /auth/login`
  - Body: `{ email, password }`

- `POST /auth/refresh`
  - Body: `{ refreshToken }`

- `POST /auth/logout` (JWT)

- `GET /auth/me` (JWT)

## Organization

- `PATCH /org/settings` (JWT)
  - Body supports keys such as:
    - `primaryColor`
    - `botName`
    - `welcomeMessage`
    - `position`
    - `showBranding`
    - `allowedDomains` (string array)

## Knowledge (JWT)

- `GET /knowledge`
- `GET /knowledge/:id/status`
- `POST /knowledge/upload`
  - Multipart key: `file`
  - Optional field: `name`
- `POST /knowledge/text`
  - Body: `{ name, type, textContent }`
- `DELETE /knowledge/:id`

## Chat (Public, legacy flow)

- `GET /chat/config?apiKey=fpy_pub_...`
- `POST /chat/message`
  - Header: `x-api-key`
  - Body: `{ message, sessionId? }`

## Billing (JWT)

- `GET /billing/plans`
- `GET /billing/subscription`
- `POST /billing/trial/verify-order`
- `POST /billing/trial/submit`
- `GET /billing/trial/status`
- `POST /billing/subscription-order`
  - Body: `{ planName }`
- `POST /billing/one-time-order`
  - Body: `{ planName }`
- `POST /billing/verify`
- `POST /billing/cancel`

## Admin (JWT + SUPER_ADMIN)

- `GET /admin/stats`
- `GET /admin/organizations?page=&search=`
- `GET /admin/organizations/:id`
- `POST /admin/organizations/:id/suspend`
- `POST /admin/organizations/:id/activate`
- `DELETE /admin/organizations/:id`
- `GET /admin/trial-requests?page=`
- `POST /admin/trial-requests/:id/approve`
- `POST /admin/trial-requests/:id/reject`
  - Body: `{ reason }`

## Widget Security Endpoints (Implemented)

Controller is currently declared as `@Controller('api/v1/widget')` while global prefix is `api/v1`.

Because of this, verify runtime route resolution in your environment. Depending on Nest prefix behavior and deployment wiring, effective paths may appear as:
- `/api/v1/widget/*` (intended in implementation docs), or
- `/api/v1/api/v1/widget/*` (if both prefixes are applied literally)

Implemented handlers:
- `POST .../init`
  - Body: `{ apiKey }`
  - Uses `Origin` or `Referer` for domain validation
- `POST .../message`
  - Header: `x-session-token`
  - Body: `{ message, sessionId? }`
- `POST .../health`

## Error Behavior Summary

Common errors returned as HTTP exceptions:
- `400` validation/body errors
- `401` missing/invalid auth credentials
- `403` forbidden access, domain mismatch, plan/limit restrictions
- `404` missing resources

## Notes for Interns

- Prefer documenting and integrating against the endpoint behavior in code, not historical markdown alone.
- If you modify endpoint contracts, update this document in the same PR.
