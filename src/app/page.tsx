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
  Sparkle,
  Volume2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Wordmark } from "@/components/wordmark";
import { cn } from "@/lib/utils";

const callStates = [
  {
    kicker: "Incoming Call",
    title: "Potential Customer",
    detail: "$400 driveway lead",
    tone: "ring",
  },
  {
    kicker: "First Ring Answering...",
    title: "Good evening, how can we help?",
    detail: "Collecting job details",
    tone: "answer",
  },
  {
    kicker: "Lead Captured",
    title: "Driveway Cleaning",
    detail: "Marietta, GA",
    footer: "Sent to your inbox",
    tone: "done",
  },
] as const;

const sections = [
  ["Answers", "Every missed and after-hours call.", PhoneCall],
  ["Qualifies", "Name, phone, address, service, timing.", Mic2],
  ["Sends", "Lead summary straight to your inbox.", Mail],
] as const;

const missed = [
  "On a job",
  "Driving",
  "After hours",
  "With a customer",
  "Phone on silent",
];

const flow = [
  "Call comes in",
  "First Ring answers",
  "Customer gives details",
  "You get the lead",
];

const included = [
  "AI phone receptionist",
  "Custom business script",
  "Lead summary emails",
  "After-hours answering",
  "Customer info collection",
  "Basic FAQ handling",
  "100 included minutes/month",
];

const faqs = [
  [
    "Is this only for pressure washing?",
    "No. It is built for exterior cleaning: pressure washing, soft washing, windows, gutters, roofs, and similar services.",
  ],
  [
    "Does it replace me?",
    "No. It catches calls, gathers details, and sends the lead so you can follow up.",
  ],
  [
    "Can it book jobs?",
    "It can qualify and route leads first. Booking can be added around your calendar and process.",
  ],
  [
    "What happens after a call?",
    "You get a clean lead summary with the customer, service, address, timing, and notes.",
  ],
  [
    "How fast can I get set up?",
    "Most businesses can be set up quickly once the script, number, and FAQs are ready.",
  ],
  [
    "What if it gets something wrong?",
    "You still receive the call summary and can follow up directly. The script is tuned as real calls come in.",
  ],
] as const;

