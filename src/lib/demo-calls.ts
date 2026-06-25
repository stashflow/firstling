import { randomUUID } from "crypto";
import { getSql } from "@/lib/db";

export type DemoCallInput = {
  callId?: string | null;
  callerName: string;
  callerPhone?: string | null;
  callerEmail?: string | null;
  callerType?: string | null;
  serviceRequested: string;
  location: string;
  timeline: string;
  addOns?: string | null;
  businessName?: string | null;
  ownerName?: string | null;
  businessServices?: string | null;
  preferredContactMethod?: string | null;
  summary: string;
  transcript?: string | null;
  recordingUrl?: string | null;
  rawPayload: unknown;
};

export type DemoCall = DemoCallInput & {
  id: string;
  resultSlug: string;
  resultUrl?: string | null;
  emailSent: boolean;
  smsSent: boolean;
  createdAt: string;
};

type DemoCallRow = {
  id: string;
  call_id: string | null;
  result_slug: string;
  caller_name: string | null;
  caller_phone: string | null;
  caller_email: string | null;
  caller_type: string | null;
  service_requested: string | null;
  location: string | null;
  timeline: string | null;
  add_ons: string | null;
  business_name: string | null;
  owner_name: string | null;
  business_services: string | null;
  preferred_contact_method: string | null;
  summary: string | null;
  transcript: string | null;
  recording_url: string | null;
  raw_payload?: unknown;
  result_url: string | null;
  email_sent: boolean | null;
  sms_sent: boolean | null;
  created_at: string;
};

const fieldAliases: Record<keyof Omit<DemoCallInput, "rawPayload">, string[]> = {
  callId: ["callId", "call_id", "id"],
  callerName: ["callerName", "caller_name", "name", "customerName", "customer_name"],
  callerPhone: ["callerPhone", "caller_phone", "phone", "customerPhone", "customer_phone"],
  callerEmail: ["callerEmail", "caller_email", "email", "customerEmail", "customer_email"],
  callerType: ["callerType", "caller_type", "customerType", "customer_type"],
  serviceRequested: [
    "serviceRequested",
    "service_requested",
    "service",
    "requestedService",
    "requested_service",
  ],
  location: ["location", "address", "city"],
  timeline: ["timeline", "timing", "timeframe", "desiredTimeline"],
  addOns: ["addOns", "add_ons", "addons", "extras"],
  businessName: ["businessName", "business_name", "company"],
  ownerName: ["ownerName", "owner_name", "owner"],
  businessServices: ["businessServices", "business_services", "services"],
  preferredContactMethod: [
    "preferredContactMethod",
    "preferred_contact_method",
    "contactMethod",
    "contact_method",
  ],
  summary: ["summary", "callSummary", "call_summary"],
  transcript: ["transcript", "callTranscript", "call_transcript"],
  recordingUrl: ["recordingUrl", "recording_url", "recording", "audioUrl", "audio_url"],
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function candidates(payload: unknown) {
  const root = asRecord(payload);

  return [
    root,
    asRecord(root.structuredData),
    asRecord(root.structured_data),
    asRecord(root.data),
    asRecord(asRecord(root.data).structuredData),
    asRecord(asRecord(root.data).structured_data),
    asRecord(root.analysis),
    asRecord(asRecord(root.analysis).structuredData),
    asRecord(asRecord(root.analysis).structured_data),
    asRecord(root.call),
  ];
}

function firstString(payload: unknown, aliases: string[]) {
  for (const source of candidates(payload)) {
    for (const key of aliases) {
      const value = source[key];

      if (Array.isArray(value)) {
        const joined = value
          .map((item) => String(item).trim())
          .filter(Boolean)
          .join(", ");

        if (joined) {
          return joined;
        }
      }

      if (typeof value === "string" && value.trim()) {
        return value.trim();
      }

      if (typeof value === "number" || typeof value === "boolean") {
        return String(value);
      }
    }
  }

  return null;
}

function fallbackSummary(input: {
  callerName: string;
  serviceRequested: string;
  location: string;
  timeline: string;
}) {
  return `${input.callerName} called about ${input.serviceRequested.toLowerCase()} in ${input.location}. Timeline: ${input.timeline}.`;
}

export function normalizeDemoCallPayload(payload: unknown): DemoCallInput {
  const callerName =
    firstString(payload, fieldAliases.callerName) || "Demo Caller";
  const serviceRequested =
    firstString(payload, fieldAliases.serviceRequested) ||
    "Exterior cleaning request";
  const location = firstString(payload, fieldAliases.location) || "Not provided";
  const timeline = firstString(payload, fieldAliases.timeline) || "Not provided";
  const summary =
    firstString(payload, fieldAliases.summary) ||
    fallbackSummary({ callerName, serviceRequested, location, timeline });

  return {
    callId: firstString(payload, fieldAliases.callId),
    callerName,
    callerPhone: firstString(payload, fieldAliases.callerPhone),
    callerEmail: firstString(payload, fieldAliases.callerEmail),
    callerType: firstString(payload, fieldAliases.callerType),
    serviceRequested,
    location,
    timeline,
    addOns: firstString(payload, fieldAliases.addOns),
    businessName: firstString(payload, fieldAliases.businessName),
    ownerName: firstString(payload, fieldAliases.ownerName),
    businessServices: firstString(payload, fieldAliases.businessServices),
    preferredContactMethod: firstString(
      payload,
      fieldAliases.preferredContactMethod,
    ),
    summary,
    transcript: firstString(payload, fieldAliases.transcript),
    recordingUrl: firstString(payload, fieldAliases.recordingUrl),
    rawPayload: payload,
  };
}

export function createResultSlug(input: DemoCallInput) {
  const name = input.callerName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 24);

  return `${name || "demo"}-${randomUUID().slice(0, 8)}`;
}

