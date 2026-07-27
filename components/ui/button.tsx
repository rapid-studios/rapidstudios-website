import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-md)] border text-sm font-semibold outline-none will-change-transform transition-[background-color,border-color,color,box-shadow,transform,filter] duration-300 [transition-timing-function:var(--ease-emphasis)] disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-4 focus-visible:ring-[var(--color-focus-ring)]",
  {
    variants: {
      variant: {
        primary:
          "specular-button border-transparent text-white",
        secondary:
          "glass-button border-[var(--color-line-subtle)] bg-[var(--color-surface-soft)] text-[var(--color-text-primary)] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] hover:border-[var(--color-line-strong)] hover:bg-[var(--color-surface-muted)]",
        ghost:
          "border-transparent bg-transparent text-[var(--color-text-primary)] shadow-none hover:border-[var(--color-line-subtle)] hover:bg-[var(--color-surface-soft)]"
      },
      size: {
        default: "h-12 px-6 text-sm",
        large: "h-14 px-7 text-base",
        sm: "h-10 px-4 text-[13px]"
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
