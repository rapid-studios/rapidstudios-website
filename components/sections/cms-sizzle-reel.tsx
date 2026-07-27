"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Bolt,
  Check,
  CheckCircle2,
  MousePointer2,
  Pause,
  Play,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";

const scenes = [
  { id: "open", label: "Open", duration: 3000 },
  { id: "edit", label: "Edit", duration: 3800 },
  { id: "ai", label: "AI", duration: 4800 },
  { id: "publish", label: "Publish", duration: 3000 },
  { id: "end", label: "End", duration: 3400 }
] as const;

type EditorMode = "edit" | "ai" | "publish";

const subscribeToHydration = () => () => {};
type SceneId = (typeof scenes)[number]["id"];

const ease = [0.22, 1, 0.36, 1] as const;

function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-[30%] bg-gradient-to-b from-[#9bcaff] to-[#327de7] text-[#06101e] shadow-[0_12px_32px_rgba(47,125,231,0.45),inset_0_2px_0_rgba(255,255,255,0.65)] ${
        compact ? "size-8 sm:size-10" : "size-11 sm:size-14"
      }`}
    >
      <Bolt aria-hidden="true" className={compact ? "size-4 sm:size-5" : "size-5 sm:size-7"} strokeWidth={2.8} />
    </span>
  );
}

function SceneCaption({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="absolute left-1/2 top-[5%] z-30 max-w-[72%] -translate-x-1/2 whitespace-nowrap rounded-full border border-white/15 bg-[#081321]/70 px-3 py-1.5 text-center text-[clamp(0.55rem,1.4vw,0.95rem)] font-semibold text-[#edf5ff] shadow-[0_12px_32px_rgba(0,0,0,0.35)] backdrop-blur-xl"
      initial={{ opacity: 0, y: -8 }}
      transition={{ delay: 0.2, duration: 0.5, ease }}
    >
      {children}
    </motion.div>
  );
}

function PagesRail() {
  return (
    <div className="hidden w-[14%] min-w-[92px] flex-col border-r border-white/10 bg-white/[0.035] p-[clamp(0.4rem,1vw,0.75rem)] lg:flex">
      <span className="mb-2 text-[9px] font-bold uppercase tracking-[0.18em] text-[#7790af]">Pages</span>
      {[
        ["Home", "bg-emerald-400"],
        ["Menu", "bg-amber-400"],
        ["Contact", "bg-emerald-400"]
      ].map(([label, color], index) => (
        <span
          className={`flex items-center gap-2 rounded-lg px-2 py-[clamp(0.25rem,0.8vw,0.55rem)] text-[clamp(0.55rem,1vw,0.75rem)] ${
            index === 0
              ? "border border-[#9bcaff]/35 bg-[#5f9cf0]/20 font-semibold text-white"
              : "text-[#92a8c4]"
          }`}
          key={label}
        >
          <span className={`size-1.5 rounded-full ${color}`} />
          {label}
        </span>
      ))}
    </div>
  );
}

function AiRail({ publishing = false }: { publishing?: boolean }) {
  return (
    <div className="hidden w-[30%] max-w-[270px] flex-col gap-[clamp(0.35rem,1vw,0.75rem)] border-l border-white/10 bg-white/[0.035] p-[clamp(0.4rem,1.1vw,0.8rem)] md:flex">
      <div className="grid grid-cols-3 rounded-full border border-white/10 bg-black/20 p-1 text-center text-[clamp(0.45rem,0.8vw,0.65rem)] text-[#88a0be]">
        <span className="rounded-full bg-white py-1 font-bold text-[#12335d]">Content</span>
        <span className="py-1">Design</span>
        <span className="py-1">Review</span>
      </div>

      <div className="rounded-xl border border-white/10 bg-[#07101d]/55 p-[clamp(0.4rem,1vw,0.7rem)] shadow-inner">
        <div className="mb-1.5 flex items-center gap-1.5 text-[clamp(0.5rem,0.9vw,0.7rem)] font-semibold text-[#dce9fa]">
          <Sparkles aria-hidden="true" className="size-3 text-[#86bcff]" />
          Ask for a change
        </div>
        <div className="overflow-hidden rounded-lg border border-white/10 bg-black/25 p-2 text-[clamp(0.48rem,0.85vw,0.68rem)] leading-snug text-[#d6e7fb]">
          <motion.span
            animate={{ clipPath: "inset(0 0% 0 0)" }}
            className="block whitespace-nowrap"
            initial={{ clipPath: "inset(0 100% 0 0)" }}
            transition={{ delay: 0.35, duration: publishing ? 0 : 1.65, ease: "linear" }}
          >
            Make the headline friendlier for locals
          </motion.span>
        </div>
      </div>

      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="min-h-0 rounded-xl border border-[#8fc5ff]/30 bg-gradient-to-br from-[#609df2]/25 to-[#1b4388]/15 p-[clamp(0.4rem,1vw,0.75rem)] shadow-[0_12px_28px_rgba(20,70,170,0.22)]"
        initial={{ opacity: 0, y: 12 }}
        transition={{ delay: publishing ? 0 : 1.9, duration: 0.55, ease }}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-[clamp(0.5rem,0.9vw,0.7rem)] font-semibold text-white">Proposal ready</span>
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300/25 bg-emerald-300/10 px-1.5 py-0.5 text-[clamp(0.4rem,0.7vw,0.55rem)] font-bold text-emerald-200">
            <Check aria-hidden="true" className="size-2.5" />
            CHECKED
          </span>
        </div>
        <p className="mt-1.5 truncate rounded-md bg-black/20 p-1.5 text-[clamp(0.42rem,0.75vw,0.6rem)] text-[#7f96b3] line-through">
          Fresh sourdough, baked before sunrise.
        </p>
        <p className="mt-1 rounded-md border border-[#9bcaff]/25 bg-[#76b3ff]/10 p-1.5 text-[clamp(0.42rem,0.75vw,0.6rem)] text-white">
          Portland&apos;s favorite sourdough, ready at 7am.
        </p>
        <div className="mt-1.5 rounded-md bg-gradient-to-b from-[#80baff] to-[#2d6fd6] px-2 py-1.5 text-center text-[clamp(0.45rem,0.8vw,0.62rem)] font-semibold text-white">
          Approve &amp; apply
        </div>
      </motion.div>
    </div>
  );
}

function EditorPreview({ mode }: { mode: EditorMode }) {
  const isAi = mode === "ai";
  const isPublish = mode === "publish";
  const headline = isPublish
    ? "Portland's favorite sourdough, ready at 7am."
    : "Fresh sourdough, baked before sunrise.";

  return (
    <motion.div
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="absolute inset-x-[3%] bottom-[16%] top-[13%] overflow-hidden rounded-[clamp(0.7rem,2vw,1.35rem)] border border-[#b9d2ff]/20 bg-[#0a1426]/70 shadow-[0_30px_70px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.2)] backdrop-blur-2xl"
      initial={{ opacity: 0, scale: 0.96, y: 12 }}
      transition={{ duration: 0.65, ease }}
    >
      <div className="flex h-7 items-center gap-2 border-b border-white/10 bg-gradient-to-b from-white/[0.09] to-transparent px-2.5 sm:h-9 sm:px-4">
        <span className="size-1.5 rounded-full bg-[#ff6157] sm:size-2" />
        <span className="size-1.5 rounded-full bg-[#ffbd2e] sm:size-2" />
        <span className="size-1.5 rounded-full bg-[#28c840] sm:size-2" />
        <div className="mx-auto flex max-w-[58%] items-center gap-1.5 truncate rounded-full border border-white/10 bg-black/20 px-2 py-1 text-[clamp(0.45rem,1vw,0.68rem)] text-[#9fb5d1]">
          <span className="size-1.5 shrink-0 rounded-full bg-emerald-400" />
          studio.app / golden-crust
          <span className="hidden font-bold text-emerald-300 sm:inline">LIVE</span>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 top-7 flex sm:top-9">
        <PagesRail />

        <div className="relative min-w-0 flex-1 overflow-hidden">
          <div className="flex h-6 items-center justify-between gap-2 border-b border-white/10 px-2 text-[clamp(0.42rem,0.85vw,0.65rem)] text-[#90a6c1] sm:h-8 sm:px-3">
            <span className="truncate">Click any text on the page to edit it directly.</span>
            <span className="hidden shrink-0 text-[#6e86a5] sm:inline">Saved just now</span>
          </div>
          <div className="absolute inset-x-0 bottom-0 top-6 sm:top-8">
            <Image
              alt="Artisan bread website inside the CMS editor"
              className="object-cover"
              fill
              sizes="(min-width: 1120px) 760px, 70vw"
              src="/cms/steaming-artisan-bread.jpg"
            />
            <div className="absolute inset-0 bg-[linear-gradient(100deg,rgba(24,13,5,0.9),rgba(24,13,5,0.38)_58%,rgba(24,13,5,0.08))]" />
            {isPublish ? (
              <motion.div
                animate={{ opacity: [0, 0.58, 0] }}
                className="absolute inset-0 bg-[#7db8ff]"
                transition={{ delay: 0.75, duration: 0.6 }}
              />
            ) : null}
            <div className="absolute inset-y-0 left-0 flex w-[72%] flex-col justify-center p-[clamp(0.65rem,3vw,2.2rem)]">
              <span className="mb-[clamp(0.45rem,2vw,1.5rem)] text-[clamp(0.42rem,0.9vw,0.7rem)] font-semibold uppercase tracking-[0.14em] text-[#f2c884]">
                Portland · Est. 2014
              </span>
              <motion.h3
                animate={mode === "edit" ? { boxShadow: "0 0 0 2px rgba(125,184,255,0.9)" } : undefined}
                className="relative max-w-[18ch] rounded-sm text-[clamp(0.72rem,2.5vw,1.9rem)] font-bold leading-[1.06] tracking-[-0.035em] text-[#fff3dd] [text-shadow:0_2px_12px_rgba(0,0,0,0.5)]"
                transition={{ delay: 1.1, duration: 0.25 }}
              >
                {headline}
                {mode === "edit" ? (
                  <motion.span
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="absolute -top-6 left-0 whitespace-nowrap rounded-full bg-gradient-to-b from-[#86c0ff] to-[#3478db] px-2 py-1 text-[clamp(0.4rem,0.8vw,0.62rem)] font-semibold tracking-normal text-white shadow-lg"
                    initial={{ opacity: 0, scale: 0.8, y: 5 }}
                    transition={{ delay: 1.25, duration: 0.45, ease }}
                  >
                    Click to edit
                  </motion.span>
                ) : null}
              </motion.h3>
              <span className="mt-[clamp(0.5rem,2vw,1.25rem)] w-fit rounded-lg bg-[#4e7247] px-[clamp(0.5rem,1.6vw,1rem)] py-[clamp(0.25rem,0.8vw,0.55rem)] text-[clamp(0.48rem,0.9vw,0.7rem)] font-semibold text-[#fff4e3] shadow-lg">
                Order for pickup
              </span>
            </div>

            {mode === "edit" ? (
              <motion.div
                animate={{ left: "34%", top: "43%", scale: [1, 1, 0.82, 1] }}
                className="absolute left-[76%] top-[70%] z-20 text-white drop-shadow-[0_5px_8px_rgba(0,0,0,0.7)]"
                transition={{ delay: 0.35, duration: 1.25, ease }}
              >
                <MousePointer2 aria-hidden="true" className="size-4 fill-white text-[#07101d] sm:size-6" />
              </motion.div>
            ) : null}

            {isAi ? (
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-2 right-2 z-20 w-[55%] rounded-lg border border-[#9bcaff]/25 bg-[#09172a]/85 p-2 shadow-xl backdrop-blur-xl md:hidden"
                initial={{ opacity: 0, y: 8 }}
                transition={{ delay: 0.8, duration: 0.5, ease }}
              >
                <div className="flex items-center gap-1 text-[clamp(0.42rem,1.5vw,0.62rem)] font-semibold text-white">
                  <Sparkles aria-hidden="true" className="size-2.5 text-[#86bcff]" />
                  Make the headline friendlier
                </div>
                <div className="mt-1 flex items-center gap-1 text-[clamp(0.4rem,1.35vw,0.58rem)] text-emerald-200">
                  <ShieldCheck aria-hidden="true" className="size-2.5" />
                  Guardian checked
                </div>
              </motion.div>
            ) : null}
          </div>
        </div>

        {isAi || isPublish ? <AiRail publishing={isPublish} /> : null}
      </div>

      {isPublish ? (
        <motion.div
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="absolute bottom-2 left-1/2 z-40 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full border border-emerald-300/30 bg-emerald-500/25 px-3 py-1.5 text-[clamp(0.48rem,1.15vw,0.78rem)] font-semibold text-emerald-50 shadow-[0_12px_30px_rgba(5,80,45,0.5)] backdrop-blur-xl sm:bottom-3"
          initial={{ opacity: 0, y: 14, scale: 0.92 }}
          transition={{ delay: 1.15, duration: 0.5, ease }}
        >
          <CheckCircle2 aria-hidden="true" className="size-3.5 text-emerald-200" />
          Published — your site is live
        </motion.div>
      ) : null}
    </motion.div>
  );
}

function OpenScene() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-6 pb-[8%] text-center">
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
        initial={{ opacity: 0, y: 12 }}
        transition={{ duration: 0.6, ease }}
      >
        <BrandMark />
        <span className="text-[clamp(1rem,3vw,2.5rem)] font-bold tracking-[-0.035em] text-white">
          RapidStudios <span className="text-[#87bdff]">CMS</span>
        </span>
      </motion.div>
      <motion.h2
        animate={{ opacity: 1, y: 0 }}
        className="mt-[clamp(0.8rem,2.4vw,1.4rem)] text-[clamp(1.7rem,5.3vw,4rem)] font-bold leading-none tracking-[-0.055em] text-white"
        initial={{ opacity: 0, y: 16 }}
        transition={{ delay: 0.25, duration: 0.65, ease }}
      >
        Hand it over.
      </motion.h2>
      <motion.p
        animate={{ opacity: 1, y: 0 }}
        className="mt-2 text-[clamp(0.72rem,1.8vw,1.25rem)] text-[#9fb4cf]"
        initial={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.45, duration: 0.55, ease }}
      >
        They can&apos;t break it.
      </motion.p>
    </div>
  );
}

function EndScene() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-6 pb-[8%] text-center">
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="mb-[clamp(0.65rem,2.2vw,1.5rem)] flex items-center gap-2.5"
        initial={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.5, ease }}
      >
        <BrandMark compact />
        <span className="text-[clamp(0.7rem,1.8vw,1.15rem)] font-bold uppercase tracking-[0.14em] text-white">
          Rapid Studios
        </span>
      </motion.div>
      <motion.h2
        animate={{ opacity: 1, y: 0 }}
        className="max-w-[18ch] text-[clamp(1.45rem,4.8vw,3.7rem)] font-bold leading-[1.02] tracking-[-0.055em] text-white"
        initial={{ opacity: 0, y: 15 }}
        transition={{ delay: 0.18, duration: 0.65, ease }}
      >
        A CMS your clients can{" "}
        <span className="bg-gradient-to-r from-[#86bdff] to-[#6ce8b0] bg-clip-text text-transparent">
          actually use
        </span>
      </motion.h2>
    </div>
  );
}

function Scene({ id }: { id: SceneId }) {
  if (id === "open") {
    return <OpenScene />;
  }

  if (id === "end") {
    return <EndScene />;
  }

  return (
    <>
      <SceneCaption>
        {id === "edit"
          ? "Click to edit — right on the page."
          : id === "ai"
            ? "Ask AI in plain English. Guardian checks every change."
            : "One safe approval. Publish success."}
      </SceneCaption>
      <EditorPreview mode={id} />
    </>
  );
}

export function CmsSizzleReel() {
  const prefersReducedMotion = useReducedMotion();
  const [activeScene, setActiveScene] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const isHydrated = useSyncExternalStore(subscribeToHydration, () => true, () => false);
  const motionEnabled = isHydrated && prefersReducedMotion === false;
  const displayedScene = motionEnabled ? activeScene : scenes.length - 1;
  const scene = scenes[displayedScene];

  useEffect(() => {
    if (!isPlaying || !motionEnabled) {
      return;
    }

    const timer = window.setTimeout(() => {
      setActiveScene((current) => (current + 1) % scenes.length);
    }, scenes[activeScene].duration);

    return () => window.clearTimeout(timer);
  }, [activeScene, isPlaying, motionEnabled]);

  return (
    <div
      aria-label="Rapid Studios CMS product demonstration"
      aria-roledescription="carousel"
      className="relative isolate aspect-video w-full min-w-0 overflow-hidden rounded-[clamp(1rem,2.6vw,2rem)] border border-[#9fc7ff]/20 bg-[#080f1a] text-white shadow-[0_35px_90px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,255,255,0.16)]"
      role="region"
      style={{
        background:
          "radial-gradient(70% 100% at 8% 0%, rgba(55,132,239,0.34), transparent 64%), radial-gradient(65% 90% at 96% 110%, rgba(34,197,121,0.16), transparent 62%), linear-gradient(180deg, #0c1523, #080e17)"
      }}
    >
      <motion.div
        animate={motionEnabled ? { x: [0, 18, 0], y: [0, 10, 0] } : undefined}
        aria-hidden="true"
        className="absolute -left-[12%] -top-[35%] size-[70%] rounded-full bg-[#3b8af0]/15 blur-3xl"
        transition={{ duration: 8, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY }}
      />
      <motion.div
        animate={motionEnabled ? { x: [0, -14, 0], y: [0, -8, 0] } : undefined}
        aria-hidden="true"
        className="absolute -bottom-[45%] -right-[15%] size-[75%] rounded-full bg-emerald-400/10 blur-3xl"
        transition={{ duration: 10, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY }}
      />

      <div aria-live={isPlaying ? "off" : "polite"} className="sr-only">
        Scene {displayedScene + 1} of {scenes.length}: {scene.label}
      </div>

      <AnimatePresence initial={false} mode="wait">
        <motion.div
          animate={{ opacity: 1 }}
          className="absolute inset-0"
          exit={{ opacity: motionEnabled ? 0 : 1 }}
          initial={{ opacity: motionEnabled ? 0 : 1 }}
          key={scene.id}
          transition={{ duration: motionEnabled ? 0.32 : 0 }}
        >
          <Scene id={scene.id} />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-x-2 bottom-2 z-50 flex items-center gap-1.5 rounded-full border border-white/15 bg-[#07111e]/75 p-1.5 pr-[4.5rem] shadow-[0_12px_32px_rgba(0,0,0,0.35)] backdrop-blur-2xl sm:bottom-3 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:gap-2 sm:pr-1.5">
        <button
          aria-label={
            motionEnabled
              ? isPlaying
                ? "Pause CMS demonstration"
                : "Play CMS demonstration"
              : "Animation disabled by reduced motion preference"
          }
          className="grid size-8 shrink-0 place-items-center rounded-full border border-white/10 bg-white/10 text-white transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8dc2ff] disabled:cursor-not-allowed disabled:opacity-50 sm:size-9"
          disabled={!motionEnabled}
          onClick={() => setIsPlaying((current) => !current)}
          type="button"
        >
          {isPlaying && motionEnabled ? (
            <Pause aria-hidden="true" className="size-3.5" fill="currentColor" />
          ) : (
            <Play aria-hidden="true" className="size-3.5" fill="currentColor" />
          )}
        </button>

        <div aria-label="CMS demonstration scenes" className="flex min-w-0 flex-1 items-center gap-1" role="group">
          {scenes.map((item, index) => {
            const isActive = index === displayedScene;

            return (
              <button
                aria-current={isActive ? "step" : undefined}
                aria-label={`Show ${item.label} scene`}
                className={`flex h-8 min-w-0 items-center gap-1.5 rounded-full px-2 text-[10px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8dc2ff] sm:h-9 sm:px-3 sm:text-xs ${
                  isActive ? "bg-white text-[#0b1c33]" : "text-[#a8bad1] hover:bg-white/10 hover:text-white"
                }`}
                disabled={!motionEnabled}
                key={item.id}
                onClick={() => setActiveScene(index)}
                type="button"
              >
                <span className={`size-1.5 shrink-0 rounded-full ${isActive ? "bg-[#327de7]" : "bg-[#647c99]"}`} />
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
