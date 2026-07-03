import Link from "next/link";
import { ExternalLink, PhoneCall, Search, SlidersHorizontal } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Wordmark } from "@/components/wordmark";
import { requireAdminAccess } from "@/lib/admin-auth";
import { listAdminClientCalls } from "@/lib/usage";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  q?: string;
  client?: string;
  booking?: string;
  callStatus?: string;
  window?: string;
}>;

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function compactNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 1,
  }).format(value);
}

function statusClass(status: string) {
  const value = status.toLowerCase();

  if (value.includes("book")) {
    return "bg-[#34c759]/12 text-[#167a31]";
  }

  if (value.includes("follow") || value.includes("qualified")) {
    return "bg-blue-100 text-blue-800";
  }

  if (value.includes("urgent")) {
    return "bg-red-100 text-red-700";
  }

  return "bg-black/6 text-black/55";
}

function windowStart(windowValue: string) {
  const now = Date.now();

  if (windowValue === "7d") {
    return new Date(now - 7 * 24 * 60 * 60 * 1000);
  }

  if (windowValue === "30d") {
    return new Date(now - 30 * 24 * 60 * 60 * 1000);
  }

  return null;
}

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireAdminAccess();
  const params = await searchParams;
  const query = (params.q || "").trim().toLowerCase();
  const selectedClient = (params.client || "").trim();
  const selectedBooking = (params.booking || "").trim().toLowerCase();
  const selectedCallStatus = (params.callStatus || "").trim().toLowerCase();
  const selectedWindow = (params.window || "30d").trim().toLowerCase();
  const calls = await listAdminClientCalls();
  const dateFloor = windowStart(selectedWindow);

  const filtered = calls.filter((call) => {
    if (selectedClient && call.clientId !== selectedClient) {
      return false;
    }

    if (
      selectedBooking &&
      (call.bookingStatus || "").trim().toLowerCase() !== selectedBooking
    ) {
      return false;
    }

    if (
      selectedCallStatus &&
      (call.callStatus || "").trim().toLowerCase() !== selectedCallStatus
    ) {
      return false;
    }

    if (dateFloor && new Date(call.createdAt) < dateFloor) {
      return false;
    }

    if (!query) {
      return true;
    }

    const haystack = [
      call.businessName,
      call.ownerName,
      call.notificationEmail,
      call.leadName,
      call.callerNumber,
      call.serviceRequested,
      call.bookingStatus,
      call.callStatus,
      call.transcriptSummary,
      call.externalCallId,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(query);
  });

  const uniqueClients = Array.from(
    new Map(calls.map((call) => [call.clientId, call.businessName])).entries(),
  );
  const uniqueBookings = Array.from(
    new Set(
      calls
        .map((call) => (call.bookingStatus || "").trim())
        .filter(Boolean),
    ),
  ).sort((a, b) => a.localeCompare(b));
  const uniqueCallStatuses = Array.from(
    new Set(calls.map((call) => (call.callStatus || "").trim()).filter(Boolean)),
  ).sort((a, b) => a.localeCompare(b));

  const totals = filtered.reduce(
    (acc, call) => {
      acc.calls += 1;
      acc.minutes += call.billableMinutes;

      if ((call.bookingStatus || "").toLowerCase().includes("book")) {
        acc.booked += 1;
      }

      if ((call.bookingStatus || "").toLowerCase().includes("follow")) {
        acc.followUp += 1;
      }

      return acc;
    },
    { calls: 0, minutes: 0, booked: 0, followUp: 0 },
  );

  return (
    <main className="min-h-screen bg-[#f4f5f4] px-4 py-6 text-[#101211] sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Wordmark />
            <h1 className="mt-8 text-5xl font-black leading-none">Leads</h1>
            <p className="mt-4 max-w-3xl text-lg font-bold leading-snug text-black/52">
              See every captured client lead in one place, filter by customer or
              outcome, and jump straight into the business account that needs
              attention.
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
              href="/admin/usage"
              className="inline-flex h-12 items-center justify-center rounded-full bg-white px-5 text-sm font-black text-[#101211] shadow-[0_12px_28px_rgba(15,23,42,0.08)] ring-1 ring-black/8"
            >
              Usage dashboard
            </Link>
            <Link
              href="/admin/demo-calls"
              className="inline-flex h-12 items-center justify-center rounded-full bg-white px-5 text-sm font-black text-[#101211] shadow-[0_12px_28px_rgba(15,23,42,0.08)] ring-1 ring-black/8"
            >
              Demo calls
            </Link>
          </div>
        </div>

        <Card className="mt-8 p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="grid size-12 place-items-center rounded-[1.1rem] bg-[#34c759] text-white">
              <SlidersHorizontal className="size-5" />
            </div>
            <div>
              <h2 className="text-2xl font-black">Filter leads</h2>
              <p className="text-sm font-bold text-black/45">
                Search by lead, phone, service, transcript, client, or external
                call ID.
              </p>
            </div>
          </div>

          <form className="mt-5 grid gap-3 lg:grid-cols-[1.6fr_1fr_1fr_1fr_0.8fr]">
            <label className="grid gap-2">
              <span className="text-xs font-black uppercase text-black/38">
                Search
              </span>
              <div className="flex h-12 items-center gap-3 rounded-[1.1rem] border border-black/8 bg-white px-4">
                <Search className="size-4 text-black/34" />
                <input
                  type="text"
                  name="q"
                  defaultValue={params.q || ""}
                  placeholder="Sarah, driveway, follow up, 404..."
                  className="w-full bg-transparent text-sm font-bold outline-none placeholder:text-black/24"
                />
              </div>
            </label>

            <label className="grid gap-2">
              <span className="text-xs font-black uppercase text-black/38">
                Client
              </span>
              <select
                name="client"
                defaultValue={selectedClient}
                className="h-12 rounded-[1.1rem] border border-black/8 bg-white px-4 text-sm font-bold outline-none"
              >
                <option value="">All clients</option>
                {uniqueClients.map(([clientId, businessName]) => (
                  <option key={clientId} value={clientId}>
                    {businessName}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-xs font-black uppercase text-black/38">
                Booking
              </span>
              <select
                name="booking"
                defaultValue={selectedBooking}
                className="h-12 rounded-[1.1rem] border border-black/8 bg-white px-4 text-sm font-bold outline-none"
              >
                <option value="">All outcomes</option>
                {uniqueBookings.map((status) => (
                  <option key={status} value={status.toLowerCase()}>
                    {status}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-xs font-black uppercase text-black/38">
                Call status
              </span>
              <select
                name="callStatus"
                defaultValue={selectedCallStatus}
                className="h-12 rounded-[1.1rem] border border-black/8 bg-white px-4 text-sm font-bold outline-none"
              >
                <option value="">All statuses</option>
                {uniqueCallStatuses.map((status) => (
                  <option key={status} value={status.toLowerCase()}>
                    {status}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-xs font-black uppercase text-black/38">
                Window
              </span>
              <select
                name="window"
                defaultValue={selectedWindow}
                className="h-12 rounded-[1.1rem] border border-black/8 bg-white px-4 text-sm font-bold outline-none"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="all">All time</option>
              </select>
            </label>

            <div className="flex flex-wrap items-end gap-3 lg:col-span-5">
              <button
                type="submit"
                className="inline-flex h-12 items-center justify-center rounded-full bg-[#101211] px-5 text-sm font-black text-white"
              >
                Apply filters
              </button>
              <Link
                href="/admin/leads"
                className="inline-flex h-12 items-center justify-center rounded-full bg-white px-5 text-sm font-black text-[#101211] shadow-[0_12px_28px_rgba(15,23,42,0.08)] ring-1 ring-black/8"
              >
                Reset
              </Link>
            </div>
          </form>
        </Card>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="p-5">
            <p className="text-xs font-black uppercase text-black/35">
              Filtered leads
            </p>
            <p className="mt-2 text-3xl font-black">{totals.calls}</p>
          </Card>
          <Card className="p-5">
            <p className="text-xs font-black uppercase text-black/35">
              Billable minutes
            </p>
            <p className="mt-2 text-3xl font-black">
              {compactNumber(totals.minutes)}
            </p>
          </Card>
          <Card className="p-5">
            <p className="text-xs font-black uppercase text-black/35">
              Booked outcomes
            </p>
            <p className="mt-2 text-3xl font-black">{totals.booked}</p>
          </Card>
          <Card className="p-5">
            <p className="text-xs font-black uppercase text-black/35">
              Needs follow-up
            </p>
            <p className="mt-2 text-3xl font-black">{totals.followUp}</p>
          </Card>
        </div>

        <div className="mt-6 grid gap-4">
          {filtered.length > 0 ? (
            filtered.map((call) => (
              <Card key={call.id} className="p-5 sm:p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-2xl font-black leading-none">
                        {call.leadName || "Unnamed lead"}
                      </h2>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-black uppercase ${statusClass(
                          call.bookingStatus || "Not provided",
                        )}`}
                      >
                        {call.bookingStatus || "No outcome"}
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-bold text-black/45">
                      {call.businessName} • {formatDate(call.createdAt)} •{" "}
                      {compactNumber(call.billableMinutes)} min
                    </p>
                    <p className="mt-3 text-sm font-bold text-black/58">
                      {call.serviceRequested || "Service not provided"}
                    </p>
                    <p className="mt-3 line-clamp-3 max-w-3xl text-sm font-bold leading-snug text-black/52">
                      {call.transcriptSummary || "No summary provided."}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-col gap-2 sm:w-60">
                    <Link
                      href={`/admin/leads/${call.id}`}
                      className="inline-flex h-12 items-center justify-center rounded-full bg-[#101211] px-5 text-sm font-black text-white"
                    >
                      Open lead detail
                    </Link>
                    <Link
                      href={`/admin/clients/${call.clientId}`}
                      className="inline-flex h-12 items-center justify-center rounded-full bg-white px-5 text-sm font-black text-[#101211] shadow-[0_12px_28px_rgba(15,23,42,0.08)] ring-1 ring-black/8"
                    >
                      Open client
                    </Link>
                    {call.callerNumber ? (
                      <a
                        href={`tel:${call.callerNumber}`}
                        className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-black text-[#101211] shadow-[0_12px_28px_rgba(15,23,42,0.08)] ring-1 ring-black/8"
                      >
                        <PhoneCall className="size-4 text-[#34c759]" />
                        Call lead
                      </a>
                    ) : null}
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                  <div className="rounded-[1.15rem] bg-[#f4f5f4] px-4 py-3">
                    <p className="text-xs font-black uppercase text-black/35">
                      Lead phone
                    </p>
                    <p className="mt-1 font-extrabold">
                      {call.callerNumber || "Not provided"}
                    </p>
                  </div>
                  <div className="rounded-[1.15rem] bg-[#f4f5f4] px-4 py-3">
                    <p className="text-xs font-black uppercase text-black/35">
                      Client status
                    </p>
                    <p className="mt-1 font-extrabold">
                      {call.clientCallerStatus.replaceAll("_", " ")}
                    </p>
                  </div>
                  <div className="rounded-[1.15rem] bg-[#f4f5f4] px-4 py-3">
                    <p className="text-xs font-black uppercase text-black/35">
                      Billing
                    </p>
                    <p className="mt-1 font-extrabold">
                      {call.clientBillingStatus.replaceAll("_", " ")}
                    </p>
                  </div>
                  <div className="rounded-[1.15rem] bg-[#f4f5f4] px-4 py-3">
                    <p className="text-xs font-black uppercase text-black/35">
                      Call status
                    </p>
                    <p className="mt-1 font-extrabold">
                      {call.callStatus || "Not provided"}
                    </p>
                  </div>
                  <div className="rounded-[1.15rem] bg-[#f4f5f4] px-4 py-3">
                    <p className="text-xs font-black uppercase text-black/35">
                      External call ID
                    </p>
                    <p className="mt-1 break-all font-extrabold">
                      {call.externalCallId}
                    </p>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-8 text-center">
              <h2 className="text-3xl font-black">No leads found.</h2>
              <p className="mx-auto mt-3 max-w-xl font-bold leading-snug text-black/52">
                Completed call webhooks will appear here after they hit
                `/api/webhooks/client-call`. Try widening the filters if you
                expected results.
              </p>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}