export function mapDemoCall(row: DemoCallRow): DemoCall {
  return {
    id: row.id,
    callId: row.call_id,
    resultSlug: row.result_slug,
    callerName: row.caller_name || "Demo Caller",
    callerPhone: row.caller_phone,
    callerEmail: row.caller_email,
    callerType: row.caller_type,
    serviceRequested: row.service_requested || "Exterior cleaning request",
    location: row.location || "Not provided",
    timeline: row.timeline || "Not provided",
    addOns: row.add_ons,
    businessName: row.business_name,
    ownerName: row.owner_name,
    businessServices: row.business_services,
    preferredContactMethod: row.preferred_contact_method,
    summary: row.summary || "First Ring captured the caller's details.",
    transcript: row.transcript,
    recordingUrl: row.recording_url,
    rawPayload: row.raw_payload,
    resultUrl: row.result_url,
    emailSent: Boolean(row.email_sent),
    smsSent: Boolean(row.sms_sent),
    createdAt: row.created_at,
  };
}

export async function insertDemoCall(
  input: DemoCallInput,
  resultSlug: string,
  resultUrl: string,
) {
  const sql = getSql();
  const rows = (await sql`
    insert into demo_calls (
      call_id,
      result_slug,
      caller_name,
      caller_phone,
      caller_email,
      caller_type,
      service_requested,
      location,
      timeline,
      add_ons,
      business_name,
      owner_name,
      business_services,
      preferred_contact_method,
      summary,
      transcript,
      recording_url,
      raw_payload,
      result_url
    ) values (
      ${input.callId},
      ${resultSlug},
      ${input.callerName},
      ${input.callerPhone},
      ${input.callerEmail},
      ${input.callerType},
      ${input.serviceRequested},
      ${input.location},
      ${input.timeline},
      ${input.addOns},
      ${input.businessName},
      ${input.ownerName},
      ${input.businessServices},
      ${input.preferredContactMethod},
      ${input.summary},
      ${input.transcript},
      ${input.recordingUrl},
      ${JSON.stringify(input.rawPayload)}::jsonb,
      ${resultUrl}
    )
    returning *
  `) as DemoCallRow[];

  return mapDemoCall(rows[0]);
}

export async function updateDemoCallDelivery(
  id: string,
  status: { emailSent?: boolean; smsSent?: boolean },
) {
  const sql = getSql();

  await sql`
    update demo_calls
    set
      email_sent = coalesce(${status.emailSent}, email_sent),
      sms_sent = coalesce(${status.smsSent}, sms_sent)
    where id = ${id}
  `;
}

export async function getDemoCallBySlug(slug: string) {
  const sql = getSql();
  const rows = (await sql`
    select *
    from demo_calls
    where result_slug = ${slug}
    limit 1
  `) as DemoCallRow[];

  return rows[0] ? mapDemoCall(rows[0]) : null;
}

export async function getDemoCallById(id: string) {
  const sql = getSql();
  const rows = (await sql`
    select *
    from demo_calls
    where id = ${id}
    limit 1
  `) as DemoCallRow[];

  return rows[0] ? mapDemoCall(rows[0]) : null;
}

export async function listDemoCalls() {
  const sql = getSql();
  const rows = (await sql`
    select *
    from demo_calls
    order by created_at desc
    limit 100
  `) as DemoCallRow[];

  return rows.map(mapDemoCall);
}
