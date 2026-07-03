import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { isClerkConfigured } from "@/lib/clerk";
import { getStripe } from "@/lib/stripe";
import { getClientForPortal } from "@/lib/usage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "https://firstring.lol").replace(
    /\/$/,
    "",
  );
}

export async function POST() {
  if (!isClerkConfigured()) {
    return NextResponse.json(
      {
        success: false,
        error: "Portal login is not configured yet. Add Clerk live keys first.",
      },
      { status: 503 },
    );
  }

  const user = await currentUser();

  if (!user) {
    return NextResponse.json(
      { success: false, error: "Please sign in first." },
      { status: 401 },
    );
  }

  const email = user.emailAddresses[0]?.emailAddress || null;
  const client = await getClientForPortal({
    clerkUserId: user.id,
    email,
  });

  if (!client || !client.stripeCustomerId) {
    return NextResponse.json(
      { success: false, error: "No billing account found." },
      { status: 404 },
    );
  }

  const session = await getStripe().billingPortal.sessions.create({
    customer: client.stripeCustomerId,
    return_url: `${siteUrl()}/portal`,
  });

  return NextResponse.json({ success: true, url: session.url });
}