function Waveform({ active }: { active: boolean }) {
  const bars = useMemo(() => Array.from({ length: 22 }), []);

  return (
    <div className="flex h-12 items-center justify-center gap-1.5">
      {bars.map((_, index) => (
        <motion.span
          key={index}
          className="w-1.5 rounded-full bg-white/85"
          animate={{
            height: active ? [10, 16 + ((index * 7) % 30), 10] : 8,
            opacity: active ? [0.45, 1, 0.45] : 0.35,
          }}
          transition={{
            duration: 1.1,
            repeat: Infinity,
            delay: index * 0.035,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

function PhoneVisual() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(
      () => setStep((current) => (current + 1) % callStates.length),
      2600,
    );

    return () => window.clearInterval(timer);
  }, []);

  const current = callStates[step];

  return (
    <motion.div
      initial={{ opacity: 0, y: 28, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
      className="relative mx-auto w-full max-w-[22rem]"
    >
      <div className="absolute -inset-5 rounded-[3.5rem] bg-[#34C759]/12 blur-3xl" />
      <div className="ios-shadow relative overflow-hidden rounded-[3.1rem] border-[10px] border-[#111] bg-[#34C759] p-5 text-white">
        <div className="mx-auto mb-7 h-7 w-28 rounded-b-3xl bg-[#111]" />
        <div className="min-h-[31rem]">
          <div className="flex items-center justify-between text-xs font-bold uppercase text-white/70">
            <span>8:30 PM</span>
            <Volume2 className="size-4" />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={current.kicker}
              initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -20, filter: "blur(8px)" }}
              transition={{ duration: 0.45 }}
              className="pt-16 text-center"
            >
              <p className="text-base font-extrabold text-white/78">
                {current.kicker}
              </p>
              <h2 className="mx-auto mt-3 max-w-[16rem] text-4xl font-black leading-[0.98]">
                {current.title}
              </h2>
              <p className="mt-4 text-lg font-bold text-white/80">
                {current.detail}
              </p>
              {"footer" in current ? (
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-sm font-extrabold text-white"
                >
                  {current.footer}
                </motion.p>
              ) : null}
            </motion.div>
          </AnimatePresence>

          <div className="mt-12 rounded-[2rem] bg-white/16 p-4 ring-1 ring-white/20 backdrop-blur">
            <Waveform active={current.tone !== "done"} />
          </div>

          <div className="absolute inset-x-8 bottom-8 flex items-center justify-center gap-5">
            <motion.div
              animate={{ scale: current.tone === "ring" ? [1, 1.05, 1] : 1 }}
              transition={{ duration: 1.1, repeat: Infinity }}
              className="grid size-16 place-items-center rounded-full bg-white text-[#34C759]"
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
        <p className="mb-3 text-sm font-black uppercase text-[#34C759]">
          {label}
        </p>
      ) : null}
      <h2 className="text-4xl font-black leading-[0.96] text-[#101211] sm:text-5xl">
        {title}
      </h2>
      {text ? (
        <p className="mx-auto mt-4 max-w-xl text-lg font-semibold leading-snug text-black/58">
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
      className={cn("px-5 py-16 sm:px-8 sm:py-24", className)}
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
    <main className="overflow-hidden">
      <header className="fixed inset-x-0 top-0 z-50 px-4 py-4">
        <nav className="mx-auto flex max-w-6xl items-center justify-between rounded-full border border-black/6 bg-white/78 px-4 py-3 shadow-[0_12px_30px_rgba(15,23,42,0.07)] backdrop-blur-xl">
          <Wordmark />
          <div className="hidden items-center gap-2 sm:flex">
            <Button asChild variant="ghost">
              <a href="#offer">Founding Offer</a>
            </Button>
            <Button asChild>
              <a href="#demo">
                <PhoneCall className="size-4" />
                Call the Demo
              </a>
            </Button>
          </div>
          <Button asChild size="icon" className="sm:hidden">
            <a href="#demo" aria-label="Call the Demo">
              <PhoneCall className="size-5" />
            </a>
          </Button>
        </nav>
      </header>

      <section
        id="demo"
        className="relative grid min-h-screen place-items-center px-5 pb-16 pt-28 sm:px-8"
      >
        <div className="mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[1fr_24rem]">
          <motion.div
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75 }}
            className="text-center lg:text-left"
          >
            <div className="mb-8 inline-flex rounded-[1.35rem] bg-[#34C759] px-5 py-4">
              <Wordmark variant="white" />
            </div>
            <h1 className="mx-auto max-w-3xl text-5xl font-black leading-[0.93] text-[#101211] sm:text-7xl lg:mx-0">
              A $400 lead can call at 8:30 PM.
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-xl font-bold leading-snug text-black/62 sm:text-2xl lg:mx-0">
              If nobody answers, they call the next company. First Ring answers
              before they leave.
            </p>
            <p className="mt-5 text-sm font-black uppercase text-[#34C759]">
              AI receptionist for exterior cleaning businesses.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
              <Button asChild size="lg">
                <a href="#demo">
                  <PhoneCall className="size-5" />
                  Call the Demo
                </a>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <a href="#offer">Claim Founding Offer</a>
              </Button>
            </div>
            <div className="mx-auto mt-5 grid max-w-xl gap-2 rounded-[1.6rem] bg-white p-4 text-left shadow-[0_14px_34px_rgba(15,23,42,0.06)] ring-1 ring-black/6 lg:mx-0">
              <p className="flex items-center gap-2 text-sm font-black text-[#101211]">
                <PhoneCall className="size-4 text-[#34C759]" />
                Call the demo and pretend you need your driveway cleaned after
                work.
              </p>
              <p className="text-sm font-bold leading-snug text-black/48">
                After the call, First Ring sends you the captured lead summary.
              </p>
            </div>
          </motion.div>

          <PhoneVisual />
        </div>
        <div className="absolute bottom-4 hidden text-xs font-black uppercase text-black/32 sm:block">
          Missed calls become missed jobs
        </div>
      </section>

      <MotionSection>
        <div className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-3">
          {sections.map(([title, text, Icon], index) => (
            <motion.div
              key={title}
              initial={{ opacity: 1, y: 0 }}
              whileHover={{ y: -6 }}
              transition={{ duration: 0.2, delay: index * 0.02 }}
            >
              <Card className="h-full p-6">
                <div className="grid size-12 place-items-center rounded-[1.1rem] bg-[#34C759] text-white green-shadow">
                  <Icon className="size-5" strokeWidth={2.7} />
                </div>
                <h2 className="mt-8 text-3xl font-black">
                  {title}
                </h2>
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
          <SectionHeading title="Voicemail does not book jobs." />
          <div className="mx-auto mt-10 flex max-w-4xl snap-x gap-3 overflow-x-auto pb-4 no-scrollbar sm:grid sm:grid-cols-5">
            {missed.map((item) => (
              <div
                key={item}
                className="min-w-[10rem] snap-center rounded-[1.7rem] bg-white p-5 text-center shadow-[0_14px_34px_rgba(15,23,42,0.06)] ring-1 ring-black/5"
              >
                <Clock3 className="mx-auto size-5 text-[#34C759]" />
                <p className="mt-5 text-xl font-black">
                  {item}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-center text-lg font-extrabold text-black/58">
            Those are the exact moments customers call.
          </p>
        </div>
      </MotionSection>

      <MotionSection>
        <div className="mx-auto max-w-3xl">
          <SectionHeading
            label="How it works"
            title="A call history that ends with a lead."
          />
          <div className="mt-10 overflow-hidden rounded-[2rem] bg-white shadow-[0_24px_70px_rgba(15,23,42,0.1)] ring-1 ring-black/6">
            {flow.map((item, index) => (
              <div
                key={item}
                className="flex items-center gap-4 border-b border-black/6 px-5 py-5 last:border-b-0"
              >
                <div
                  className={cn(
                    "grid size-11 shrink-0 place-items-center rounded-full",
                    index === 0
                      ? "bg-[#34C759] text-white"
                      : "bg-[#eff8f1] text-[#34C759]",
                  )}
                >
                  {index === 0 ? (
                    <Phone className="size-5" />
                  ) : (
                    <Check className="size-5" strokeWidth={3} />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-lg font-black">
                    {item}
                  </p>
                  <p className="text-sm font-bold text-black/42">
                    {index === 3 ? "Ready to follow up" : "Handled in the call"}
                  </p>
                </div>
                <ChevronRight className="size-5 text-black/22" />
              </div>
            ))}
          </div>
        </div>
      </MotionSection>

      <MotionSection className="bg-[#34C759] text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <Wordmark variant="white" />
            <h2 className="mt-8 text-5xl font-black leading-[0.95] sm:text-6xl">
              The lead lands where you already work.
            </h2>
          </div>
          <div className="rounded-[2.4rem] bg-white p-5 text-[#101211] shadow-[0_28px_80px_rgba(7,73,24,0.22)]">
            <div className="flex items-start gap-4">
              <div className="grid size-12 shrink-0 place-items-center rounded-[1rem] bg-[#34C759] text-white">
                <Mail className="size-5" />
              </div>
              <div>
                <p className="text-sm font-black text-black/42">
                  New First Ring Lead
                </p>
                <h3 className="mt-1 text-2xl font-black">
                  Sarah M.
                </h3>
              </div>
            </div>
            <div className="mt-6 grid gap-3 text-sm font-bold">
              {[
                ["Customer", "Sarah M."],
                ["Service", "Driveway cleaning"],
                ["Address", "Marietta, GA"],
                [
                  "Summary",
                  "Customer wants driveway and walkway cleaned next week. Asked about pricing and availability.",
                ],
                ["Status", "Ready to follow up"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-[1.25rem] bg-[#f4f5f4] px-4 py-3"
                >
                  <p className="text-xs font-black uppercase text-black/35">
                    {label}
                  </p>
                  <p className="mt-1 leading-snug text-black/78">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </MotionSection>

      <MotionSection id="offer">
        <div className="mx-auto max-w-4xl">
          <Card className="overflow-hidden">
            <div className="bg-[#101211] p-7 text-white sm:p-10">
              <p className="text-sm font-black uppercase text-[#34C759]">
                Founding offer
              </p>
              <h2 className="mt-4 text-4xl font-black leading-none sm:text-6xl">
                Founding Exterior Cleaning Plan
              </h2>
              <div className="mt-7 flex flex-wrap items-end gap-x-3 gap-y-1">
                <span className="text-4xl font-black">
                  $149 setup
                </span>
                <span className="pb-1 text-2xl font-black text-white/62">
                  $99/month
                </span>
              </div>
              <p className="mt-4 text-lg font-bold text-white/58">
                For the first 10 exterior cleaning businesses.
              </p>
            </div>
            <div className="grid gap-6 p-6 sm:grid-cols-[1fr_auto] sm:p-8">
              <div className="grid gap-3 sm:grid-cols-2">
                {included.map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#34C759] text-white">
                      <Check className="size-4" strokeWidth={3} />
                    </span>
                    <span className="font-extrabold text-black/70">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex flex-col justify-between gap-4 sm:w-56">
                <p className="text-sm font-bold text-black/42">
                  Extra minutes billed separately.
                </p>
                <Button asChild size="lg" className="w-full">
                  <a href="#demo">
                    Claim Founding Spot
                    <ArrowDownRight className="size-5" />
                  </a>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </MotionSection>

      <MotionSection className="bg-[#f4f5f4]">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto grid size-14 place-items-center rounded-[1.3rem] bg-[#34C759] text-white green-shadow">
            <Sparkle className="size-6" />
          </div>
          <h2 className="mt-8 text-5xl font-black leading-none">
            Built from the field.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-xl font-bold leading-snug text-black/58">
            First Ring started inside our own exterior cleaning business. We
            built it to solve the calls we were missing while working, driving,
            or closed.
          </p>
          <Button asChild size="lg" className="mt-8">
            <a href="#demo">
              <PhoneCall className="size-5" />
              Call the Demo
            </a>
          </Button>
        </div>
      </MotionSection>

      <MotionSection>
        <div className="mx-auto max-w-4xl">
          <SectionHeading label="FAQ" title="Short answers. No fluff." />
          <div className="mt-10 grid gap-3">
            {faqs.map(([question, answer]) => (
              <details
                key={question}
                className="group rounded-[1.5rem] bg-white p-5 shadow-[0_12px_34px_rgba(15,23,42,0.06)] ring-1 ring-black/6"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-5 text-lg font-black">
                  {question}
                  <ChevronRight className="size-5 shrink-0 text-[#34C759] transition-transform group-open:rotate-90" />
                </summary>
                <p className="mt-3 max-w-2xl text-base font-semibold leading-snug text-black/55">
                  {answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </MotionSection>

      <MotionSection className="pb-28">
        <div className="mx-auto max-w-5xl rounded-[2.5rem] bg-[#34C759] px-6 py-14 text-center text-white shadow-[0_28px_80px_rgba(52,199,89,0.28)] sm:px-10 sm:py-20">
          <h2 className="text-5xl font-black leading-[0.95] sm:text-7xl">
            Your next customer might call tonight.
          </h2>
          <p className="mt-5 text-2xl font-extrabold text-white/76">
            First Ring answers before they leave.
          </p>
          <Button
            asChild
            size="lg"
            variant="secondary"
            className="mt-8 text-[#34C759]"
          >
            <a href="#demo">
              <PhoneCall className="size-5" />
              Call the Demo
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
              <a href="#demo">
                <PhoneCall className="size-5" />
                Call the Demo
              </a>
            </Button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </main>
  );
}
