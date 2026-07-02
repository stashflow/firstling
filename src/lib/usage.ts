import { getSql } from "@/lib/db";

const CALL_COST_PER_MINUTE = 0.11;
const PLAN_DEFAULTS = {
  starter: {
    planName: "Starter",
    monthlyPrice: 29,
    includedMinutes: 50,
    overageRate: 0.25,
  },
  basic: {
    planName: "Basic",
    monthlyPrice: 49,
    includedMinutes: 100,
    overageRate: 0.2,
  },
  growth: {
    planName: "Growth",
    monthlyPrice: 99,
    includedMinutes: 300,
    overageRate: 0.2,
  },
} as const;

export type PlanName = "Starter" | "Basic" | "Growth";

export type Client = {
  id: string;
  businessName: string;
  ownerName?: string | null;
  notificationEmail?: string | null;
  notificationPhone?: string | null;
  websiteUrl?: string | null;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  clerkUserId?: string | null;
  planName: PlanName | string;
  monthlyPrice: number;
  includedMinutes: number;
  overageRate: number;
  phoneNumberMonthlyCost: number;
  paymentFeeEstimate: number;
  billingStatus: string;
  callerPreferences?: unknown;
  callerPhoneNumber?: string | null;
  callerStatus: string;
  callerNotes?: string | null;
  callerLiveAt?: string | null;
  setupEmailSentAt?: string | null;
  readyEmailSentAt?: string | null;
  lastPortalLoginAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UsageCall = {
  id: string;
  clientId: string;
  externalCallId: string;
  callerNumber?: string | null;
  durationSeconds: number;
  billableMinutes: number;
  estimatedCost: number;
  callStatus: string;
  leadName?: string | null;
  serviceRequested?: string | null;
  bookingStatus?: string | null;
  transcriptSummary?: string | null;
  createdAt: string;
};

export type UsageCallInput = {
  clientId?: string | null;
  externalCallId: string;
  callerNumber?: string | null;
  durationSeconds: number;
  callStatus: string;
  leadName?: string | null;
  serviceRequested?: string | null;
  bookingStatus?: string | null;
  transcriptSummary?: string | null;
  businessName?: string | null;
  rawPayload: unknown;
};

export type UsageDashboardRow = Client & {
  totalCalls: number;
  totalMinutes: number;
  estimatedCallCost: number;
  overageMinutes: number;
  overageRevenue: number;
  monthlyRevenue: number;
  grossProfit: number;
  profitMargin: number;
  includedUsedPercent: number;
  remainingMinutes: number;
  warningLevel: "green" | "yellow" | "red";
};

export type OverageBillingCandidate = Client & {
  month: string;
  totalMinutes: number;
  overageMinutes: number;
  overageRevenue: number;
  existingRunStatus?: string | null;
};

type ClientRow = {
  id: string;
  business_name: string;
  owner_name: string | null;
  notification_email: string | null;
  notification_phone: string | null;
  website_url: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  clerk_user_id: string | null;
  plan_name: string;
  monthly_price: string | number;
  included_minutes: string | number;
  overage_rate: string | number;
  phone_number_monthly_cost: string | number;
  payment_fee_estimate: string | number;
  billing_status: string;
  caller_preferences?: unknown;
  caller_phone_number: string | null;
  caller_status: string;
  caller_notes: string | null;
  caller_live_at: string | null;
  setup_email_sent_at: string | null;
  ready_email_sent_at: string | null;
  last_portal_login_at: string | null;
  created_at: string;
  updated_at: string;
};

type UsageCallRow = {
  id: string;
  client_id: string;
  external_call_id: string;
  caller_number: string | null;
  duration_seconds: string | number;
  billable_minutes: string | number;
  estimated_cost: string | number;
  call_status: string;
  lead_name: string | null;
  service_requested: string | null;
  booking_status: string | null;
  transcript_summary: string | null;
  created_at: string;
};

type UsageDashboardDbRow = ClientRow & {
  total_calls: string | number | null;
  total_minutes: string | number | null;
  estimated_call_cost: string | number | null;
};

type OverageBillingRow = ClientRow & {
  month: string;
  total_minutes: string | number;
  overage_minutes: string | number;
  overage_revenue: string | number;
  existing_run_status: string | null;
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
    asRecord(root.data),
    asRecord(root.call),
    asRecord(root.call_analysis),
    asRecord(root.analysis),
    asRecord(root.structuredData),
    asRecord(root.structured_data),
    asRecord(asRecord(root.data).structuredData),
    asRecord(asRecord(root.data).structured_data),
    asRecord(root.metadata),
    asRecord(asRecord(root.data).metadata),
  ];
}

