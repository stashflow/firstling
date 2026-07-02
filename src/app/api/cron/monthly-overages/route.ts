import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import {
  listOverageBillingCandidates,
  previousMonthStart,
  recordOverageBillingRun,
  refreshMonthlyUsageForAllClients,
} from "@/lib/usage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    return process.env.NODE_ENV !== "production";
  }

  return request.headers.get("authorization") === `Bearer ${secret}`;
}

function monthLabel(month: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(month);
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { success: false, error: "Unauthorized cron request" },
      { status: 401 },
    );
  }

  const month = previousMonthStart();
  await refreshMonthlyUsageForAllClients(month);

  const stripe = getStripe();
  const candidates = await listOverageBillingCandidates(month);
  const results: Array<{
    clientId: string;
    businessName: string;
    status: string;
    amount: number;
  }> = [];

  for (const client of candidates) {
    const amount = Number(client.overageRevenue.toFixed(2));
    const amountInCents = Math.round(amount * 100);

    if (!client.stripeCustomerId || amountInCents <= 0) {
      await recordOverageBillingRun({
        clientId: client.id,
        month,
        overageMinutes: client.overageMinutes,
        overageRate: client.overageRate,
        amount,
        status: "skipped",
        errorMessage: "No billable amount or Stripe customer.",
      });
      results.push({
        clientId: client.id,
        businessName: client.businessName,
        status: "skipped",
        amount,
      });
      continue;
    }

    try {
      const idempotencyBase = `overage-${client.id}-${month.toISOString().slice(0, 10)}`;
      const invoiceItem = await stripe.invoiceItems.create(
        {
          customer: client.stripeCustomerId,
          amount: amountInCents,
          currency: "usd",
          description: `First Ring extra minutes - ${monthLabel(month)} (${client.overageMinutes} min)`,
        },
        { idempotencyKey: `${idempotencyBase}-item` },
      );
      const invoice = await stripe.invoices.create(
        {
          customer: client.stripeCustomerId,
          auto_advance: true,
          collection_method: "charge_automatically",
          description: `First Ring extra minutes - ${monthLabel(month)}`,
          metadata: {
            clientId: client.id,
            month: month.toISOString().slice(0, 10),
            overageMinutes: String(client.overageMinutes),
          },
        },
        { idempotencyKey: `${idempotencyBase}-invoice` },
      );

      await recordOverageBillingRun({
        clientId: client.id,
        month,
        overageMinutes: client.overageMinutes,
        overageRate: client.overageRate,
        amount,
        stripeInvoiceItemId: invoiceItem.id,
        stripeInvoiceId: invoice.id,
        status: "invoiced",
      });
      results.push({
        clientId: client.id,
        businessName: client.businessName,
        status: "invoiced",
        amount,
      });
    } catch (error) {
      await recordOverageBillingRun({
        clientId: client.id,
        month,
        overageMinutes: client.overageMinutes,
        overageRate: client.overageRate,
        amount,
        status: "failed",
        errorMessage:
          error instanceof Error ? error.message : "Unable to bill overage.",
      });
      results.push({
        clientId: client.id,
        businessName: client.businessName,
        status: "failed",
        amount,
      });
    }
  }

  return NextResponse.json({
    success: true,
    month: month.toISOString().slice(0, 10),
    checked: candidates.length,
    results,
  });
}

export async function GET(request: NextRequest) {
  return POST(request);
}
