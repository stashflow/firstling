import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";

type CheckoutPayload = {
  businessName?: string;
  ownerName?: string;
  email?: string;
  phone?: string;
};

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
    const setupPriceId = process.env.STRIPE_FOUNDING_SETUP_PRICE_ID;
    const monthlyPriceId = process.env.STRIPE_FOUNDING_MONTHLY_PRICE_ID;
    const siteUrl = siteUrlFrom(request);

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      setupPriceId
        ? { price: setupPriceId, quantity: 1 }
        : {
            price_data: {
              currency: "usd",
              unit_amount: 3900,
              product_data: {
                name: "First Ring Founding Setup",
                description: "One-time setup for your First Ring caller.",
              },
            },
            quantity: 1,
          },
      monthlyPriceId
        ? { price: monthlyPriceId, quantity: 1 }
        : {
            price_data: {
              currency: "usd",
              unit_amount: 2900,
              recurring: { interval: "month" },
              product_data: {
                name: "First Ring Founding Plan",
                description: "Monthly missed-call answering and lead capture.",
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
        plan: "founding-exterior-cleaning",
      },
      subscription_data: {
        metadata: {
          businessName,
          ownerName,
          phone,
          plan: "founding-exterior-cleaning",
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
