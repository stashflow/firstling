import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PhoneCall } from "lucide-react";
import { Wordmark } from "@/components/wordmark";
import { Card } from "@/components/ui/card";
import { isClerkConfigured } from "@/lib/clerk";
import {
  getClientForPortal,
  getClientMonthlyUsage,
  listRecentClientCalls,
} from "@/lib/usage";
import { PortalClient } from "./portal-client";

export const dynamic = "force-dynamic";

export default async function PortalPage() {
  if (!isClerkConfigured()) {
    return (
      <main className="min-h-screen bg-[#f4f5f4] px-4 py-6 text-[#101211] sm:px-8">
        <div className="mx-auto max-w-5xl">
          <header className="flex items-center justify-between gap-4">
            <Wordmark />
            <Link
              href="/"
              className="rounded-full bg-white px-5 py-3 text-sm font-black shadow-[0_12px_28px_rgba(15,23,42,0.08)] ring-1 ring-black/8"
            >
              Home
            </Link>
          </header>

          <Card className="mt-10 p-8 text-center sm:p-12">
            <div className="mx-auto grid size-16 place-items-center rounded-[1.4rem] bg-[#34c759] text-white">
              <PhoneCall className="size-7" />
            </div>
            <h1 className="mx-auto mt-7 max-w-xl text-4xl font-black leading-none sm:text-6xl">
              Your dashboard is not ready yet.
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg font-bold leading-snug text-black/52">
              Portal login is not configured in production yet. Your purchase is
              still recorded, but Clerk needs its live keys before customers can
              sign in here.
            </p>
            <p className="mx-auto mt-4 max-w-2xl text-base font-bold leading-snug text-black/45">
              Set `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` in
              Vercel, then this page will work.
            </p>
          </Card>
        </div>
      </main>
    );
  }

  const user = await currentUser();

  if (!user) {
    redirect("/portal/login");
  }

  const email = user.emailAddresses[0]?.emailAddress || null;
  const client = await getClientForPortal({
    clerkUserId: user.id,
    email,
  });

  if (!client) {
    return (
      <main className="min-h-screen bg-[#f4f5f4] px-4 py-6 text-[#101211] sm:px-8">
        <div className="mx-auto max-w-5xl">
          <header className="flex items-center justify-between gap-4">
            <Wordmark />
            <Link
              href="/signup"
              className="rounded-full bg-[#34c759] px-5 py-3 text-sm font-black text-white shadow-[0_12px_28px_rgba(52,199,89,0.26)]"
            >
              Start
            </Link>
          </header>

          <Card className="mt-10 p-8 text-center sm:p-12">
            <div className="mx-auto grid size-16 place-items-center rounded-[1.4rem] bg-[#34c759] text-white">
              <PhoneCall className="size-7" />
            </div>
            <h1 className="mx-auto mt-7 max-w-xl text-4xl font-black leading-none sm:text-6xl">
              We could not find your caller yet.
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-lg font-bold leading-snug text-black/52">
              Use the same email you used at checkout. If you just paid, give it
              a minute and refresh this page.
            </p>
          </Card>
        </div>
      </main>
    );
  }

  const [usage, calls] = await Promise.all([
    getClientMonthlyUsage(client.id),
    listRecentClientCalls(client.id),
  ]);

  return (
    <main className="min-h-screen bg-[#f4f5f4] px-4 py-6 text-[#101211] sm:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex items-center justify-between gap-4">
          <Wordmark />
          <Link
            href="/"
            className="rounded-full bg-white px-5 py-3 text-sm font-black shadow-[0_12px_28px_rgba(15,23,42,0.08)] ring-1 ring-black/8"
          >
            Home
          </Link>
        </header>
        <PortalClient client={client} usage={usage} calls={calls} />
      </div>
    </main>
  );
}
