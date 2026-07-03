import Link from "next/link";
import { ArrowRight, Clock3, LayoutDashboard, Mic2, PhoneCall, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Wordmark } from "@/components/wordmark";
import { requireAdminAccess } from "@/lib/admin-auth";
import { listAdminClientCalls, listClients, listUsageDashboard } from "@/lib/usage";

export const dynamic = "force-dynamic";

function compactNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 1,
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function AdminHomePage() {
  await requireAdminAccess();
  const [clients, usage, leads] = await Promise.all([
    listClients(),
    listUsageDashboard(),
    listAdminClientCalls(12),
  ]);

  const liveClients = clients.filter((client) => client.callerStatus === "live").length;
  const setupQueue = clients.filter((client) => client.callerStatus !== "live").length;
  const monthlyCalls = usage.reduce((sum, row) => sum + row.totalCalls, 0);
  const monthlyMinutes = usage.reduce((sum, row) => sum + row.totalMinutes, 0);

  const sections = [
    {
      href: "/admin/clients",
      title: "Clients",
      text: "Payments, setup status, caller numbers, and launch notes.",
      Icon: Users,
    },
    {
      href: "/admin/leads",
      title: "Leads",
      text: "Every captured customer lead with search and detail views.",
      Icon: Mic2,
    },
    {
      href: "/admin/usage",
      title: "Usage",
      text: "Minutes, overages, margin, and profitability by client.",
      Icon: LayoutDashboard,
    },
    {
      href: "/admin/demo-calls",
      title: "Demo calls",
      text: "Saved demo traffic, result links, and recordings.",
      Icon: PhoneCall,
    },
  ];

  return (
    <main className="min-h-screen bg-[#f4f5f4] px-4 py-6 text-[#101211] sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Wordmark />
            <p className="mt-8 text-sm font-black uppercase text-[#34c759]">
              Admin
            </p>
            <h1 className="mt-2 text-5xl font-black leading-none">
              First Ring Ops
            </h1>
            <p className="mt-4 max-w-2xl text-lg font-bold leading-snug text-black/52">
              One place to launch callers, watch lead flow, and keep revenue ops
              moving.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="p-5">
            <p className="text-xs font-black uppercase text-black/35">
              Total clients
            </p>
            <p className="mt-2 text-3xl font-black">{clients.length}</p>
          </Card>
          <Card className="p-5">
            <p className="text-xs font-black uppercase text-black/35">
              Live callers
            </p>
            <p className="mt-2 text-3xl font-black">{liveClients}</p>
          </Card>
          <Card className="p-5">
            <p className="text-xs font-black uppercase text-black/35">
              Setup queue
            </p>
            <p className="mt-2 text-3xl font-black">{setupQueue}</p>
          </Card>
          <Card className="p-5">
            <p className="text-xs font-black uppercase text-black/35">
              Calls this month
            </p>
            <p className="mt-2 text-3xl font-black">{compactNumber(monthlyCalls)}</p>
            <p className="mt-1 text-sm font-bold text-black/45">
              {compactNumber(monthlyMinutes)} billable minutes
            </p>
          </Card>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {sections.map(({ href, title, text, Icon }) => (
            <Link key={title} href={href}>
              <Card className="h-full p-6 transition hover:-translate-y-0.5">
                <div className="grid size-12 place-items-center rounded-[1.1rem] bg-[#34c759] text-white">
                  <Icon className="size-5" />
                </div>
                <h2 className="mt-6 text-3xl font-black">{title}</h2>
                <p className="mt-2 max-w-lg text-base font-bold leading-snug text-black/52">
                  {text}
                </p>
                <div className="mt-5 inline-flex items-center gap-2 text-sm font-black text-[#34c759]">
                  Open
                  <ArrowRight className="size-4" />
                </div>
              </Card>
            </Link>
          ))}
        </div>

        <Card className="mt-6 p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="grid size-12 place-items-center rounded-[1.1rem] bg-[#101211] text-white">
              <Clock3 className="size-5" />
            </div>
            <div>
              <h2 className="text-2xl font-black">Latest captured leads</h2>
              <p className="text-sm font-bold text-black/45">
                Quick pulse check before you dive into the full lead inbox.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3">
            {leads.length > 0 ? (
              leads.slice(0, 6).map((lead) => (
                <div
                  key={lead.id}
                  className="rounded-[1.2rem] bg-[#f4f5f4] px-4 py-4 sm:px-5"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-black">
                        {lead.leadName || "Unnamed lead"} • {lead.businessName}
                      </p>
                      <p className="mt-1 text-sm font-bold text-black/48">
                        {lead.serviceRequested || "Service not provided"}
                      </p>
                    </div>
                    <p className="text-xs font-black uppercase text-black/35">
                      {formatDate(lead.createdAt)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[1.2rem] bg-[#f4f5f4] px-5 py-6">
                <p className="text-xl font-black">No leads yet.</p>
                <p className="mt-2 font-bold leading-snug text-black/50">
                  Once completed client-call webhooks start arriving, leads will
                  show up here and in `/admin/leads`.
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </main>
  );
}
