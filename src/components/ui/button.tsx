import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-extrabold transition-all disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#34C759]/30",
  {
    variants: {
      variant: {
        default:
          "bg-[#34C759] text-white shadow-[0_16px_34px_rgba(52,199,89,0.28)] hover:bg-[#2fbd52]",
        secondary:
          "bg-white text-[#111111] shadow-[0_12px_28px_rgba(15,23,42,0.08)] ring-1 ring-black/8 hover:bg-[#f6f7f6]",
        ghost: "bg-transparent text-[#111111] hover:bg-black/5",
      },
      size: {
        default: "h-12 px-6",
        lg: "h-14 px-7 text-base",
        icon: "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
