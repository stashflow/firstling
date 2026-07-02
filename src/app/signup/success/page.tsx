import { Check, LayoutDashboard, PhoneCall } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Wordmark } from "@/components/wordmark";

const demoPhone = "+12137145090";

export default function SignupSuccessPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f4f5f4] px-4 py-8 text-[#101211]">
      <Card className="w-full max-w-2xl p-6 text-center sm:p-10">
        <div className="flex justify-center">
          <Wordmark />
        </div>
        <div className="mx-auto mt-9 grid size-16 place-items-center rounded-full bg-[#34c759] text-white green-shadow">
          <Check className="size-8" strokeWidth={3} />
        </div>
        <p className="mt-8 text-sm font-black uppercase text-[#34c759]">
          Plan started
        </p>
        <h1 className="mx-auto mt-3 max-w-xl text-5xl font-black leading-[0.94]">
          Your First Ring setup is started.
        </h1>
        <p className="mx-auto mt-5 max-w-lg text-lg font-bold leading-snug text-black/58">
          We will use your checkout details to start setting up your caller.
          Your dashboard will show the caller number as soon as it is ready.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/portal">
              <LayoutDashboard className="size-5" />
              Open Dashboard
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
