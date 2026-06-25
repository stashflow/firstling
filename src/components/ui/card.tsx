import * as React from "react";
import { cn } from "@/lib/utils";

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "rounded-[2rem] border border-black/6 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.08)]",
        className,
      )}
      {...props}
    />
  );
}

export { Card };