function firstString(payload: unknown, aliases: string[]) {
  for (const source of candidates(payload)) {
    for (const key of aliases) {
      const value = source[key];

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

function firstNumber(payload: unknown, aliases: string[]) {
  for (const source of candidates(payload)) {
    for (const key of aliases) {
      const value = source[key];

      if (typeof value === "number" && Number.isFinite(value)) {
        return value;
      }

      if (typeof value === "string" && value.trim()) {
        const parsed = Number(value);

        if (Number.isFinite(parsed)) {
          return parsed;
        }
      }
    }
  }

  return null;
}

function centsToDollars(value: string | number | null | undefined) {
  return Number(value || 0);
}

function mapClient(row: ClientRow): Client {
  return {
    id: row.id,
    businessName: row.business_name,
    ownerName: row.owner_name,
    notificationEmail: row.notification_email,
    notificationPhone: row.notification_phone,
    websiteUrl: row.website_url,
    stripeCustomerId: row.stripe_customer_id,
    stripeSubscriptionId: row.stripe_subscription_id,
    clerkUserId: row.clerk_user_id,
    planName: row.plan_name,
    monthlyPrice: centsToDollars(row.monthly_price),
    includedMinutes: Number(row.included_minutes || 0),
    overageRate: centsToDollars(row.overage_rate),
    phoneNumberMonthlyCost: centsToDollars(row.phone_number_monthly_cost),
    paymentFeeEstimate: centsToDollars(row.payment_fee_estimate),
    billingStatus: row.billing_status,
    callerPreferences: row.caller_preferences,
    callerPhoneNumber: row.caller_phone_number,
    callerStatus: row.caller_status,
    callerNotes: row.caller_notes,
    callerLiveAt: row.caller_live_at,
    setupEmailSentAt: row.setup_email_sent_at,
    readyEmailSentAt: row.ready_email_sent_at,
    lastPortalLoginAt: row.last_portal_login_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapUsageCall(row: UsageCallRow): UsageCall {
  return {
    id: row.id,
    clientId: row.client_id,
    externalCallId: row.external_call_id,
    callerNumber: row.caller_number,
    durationSeconds: Number(row.duration_seconds || 0),
    billableMinutes: Number(row.billable_minutes || 0),
    estimatedCost: Number(row.estimated_cost || 0),
    callStatus: row.call_status,
    leadName: row.lead_name,
    serviceRequested: row.service_requested,
    bookingStatus: row.booking_status,
    transcriptSummary: row.transcript_summary,
    createdAt: row.created_at,
  };
}

export function normalizeUsageCallPayload(payload: unknown): UsageCallInput {
  const externalCallId =
    firstString(payload, [
      "external_call_id",
      "externalCallId",
      "call_id",
      "callId",
      "id",
    ]) || `call-${Date.now()}`;
  const durationSeconds =
    firstNumber(payload, [
      "duration_seconds",
      "durationSeconds",
      "call_duration_seconds",
      "callDurationSeconds",
      "duration",
    ]) ||
    (() => {
      const durationMs = firstNumber(payload, [
        "duration_ms",
        "durationMs",
        "call_duration_ms",
        "callDurationMs",
      ]);

      return durationMs ? durationMs / 1000 : 0;
    })();
  const callerNumber = firstString(payload, [
    "caller_number",
    "callerNumber",
    "from_number",
    "fromNumber",
    "callerPhone",
    "caller_phone",
    "phone",
  ]);
  const callStatus =
    firstString(payload, [
      "call_status",
      "callStatus",
      "status",
      "callSuccessful",
      "Call Successful",
    ]) || "completed";

  return {
    clientId: firstString(payload, ["client_id", "clientId", "client"]),
    externalCallId,
    callerNumber,
    durationSeconds: Math.max(0, Math.round(durationSeconds)),
    callStatus,
    leadName:
      firstString(payload, ["lead_name", "leadName", "callerName", "caller_name"]) ||
      "Not provided",
    serviceRequested:
      firstString(payload, [
        "service_requested",
        "serviceRequested",
        "service",
      ]) || "Not provided",
    bookingStatus:
      firstString(payload, ["booking_status", "bookingStatus"]) ||
      "Not provided",
    transcriptSummary:
      firstString(payload, [
        "transcript_summary",
        "transcriptSummary",
        "summary",
        "Call Summary",
        "callSummary",
      ]) || "Not provided",
    businessName: firstString(payload, [
      "businessName",
      "business_name",
      "company",
    ]),
    rawPayload: payload,
  };
}

export function billableMinutes(durationSeconds: number) {
  return Math.ceil(Math.max(0, durationSeconds) / 60);
}

function planDefaults(plan?: string | null) {
  const key = String(plan || "starter").toLowerCase();

  if (key in PLAN_DEFAULTS) {
    return PLAN_DEFAULTS[key as keyof typeof PLAN_DEFAULTS];
  }

  return PLAN_DEFAULTS.starter;
}

export async function upsertClientFromSignup(input: {
  businessName: string;
  ownerName?: string | null;
  notificationEmail?: string | null;
  notificationPhone?: string | null;
  websiteUrl?: string | null;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  plan?: string | null;
  billingStatus?: string;
  callerPreferences?: unknown;
}) {
  const sql = getSql();
  const plan = planDefaults(input.plan);
  const rows = (await sql`
    insert into clients (
      business_name,
      owner_name,
      notification_email,
      notification_phone,
      website_url,
      stripe_customer_id,
      stripe_subscription_id,
      plan_name,
      monthly_price,
      included_minutes,
      overage_rate,
      phone_number_monthly_cost,
      payment_fee_estimate,
      billing_status,
      caller_preferences
    ) values (
      ${input.businessName},
      ${input.ownerName},
      ${input.notificationEmail},
      ${input.notificationPhone},
      ${input.websiteUrl},
      ${input.stripeCustomerId},
      ${input.stripeSubscriptionId},
      ${plan.planName},
      ${plan.monthlyPrice},
      ${plan.includedMinutes},
      ${plan.overageRate},
      2,
      ${plan.monthlyPrice * 0.029 + 0.3},
      ${input.billingStatus || "active"},
      ${JSON.stringify(input.callerPreferences || {})}::jsonb
    )
    on conflict (business_name) do update
    set
      owner_name = excluded.owner_name,
      notification_email = excluded.notification_email,
      notification_phone = excluded.notification_phone,
      website_url = excluded.website_url,
      stripe_customer_id = excluded.stripe_customer_id,
      stripe_subscription_id = excluded.stripe_subscription_id,
      plan_name = excluded.plan_name,
      monthly_price = excluded.monthly_price,
      included_minutes = excluded.included_minutes,
      overage_rate = excluded.overage_rate,
      payment_fee_estimate = excluded.payment_fee_estimate,
      billing_status = excluded.billing_status,
      caller_preferences = excluded.caller_preferences,
      updated_at = now()
    returning *
  `) as ClientRow[];

  await upsertMonthlyUsage(rows[0].id);

  return mapClient(rows[0]);
}

export async function listClients() {
  const sql = getSql();
  const rows = (await sql`
    select *
    from clients
    order by created_at desc
  `) as ClientRow[];

  return rows.map(mapClient);
}

export async function getClientById(id: string) {
  const sql = getSql();
  const rows = (await sql`
    select *
    from clients
    where id = ${id}
    limit 1
  `) as ClientRow[];

  return rows[0] ? mapClient(rows[0]) : null;
}

export async function getClientForPortal(input: {
  clerkUserId: string;
  email?: string | null;
}) {
  const sql = getSql();
  const email = input.email?.trim().toLowerCase() || null;
  const rows = (await sql`
    select *
    from clients
    where
      clerk_user_id = ${input.clerkUserId}
      or (
        ${email}::text is not null
        and lower(notification_email) = ${email}
      )
    order by
      case when clerk_user_id = ${input.clerkUserId} then 0 else 1 end,
      created_at desc
    limit 1
  `) as ClientRow[];

  if (!rows[0]) {
    return null;
  }

  const client = mapClient(rows[0]);

  if (!client.clerkUserId) {
    await sql`
      update clients
      set
        clerk_user_id = ${input.clerkUserId},
        last_portal_login_at = now(),
        updated_at = now()
      where id = ${client.id}
    `;
    return { ...client, clerkUserId: input.clerkUserId };
  }

  await sql`
    update clients
    set last_portal_login_at = now()
    where id = ${client.id}
  `;

  return client;
}

export async function getClientMonthlyUsage(clientId: string, month = new Date()) {
  const rows = await listUsageDashboard(month);
  return rows.find((row) => row.id === clientId) || null;
}

export async function listRecentClientCalls(clientId: string, limit = 8) {
  const sql = getSql();
  const rows = (await sql`
    select *
    from calls
    where client_id = ${clientId}
    order by created_at desc
    limit ${limit}
  `) as UsageCallRow[];

  return rows.map(mapUsageCall);
}

export async function markClientSetupEmailSent(clientId: string) {
  const sql = getSql();
  await sql`
    update clients
    set
      setup_email_sent_at = coalesce(setup_email_sent_at, now()),
      updated_at = now()
    where id = ${clientId}
  `;
}

export async function markClientReadyEmailSent(clientId: string) {
  const sql = getSql();
  await sql`
    update clients
    set
      ready_email_sent_at = now(),
      updated_at = now()
    where id = ${clientId}
  `;
}

export async function updateClientCallerSetup(
  id: string,
  input: {
    callerPhoneNumber?: string | null;
    callerStatus?: string | null;
    callerNotes?: string | null;
  },
) {
  const sql = getSql();
  const liveAt = input.callerStatus === "live" ? new Date().toISOString() : null;
  const rows = (await sql`
    update clients
    set
      caller_phone_number = ${input.callerPhoneNumber},
      caller_status = coalesce(${input.callerStatus}, caller_status),
      caller_notes = ${input.callerNotes},
      caller_live_at = case
        when ${input.callerStatus} = 'live' and caller_live_at is null
          then ${liveAt}::timestamp with time zone
        else caller_live_at
      end,
      updated_at = now()
    where id = ${id}
    returning *
  `) as ClientRow[];

  return rows[0] ? mapClient(rows[0]) : null;
}

export async function updateClientBillingByStripe(input: {
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  billingStatus: string;
}) {
  const sql = getSql();

  if (!input.stripeCustomerId && !input.stripeSubscriptionId) {
    return null;
  }

  const rows = (await sql`
    update clients
    set
      billing_status = ${input.billingStatus},
      caller_status = case
        when ${input.billingStatus} in ('canceled', 'unpaid', 'incomplete_expired')
          then 'paused'
        else caller_status
      end,
      updated_at = now()
    where
      (${input.stripeCustomerId}::text is not null and stripe_customer_id = ${input.stripeCustomerId})
      or
      (${input.stripeSubscriptionId}::text is not null and stripe_subscription_id = ${input.stripeSubscriptionId})
    returning *
  `) as ClientRow[];

  if (rows[0]) {
    await upsertMonthlyUsage(rows[0].id);
    return mapClient(rows[0]);
  }

  return null;
}

export async function findOrCreateClient(input: {
  clientId?: string | null;
  businessName?: string | null;
}) {
  const sql = getSql();

  if (input.clientId) {
    const rows = (await sql`
      select *
      from clients
      where id = ${input.clientId}
      limit 1
    `) as ClientRow[];

    if (rows[0]) {
      return mapClient(rows[0]);
    }
  }

  const businessName = input.businessName?.trim() || "Unassigned Client";
  const rows = (await sql`
    insert into clients (
      business_name,
      plan_name,
      monthly_price,
      included_minutes,
      overage_rate,
      phone_number_monthly_cost,
      payment_fee_estimate,
      billing_status
    ) values (
      ${businessName},
      'Starter',
      29,
      50,
      0.25,
      2,
      1.15,
      'trial'
    )
    on conflict (business_name) do update
    set updated_at = now()
    returning *
  `) as ClientRow[];

  return mapClient(rows[0]);
}

export async function insertUsageCall(input: UsageCallInput) {
  const client = await findOrCreateClient({
    clientId: input.clientId,
    businessName: input.businessName,
  });
  const minutes = billableMinutes(input.durationSeconds);
  const estimatedCost = minutes * CALL_COST_PER_MINUTE;
  const sql = getSql();

  const rows = (await sql`
    insert into calls (
      client_id,
      external_call_id,
      caller_number,
      duration_seconds,
      billable_minutes,
      estimated_cost,
      call_status,
      lead_name,
      service_requested,
      booking_status,
      transcript_summary,
      raw_payload
    ) values (
      ${client.id},
      ${input.externalCallId},
      ${input.callerNumber},
      ${input.durationSeconds},
      ${minutes},
      ${estimatedCost},
      ${input.callStatus},
      ${input.leadName},
      ${input.serviceRequested},
      ${input.bookingStatus},
      ${input.transcriptSummary},
      ${JSON.stringify(input.rawPayload)}::jsonb
    )
    on conflict (client_id, external_call_id) do update
    set
      caller_number = excluded.caller_number,
      duration_seconds = excluded.duration_seconds,
      billable_minutes = excluded.billable_minutes,
      estimated_cost = excluded.estimated_cost,
      call_status = excluded.call_status,
      lead_name = excluded.lead_name,
      service_requested = excluded.service_requested,
      booking_status = excluded.booking_status,
      transcript_summary = excluded.transcript_summary,
      raw_payload = excluded.raw_payload
    returning *
  `) as UsageCallRow[];

  await upsertMonthlyUsage(client.id);

  const call = mapUsageCall(rows[0]);

  return {
    id: call.id,
    client,
    call,
    billableMinutes: minutes,
    estimatedCost,
  };
}

export async function upsertMonthlyUsage(clientId: string, month = new Date()) {
  const sql = getSql();
  const monthStart = new Date(
    Date.UTC(month.getUTCFullYear(), month.getUTCMonth(), 1),
  );

  await sql`
    insert into monthly_usage (
      client_id,
      month,
      total_calls,
      total_minutes,
      included_minutes,
      overage_minutes,
      overage_revenue,
      estimated_call_cost,
      monthly_revenue,
      gross_profit,
      profit_margin,
      billing_status
    )
    select
      c.id,
      ${monthStart.toISOString()}::date,
      count(ca.id)::int,
      coalesce(sum(ca.billable_minutes), 0)::int,
      c.included_minutes,
      greatest(coalesce(sum(ca.billable_minutes), 0) - c.included_minutes, 0)::int,
      greatest(coalesce(sum(ca.billable_minutes), 0) - c.included_minutes, 0) * c.overage_rate,
      coalesce(sum(ca.estimated_cost), 0),
      c.monthly_price,
      c.monthly_price
        + (greatest(coalesce(sum(ca.billable_minutes), 0) - c.included_minutes, 0) * c.overage_rate)
        - coalesce(sum(ca.estimated_cost), 0)
        - c.phone_number_monthly_cost
        - c.payment_fee_estimate,
      case
        when c.monthly_price + (greatest(coalesce(sum(ca.billable_minutes), 0) - c.included_minutes, 0) * c.overage_rate) = 0
          then 0
        else (
          c.monthly_price
          + (greatest(coalesce(sum(ca.billable_minutes), 0) - c.included_minutes, 0) * c.overage_rate)
          - coalesce(sum(ca.estimated_cost), 0)
          - c.phone_number_monthly_cost
          - c.payment_fee_estimate
        ) / (
          c.monthly_price
          + (greatest(coalesce(sum(ca.billable_minutes), 0) - c.included_minutes, 0) * c.overage_rate)
        )
      end,
      c.billing_status
    from clients c
    left join calls ca
      on ca.client_id = c.id
      and ca.created_at >= ${monthStart.toISOString()}::date
      and ca.created_at < (${monthStart.toISOString()}::date + interval '1 month')
    where c.id = ${clientId}
    group by c.id
    on conflict (client_id, month) do update
    set
      total_calls = excluded.total_calls,
      total_minutes = excluded.total_minutes,
      included_minutes = excluded.included_minutes,
      overage_minutes = excluded.overage_minutes,
      overage_revenue = excluded.overage_revenue,
      estimated_call_cost = excluded.estimated_call_cost,
      monthly_revenue = excluded.monthly_revenue,
      gross_profit = excluded.gross_profit,
      profit_margin = excluded.profit_margin,
      billing_status = excluded.billing_status,
      updated_at = now()
  `;
}

export async function listUsageDashboard(month = new Date()) {
  const sql = getSql();
  const monthStart = new Date(
    Date.UTC(month.getUTCFullYear(), month.getUTCMonth(), 1),
  );
  const rows = (await sql`
    select
      c.*,
      coalesce(count(ca.id), 0)::int as total_calls,
      coalesce(sum(ca.billable_minutes), 0)::int as total_minutes,
      coalesce(sum(ca.estimated_cost), 0) as estimated_call_cost
    from clients c
    left join calls ca
      on ca.client_id = c.id
      and ca.created_at >= ${monthStart.toISOString()}::date
      and ca.created_at < (${monthStart.toISOString()}::date + interval '1 month')
    group by c.id
    order by c.business_name asc
  `) as UsageDashboardDbRow[];

  return rows.map((row): UsageDashboardRow => {
    const client = mapClient(row);
    const totalCalls = Number(row.total_calls || 0);
    const totalMinutes = Number(row.total_minutes || 0);
    const estimatedCallCost = Number(row.estimated_call_cost || 0);
    const overageMinutes = Math.max(0, totalMinutes - client.includedMinutes);
    const overageRevenue = overageMinutes * client.overageRate;
    const monthlyRevenue = client.monthlyPrice + overageRevenue;
    const grossProfit =
      monthlyRevenue -
      estimatedCallCost -
      client.phoneNumberMonthlyCost -
      client.paymentFeeEstimate;
    const profitMargin = monthlyRevenue > 0 ? grossProfit / monthlyRevenue : 0;
    const includedUsedPercent =
      client.includedMinutes > 0 ? totalMinutes / client.includedMinutes : 1;
    const warningLevel =
      includedUsedPercent > 1
        ? "red"
        : includedUsedPercent >= 0.7
          ? "yellow"
          : "green";

    return {
      ...client,
      totalCalls,
      totalMinutes,
      estimatedCallCost,
      overageMinutes,
      overageRevenue,
      monthlyRevenue,
      grossProfit,
      profitMargin,
      includedUsedPercent,
      remainingMinutes: Math.max(0, client.includedMinutes - totalMinutes),
      warningLevel,
    };
  });
}

export function monthStart(date = new Date()) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

export function previousMonthStart(date = new Date()) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() - 1, 1));
}

export async function listOverageBillingCandidates(month = previousMonthStart()) {
  const sql = getSql();
  const startedAt = monthStart(month);
  const rows = (await sql`
    select
      c.*,
      mu.month,
      mu.total_minutes,
      mu.overage_minutes,
      mu.overage_revenue,
      obr.status as existing_run_status
    from monthly_usage mu
    join clients c on c.id = mu.client_id
    left join overage_billing_runs obr
      on obr.client_id = c.id
      and obr.month = mu.month
    where
      mu.month = ${startedAt.toISOString()}::date
      and mu.overage_minutes > 0
      and c.billing_status = 'active'
      and c.stripe_customer_id is not null
      and (
        obr.id is null
        or obr.status in ('failed', 'pending')
      )
    order by c.business_name asc
  `) as OverageBillingRow[];

  return rows.map((row): OverageBillingCandidate => ({
    ...mapClient(row),
    month: row.month,
    totalMinutes: Number(row.total_minutes || 0),
    overageMinutes: Number(row.overage_minutes || 0),
    overageRevenue: Number(row.overage_revenue || 0),
    existingRunStatus: row.existing_run_status,
  }));
}

export async function refreshMonthlyUsageForAllClients(month = new Date()) {
  const clients = await listClients();

  await Promise.all(
    clients.map((client) => upsertMonthlyUsage(client.id, month)),
  );

  return clients.length;
}

export async function recordOverageBillingRun(input: {
  clientId: string;
  month: Date | string;
  overageMinutes: number;
  overageRate: number;
  amount: number;
  stripeInvoiceItemId?: string | null;
  stripeInvoiceId?: string | null;
  status: "pending" | "invoiced" | "skipped" | "failed";
  errorMessage?: string | null;
}) {
  const sql = getSql();
  const month =
    input.month instanceof Date
      ? monthStart(input.month).toISOString()
      : input.month;

  await sql`
    insert into overage_billing_runs (
      client_id,
      month,
      overage_minutes,
      overage_rate,
      amount,
      stripe_invoice_item_id,
      stripe_invoice_id,
      status,
      error_message
    ) values (
      ${input.clientId},
      ${month}::date,
      ${input.overageMinutes},
      ${input.overageRate},
      ${input.amount},
      ${input.stripeInvoiceItemId || null},
      ${input.stripeInvoiceId || null},
      ${input.status},
      ${input.errorMessage || null}
    )
    on conflict (client_id, month) do update
    set
      overage_minutes = excluded.overage_minutes,
      overage_rate = excluded.overage_rate,
      amount = excluded.amount,
      stripe_invoice_item_id = excluded.stripe_invoice_item_id,
      stripe_invoice_id = excluded.stripe_invoice_id,
      status = excluded.status,
      error_message = excluded.error_message,
      updated_at = now()
  `;
}
