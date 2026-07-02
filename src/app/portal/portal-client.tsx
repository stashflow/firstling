"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  CreditCard,
  ExternalLink,
  LogOut,
  PhoneCall,
  Sparkles,
} from "lucide-react";
import { SignOutButton } from "@clerk/nextjs";
import type { Client, UsageCall, UsageDashboardRow } from "@/lib/usage";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

function compact(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 1,
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function statusCopy(client: Client) {
  if (client.billingStatus !== "active") {
    return {
      label: "Billing needs attention",
      title: "Your caller is paused.",
      body: "Open billing to update your payment method. Once billing is active, your caller can keep answering.",
    };
  }

  if (client.callerStatus === "live" && client.callerPhoneNumber) {
    return {
      label: "Caller live",
      title: "Your caller is live.",
      body: "Forward missed and after-hours calls to this number. New leads will show up here and arrive by email.",
    };
  }

  return {
    label: "Being built",
    title: "Your caller is being set up.",
    body: "You are in good shape. We have your business details and will email you when your caller number is ready.",
  };
}

function BillingButton() {
  async function openBilling() {
    const response = await fetch("/api/billing/portal", { method: "POST" });
    const result = (await response.json()) as { url?: string; error?: string };

    if (result.url) {
      window.location.href = result.url;
    } else {
      alert(result.error || "Billing is not ready yet.");
    }
  }

  return (
    <Button onClick={openBilling} variant="secondary" className="h-12">
      <CreditCard className="size-5" />
      Manage billing
    </Button>
  );
}

export function PortalClient({
  client,
  usage,
  calls,
}: {
  client: Client;
  usage: UsageDashboardRow | null;
  calls: UsageCall[];
}) {
  const status = statusCopy(client);
  const totalMinutes = usage?.totalMinutes || 0;
  const includedMinutes = client.includedMinutes || 0;
  const usedPercent =
    includedMinutes > 0 ? Math.min(100, (totalMinutes / includedMinutes) * 100) : 0;

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_0.72fr]">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="grid gap-5"
      >
        <Card className="overflow-hidden">
          <div className="bg-[#101211] p-6 text-white sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <span className="rounded-full bg-[#34c759] px-4 py-2 text-xs font-black uppercase text-white">
                {status.label}
              </span>
              <SignOutButton>
                <button className="grid size-11 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/18">
                  <LogOut className="size-5" />
                </button>
              </SignOutButton>
            </div>
            <h1 className="mt-8 max-w-xl text-5xl font-black leading-[0.95] sm:text-7xl">
              {status.title}
            </h1>
            <p className="mt-5 max-w-xl text-lg font-bold leading-snug text-white/62">
              {status.body}
            </p>
          </div>

          <div className="grid gap-4 p-5 sm:p-6">
            {client.callerPhoneNumber ? (
              <motion.div
                initial={{ scale: 0.96, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.15, type: "spring", stiffness: 160 }}
                className="rounded-[1.5rem] bg-[#34c759] p-5 text-white shadow-[0_20px_55px_rgba(52,199,89,0.28)]"
              >
                <p className="text-sm font-black uppercase text-white/75">
                  Forward calls here
                </p>
                <a
                  href={`tel:${client.callerPhoneNumber}`}
                  className="mt-3 flex flex-wrap items-center gap-3 text-4xl font-black tracking-normal sm:text-5xl"
                >
                  {client.callerPhoneNumber}
                  <PhoneCall className="size-8" />
                </a>
              </motion.div>
            ) : (
              <div className="rounded-[1.5rem] bg-[#f4f5f4] p-5">
                <p className="text-sm font-black uppercase text-black/40">
                  Caller number
                </p>
                <p className="mt-2 text-3xl font-black">Coming soon</p>
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[1.25rem] bg-[#f4f5f4] p-4">
                <p className="text-xs font-black uppercase text-black/35">
                  Plan
                </p>
                <p className="mt-2 text-2xl font-black">{client.planName}</p>
              </div>
              <div className="rounded-[1.25rem] bg-[#f4f5f4] p-4">
                <p className="text-xs font-black uppercase text-black/35">
                  Billing
                </p>
                <p className="mt-2 text-2xl font-black capitalize">
                  {client.billingStatus.replaceAll("_", " ")}
                </p>
              </div>
              <div className="rounded-[1.25rem] bg-[#f4f5f4] p-4">
                <p className="text-xs font-black uppercase text-black/35">
                  Leads
                </p>
                <p className="mt-2 text-2xl font-black">{calls.length}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-black uppercase text-[#34c759]">
                This month
              </p>
              <h2 className="mt-1 text-3xl font-black">Minutes used</h2>
            </div>
            <div className="text-right">
              <p className="text-3xl font-black">
                {compact(totalMinutes)}
                <span className="text-lg text-black/35"> / {includedMinutes}</span>
              </p>
              <p className="text-sm font-black text-black/42">
                {compact(usage?.remainingMinutes || includedMinutes)} left
              </p>
            </div>
          </div>
          <div className="mt-5 h-4 overflow-hidden rounded-full bg-[#edf0ec]">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${usedPercent}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full rounded-full bg-[#34c759]"
            />
          </div>
          {(usage?.overageMinutes || 0) > 0 ? (
            <p className="mt-4 rounded-[1rem] bg-yellow-100 px-4 py-3 text-sm font-black text-yellow-900">
              You are {compact(usage?.overageMinutes || 0)} minutes over your
              included plan minutes this month.
            </p>
          ) : null}
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.08 }}
        className="grid gap-5"
      >
        <Card className="p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="grid size-12 place-items-center rounded-[1.1rem] bg-[#34c759] text-white">
              <Sparkles className="size-5" />
            </div>
            <div>
              <p className="text-sm font-black text-black/38">Your business</p>
              <h2 className="text-2xl font-black">{client.businessName}</h2>
            </div>
          </div>
          <div className="mt-5 grid gap-3">
            <BillingButton />
            {client.websiteUrl ? (
              <Button asChild variant="secondary" className="h-12">
                <a href={client.websiteUrl} target="_blank" rel="noreferrer">
                  <ExternalLink className="size-5" />
                  Website
                </a>
              </Button>
            ) : null}
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-3xl font-black">Recent leads</h2>
            <ArrowRight className="size-5 text-[#34c759]" />
          </div>
          <div className="mt-5 grid gap-3">
            {calls.length > 0 ? (
              calls.map((call, index) => (
                <motion.div
                  key={call.id}
                  initial={{ opacity: 0, x: 14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="rounded-[1.25rem] bg-[#f4f5f4] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-black">
                        {call.leadName || "New caller"}
                      </p>
                      <p className="mt-1 text-sm font-bold text-black/48">
                        {call.serviceRequested || "Service request"}
                      </p>
                    </div>
                    <p className="shrink-0 text-xs font-black text-black/35">
                      {formatDate(call.createdAt)}
                    </p>
                  </div>
                  <p className="mt-3 line-clamp-3 text-sm font-bold leading-snug text-black/55">
                    {call.transcriptSummary || "Lead captured."}
                  </p>
                </motion.div>
              ))
            ) : (
              <div className="rounded-[1.25rem] bg-[#f4f5f4] p-5">
                <p className="text-xl font-black">No leads yet.</p>
                <p className="mt-2 font-bold leading-snug text-black/50">
                  Once customers call your First Ring number, their details will
                  appear here.
                </p>
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
