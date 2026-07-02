import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import {
  updateClientBillingByStripe,
  upsertClientFromSignup,
} from "@/lib/usage";

export const runtime = "nodejs";

function stripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY");
  }

  return new Stripe(secretKey);
}

function stripeId(value: unknown) {
  if (typeof value === "string") {
    return value;
  }

  if (value && typeof value === "object" && "id" in value) {
    const id = (value as { id?: unknown }).id;

    return typeof id === "string" ? id : null;
  }

  return null;
}

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return NextResponse.json(
      { success: false, error: "Missing STRIPE_WEBHOOK_SECRET" },
      { status: 500 },
    );
  }

  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { success: false, error: "Missing Stripe signature" },
      { status: 400 },
    );
  }

  try {
    const body = await request.text();
    const event = stripeClient().webhooks.constructEvent(
      body,
      signature,
      webhookSecret,
    );

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const businessName = session.metadata?.businessName;

        if (businessName) {
          await upsertClientFromSignup({
            businessName,
            ownerName: session.metadata?.ownerName,
            notificationEmail: session.customer_email,
            notificationPhone: session.metadata?.phone,
            websiteUrl: session.metadata?.websiteUrl,
            stripeCustomerId: stripeId(session.customer),
            stripeSubscriptionId: stripeId(session.subscription),
            plan: session.metadata?.plan,
            billingStatus: "active",
            callerPreferences: {
              industry: session.metadata?.industry,
              callerTone: session.metadata?.callerTone,
              serviceMentionStyle: session.metadata?.serviceMentionStyle,
              bookingPreference: session.metadata?.bookingPreference,
              handoffPreference: session.metadata?.handoffPreference,
              alertPreference: session.metadata?.alertPreference,
              websiteUsage: session.metadata?.websiteUsage,
              outcomeGoal: session.metadata?.outcomeGoal,
              extraNotes: session.metadata?.extraNotes,
            },
          });
        }

        console.info(`Stripe event received: ${event.type}`);
        break;
      }
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;

        await updateClientBillingByStripe({
          stripeCustomerId: stripeId(invoice.customer),
          stripeSubscriptionId: stripeId(
            (invoice as unknown as { subscription?: unknown }).subscription,
          ),
          billingStatus: "active",
        });
        console.info(`Stripe event received: ${event.type}`);
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;

        await updateClientBillingByStripe({
          stripeCustomerId: stripeId(invoice.customer),
          stripeSubscriptionId: stripeId(
            (invoice as unknown as { subscription?: unknown }).subscription,
          ),
          billingStatus: "past_due",
        });
        console.info(`Stripe event received: ${event.type}`);
        break;
      }
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const status =
          subscription.status === "active" || subscription.status === "trialing"
            ? "active"
            : subscription.status;

        await updateClientBillingByStripe({
          stripeCustomerId: stripeId(subscription.customer),
          stripeSubscriptionId: subscription.id,
          billingStatus: status,
        });
        console.info(`Stripe event received: ${event.type}`);
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        await updateClientBillingByStripe({
          stripeCustomerId: stripeId(subscription.customer),
          stripeSubscriptionId: subscription.id,
          billingStatus: "canceled",
        });
        console.info(`Stripe event received: ${event.type}`);
        break;
      }
      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook failed", error);

    return NextResponse.json(
      { success: false, error: "Invalid Stripe webhook" },
      { status: 400 },
    );
  }
}
