import { notFound } from "next/navigation";
import Link from "next/link";
import { ExternalLink, PhoneCall } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Wordmark } from "@/components/wordmark";
import { requireAdminAccess } from "@/lib/admin-auth";
import { getAdminClientCallById } from "@/lib/usage";

export const dynamic = "force-dynamic";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function currency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function Field({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div className="rounded-[1.15rem] bg-[#f4f5f4] px-4 py-3">
      <p className="text-xs font-black uppercase text-black/35">{label}</p>
      <p className="mt-1 break-words font-extrabold leading-snug text-[#101211]">
        {value === undefined || value === null || value === "" ? "Not set" : value}
      </p>
    </div>
  );
}

export default async function AdminLeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminAccess();
  const { id } = await params;
  const call = await getAdminClientCallById(id);

  if (!call) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#f4f5f4] px-4 py-6 text-[#101211] sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Wordmark />
            <h1 className="mt-8 text-5xl font-black leading-none">
              Lead Detail
            </h1>
            <p className="mt-4 max-w-2xl text-lg font-bold leading-snug text-black/52">
              Review the captured details, open the owning client record, and
              inspect the raw webhook payload when something looks off.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/leads"
              className="inline-flex h-12 items-center justify-center rounded-full bg-white px-5 text-sm font-black text-[#101211] shadow-[0_12px_28px_rgba(15,23,42,0.08)] ring-1 ring-black/8"
            >
              Back to leads
            </Link>
            <Link
              href={`/admin/clients/${call.clientId}`}
              className="inline-flex h-12 items-center justify-center rounded-full bg-[#101211] px-5 text-sm font-black text-white"
            >
              Open client
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_0.86fr]">
          <div className="grid gap-5">
            <Card className="p-5 sm:p-6">
              <h2 className="text-2xl font-black">Lead summary</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <Field label="Lead name" value={call.leadName} />
                <Field label="Lead phone" value={call.callerNumber} />
                <Field label="Service requested" value={call.serviceRequested} />
                <Field label="Booking outcome" value={call.bookingStatus} />
                <Field label="Call status" value={call.callStatus} />
                <Field label="Created at" value={formatDate(call.createdAt)} />
                <Field label="Billable minutes" value={call.billableMinutes} />
                <Field
                  label="Estimated call cost"
                  value={currency(call.estimatedCost)}
                />
                <Field label="Lead ID" value={call.id} />
                <Field label="External call ID" value={call.externalCallId} />
              </div>

              <div className="mt-5 rounded-[1.25rem] bg-[#101211] p-5 text-white">
                <p className="text-xs font-black uppercase text-white/42">
                  Transcript summary
                </p>
                <p className="mt-3 whitespace-pre-wrap font-bold leading-relaxed text-white/82">
                  {call.transcriptSummary || "Not provided"}
                </p>
              </div>
            </Card>

            <Card className="p-5 sm:p-6">
              <h2 className="text-2xl font-black">Raw webhook payload</h2>
              <p className="mt-2 text-sm font-bold leading-snug text-black/48">
                Use this when a provider field maps incorrectly or a lead looks
                incomplete.
              </p>
              <pre className="mt-5 max-h-[36rem] overflow-auto rounded-[1.25rem] bg-[#101211] p-4 text-xs leading-relaxed text-white/78">
                {JSON.stringify(call.rawPayload || {}, null, 2)}
              </pre>
            </Card>
          </div>

          <div className="grid gap-5">
            <Card className="p-5 sm:p-6">
              <h2 className="text-2xl font-black">Owning client</h2>
              <div className="mt-5 grid gap-3">
                <Field label="Business" value={call.businessName} />
                <Field label="Owner" value={call.ownerName} />
                <Field label="Notification email" value={call.notificationEmail} />
                <Field
                  label="Caller status"
                  value={call.clientCallerStatus.replaceAll("_", " ")}
                />
                <Field
                  label="Billing status"
                  value={call.clientBillingStatus.replaceAll("_", " ")}
                />
                <Field
                  label="Forwarding number"
                  value={call.clientCallerPhoneNumber}
                />
              </div>

              <div className="mt-5 flex flex-col gap-3">
                {call.callerNumber ? (
                  <a
                    href={`tel:${call.callerNumber}`}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#34c759] px-5 text-sm font-black text-white"
                  >
                    <PhoneCall className="size-4" />
                    Call lead
                  </a>
                ) : null}
                <Link
                  href={`/admin/clients/${call.clientId}`}
                  className="inline-flex h-12 items-center justify-center rounded-full bg-white px-5 text-sm font-black text-[#101211] shadow-[0_12px_28px_rgba(15,23,42,0.08)] ring-1 ring-black/8"
                >
                  Open client setup
                </Link>
                <Link
                  href={`/portal`}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-black text-[#101211] shadow-[0_12px_28px_rgba(15,23,42,0.08)] ring-1 ring-black/8"
                >
                  Portal
                  <ExternalLink className="size-4" />
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
