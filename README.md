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

Use this live webhook URL for demo calls:

```text
https://firstring.lol/api/webhooks/demo-call
```

Do not set a webhook secret for the demo call webhook right now. Leave
`WEBHOOK_SECRET` empty in Vercel unless you later decide to send a matching
secret header.

Local route:

```text
POST /api/webhooks/demo-call
```

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

## Paid Client Setup

After a customer pays through `/signup`, Stripe sends a webhook to:

```text
https://firstring.lol/api/webhooks/stripe
```

That creates or updates the client in Neon. Billing status is kept in sync from
Stripe events:

- `active`
- `past_due`
- `canceled`
- other subscription states sent by Stripe

Use these admin pages:

```text
/admin/clients
/admin/usage
```

In `/admin/clients`, open a client, copy their `clientId`, and put it in the
client caller metadata. After you build the caller, save the caller phone number
and status there.

For real client calls, use:

```text
https://firstring.lol/api/webhooks/client-call
```

Set `CLIENT_CALL_WEBHOOK_SECRET` in Vercel and send it as:

```text
x-webhook-secret: your-secret
```

The demo webhook can stay no-secret. Real client call webhooks should use a
secret.

# firstling
