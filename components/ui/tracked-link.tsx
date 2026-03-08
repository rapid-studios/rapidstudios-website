"use client";

import Link from "next/link";
import type { ComponentProps } from "react";

import { trackCtaClick } from "@/lib/analytics";

type Props = ComponentProps<typeof Link> & {
  trackLocation: string;
  trackLabel: string;
};

export function TrackedLink({ trackLocation, trackLabel, onClick, ...props }: Props) {
  return (
    <Link
      {...props}
      onClick={(e) => {
        trackCtaClick(trackLocation, trackLabel);
        onClick?.(e);
      }}
    />
  );
}
