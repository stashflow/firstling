import { NextRequest, NextResponse } from "next/server";
import { insertUsageCall, normalizeUsageCallPayload } from "@/lib/usage";

export const runtime = "nodejs";

function isAuthorized(request: NextRequest) {
  const secret = process.env.CLIENT_CALL_WEBHOOK_SECRET || process.env.WEBHOOK_SECRET;

  if (!secret) {
    return true;
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
    const call = await insertUsageCall(input);

    return NextResponse.json({
      success: true,
      callId: call.id,
      clientId: call.client.id,
      billableMinutes: call.billableMinutes,
      estimatedCost: call.estimatedCost,
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
