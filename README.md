# First Ring

Premium Next.js landing page and demo-call result system for First Ring.

## Local Development

```bash
npm install
npm run dev
```

## Vercel + Neon Setup

1. Create/link the Vercel project.
2. Add Neon through the Vercel Marketplace.
3. Pull or set the injected database env var. The app accepts `DATABASE_URL`, `POSTGRES_URL`, or `POSTGRES_PRISMA_URL`.
4. Run `database/demo_calls.sql` against the Neon database.
5. Set the remaining env vars from `.env.example`.

## Demo Call Webhook

`POST /api/webhooks/demo-call`

If `WEBHOOK_SECRET` is set, include either:

```text
x-webhook-secret: your-secret
```

or:

```text
authorization: Bearer your-secret
```

The webhook saves the call, creates `/demo-result/[slug]`, sends email through Resend when configured, and skips SMS safely unless the optional SMS relay env vars are present.

## Admin

`/admin/demo-calls` lists saved demo calls.

`/admin/demo-calls/[id]` shows full details, including raw payload. Set `ADMIN_BASIC_USER` and `ADMIN_BASIC_PASSWORD` in production to protect admin pages.
