import {
  AlertTriangle,
  CheckCircle2,
  PhoneCall,
} from "lucide-react";
import Link from "next/link";
import { requireAdminAccess } from "@/lib/admin-auth";
import { listUsageDashboard, type UsageDashboardRow } from "@/lib/usage";
import { Card } from "@/components/ui/card";
import { Wordmark } from "@/components/wordmark";

export const dynamic = "force-dynamic";

function currency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function percent(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    maximumFractionDigits: 1,
  }).format(value);
}

function compactNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 1,
  }).format(value);
}

function monthLabel() {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(new Date());
}

function WarningBadge({ client }: { client: UsageDashboardRow }) {
  const config = {
    green: {
      label: "Healthy",
      className: "bg-[#34c759]/12 text-[#167a31]",
      Icon: CheckCircle2,
    },
    yellow: {
      label: "Watch minutes",
      className: "bg-yellow-100 text-yellow-800",
      Icon: AlertTriangle,
    },
    red: {
      label: "Over included",
      className: "bg-red-100 text-red-700",
      Icon: AlertTriangle,
    },
  }[client.warningLevel];
  const Icon = config.Icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black uppercase ${config.className}`}
    >
      <Icon className="size-3.5" />
      {config.label}
    </span>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[1.15rem] bg-[#f4f5f4] px-4 py-3">
      <p className="text-xs font-black uppercase text-black/35">{label}</p>
      <p className="mt-1 text-xl font-black leading-none text-[#101211]">
        {value}
      </p>
    </div>
  );
}

function ClientUsageCard({ client }: { client: UsageDashboardRow }) {
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-black/6 p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-3xl font-black leading-none">
              {client.businessName}
            </h2>
            <WarningBadge client={client} />
          </div>
          <p className="mt-2 text-sm font-bold text-black/45">
            {client.planName} plan - {client.billingStatus}
          </p>
        </div>
        <div className="rounded-[1.25rem] bg-[#101211] px-4 py-3 text-white">
          <p className="text-xs font-black uppercase text-white/45">
            Gross profit
          </p>
          <p className="mt-1 text-2xl font-black">
            {currency(client.grossProfit)}
          </p>
        </div>
      </div>

      <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-4 lg:p-6">
        <Metric label="Calls this month" value={String(client.totalCalls)} />
        <Metric label="Minutes this month" value={compactNumber(client.totalMinutes)} />
        <Metric
          label="Included used"
          value={`${compactNumber(client.totalMinutes)} / ${client.includedMinutes}`}
        />
        <Metric label="Remaining" value={compactNumber(client.remainingMinutes)} />
        <Metric label="Overage minutes" value={compactNumber(client.overageMinutes)} />
        <Metric label="Call cost" value={currency(client.estimatedCallCost)} />
        <Metric label="Monthly revenue" value={currency(client.monthlyRevenue)} />
        <Metric label="Profit margin" value={percent(client.profitMargin)} />
      </div>

      <div className="px-5 pb-5 lg:px-6 lg:pb-6">
        <div className="h-3 overflow-hidden rounded-full bg-[#edf0ec]">
          <div
            className={`h-full rounded-full ${
              client.warningLevel === "red"
                ? "bg-red-500"
                : client.warningLevel === "yellow"
                  ? "bg-yellow-400"
                  : "bg-[#34c759]"
            }`}
            style={{
              width: `${Math.min(100, client.includedUsedPercent * 100)}%`,
            }}
          />
        </div>
        <p className="mt-3 text-sm font-bold text-black/45">
          Overage revenue: {currency(client.overageRevenue)} - Phone number:
          {" "}
          {currency(client.phoneNumberMonthlyCost)} - Payment fees:
          {" "}
          {currency(client.paymentFeeEstimate)}
        </p>
      </div>
    </Card>
  );
}

export default async function UsageDashboardPage() {
  await requireAdminAccess();
  const clients = await listUsageDashboard();
  const totals = clients.reduce(
    (acc, client) => ({
      calls: acc.calls + client.totalCalls,
      minutes: acc.minutes + client.totalMinutes,
      callCost: acc.callCost + client.estimatedCallCost,
      revenue: acc.revenue + client.monthlyRevenue,
      grossProfit: acc.grossProfit + client.grossProfit,
    }),
    { calls: 0, minutes: 0, callCost: 0, revenue: 0, grossProfit: 0 },
  );

  return (
    <main className="min-h-screen bg-[#f4f5f4] px-4 py-6 text-[#101211] sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Wordmark />
            <p className="mt-8 text-sm font-black uppercase text-[#34c759]">
              {monthLabel()}
            </p>
            <h1 className="mt-2 text-5xl font-black leading-none">
              Usage Dashboard
            </h1>
            <p className="mt-4 max-w-2xl text-lg font-bold leading-snug text-black/52">
              Track call volume, included minutes, call cost, overages,
              revenue, and profit by client.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/clients"
              className="inline-flex h-12 items-center justify-center rounded-full bg-white px-5 text-sm font-black text-[#101211] shadow-[0_12px_28px_rgba(15,23,42,0.08)] ring-1 ring-black/8"
            >
              Clients
            </Link>
            <Link
              href="/admin/demo-calls"
              className="inline-flex h-12 items-center justify-center rounded-full bg-white px-5 text-sm font-black text-[#101211] shadow-[0_12px_28px_rgba(15,23,42,0.08)] ring-1 ring-black/8"
            >
              Demo calls
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Metric label="Total calls" value={String(totals.calls)} />
          <Metric label="Total minutes" value={compactNumber(totals.minutes)} />
          <Metric label="Call cost" value={currency(totals.callCost)} />
          <Metric label="Revenue" value={currency(totals.revenue)} />
          <Metric label="Gross profit" value={currency(totals.grossProfit)} />
        </div>

        <div className="mt-6 grid gap-4">
          {clients.length > 0 ? (
            clients.map((client) => (
              <ClientUsageCard key={client.id} client={client} />
            ))
          ) : (
            <Card className="p-8 text-center">
              <div className="mx-auto grid size-14 place-items-center rounded-[1.3rem] bg-[#34c759] text-white">
                <PhoneCall className="size-6" />
              </div>
              <h2 className="mt-6 text-3xl font-black">No usage yet.</h2>
              <p className="mx-auto mt-3 max-w-xl font-bold leading-snug text-black/52">
                Run `database/usage_tracking.sql` in Neon, then point completed
                call webhooks to `/api/webhooks/client-call`.
              </p>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}
