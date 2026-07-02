import { NextRequest, NextResponse } from "next/server";
import { insertUsageCall, normalizeUsageCallPayload } from "@/lib/usage";
import { sendClientLeadEmail } from "@/lib/notifications";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthorized(request: NextRequest) {
  const secret = process.env.CLIENT_CALL_WEBHOOK_SECRET || process.env.WEBHOOK_SECRET;

  if (!secret) {
    return process.env.NODE_ENV !== "production";
  }

  const headerSecret = request.headers.get("x-webhook-secret");
  const authorization = request.headers.get("authorization");

  return headerSecret === secret || authorization === `Bearer ${secret}`;
}

function isCompletedCall(payload: unknown) {
  const source =
    payload && typeof payload === "object" && !Array.isArray(payload)
      ? (payload as Record<string, unknown>)
      : {};
  const event = String(source.event || source.event_type || source.type || "")
    .toLowerCase()
    .trim();
  const status = String(
    source.call_status || source.callStatus || source.status || "",
  )
    .toLowerCase()
    .trim();

  if (!event && !status) {
    return true;
  }

  return (
    event.includes("completed") ||
    event.includes("ended") ||
    event.includes("analyzed") ||
    event.includes("post_call") ||
    status.includes("completed") ||
    status.includes("ended") ||
    status.includes("done")
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

  if (!isCompletedCall(payload)) {
    return NextResponse.json({ success: true, skipped: "Call not completed" });
  }

  try {
    const input = normalizeUsageCallPayload(payload);
    const saved = await insertUsageCall(input);

    try {
      await sendClientLeadEmail(saved.client, saved.call);
    } catch (error) {
      console.error("Client lead email failed", error);
    }

    return NextResponse.json({
      success: true,
      callId: saved.id,
      clientId: saved.client.id,
      billableMinutes: saved.billableMinutes,
      estimatedCost: saved.estimatedCost,
    });
  } catch (error) {
    console.error("Client call usage webhook failed", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to save call usage",
      },
      { status: 500 },
    );
  }
}
