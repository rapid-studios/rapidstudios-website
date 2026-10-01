"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

type SiteReelProps = {
  webm: string;
  mp4: string;
  poster: string;
  title: string;
};

/** Muted, looping walkthrough video that only downloads and plays while it is on screen. */
export function SiteReel({ webm, mp4, poster, title }: SiteReelProps) {
  const prefersReducedMotion = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || prefersReducedMotion) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  return (
    <video
      aria-label={title}
      className="absolute inset-0 size-full bg-black object-cover"
      controls
      loop
      muted
      playsInline
      poster={poster}
      preload="none"
      ref={videoRef}
    >
      <source src={webm} type='video/webm; codecs="av01.0.08M.10"' />
      <source src={mp4} type="video/mp4" />
    </video>
  );
}
