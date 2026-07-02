import { CheckCircle2, ExternalLink, PhoneCall, Settings2 } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Wordmark } from "@/components/wordmark";
import { requireAdminAccess } from "@/lib/admin-auth";
import { listClients, type Client } from "@/lib/usage";

export const dynamic = "force-dynamic";

function statusClass(status: string) {
  if (status === "active") {
    return "bg-[#34c759]/12 text-[#167a31]";
  }

  if (status === "past_due" || status === "unpaid") {
    return "bg-yellow-100 text-yellow-800";
  }

  if (status === "canceled" || status === "incomplete_expired") {
    return "bg-red-100 text-red-700";
  }

  return "bg-black/6 text-black/55";
}

function callerStatusClass(status: string) {
  if (status === "live") {
    return "bg-[#34c759]/12 text-[#167a31]";
  }

  if (status === "building" || status === "testing") {
    return "bg-yellow-100 text-yellow-800";
  }

  return "bg-black/6 text-black/55";
}

function ClientCard({ client }: { client: Client }) {
  return (
    <Card className="p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-3xl font-black leading-none">
              {client.businessName}
            </h2>
            <span
              className={`rounded-full px-3 py-1 text-xs font-black uppercase ${statusClass(client.billingStatus)}`}
            >
              {client.billingStatus}
            </span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-black uppercase ${callerStatusClass(client.callerStatus)}`}
            >
              {client.callerStatus.replaceAll("_", " ")}
            </span>
          </div>
          <p className="mt-2 text-sm font-bold text-black/48">
            {client.planName} - ${client.monthlyPrice}/mo -{" "}
            {client.includedMinutes} included minutes
          </p>
          <p className="mt-1 text-sm font-bold text-black/48">
            {client.ownerName || "No owner name"} -{" "}
            {client.notificationEmail || "No email"}
          </p>
          {client.websiteUrl ? (
            <a
              href={client.websiteUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-sm font-black text-[#34c759]"
            >
              Website
              <ExternalLink className="size-3.5" />
            </a>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:w-52">
          <Link
            href={`/admin/clients/${client.id}`}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#101211] px-5 text-sm font-black text-white"
          >
            <Settings2 className="size-4" />
            Set Up Caller
          </Link>
          {client.callerPhoneNumber ? (
            <a
              href={`tel:${client.callerPhoneNumber}`}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-black text-[#101211] shadow-[0_12px_28px_rgba(15,23,42,0.08)] ring-1 ring-black/8"
            >
              <PhoneCall className="size-4 text-[#34c759]" />
              {client.callerPhoneNumber}
            </a>
          ) : null}
        </div>
      </div>
    </Card>
  );
}

export default async function AdminClientsPage() {
  await requireAdminAccess();
  const clients = await listClients();

  return (
    <main className="min-h-screen bg-[#f4f5f4] px-4 py-6 text-[#101211] sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Wordmark />
            <h1 className="mt-8 text-5xl font-black leading-none">
              Clients
            </h1>
            <p className="mt-4 max-w-2xl text-lg font-bold leading-snug text-black/52">
              Paid customers appear here after checkout. Use this to see billing
              status, copy their client ID, and enter the caller details after
              you build them.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
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

        <div className="mt-8 grid gap-4">
          {clients.length > 0 ? (
            clients.map((client) => (
              <ClientCard key={client.id} client={client} />
            ))
          ) : (
            <Card className="p-8 text-center">
              <div className="mx-auto grid size-14 place-items-center rounded-[1.3rem] bg-[#34c759] text-white">
                <CheckCircle2 className="size-6" />
              </div>
              <h2 className="mt-6 text-3xl font-black">No clients yet.</h2>
              <p className="mx-auto mt-3 max-w-xl font-bold leading-snug text-black/52">
                Once someone pays through Stripe Checkout, they will appear here
                automatically.
              </p>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}
