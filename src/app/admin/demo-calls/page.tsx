import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { listDemoCalls } from "@/lib/demo-calls";
import { Wordmark } from "@/components/wordmark";
import { requireAdminAccess } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function AdminDemoCallsPage() {
  await requireAdminAccess();
  const calls = await listDemoCalls();

  return (
    <main className="min-h-screen bg-[#f4f5f4] px-4 py-6 text-[#101211] sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Wordmark />
            <h1 className="mt-8 text-5xl font-black leading-none">
              Demo Calls
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
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
              href="/admin/leads"
              className="inline-flex h-12 items-center justify-center rounded-full bg-white px-5 text-sm font-black text-[#101211] shadow-[0_12px_28px_rgba(15,23,42,0.08)] ring-1 ring-black/8"
            >
              Leads
            </Link>
            <p className="font-bold text-black/48">
              {calls.length} saved calls
            </p>
          </div>
        </div>

        <div className="mt-8 overflow-hidden rounded-[2rem] bg-white shadow-[0_18px_55px_rgba(15,23,42,0.08)] ring-1 ring-black/6">
          <div className="overflow-x-auto">
            <table className="min-w-[1100px] w-full text-left text-sm">
              <thead className="bg-[#101211] text-white">
                <tr>
                  {[
                    "Created date",
                    "Caller name",
                    "Phone",
                    "Email",
                    "Caller type",
                    "Service requested",
                    "Location",
                    "Timeline",
                    "Result URL",
                    "Recording URL",
                  ].map((heading) => (
                    <th key={heading} className="px-4 py-4 font-black">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {calls.map((call) => (
                  <tr key={call.id} className="border-t border-black/6">
                    <td className="px-4 py-4 font-bold">
                      <Link
                        href={`/admin/demo-calls/${call.id}`}
                        className="text-[#34C759]"
                      >
                        {formatDate(call.createdAt)}
                      </Link>
                    </td>
                    <td className="px-4 py-4 font-bold">{call.callerName}</td>
                    <td className="px-4 py-4">{call.callerPhone || "-"}</td>
                    <td className="px-4 py-4">{call.callerEmail || "-"}</td>
                    <td className="px-4 py-4">{call.callerType || "-"}</td>
                    <td className="px-4 py-4">{call.serviceRequested}</td>
                    <td className="px-4 py-4">{call.location}</td>
                    <td className="px-4 py-4">{call.timeline}</td>
                    <td className="px-4 py-4">
                      {call.resultUrl ? (
                        <a
                          href={call.resultUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 font-bold text-[#34C759]"
                        >
                          Open
                          <ExternalLink className="size-3.5" />
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-4 py-4">
                      {call.recordingUrl ? (
                        <a
                          href={call.recordingUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 font-bold text-[#34C759]"
                        >
                          Listen
                          <ExternalLink className="size-3.5" />
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
