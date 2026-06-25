import { Phone } from "lucide-react";
import { cn } from "@/lib/utils";

export function Wordmark({
  variant = "green",
  className,
}: {
  variant?: "green" | "white";
  className?: string;
}) {
  const isWhite = variant === "white";

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2.5 font-black",
        isWhite ? "text-white" : "text-[#34C759]",
        className,
      )}
    >
      <span
        className={cn(
          "grid size-9 place-items-center rounded-[1rem]",
          isWhite ? "bg-white/18 ring-1 ring-white/20" : "bg-[#34C759]",
        )}
      >
        <Phone className="size-4 text-white" strokeWidth={2.8} />
      </span>
      <span className="relative text-[1.38rem] leading-none">
        F
        <span className="relative">
          i
          <span
            className={cn(
              "absolute -right-[0.08em] -top-[0.32em] size-2.5 rounded-full border-[2.5px]",
              isWhite ? "border-white" : "border-[#34C759]",
            )}
          />
        </span>
        rst Ring
      </span>
    </div>
  );
}
