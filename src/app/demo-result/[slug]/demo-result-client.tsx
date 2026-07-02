"use client";

import { motion } from "framer-motion";
import { CalendarClock, Check, Mail, PhoneCall, Play, User } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Wordmark } from "@/components/wordmark";
import type { DemoCall } from "@/lib/demo-calls";

const demoPhone = "+12137145090";

function Field({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div className="rounded-[1.25rem] bg-[#f4f5f4] px-4 py-3">
      <p className="text-xs font-black uppercase text-black/35">{label}</p>
      <p className="mt-1 font-extrabold leading-snug text-[#101211]">
        {value || "Not provided"}
      </p>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function TranscriptCard({ transcript }: { transcript?: string | null }) {
  const [open, setOpen] = useState(false);
  const text = transcript || "No transcript was captured for this demo call.";
  const isLong = text.length > 360;
  const visible = !isLong || open ? text : `${text.slice(0, 360)}...`;

  return (
    <Card className="p-5 sm:p-7">
      <h2 className="text-2xl font-black">Transcript</h2>
      <p className="mt-4 whitespace-pre-wrap rounded-[1.5rem] bg-[#f4f5f4] p-4 text-sm font-semibold leading-relaxed text-black/62">
        {visible}
      </p>
      {isLong ? (
        <Button
          type="button"
          variant="secondary"
          className="mt-4"
          onClick={() => setOpen((current) => !current)}
        >
          {open ? "Hide Full Transcript" : "Show Full Transcript"}
        </Button>
      ) : null}
    </Card>
  );
}

export function DemoResultClient({ call }: { call: DemoCall }) {
  const fields = [
    ["Caller name", call.callerName],
    ["Phone", call.callerPhone],
    ["Email", call.callerEmail],
    ["Caller type", call.callerType],
    ["Service requested", call.serviceRequested],
    ["Location", call.location],
    ["Timeline", call.timeline],
    ["Add-ons", call.addOns],
    ["Preferred contact", call.preferredContactMethod],
    ["Call date/time", formatDate(call.createdAt)],
  ] as const;

  return (
    <main className="min-h-screen bg-[#f4f5f4] px-4 py-5 text-[#101211] sm:px-8 sm:py-8">
      <div className="mx-auto max-w-5xl">
        <motion.div
          role="banner"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="rounded-[2.4rem] bg-[#34C759] p-5 text-white shadow-[0_24px_70px_rgba(52,199,89,0.26)] sm:p-8"
        >
          <div className="flex items-center justify-between gap-4">
            <Wordmark variant="white" />
            <div className="grid size-12 place-items-center rounded-full bg-white text-[#34C759]">
              <Check className="size-6" strokeWidth={3} />
            </div>
          </div>
          <p className="mt-12 text-sm font-black uppercase text-white/70">
            Lead Captured
          </p>
          <h1 className="mt-3 max-w-3xl text-5xl font-black leading-[0.94] sm:text-7xl">
            This is what your business would receive.
          </h1>
          <p className="mt-5 max-w-xl text-xl font-extrabold leading-snug text-white/78">
            After a missed or after-hours call, First Ring turns the conversation
            into a lead you can follow up.
          </p>
        </motion.div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.06 }}
          >
            <Card className="p-5 sm:p-7">
              <div className="flex items-center gap-3">
                <div className="grid size-12 place-items-center rounded-[1.1rem] bg-[#34C759] text-white">
                  <User className="size-5" />
                </div>
                <div>
                  <p className="text-sm font-black text-black/38">Main lead</p>
                  <h2 className="text-3xl font-black">{call.callerName}</h2>
                </div>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {fields.map(([label, value]) => (
                  <Field key={label} label={label} value={value} />
                ))}
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.12 }}
            className="grid gap-5"
          >
            <Card className="p-5 sm:p-7">
              <h2 className="text-2xl font-black">Summary</h2>
              <p className="mt-4 text-lg font-bold leading-snug text-black/62">
                {call.summary}
              </p>
            </Card>

            <Card className="p-5 sm:p-7">
              <div className="flex items-center gap-3">
                <div className="grid size-11 place-items-center rounded-[1rem] bg-[#34C759] text-white">
                  <Mail className="size-5" />
                </div>
                <h2 className="text-2xl font-black">
                  Example Email Sent to Owner
                </h2>
              </div>
              <div className="mt-5 rounded-[1.5rem] bg-[#f4f5f4] p-4 text-sm font-semibold leading-relaxed text-black/66">
                <p>
                  <strong>Subject:</strong> New First Ring Lead:{" "}
                  {call.serviceRequested}
                </p>
                <br />
                <p>New lead captured by First Ring.</p>
                <br />
                <p>Customer: {call.callerName}</p>
                <p>Phone: {call.callerPhone || "Not provided"}</p>
                <p>Email: {call.callerEmail || "Not provided"}</p>
                <p>Service: {call.serviceRequested}</p>
                <p>Location: {call.location}</p>
                <p>Timeline: {call.timeline}</p>
                <p>Add-ons: {call.addOns || "Not provided"}</p>
                <p>
                  Preferred Contact:{" "}
                  {call.preferredContactMethod || "Not provided"}
                </p>
                <br />
                <p>Summary: {call.summary}</p>
                <br />
                <p className="font-black">
                  First Ring captured this lead before they called the next
                  company.
                </p>
              </div>
            </Card>
          </motion.div>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.7fr]">
          <TranscriptCard transcript={call.transcript} />
          <Card className="p-5 sm:p-7">
            <div className="grid size-12 place-items-center rounded-[1.1rem] bg-[#34C759] text-white">
              <CalendarClock className="size-5" />
            </div>
            <h2 className="mt-5 text-2xl font-black">Recording</h2>
            {call.recordingUrl ? (
              <Button asChild className="mt-5">
                <a href={call.recordingUrl} target="_blank" rel="noreferrer">
                  <Play className="size-4" />
                  Listen to Demo Call
                </a>
              </Button>
            ) : (
              <p className="mt-4 font-bold leading-snug text-black/52">
                No recording link was included with this call.
              </p>
            )}
          </Card>
        </div>

        <section className="mt-5 rounded-[2.4rem] bg-[#34C759] p-6 text-center text-white shadow-[0_24px_70px_rgba(52,199,89,0.24)] sm:p-10">
          <p className="text-sm font-black uppercase text-white/70">
            First Ring Plans
          </p>
          <h2 className="mx-auto mt-4 max-w-3xl text-5xl font-black leading-[0.94]">
            Your next customer might call tonight.
          </h2>
          <p className="mt-4 text-xl font-extrabold text-white/78">
            First Ring answers before they leave.
          </p>
          <p className="mt-5 text-2xl font-black">
            Plans start at $29/month
          </p>
          <p className="text-sm font-bold text-white/70">
            Starter, Basic, and Growth options available.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild variant="secondary" size="lg">
              <Link href="/signup">Choose a Plan</Link>
            </Button>
            <Button asChild size="lg" className="bg-white/18 ring-1 ring-white/25">
              <a href={`tel:${demoPhone}`}>
                <PhoneCall className="size-5" />
                Call Demo Again
              </a>
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
}
