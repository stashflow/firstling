"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  Check,
  CreditCard,
  Loader2,
  PhoneCall,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Wordmark } from "@/components/wordmark";

const demoPhone = "+12137145090";

const plans = [
  {
    id: "starter",
    name: "Starter",
    price: "$29/mo",
    minutes: "50 AI minutes",
    extra: "$0.20-$0.25/min extra",
    note: "Good for tiny businesses/testing",
  },
  {
    id: "basic",
    name: "Basic",
    price: "$49/mo",
    minutes: "100 AI minutes",
    extra: "$0.20/min extra",
    note: "Best for most small exterior cleaning businesses",
  },
  {
    id: "growth",
    name: "Growth",
    price: "$99/mo",
    minutes: "300 AI minutes",
    extra: "$0.18-$0.20/min extra",
    note: "For busier teams with more call volume",
  },
] as const;

type PlanId = (typeof plans)[number]["id"];

export default function SignupPage() {
  const [businessName, setBusinessName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [plan, setPlan] = useState<PlanId>("starter");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");
  const selectedPlan = plans.find((item) => item.id === plan) || plans[0];

  useEffect(() => {
    const requestedPlan = new URLSearchParams(window.location.search).get(
      "plan",
    );
    const matchedPlan = plans.find((item) => item.id === requestedPlan);

    if (matchedPlan) {
      setPlan(matchedPlan.id);
    }
  }, []);

  async function startCheckout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setError("");

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ businessName, ownerName, email, phone, plan }),
      });
      const result = (await response.json()) as {
        success?: boolean;
        url?: string;
        error?: string;
      };

      if (!response.ok || !result.success || !result.url) {
        throw new Error(result.error || "Unable to start checkout.");
      }

      window.location.href = result.url;
    } catch (checkoutError) {
      setStatus("error");
      setError(
        checkoutError instanceof Error
          ? checkoutError.message
          : "Unable to start checkout.",
      );
    }
  }

  return (
    <main className="min-h-screen bg-[#f4f5f4] px-4 py-5 text-[#101211] sm:px-8 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-center justify-between gap-4">
          <Wordmark />
          <Button asChild variant="secondary">
            <Link href="/">
              <ArrowLeft className="size-4" />
              Back
            </Link>
          </Button>
        </header>

        <section className="grid gap-6 py-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-start lg:py-16">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
          >
            <p className="text-sm font-black uppercase text-[#34c759]">
              Plans
            </p>
            <h1 className="mt-4 max-w-2xl text-5xl font-black leading-[0.93] sm:text-7xl">
              Start catching missed calls.
            </h1>
            <p className="mt-5 max-w-xl text-xl font-bold leading-snug text-black/58">
              Get First Ring set up for your business, then send missed and
              after-hours calls to your receptionist number.
            </p>

            <Card className="mt-7 overflow-hidden">
              <div className="bg-[#101211] p-7 text-white">
                <p className="text-sm font-black uppercase text-[#34c759]">
                  Selected plan
                </p>
                <div className="mt-5 flex flex-wrap items-end gap-x-3 gap-y-1">
                  <span className="text-5xl font-black">
                    {selectedPlan.price}
                  </span>
                  <span className="pb-1 text-2xl font-black text-white/62">
                    {selectedPlan.name}
                  </span>
                </div>
              </div>
              <div className="grid gap-3 p-6">
                {[selectedPlan.minutes, selectedPlan.extra, selectedPlan.note].map(
                  (item) => (
                    <div key={item} className="flex items-center gap-3">
                      <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#34c759] text-white">
                        <Check className="size-4" strokeWidth={3} />
                      </span>
                      <span className="font-extrabold text-black/70">
                        {item}
                      </span>
                    </div>
                  ),
                )}
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08 }}
          >
            <Card className="p-5 sm:p-7">
              <div className="flex items-center gap-3">
                <div className="grid size-12 place-items-center rounded-[1.1rem] bg-[#34c759] text-white">
                  <CreditCard className="size-5" />
                </div>
                <div>
                  <p className="text-sm font-black text-black/38">
                    Secure checkout
                  </p>
                  <h2 className="text-3xl font-black">Claim your spot</h2>
                </div>
              </div>

              <form onSubmit={startCheckout} className="mt-7 grid gap-4">
                <div className="grid gap-2">
                  <span className="text-sm font-black text-black/45">
                    Choose plan
                  </span>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {plans.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setPlan(item.id)}
                        className={`rounded-[1.2rem] border p-4 text-left transition ${
                          plan === item.id
                            ? "border-[#101211] bg-[#101211] text-white shadow-[0_14px_34px_rgba(15,23,42,0.18)]"
                            : "border-black/8 bg-white text-[#101211] hover:border-[#34c759]/60"
                        }`}
                      >
                        <span className="block text-sm font-black uppercase opacity-60">
                          {item.name}
                        </span>
                        <span className="mt-2 block text-2xl font-black">
                          {item.price}
                        </span>
                        <span className="mt-2 block text-xs font-bold leading-snug opacity-62">
                          {item.minutes}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <label className="grid gap-2">
                  <span className="text-sm font-black text-black/45">
                    Business name
                  </span>
                  <input
                    required
                    value={businessName}
                    onChange={(event) => setBusinessName(event.target.value)}
                    placeholder="BrightSide Exterior Cleaning"
                    className="h-14 rounded-[1.2rem] border border-black/8 bg-white px-4 text-base font-bold outline-none transition placeholder:text-black/24 focus:border-[#34c759] focus:ring-4 focus:ring-[#34c759]/12"
                  />
                </label>
                <label className="grid gap-2">
                  <span className="text-sm font-black text-black/45">
                    Your name
                  </span>
                  <input
                    required
                    value={ownerName}
                    onChange={(event) => setOwnerName(event.target.value)}
                    placeholder="Emerson"
                    className="h-14 rounded-[1.2rem] border border-black/8 bg-white px-4 text-base font-bold outline-none transition placeholder:text-black/24 focus:border-[#34c759] focus:ring-4 focus:ring-[#34c759]/12"
                  />
                </label>
                <label className="grid gap-2">
                  <span className="text-sm font-black text-black/45">
                    Email
                  </span>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="owner@example.com"
                    className="h-14 rounded-[1.2rem] border border-black/8 bg-white px-4 text-base font-bold outline-none transition placeholder:text-black/24 focus:border-[#34c759] focus:ring-4 focus:ring-[#34c759]/12"
                  />
                </label>
                <label className="grid gap-2">
                  <span className="text-sm font-black text-black/45">
                    Phone
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="(555) 123-4567"
                    className="h-14 rounded-[1.2rem] border border-black/8 bg-white px-4 text-base font-bold outline-none transition placeholder:text-black/24 focus:border-[#34c759] focus:ring-4 focus:ring-[#34c759]/12"
                  />
                </label>

                {status === "error" ? (
                  <p className="rounded-[1rem] bg-red-50 px-4 py-3 text-sm font-black text-red-700">
                    {error}
                  </p>
                ) : null}

                <Button
                  type="submit"
                  size="lg"
                  disabled={status === "loading"}
                  className="mt-2 h-14"
                >
                  {status === "loading" ? (
                    <>
                      <Loader2 className="size-5 animate-spin" />
                      Opening Stripe
                    </>
                  ) : (
                    <>
                      Start {selectedPlan.name} at {selectedPlan.price}
                      <CreditCard className="size-5" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-2 rounded-[1rem] bg-[#f4f5f4] px-4 py-3 text-sm font-black text-black/54">
                  <ShieldCheck className="size-5 text-[#34c759]" />
                  Stripe secure payment
                </div>
                <a
                  href={`tel:${demoPhone}`}
                  className="flex items-center gap-2 rounded-[1rem] bg-[#f4f5f4] px-4 py-3 text-sm font-black text-black/54"
                >
                  <PhoneCall className="size-5 text-[#34c759]" />
                  Call demo first
                </a>
              </div>
            </Card>
          </motion.div>
        </section>
      </div>
    </main>
  );
}
