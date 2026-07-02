import { NextRequest, NextResponse } from "next/server";
import {
  createResultSlug,
  insertDemoCall,
  normalizeDemoCallPayload,
  updateDemoCallDelivery,
} from "@/lib/demo-calls";
import {
  sendDemoSummaryEmail,
  sendDemoSummarySms,
} from "@/lib/notifications";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthorized(request: NextRequest) {
  const secret = process.env.WEBHOOK_SECRET;

  if (!secret) {
    return true;
  }

  const headerSecret = request.headers.get("x-webhook-secret");
  const authorization = request.headers.get("authorization");

  return (
    headerSecret === secret ||
    authorization === `Bearer ${secret}`
  );
}

function siteUrlFrom(request: NextRequest) {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    new URL(request.url).origin
  );
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { success: false, error: "Unauthorized webhook" },
      { status: 401 },
    );
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON payload" },
      { status: 400 },
    );
  }

  try {
    const input = normalizeDemoCallPayload(payload);
    const slug = createResultSlug(input);
    const resultUrl = `${siteUrlFrom(request)}/demo-result/${slug}`;
    let call = await insertDemoCall(input, slug, resultUrl);

    const [emailSent, smsSent] = await Promise.all([
      sendDemoSummaryEmail(call).catch((error) => {
        console.error("Demo summary email failed", error);
        return false;
      }),
      sendDemoSummarySms(call).catch((error) => {
        console.error("Demo summary SMS failed", error);
        return false;
      }),
    ]);

    if (emailSent || smsSent) {
      await updateDemoCallDelivery(call.id, { emailSent, smsSent });
      call = { ...call, emailSent, smsSent };
    }

    return NextResponse.json({
      success: true,
      resultUrl,
      slug,
      emailSent: call.emailSent,
      smsSent: call.smsSent,
    });
  } catch (error) {
    console.error("Demo call webhook failed", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to save demo call",
      },
      { status: 500 },
    );
  }
}
