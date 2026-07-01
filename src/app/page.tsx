"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDownRight,
  Check,
  ChevronRight,
  Clock3,
  Mail,
  Mic2,
  Phone,
  PhoneCall,
  Play,
  Sparkles,
  Volume2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Wordmark } from "@/components/wordmark";
import { cn } from "@/lib/utils";

const demoPhone = "+12137145090";
const displayDemoPhone = "(213) 714-5090";

const callStates = [
  {
    label: "Incoming after-hours call",
    title: "Driveway cleaning lead",
    detail: "$400 job at 8:30 PM",
    tone: "ring",
  },
  {
    label: "First Ring answers",
    title: "What service are you looking for?",
    detail: "One clear question at a time",
    tone: "answer",
  },
  {
    label: "Lead captured",
    title: "Name, phone, service, city, timing",
    detail: "Sent to the business owner",
    tone: "done",
  },
] as const;

const missedMoments = [
  "On a job",
  "Driving",
  "With a customer",
  "After hours",
  "Phone on silent",
];

const demoSteps = [
  "Call the demo number",
  "Pretend to be a homeowner or business owner",
  "First Ring captures the important details",
  "You receive a demo result page",
] as const;

const included = [
  "Custom business script",
  "Missed and after-hours answering",
  "Lead summary emails",
  "Customer name and contact capture",
  "Service, location, timing, and notes",
  "Basic FAQ handling",
  "100 included minutes/month",
] as const;

const pricingPlans = [
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
    note: "Best first plan for steady missed-call capture",
  },
  {
    id: "growth",
    name: "Growth",
    price: "$99/mo",
    minutes: "300 AI minutes",
    extra: "$0.18-$0.20/min extra",
    note: "For busier teams with more after-hours volume",
  },
] as const;

const resultFields = [
  ["Customer", "Sarah M."],
  ["Phone", "(404) 555-0188"],
  ["Service", "Driveway cleaning"],
  ["Location", "Marietta, GA"],
  ["Timeline", "This week"],
  ["Summary", "Customer wants driveway and walkway cleaned after work."],
] as const;

const featureCards: Array<{
  title: string;
  text: string;
  Icon: LucideIcon;
}> = [
  {
    title: "Answers",
    text: "Missed and after-hours calls before the lead leaves.",
    Icon: PhoneCall,
  },
  {
    title: "Captures",
    text: "Name, phone, service, location, timing, and notes.",
    Icon: Mic2,
  },
  {
    title: "Sends",
    text: "A clean lead summary your business can act on.",
    Icon: Mail,
  },
];

