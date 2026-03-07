import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-pill)] text-sm font-semibold tracking-[-0.02em] transition-[background-color,border-color,color,box-shadow,transform] duration-[180ms] outline-none disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-4 focus-visible:ring-[var(--color-focus-ring)]",
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--color-brand-primary)] text-[var(--color-text-inverse)] shadow-[var(--shadow-elevated)] hover:-translate-y-px hover:bg-[var(--color-brand-primary-hover)] hover:shadow-[var(--shadow-float)]",
        secondary:
          "border border-[var(--color-line-subtle)] bg-white/4 text-[var(--color-text-primary)] shadow-[var(--shadow-soft)] backdrop-blur-md hover:-translate-y-px hover:border-[var(--color-line-strong)] hover:bg-white/8",
        ghost:
          "text-[var(--color-text-primary)] hover:bg-white/6"
      },
      size: {
        default: "h-12 px-5",
        large: "h-14 px-6",
        sm: "h-10 px-4"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "default"
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);

Button.displayName = "Button";
