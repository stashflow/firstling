import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";

type CheckoutPayload = {
  businessName?: string;
  ownerName?: string;
  email?: string;
  phone?: string;
  plan?: string;
};

const plans = {
  starter: {
    name: "First Ring Starter",
    amount: 2900,
    minutes: "50 AI minutes",
    extra: "$0.20-$0.25/min",
    envKey: "STRIPE_STARTER_PRICE_ID",
  },
  basic: {
    name: "First Ring Basic",
    amount: 4900,
    minutes: "100 AI minutes",
    extra: "$0.20/min",
    envKey: "STRIPE_BASIC_PRICE_ID",
  },
  growth: {
    name: "First Ring Growth",
    amount: 9900,
    minutes: "300 AI minutes",
    extra: "$0.18-$0.20/min",
    envKey: "STRIPE_GROWTH_PRICE_ID",
  },
} as const;

type PlanKey = keyof typeof plans;

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function siteUrlFrom(request: NextRequest) {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    new URL(request.url).origin
  );
}

function stripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY");
  }

  return new Stripe(secretKey);
}

export async function POST(request: NextRequest) {
  let payload: CheckoutPayload;

  try {
    payload = (await request.json()) as CheckoutPayload;
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid checkout request" },
      { status: 400 },
    );
  }

  const businessName = clean(payload.businessName);
  const ownerName = clean(payload.ownerName);
  const email = clean(payload.email);
  const phone = clean(payload.phone);
  const planKey = clean(payload.plan) as PlanKey;
  const selectedPlanKey: PlanKey = planKey in plans ? planKey : "starter";
  const plan = plans[selectedPlanKey];

  if (!businessName || !ownerName || !email) {
    return NextResponse.json(
      {
        success: false,
        error: "Business name, owner name, and email are required.",
      },
      { status: 400 },
    );
  }

  try {
    const stripe = stripeClient();
    const priceId = process.env[plan.envKey];
    const siteUrl = siteUrlFrom(request);

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      priceId
        ? { price: priceId, quantity: 1 }
        : {
            price_data: {
              currency: "usd",
              unit_amount: plan.amount,
              recurring: { interval: "month" },
              product_data: {
                name: plan.name,
                description: `${plan.minutes}. Extra minutes: ${plan.extra}.`,
              },
            },
            quantity: 1,
          },
    ];

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: email,
      phone_number_collection: { enabled: true },
      line_items: lineItems,
      metadata: {
        businessName,
        ownerName,
        phone,
        plan: selectedPlanKey,
      },
      subscription_data: {
        metadata: {
          businessName,
          ownerName,
          phone,
          plan: selectedPlanKey,
        },
      },
      success_url: `${siteUrl}/signup/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/signup/cancel`,
    });

    return NextResponse.json({ success: true, url: session.url });
  } catch (error) {
    console.error("Stripe checkout failed", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to start checkout.",
      },
      { status: 500 },
    );
  }
}
