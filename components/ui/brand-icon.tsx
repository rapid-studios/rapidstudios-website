"use client";

import type { Variants } from "framer-motion";
import { motion, useAnimation } from "framer-motion";
import type { MouseEvent, SVGProps } from "react";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";

export interface BrandIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

type BrandIconProps = SVGProps<SVGSVGElement> & {
  size?: number;
  title?: string;
};

const PATH_VARIANTS: Variants = {
  normal: {
    opacity: 1,
    pathLength: 1,
    transition: {
      duration: 0.6,
      opacity: { duration: 0.1 }
    }
  },
  animate: {
    opacity: [0, 1],
    pathLength: [0, 1],
    transition: {
      duration: 0.6,
      opacity: { duration: 0.1 }
    }
  }
};

export const BrandIcon = forwardRef<BrandIconHandle, BrandIconProps>(function BrandIcon(
  { className, onMouseEnter, onMouseLeave, size = 28, title = "Rapid Studios icon", width, height, ...props },
  ref
) {
  const controls = useAnimation();
  const isControlledRef = useRef(false);

  useImperativeHandle(
    ref,
    () => {
      isControlledRef.current = true;

      return {
        startAnimation: () => controls.start("animate"),
        stopAnimation: () => controls.start("normal")
      };
    },
    [controls]
  );

  const handleMouseEnter = useCallback(
    (event: MouseEvent<SVGSVGElement>) => {
      if (isControlledRef.current) {
        onMouseEnter?.(event);
        return;
      }

      controls.start("animate");
      onMouseEnter?.(event);
    },
    [controls, onMouseEnter]
  );

  const handleMouseLeave = useCallback(
    (event: MouseEvent<SVGSVGElement>) => {
      if (isControlledRef.current) {
        onMouseLeave?.(event);
        return;
      }

      controls.start("normal");
      onMouseLeave?.(event);
    },
    [controls, onMouseLeave]
  );

  return (
    <svg
      aria-hidden={title ? undefined : true}
      className={className}
      fill="none"
      height={height ?? size}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2.5}
      viewBox="0 0 24 24"
      width={width ?? size}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {title ? <title>{title}</title> : null}
      <motion.path
        animate={controls}
        d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"
        initial="normal"
        variants={PATH_VARIANTS}
      />
    </svg>
  );
});