function Waveform({ active }: { active: boolean }) {
  const bars = useMemo(() => Array.from({ length: 24 }), []);

  return (
    <div className="flex h-12 items-center justify-center gap-1.5">
      {bars.map((_, index) => (
        <motion.span
          key={index}
          className="w-1.5 rounded-full bg-white/86"
          animate={{
            height: active ? [8, 14 + ((index * 9) % 30), 8] : 9,
            opacity: active ? [0.4, 1, 0.4] : 0.38,
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: index * 0.035,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

function PhoneDemo() {
  const [step, setStep] = useState(0);
  const current = callStates[step];

  useEffect(() => {
    const timer = window.setInterval(
      () => setStep((value) => (value + 1) % callStates.length),
      2400,
    );

    return () => window.clearInterval(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, rotate: -1 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ duration: 0.75 }}
      className="relative mx-auto w-full max-w-[22rem]"
    >
      <div className="absolute -inset-5 rounded-[3.4rem] bg-[#34c759]/16 blur-3xl" />
      <div className="ios-shadow relative overflow-hidden rounded-[3.05rem] border-[10px] border-[#101211] bg-[#34c759] p-5 text-white">
        <div className="mx-auto mb-7 h-7 w-28 rounded-b-3xl bg-[#101211]" />
        <div className="relative min-h-[31rem]">
          <div className="flex items-center justify-between text-xs font-black uppercase text-white/70">
            <span>8:30 PM</span>
            <Volume2 className="size-4" />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={current.label}
              initial={{ opacity: 0, y: 22, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -18, filter: "blur(8px)" }}
              transition={{ duration: 0.4 }}
              className="pt-14 text-center"
            >
              <p className="text-sm font-black uppercase text-white/68">
                {current.label}
              </p>
              <h2 className="mx-auto mt-4 max-w-[17rem] text-4xl font-black leading-[0.95]">
                {current.title}
              </h2>
              <p className="mt-4 text-lg font-extrabold text-white/78">
                {current.detail}
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="mt-10 rounded-[1.8rem] bg-white/16 p-4 ring-1 ring-white/20 backdrop-blur">
            <Waveform active={current.tone !== "done"} />
          </div>

          <div className="absolute inset-x-0 bottom-7 flex justify-center">
            <motion.div
              animate={{ scale: current.tone === "ring" ? [1, 1.06, 1] : 1 }}
              transition={{ duration: 1.05, repeat: Infinity }}
              className="grid size-16 place-items-center rounded-full bg-white text-[#34c759]"
            >
              {current.tone === "done" ? (
                <Check className="size-7" strokeWidth={3} />
              ) : (
                <Phone className="size-7" strokeWidth={3} />
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function SectionHeading({
  label,
  title,
  text,
}: {
  label?: string;
  title: string;
  text?: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      {label ? (
        <p className="mb-3 text-sm font-black uppercase text-[#34c759]">
          {label}
        </p>
      ) : null}
      <h2 className="text-4xl font-black leading-[0.96] text-[#101211] sm:text-5xl">
        {title}
      </h2>
      {text ? (
        <p className="mx-auto mt-4 max-w-xl text-lg font-bold leading-snug text-black/56">
          {text}
        </p>
      ) : null}
    </div>
  );
}

function MotionSection({
  children,
  className,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={cn("relative px-5 py-16 sm:px-8 sm:py-24", className)}
    >
      {children}
    </section>
  );
}

export default function Home() {
  const [showStickyCta, setShowStickyCta] = useState(false);

  useEffect(() => {
    const updateStickyCta = () => {
      setShowStickyCta(window.scrollY > window.innerHeight * 0.72);
    };

    updateStickyCta();
    window.addEventListener("scroll", updateStickyCta, { passive: true });

    return () => window.removeEventListener("scroll", updateStickyCta);
  }, []);

  return (
    <main className="overflow-hidden bg-[#fbfcfb] text-[#101211]">
      <header className="fixed inset-x-0 top-0 z-50 px-4 py-4">
        <nav className="mx-auto flex max-w-6xl items-center justify-between rounded-full border border-black/6 bg-white/82 px-4 py-3 shadow-[0_12px_30px_rgba(15,23,42,0.07)] backdrop-blur-xl">
          <Wordmark />
          <div className="hidden items-center gap-2 sm:flex">
            <Button asChild variant="ghost">
              <a href="#offer">Pricing</a>
            </Button>
            <Button asChild>
              <a href={`tel:${demoPhone}`}>
                <PhoneCall className="size-4" />
                Call Demo
              </a>
            </Button>
          </div>
          <Button asChild size="icon" className="sm:hidden">
            <a href={`tel:${demoPhone}`} aria-label="Call First Ring demo">
              <PhoneCall className="size-5" />
            </a>
          </Button>
        </nav>
      </header>

      <section
        id="demo"
        className="relative grid min-h-screen place-items-center px-5 pb-12 pt-28 sm:px-8"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_18%,rgba(52,199,89,0.16),transparent_32%),radial-gradient(circle_at_88%_10%,rgba(74,199,255,0.12),transparent_28%),linear-gradient(180deg,#fbfcfb,#f4f5f4)]" />
        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[1fr_24rem]">
          <motion.div
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75 }}
            className="text-center lg:text-left"
          >
            <div className="mb-7 inline-flex rounded-[1.35rem] bg-[#34c759] px-5 py-4">
              <Wordmark variant="white" />
            </div>
            <h1 className="mx-auto max-w-3xl text-5xl font-black leading-[0.9] text-[#101211] sm:text-7xl lg:mx-0">
              A $400 lead can call at 8:30 PM.
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-xl font-bold leading-snug text-black/62 sm:text-2xl lg:mx-0">
              If nobody answers, they call the next company. First Ring answers
              before they leave.
            </p>
            <div className="mx-auto mt-7 max-w-xl rounded-[1.7rem] bg-white p-4 text-left shadow-[0_18px_48px_rgba(15,23,42,0.08)] ring-1 ring-black/6 lg:mx-0">
              <p className="text-xs font-black uppercase text-black/38">
                Demo number
              </p>
              <div className="mt-2 flex items-center justify-between gap-3">
                <p className="text-3xl font-black leading-none text-[#101211]">
                  {displayDemoPhone}
                </p>
                <motion.span
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ duration: 1.4, repeat: Infinity }}
                  className="grid size-12 shrink-0 place-items-center rounded-full bg-[#34c759] text-white green-shadow"
                >
                  <Phone className="size-5" />
                </motion.span>
              </div>
              <p className="mt-3 text-sm font-bold leading-snug text-black/48">
                Call and pretend you need driveway cleaning, or say you own an
                exterior cleaning company and want to test First Ring.
              </p>
            </div>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
              <Button asChild size="lg">
                <a href={`tel:${demoPhone}`}>
                  <PhoneCall className="size-5" />
                  Call the Demo
                </a>
              </Button>
            <Button asChild variant="secondary" size="lg">
                <a href="/signup">
                  Choose a Plan
                  <ArrowDownRight className="size-5" />
                </a>
              </Button>
            </div>
          </motion.div>

          <PhoneDemo />
        </div>
      </section>

      <MotionSection>
        <div className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-3">
          {featureCards.map(({ title, text, Icon }, index) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.45, delay: index * 0.06 }}
              whileHover={{ y: -6 }}
            >
              <Card className="h-full p-6">
                <div className="grid size-12 place-items-center rounded-[1.1rem] bg-[#34c759] text-white green-shadow">
                  <Icon className="size-5" strokeWidth={2.7} />
                </div>
                <h2 className="mt-8 text-3xl font-black">{title}</h2>
                <p className="mt-2 text-lg font-semibold leading-snug text-black/55">
                  {text}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </MotionSection>

      <MotionSection className="bg-[#f4f5f4]">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            title="Voicemail does not book jobs."
            text="These are the exact moments customers call. First Ring turns them into follow-ups instead of missed opportunities."
          />
          <div className="mx-auto mt-10 flex max-w-4xl snap-x gap-3 overflow-x-auto pb-4 no-scrollbar sm:grid sm:grid-cols-5">
            {missedMoments.map((item, index) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.04 }}
                className="min-w-[10rem] snap-center rounded-[1.7rem] bg-white p-5 text-center shadow-[0_14px_34px_rgba(15,23,42,0.06)] ring-1 ring-black/5"
              >
                <Clock3 className="mx-auto size-5 text-[#34c759]" />
                <p className="mt-5 text-xl font-black">{item}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </MotionSection>

      <MotionSection>
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <SectionHeading
              label="Try it"
              title="Call once. See exactly what gets captured."
              text="The demo can act like a homeowner lead or answer questions from a business owner."
            />
            <div className="mt-8 overflow-hidden rounded-[2rem] bg-white shadow-[0_24px_70px_rgba(15,23,42,0.1)] ring-1 ring-black/6">
              {demoSteps.map((item, index) => (
                <div
                  key={item}
                  className="flex items-center gap-4 border-b border-black/6 px-5 py-5 last:border-b-0"
                >
                  <div
                    className={cn(
                      "grid size-11 shrink-0 place-items-center rounded-full font-black",
                      index === 0
                        ? "bg-[#34c759] text-white"
                        : "bg-[#eff8f1] text-[#34c759]",
                    )}
                  >
                    {index + 1}
                  </div>
                  <p className="min-w-0 flex-1 text-lg font-black">{item}</p>
                  <ChevronRight className="size-5 text-black/22" />
                </div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="rounded-[2.4rem] bg-[#101211] p-5 text-white shadow-[0_28px_80px_rgba(15,23,42,0.18)]"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="grid size-12 place-items-center rounded-[1rem] bg-[#34c759] text-white">
                <Mail className="size-5" />
              </div>
              <span className="rounded-full bg-white/12 px-3 py-1 text-xs font-black uppercase text-white/58">
                Owner preview
              </span>
            </div>
            <h2 className="mt-6 text-4xl font-black leading-none">
              New First Ring Lead
            </h2>
            <div className="mt-6 grid gap-3">
              {resultFields.map(([label, value]) => (
                <div key={label} className="rounded-[1.2rem] bg-white/10 p-4">
                  <p className="text-xs font-black uppercase text-white/36">
                    {label}
                  </p>
                  <p className="mt-1 font-extrabold leading-snug text-white/82">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </MotionSection>

      <MotionSection id="offer" className="bg-[#34c759] text-white">
        <div className="mx-auto max-w-6xl">
          <div>
            <p className="text-sm font-black uppercase text-white/70">
              Plans
            </p>
            <h2 className="mt-4 max-w-3xl text-5xl font-black leading-[0.93] sm:text-6xl">
              Catch the call before they call the next company.
            </h2>
            <p className="mt-5 max-w-xl text-xl font-extrabold leading-snug text-white/76">
              Built for pressure washing, soft washing, driveway cleaning,
              gutters, roofs, windows, and similar exterior cleaning businesses.
            </p>
          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {pricingPlans.map((plan) => (
              <Card
                key={plan.id}
                className={cn(
                  "overflow-hidden bg-white text-[#101211]",
                  plan.id === "basic" ? "ring-4 ring-white/40" : "",
                )}
              >
                <div className="bg-[#101211] p-6 text-white">
                  <p className="text-sm font-black uppercase text-[#34c759]">
                    {plan.name}
                  </p>
                  <p className="mt-4 text-5xl font-black leading-none">
                    {plan.price}
                  </p>
                  <p className="mt-3 text-sm font-bold leading-snug text-white/58">
                    {plan.note}
                  </p>
                </div>
                <div className="p-6">
                  <div className="grid gap-3">
                    {[plan.minutes, plan.extra, ...included.slice(0, 4)].map(
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
                  <Button asChild size="lg" className="mt-6 w-full">
                    <a href={`/signup?plan=${plan.id}`}>
                      <ArrowDownRight className="size-5" />
                      Choose {plan.name}
                    </a>
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-6 flex justify-center">
            <Button asChild variant="secondary" size="lg">
              <a href={`tel:${demoPhone}`}>
                <Play className="size-5" />
                Call Demo First
              </a>
            </Button>
          </div>
        </div>
      </MotionSection>

      <MotionSection className="pb-28">
        <div className="mx-auto max-w-5xl rounded-[2.5rem] bg-[#101211] px-6 py-14 text-center text-white shadow-[0_28px_80px_rgba(15,23,42,0.18)] sm:px-10 sm:py-20">
          <div className="mx-auto grid size-14 place-items-center rounded-[1.3rem] bg-[#34c759] text-white green-shadow">
            <Sparkles className="size-6" />
          </div>
          <h2 className="mx-auto mt-7 max-w-3xl text-5xl font-black leading-[0.94] sm:text-7xl">
            Your next customer might call tonight.
          </h2>
          <p className="mt-5 text-2xl font-extrabold text-white/72">
            First Ring answers before they leave.
          </p>
          <Button asChild size="lg" className="mt-8">
            <a href={`tel:${demoPhone}`}>
              <PhoneCall className="size-5" />
              Call {displayDemoPhone}
            </a>
          </Button>
        </div>
      </MotionSection>

      <AnimatePresence>
        {showStickyCta ? (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 18 }}
            className="fixed inset-x-4 bottom-4 z-50 sm:hidden"
          >
            <Button asChild size="lg" className="h-14 w-full">
              <a href={`tel:${demoPhone}`}>
                <PhoneCall className="size-5" />
                Call Demo
              </a>
            </Button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </main>
  );
}
