import { notFound } from "next/navigation";
import { getDemoCallById } from "@/lib/demo-calls";
import { Wordmark } from "@/components/wordmark";
import { requireAdminAccess } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function AdminField({
  label,
  value,
}: {
  label: string;
  value?: string | boolean | null;
}) {
  return (
    <div className="rounded-[1.25rem] bg-white p-4 ring-1 ring-black/6">
      <p className="text-xs font-black uppercase text-black/35">{label}</p>
      <p className="mt-1 whitespace-pre-wrap break-words font-bold leading-snug text-[#101211]">
        {value === undefined || value === null || value === "" ? "-" : String(value)}
      </p>
    </div>
  );
}

export default async function AdminDemoCallDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminAccess();
  const { id } = await params;
  const call = await getDemoCallById(id);

  if (!call) {
    notFound();
  }

  const fields = [
    ["ID", call.id],
    ["Call ID", call.callId],
    ["Result slug", call.resultSlug],
    ["Created date", formatDate(call.createdAt)],
    ["Caller name", call.callerName],
    ["Phone", call.callerPhone],
    ["Email", call.callerEmail],
    ["Caller type", call.callerType],
    ["Service requested", call.serviceRequested],
    ["Location", call.location],
    ["Timeline", call.timeline],
    ["Add-ons", call.addOns],
    ["Business name", call.businessName],
    ["Owner name", call.ownerName],
    ["Business services", call.businessServices],
    ["Preferred contact method", call.preferredContactMethod],
    ["Recording URL", call.recordingUrl],
    ["Result URL", call.resultUrl],
    ["Email sent", call.emailSent],
    ["SMS sent", call.smsSent],
  ] as const;

  return (
    <main className="min-h-screen bg-[#f4f5f4] px-4 py-6 text-[#101211] sm:px-8">
      <div className="mx-auto max-w-5xl">
        <Wordmark />
        <h1 className="mt-8 text-5xl font-black leading-none">
          Demo Call Detail
        </h1>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {fields.map(([label, value]) => (
            <AdminField key={label} label={label} value={value} />
          ))}
        </div>

        <div className="mt-3 grid gap-3">
          <AdminField label="Summary" value={call.summary} />
          <AdminField label="Transcript" value={call.transcript} />
          <div className="rounded-[1.25rem] bg-[#101211] p-4 text-white">
            <p className="text-xs font-black uppercase text-white/45">
              Raw payload
            </p>
            <pre className="mt-3 max-h-[32rem] overflow-auto whitespace-pre-wrap break-words text-xs leading-relaxed text-white/78">
              {JSON.stringify(call.rawPayload, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </main>
  );
}
