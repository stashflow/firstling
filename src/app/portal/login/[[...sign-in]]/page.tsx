import { SignIn } from "@clerk/nextjs";
import { PhoneCall } from "lucide-react";
import Link from "next/link";
import { Wordmark } from "@/components/wordmark";

export const dynamic = "force-dynamic";

export default function PortalLoginPage() {
  return (
    <main className="min-h-screen bg-[#f4f5f4] px-4 py-6 text-[#101211] sm:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-48px)] max-w-6xl flex-col">
        <header className="flex items-center justify-between gap-4">
          <Wordmark />
          <Link
            href="/"
            className="rounded-full bg-white px-5 py-3 text-sm font-black shadow-[0_12px_28px_rgba(15,23,42,0.08)] ring-1 ring-black/8"
          >
            Home
          </Link>
        </header>

        <section className="grid flex-1 gap-8 py-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:py-16">
          <div>
            <div className="grid size-16 place-items-center rounded-[1.4rem] bg-[#34c759] text-white shadow-[0_18px_45px_rgba(52,199,89,0.32)]">
              <PhoneCall className="size-7" />
            </div>
            <p className="mt-8 text-sm font-black uppercase text-[#34c759]">
              Client dashboard
            </p>
            <h1 className="mt-3 max-w-xl text-5xl font-black leading-[0.95] sm:text-7xl">
              See your caller in one place.
            </h1>
            <p className="mt-5 max-w-lg text-xl font-bold leading-snug text-black/55">
              Sign in with the email you used at checkout. No complicated
              software, no setup maze.
            </p>
          </div>

          <div className="rounded-[2rem] bg-white p-4 shadow-[0_24px_70px_rgba(15,23,42,0.12)] ring-1 ring-black/8 sm:p-6">
            <SignIn
              routing="path"
              path="/portal/login"
              signUpUrl="/signup"
              fallbackRedirectUrl="/portal"
              appearance={{
                elements: {
                  rootBox: "mx-auto",
                  cardBox: "shadow-none",
                  card: "shadow-none border-0",
                  formButtonPrimary:
                    "bg-[#34c759] hover:bg-[#2fb44f] text-white font-black",
                  headerTitle: "text-[#101211]",
                  headerSubtitle: "text-black/55",
                },
              }}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
