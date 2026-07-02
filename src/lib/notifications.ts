import { Resend } from "resend";
import type { DemoCall } from "@/lib/demo-calls";
import type { Client, UsageCall } from "@/lib/usage";

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

function resendClient() {
  if (!process.env.RESEND_API_KEY) {
    return null;
  }

  return new Resend(process.env.RESEND_API_KEY);
}

function fromEmail() {
  return process.env.RESEND_FROM_EMAIL || "First Ring <hello@firstring.lol>";
}

function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "https://firstring.lol").replace(
    /\/$/,
    "",
  );
}

function emailShell({
  eyebrow,
  title,
  body,
  cta,
  ctaUrl,
  details,
}: {
  eyebrow: string;
  title: string;
  body: string;
  cta?: string;
  ctaUrl?: string;
  details?: string;
}) {
  return `
    <div style="margin:0;background:#f4f5f4;padding:32px;font-family:Inter,Arial,sans-serif;color:#101211">
      <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:28px;padding:28px;border:1px solid rgba(16,18,17,.08);box-shadow:0 18px 45px rgba(15,23,42,.08)">
        <div style="display:inline-block;background:#34C759;color:#fff;border-radius:18px;padding:10px 14px;font-weight:900">First Ring</div>
        <p style="margin:24px 0 0;color:#34C759;font-size:12px;letter-spacing:.06em;text-transform:uppercase;font-weight:900">${escapeHtml(eyebrow)}</p>
        <h1 style="font-size:32px;line-height:1;margin:10px 0 12px">${escapeHtml(title)}</h1>
        <p style="margin:0 0 20px;color:rgba(16,18,17,.62);font-weight:700;line-height:1.55">${escapeHtml(body)}</p>
        ${
          details
            ? `<div style="background:#f4f5f4;border-radius:20px;padding:16px;margin-bottom:20px;font-weight:700;line-height:1.6">${details}</div>`
            : ""
        }
        ${
          cta && ctaUrl
            ? `<a href="${escapeHtml(ctaUrl)}" style="display:inline-block;background:#34C759;color:#fff;text-decoration:none;border-radius:999px;padding:14px 20px;font-weight:900">${escapeHtml(cta)}</a>`
            : ""
        }
      </div>
    </div>
  `;
}

export async function sendClientSetupStartedEmail(client: Client) {
  const resend = resendClient();

  if (!resend || !client.notificationEmail) {
    return false;
  }

  await resend.emails.send({
    from: fromEmail(),
    to: client.notificationEmail,
    subject: "First Ring is setting up your caller",
    html: emailShell({
      eyebrow: "Setup started",
      title: "We have what we need.",
      body:
        "Your First Ring caller is being set up. You do not need to learn anything complicated. We will email you when your caller number is ready.",
      cta: "Open Your Dashboard",
      ctaUrl: `${siteUrl()}/portal`,
      details: `
        <p style="margin:0"><strong>Business:</strong> ${escapeHtml(client.businessName)}</p>
        <p style="margin:8px 0 0"><strong>Plan:</strong> ${escapeHtml(String(client.planName))}</p>
        <p style="margin:8px 0 0"><strong>Status:</strong> Being built</p>
      `,
    }),
  });

  return true;
}

export async function sendClientReadyEmail(client: Client) {
  const resend = resendClient();

  if (!resend || !client.notificationEmail || !client.callerPhoneNumber) {
    return false;
  }

  await resend.emails.send({
    from: fromEmail(),
    to: client.notificationEmail,
    subject: "Your First Ring caller is ready",
    html: emailShell({
      eyebrow: "Caller ready",
      title: "Your caller is live.",
      body:
        "Forward missed and after-hours calls to this number. When a customer calls, First Ring answers and sends you the lead details.",
      cta: "Open Your Dashboard",
      ctaUrl: `${siteUrl()}/portal`,
      details: `
        <p style="margin:0"><strong>Your caller number:</strong></p>
        <p style="margin:8px 0 0;font-size:26px;font-weight:900;color:#34C759">${escapeHtml(client.callerPhoneNumber)}</p>
      `,
    }),
  });

  return true;
}

export async function sendClientLeadEmail(client: Client, call: UsageCall) {
  const resend = resendClient();

  if (!resend || !client.notificationEmail) {
    return false;
  }

  const service = call.serviceRequested || "New service request";
  const summary = call.transcriptSummary || "A new lead was captured.";

  await resend.emails.send({
    from: fromEmail(),
    to: client.notificationEmail,
    subject: `New First Ring Lead: ${service}`,
    html: emailShell({
      eyebrow: "New lead captured",
      title: "A customer called.",
      body:
        "First Ring answered, gathered the important details, and saved the lead in your dashboard.",
      cta: "View Dashboard",
      ctaUrl: `${siteUrl()}/portal`,
      details: `
        <p style="margin:0"><strong>Customer:</strong> ${escapeHtml(call.leadName || "Not provided")}</p>
        <p style="margin:8px 0 0"><strong>Phone:</strong> ${escapeHtml(call.callerNumber || "Not provided")}</p>
        <p style="margin:8px 0 0"><strong>Service:</strong> ${escapeHtml(service)}</p>
        <p style="margin:8px 0 0"><strong>Booking:</strong> ${escapeHtml(call.bookingStatus || "Not provided")}</p>
        <p style="margin:14px 0 0"><strong>Summary:</strong><br>${escapeHtml(summary)}</p>
      `,
    }),
  });

  return true;
}
