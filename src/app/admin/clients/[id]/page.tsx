import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { ArrowLeft, Copy, ExternalLink, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Wordmark } from "@/components/wordmark";
import { requireAdminAccess } from "@/lib/admin-auth";
import {
  getClientById,
  updateClientCallerSetup,
  type Client,
} from "@/lib/usage";

export const dynamic = "force-dynamic";

function formatDate(value?: string | null) {
  if (!value) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
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

function preferenceRows(client: Client): Array<[string, string | null]> {
  const preferences =
    client.callerPreferences &&
    typeof client.callerPreferences === "object" &&
    !Array.isArray(client.callerPreferences)
      ? (client.callerPreferences as Record<string, unknown>)
      : {};

  const rows: Array<[string, unknown]> = [
    ["Industry", preferences.industry],
    ["Tone", preferences.callerTone],
    ["Services before close", preferences.serviceMentionStyle],
    ["Booking", preferences.bookingPreference],
    ["Handoff", preferences.handoffPreference],
    ["Alerts", preferences.alertPreference],
    ["Website answers", preferences.websiteUsage],
    ["Perfect outcome", preferences.outcomeGoal],
    ["Notes", preferences.extraNotes],
  ];

  return rows.map(([label, value]) => [
    label,
    typeof value === "string" ? value : null,
  ]);
}

async function saveCallerSetup(formData: FormData) {
  "use server";

  const id = String(formData.get("id") || "");
  const callerPhoneNumber = String(formData.get("callerPhoneNumber") || "").trim();
  const callerStatus = String(formData.get("callerStatus") || "").trim();
  const callerNotes = String(formData.get("callerNotes") || "").trim();

  if (!id) {
    notFound();
  }

  await updateClientCallerSetup(id, {
    callerPhoneNumber,
    callerStatus,
    callerNotes,
  });
  revalidatePath("/admin/clients");
  revalidatePath(`/admin/clients/${id}`);
  revalidatePath("/admin/usage");
  redirect(`/admin/clients/${id}`);
}

export default async function AdminClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminAccess();
  const { id } = await params;
  const client = await getClientById(id);

  if (!client) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#f4f5f4] px-4 py-6 text-[#101211] sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between gap-4">
          <Wordmark />
          <Button asChild variant="secondary">
            <Link href="/admin/clients">
              <ArrowLeft className="size-4" />
              Clients
            </Link>
          </Button>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <p className="text-sm font-black uppercase text-[#34c759]">
              Client setup
            </p>
            <h1 className="mt-3 text-5xl font-black leading-none">
              {client.businessName}
            </h1>
            <p className="mt-4 max-w-xl text-lg font-bold leading-snug text-black/52">
              Check payment status, copy the client ID into the caller metadata,
              then save the phone number and launch status here.
            </p>

            <Card className="mt-6 p-5 sm:p-6">
              <h2 className="text-2xl font-black">Connect the caller</h2>
              <p className="mt-2 text-sm font-bold leading-snug text-black/50">
                Put this value into the caller metadata as `clientId` so usage
                attaches to the right client.
              </p>
              <div className="mt-4 flex items-center gap-3 rounded-[1.2rem] bg-[#101211] p-4 text-white">
                <Copy className="size-5 shrink-0 text-[#34c759]" />
                <code className="break-all text-sm font-black">{client.id}</code>
              </div>
            </Card>

            <Card className="mt-5 p-5 sm:p-6">
              <h2 className="text-2xl font-black">Caller setup</h2>
              <form action={saveCallerSetup} className="mt-5 grid gap-4">
                <input type="hidden" name="id" value={client.id} />
                <label className="grid gap-2">
                  <span className="text-sm font-black text-black/45">
                    Caller phone number
                  </span>
                  <input
                    name="callerPhoneNumber"
                    defaultValue={client.callerPhoneNumber || ""}
                    placeholder="(555) 123-4567"
                    className="h-14 rounded-[1.2rem] border border-black/8 bg-white px-4 text-base font-bold outline-none transition placeholder:text-black/24 focus:border-[#34c759] focus:ring-4 focus:ring-[#34c759]/12"
                  />
                </label>
                <label className="grid gap-2">
                  <span className="text-sm font-black text-black/45">
                    Caller status
                  </span>
                  <select
                    name="callerStatus"
                    defaultValue={client.callerStatus}
                    className="h-14 rounded-[1.2rem] border border-black/8 bg-white px-4 text-base font-bold outline-none transition focus:border-[#34c759] focus:ring-4 focus:ring-[#34c759]/12"
                  >
                    <option value="needs_setup">Needs setup</option>
                    <option value="building">Building</option>
                    <option value="testing">Testing</option>
                    <option value="live">Live</option>
                    <option value="paused">Paused</option>
                  </select>
                </label>
                <label className="grid gap-2">
                  <span className="text-sm font-black text-black/45">
                    Internal notes
                  </span>
                  <textarea
                    name="callerNotes"
                    defaultValue={client.callerNotes || ""}
                    placeholder="Forwarding notes, launch checklist, numbers, or anything you need before going live."
                    className="min-h-32 resize-none rounded-[1.2rem] border border-black/8 bg-white px-4 py-3 text-base font-bold outline-none transition placeholder:text-black/24 focus:border-[#34c759] focus:ring-4 focus:ring-[#34c759]/12"
                  />
                </label>
                <Button type="submit" size="lg">
                  Save Caller Setup
                </Button>
              </form>
            </Card>
          </div>

          <div className="grid gap-5">
            <Card className="p-5 sm:p-6">
              <h2 className="text-2xl font-black">Payment</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <Field label="Billing status" value={client.billingStatus} />
                <Field label="Plan" value={client.planName} />
                <Field label="Monthly price" value={`$${client.monthlyPrice}`} />
                <Field label="Included minutes" value={client.includedMinutes} />
                <Field label="Stripe customer" value={client.stripeCustomerId} />
                <Field
                  label="Stripe subscription"
                  value={client.stripeSubscriptionId}
                />
              </div>
            </Card>

            <Card className="p-5 sm:p-6">
              <h2 className="text-2xl font-black">Customer</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <Field label="Owner" value={client.ownerName} />
                <Field label="Email" value={client.notificationEmail} />
                <Field label="Phone" value={client.notificationPhone} />
                <Field label="Caller status" value={client.callerStatus} />
                <Field label="Caller live at" value={formatDate(client.callerLiveAt)} />
                <div className="rounded-[1.15rem] bg-[#f4f5f4] px-4 py-3">
                  <p className="text-xs font-black uppercase text-black/35">
                    Website
                  </p>
                  {client.websiteUrl ? (
                    <a
                      href={client.websiteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-flex items-center gap-1 font-extrabold text-[#34c759]"
                    >
                      Open website
                      <ExternalLink className="size-3.5" />
                    </a>
                  ) : (
                    <p className="mt-1 font-extrabold">Not set</p>
                  )}
                </div>
              </div>
              {client.callerPhoneNumber ? (
                <Button asChild className="mt-5">
                  <a href={`tel:${client.callerPhoneNumber}`}>
                    <PhoneCall className="size-5" />
                    Call Client Caller
                  </a>
                </Button>
              ) : null}
            </Card>

            <Card className="p-5 sm:p-6">
              <h2 className="text-2xl font-black">Requested caller behavior</h2>
              <div className="mt-5 grid gap-3">
                {preferenceRows(client).map(([label, value]) => (
                  <Field key={label} label={label} value={value} />
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
