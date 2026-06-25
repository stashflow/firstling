import { Resend } from "resend";
import type { DemoCall } from "@/lib/demo-calls";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendDemoSummaryEmail(call: DemoCall) {
  if (!process.env.RESEND_API_KEY || !call.callerEmail || !call.resultUrl) {
    return false;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const resultUrl = call.resultUrl;

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "First Ring <demo@firstring.ai>",
    to: call.callerEmail,
    subject: "Your First Ring demo summary",
    html: `
      <div style="margin:0;background:#f4f5f4;padding:32px;font-family:Inter,Arial,sans-serif;color:#101211">
        <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:28px;padding:28px;border:1px solid rgba(16,18,17,.08);box-shadow:0 18px 45px rgba(15,23,42,.08)">
          <div style="display:inline-block;background:#34C759;color:#fff;border-radius:18px;padding:10px 14px;font-weight:900">First Ring</div>
          <h1 style="font-size:30px;line-height:1;margin:24px 0 10px">First Ring captured your demo lead.</h1>
          <p style="margin:0 0 20px;color:rgba(16,18,17,.58);font-weight:700">This is the lead summary your business would receive.</p>
          <div style="background:#f4f5f4;border-radius:20px;padding:16px;margin-bottom:18px">
            <p><strong>Service:</strong> ${escapeHtml(call.serviceRequested)}</p>
            <p><strong>Location:</strong> ${escapeHtml(call.location)}</p>
            <p><strong>Timeline:</strong> ${escapeHtml(call.timeline)}</p>
            <p><strong>Summary:</strong> ${escapeHtml(call.summary)}</p>
          </div>
          <a href="${escapeHtml(resultUrl)}" style="display:inline-block;background:#34C759;color:#fff;text-decoration:none;border-radius:999px;padding:14px 20px;font-weight:900">View Demo Result</a>
        </div>
      </div>
    `,
  });

  return true;
}

export async function sendDemoSummarySms(call: DemoCall) {
  const providerUrl = process.env.SMS_PROVIDER_URL;
  const apiKey = process.env.SMS_PROVIDER_API_KEY;
  const from = process.env.SMS_FROM_NUMBER;

  if (!providerUrl || !apiKey || !from || !call.callerPhone || !call.resultUrl) {
    return false;
  }

  await fetch(providerUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from,
      to: call.callerPhone,
      body: `First Ring captured your demo lead. View your result: ${call.resultUrl}`,
    }),
  });

  return true;
}
