import { ArrowLeft, PhoneCall } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Wordmark } from "@/components/wordmark";

const demoPhone = "+12137145090";

export default function SignupCancelPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f4f5f4] px-4 py-8 text-[#101211]">
      <Card className="w-full max-w-2xl p-6 text-center sm:p-10">
        <div className="flex justify-center">
          <Wordmark />
        </div>
        <p className="mt-9 text-sm font-black uppercase text-[#34c759]">
          Checkout canceled
        </p>
        <h1 className="mx-auto mt-3 max-w-xl text-5xl font-black leading-[0.94]">
          No charge was made.
        </h1>
        <p className="mx-auto mt-5 max-w-lg text-lg font-bold leading-snug text-black/58">
          You can go back to choose a plan, or call the demo first if you want
          to hear how First Ring handles a missed call.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/signup">
              <ArrowLeft className="size-5" />
              Return to Checkout
            </Link>
          </Button>
          <Button asChild variant="secondary" size="lg">
            <a href={`tel:${demoPhone}`}>
              <PhoneCall className="size-5" />
              Call Demo
            </a>
          </Button>
        </div>
      </Card>
    </main>
  );
}
