# First Ring

First Ring is a premium missed-call receptionist SaaS for exterior cleaning
businesses. The app includes the sales site, demo call results, paid signup,
client portal, admin setup workflow, call usage tracking, email notifications,
and monthly overage billing.

## Local Development

```bash
npm install
npm run dev
```

## Required Setup

### Vercel

1. Connect this GitHub repo to Vercel.
2. Add the production domain `firstring.lol`.
3. Set `NEXT_PUBLIC_SITE_URL=https://firstring.lol`.
4. Keep `vercel.json` committed. It runs monthly overage billing on the first
   day of each month.
5. Set `CRON_SECRET` in production so only Vercel Cron can trigger billing.

### Neon

1. Add Neon Postgres through the Vercel Marketplace.
2. Confirm Vercel has one of these env vars: `DATABASE_URL`, `POSTGRES_URL`, or
   `POSTGRES_PRISMA_URL`.
3. Run both SQL files in Neon:

```text
database/demo_calls.sql
database/usage_tracking.sql
```

No seed or sample data is required.

### Stripe

1. Add Stripe through the Vercel Marketplace or set Stripe env vars manually.
2. Create three monthly subscription prices:
   - Starter: `$29/mo`
   - Basic: `$49/mo`
   - Growth: `$99/mo`
3. Set:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `STRIPE_STARTER_PRICE_ID`
   - `STRIPE_BASIC_PRICE_ID`
   - `STRIPE_GROWTH_PRICE_ID`
4. Add the webhook endpoint:

```text
https://firstring.lol/api/webhooks/stripe
```

5. Send these events:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
6. Enable Stripe Customer Portal for card updates, invoices, subscription
   management, and cancellation.

### Clerk

1. Add Clerk through the Vercel Marketplace.
2. Set:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/portal/login`
   - `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup`
3. In Clerk, enable the sign-in methods you want clients to use:
   - email magic link
   - password
   - phone login
   - passkeys

Clients sign in at:

```text
https://firstring.lol/portal
```

The app connects a portal login to the paid client by matching the checkout
email.

### Resend

1. Verify your sending domain.
2. Set:
   - `RESEND_API_KEY`
   - `RESEND_FROM_EMAIL`

Emails sent by the app:

- demo result summary
- setup started after checkout
- caller ready after admin marks a caller live
- new captured lead summaries

### Call Routing

Demo call webhook:

```text
https://firstring.lol/api/webhooks/demo-call
```

Leave `WEBHOOK_SECRET` empty for the demo webhook right now.

Real client call webhook:

```text
https://firstring.lol/api/webhooks/client-call
```

Set `CLIENT_CALL_WEBHOOK_SECRET` and send it as:

```text
x-webhook-secret: your-secret
```

For each paid client caller, put the client ID from `/admin/clients/[id]` into
the caller metadata as `clientId`. That is how usage and lead emails attach to
the right business.

## Main Flows

### Customer Flow

1. Customer reads the First Ring sales page.
2. Customer chooses a plan and completes `/signup`.
3. Stripe Checkout starts the subscription.
4. Stripe webhook creates the client in Neon.
5. The owner gets a setup-started email.
6. The owner can sign in to `/portal`.
7. You create the caller and save the number in `/admin/clients/[id]`.
8. When status is set to `Live`, the owner gets a caller-ready email.
9. New completed calls create leads, update usage, and email the owner.

### Admin Flow

Use:

```text
/admin/clients
/admin/usage
/admin/demo-calls
```

Protect admin pages in production with:

```text
ADMIN_BASIC_USER=
ADMIN_BASIC_PASSWORD=
```

## Billing Rules

Usage calculations:

```text
billable_minutes = Math.ceil(duration_seconds / 60)
estimated_cost = billable_minutes * 0.11
overage_minutes = max(0, total_minutes - included_minutes)
overage_revenue = overage_minutes * overage_rate
gross_profit = monthly_price + overage_revenue - estimated_cost - phone_number_monthly_cost - payment_fee_estimate
```

Monthly overages run on the first day of the month for the previous calendar
month. The billing route records every run in Neon and uses Stripe idempotency
keys to avoid duplicate invoice items.

## Verification Checklist

Before launch:

1. Run `npm run build`.
2. Run both SQL files in Neon.
3. Complete a Stripe test checkout for each plan.
4. Confirm `/admin/clients` shows the paid client.
5. Confirm `/portal` works with the checkout email.
6. Mark a client live and confirm the ready email sends.
7. Send a test client-call payload and confirm usage, recent leads, and owner
   lead email.
8. Trigger `/api/cron/monthly-overages` in test mode with `CRON_SECRET`.
9. Confirm customer-facing pages do not mention internal call providers.
