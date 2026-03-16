# 07 Environment Variable Reference

This document lists variables referenced directly in code.

## API (`apps/api/.env`)

## Core

- `PORT` default fallback: `3001`
- `DATABASE_URL` required by Prisma

## JWT/Auth

- `JWT_SECRET`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`

Important:
- Keep naming and usage consistent with JWT strategy and token generation paths.

## AI / Vector

- `GEMINI_API_KEY`
- `PINECONE_API_KEY`
- `PINECONE_INDEX`

## Billing (Razorpay)

- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_STARTER_PLAN_ID`
- `RAZORPAY_PRO_PLAN_ID`
- `RAZORPAY_BUSINESS_PLAN_ID`

## Email / Notification

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`
- `FRONTEND_URL`

## Dashboard (`apps/dashboard/.env.local`)

- `NEXT_PUBLIC_API_URL`
  - Example: `http://localhost:3001/api/v1`

## Superadmin (`apps/superadmin/.env.local`)

- `NEXT_PUBLIC_API_URL`
  - Example: `http://localhost:3001/api/v1`

## Suggested Local Baseline

Use this as a starting template only:

```env
# apps/api/.env
PORT=3001
DATABASE_URL=postgresql://fluxypy:fluxypy_secret@localhost:5432/fluxypy_dev
JWT_SECRET=change_me
JWT_ACCESS_SECRET=change_me
JWT_REFRESH_SECRET=change_me
GEMINI_API_KEY=change_me
PINECONE_API_KEY=change_me
PINECONE_INDEX=change_me
RAZORPAY_KEY_ID=change_me
RAZORPAY_KEY_SECRET=change_me
RAZORPAY_STARTER_PLAN_ID=change_me
RAZORPAY_PRO_PLAN_ID=change_me
RAZORPAY_BUSINESS_PLAN_ID=change_me
SMTP_HOST=smtp.zoho.in
SMTP_PORT=587
SMTP_USER=change_me
SMTP_PASS=change_me
SMTP_FROM=Fluxypy Bot <noreply@fluxypy.ai>
FRONTEND_URL=http://localhost:3000
```

```env
# apps/dashboard/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

```env
# apps/superadmin/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

## Secret Management Guidance

- Never commit real secrets.
- Rotate Razorpay/JWT/SMTP credentials when sharing environments.
- Use deployment platform secret stores for production.
