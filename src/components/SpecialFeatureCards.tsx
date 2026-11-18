"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Accessibility, ArrowRight, Swords, Trophy, Medal } from "lucide-react";
import { registerHref } from "@/data/festival";
import { useReplayOnScroll } from "@/hooks/useReplayOnScroll";

export function SpecialFeatureCards() {
  const containerRef = useRef<HTMLDivElement>(null);
  const play = useReplayOnScroll(containerRef);
  const hasEntered = play;
  const isInView = play;
  const [isReduced, setIsReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setIsReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <div
      ref={containerRef}
      data-play={play}
      className="mt-8 md:mt-12 lg:mt-16 grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-5 items-stretch select-none"
    >
      {/* SVG linear-gradient definition used by border draw animation */}
      <svg aria-hidden="true" className="absolute size-0 pointer-events-none">
        <defs>
          <linearGradient id="uf-border-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFE600" />
            <stop offset="50%" stopColor="#FF9A00" />
            <stop offset="100%" stopColor="#FF6A00" />
          </linearGradient>
        </defs>
      </svg>

      {/* ============================================================== */}
      {/* CARD 1: UTKAL KESARI 2026 · DANGAL (Cols 1-7, Asymmetric 7 cols) */}
      {/* ============================================================== */}
      <article
        style={{
          "--uf-anim-state": isInView && !isReduced ? "running" : "paused",
        } as React.CSSProperties}
        className={`group relative rounded-3xl bg-[#0A0A0A] border border-white/12 p-6 sm:p-8 lg:p-10 flex flex-col justify-between overflow-hidden lg:col-span-7 uf-card-hover active:scale-[0.99] transition-transform ${
          hasEntered && !isReduced ? "uf-slash-left-active" : ""
        }`}
      >
        {/* Soft orange radial glow in top-right corner (#FF6A00 at 18%, blur 100px) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-12 -right-12 w-[340px] h-[340px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(255, 106, 0, 0.18) 0%, transparent 65%)",
            filter: "blur(100px)",
          }}
        />

        {/* Faint dot-grid pattern masked to fade out toward bottom-left */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 uf-dot-grid"
        />

        {/* Large Decorative Swords Watermark Icon */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-6 md:-right-8 -bottom-6 md:-bottom-8 opacity-[0.06] md:opacity-[0.08] text-white uf-watermark-float uf-hover-rotate"
        >
          <Swords className="size-[180px] md:size-[280px] stroke-[1.2]" />
        </div>

        {/* Animated SVG Border Draw during entrance */}
        {hasEntered && !isReduced && (
          <svg
            aria-hidden="true"
            className="absolute inset-0 size-full pointer-events-none rounded-3xl overflow-hidden"
          >
            <rect
              x="1"
              y="1"
              width="calc(100% - 2px)"
              height="calc(100% - 2px)"
              rx="24"
              fill="none"
              stroke="url(#uf-border-gradient)"
              strokeWidth="2"
              pathLength="1"
              className="uf-border-svg-draw"
            />
          </svg>
        )}

        {/* Top: Eyebrow label + matching top-right badge */}
        <div className={`relative z-10 flex items-center justify-between ${hasEntered && !isReduced ? "uf-seq-1" : ""}`}>
          <div className="flex items-center">
            <span className="size-2 rounded-full uf-gradient-bg mr-2.5 inline-block shrink-0 shadow-sm shadow-orange-500/50" />
            <p className="text-xs font-bold tracking-[0.25em] text-[#FFE600] uppercase">
              Utkal Kesari 2026 · Dangal (Matti Kusti)
            </p>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#FF6A00]/40 bg-[#FF6A00]/10 text-[11px] font-black uppercase tracking-wider text-[#FF6A00]">
            <Trophy className="size-3.5 stroke-[2.5]" />
            <span>Royal Enfield Bullet</span>
          </span>
        </div>

        {/* Middle: Big Headline "25 YEARS" + Subtitle + Highlights */}
        <div className="relative z-10 my-5 sm:my-7">
          <h3 className="display tracking-tight text-white uppercase">
            <span className="block text-[clamp(3.5rem,10vw,7.5rem)] font-black leading-[0.95] text-transparent bg-clip-text bg-gradient-to-r from-[#FFE600] via-[#FF9A00] to-[#FF6A00] drop-shadow-[0_4px_30px_rgba(255,106,0,0.45)]">
              25 YEARS
            </span>
            <span className="block text-[clamp(1.3rem,2.8vw,2.4rem)] text-white font-black mt-2 leading-tight tracking-wide">
              LATER, THE DANGAL RETURNS
            </span>
          </h3>

          {/* Short gradient divider */}
          <span
            aria-hidden="true"
            className="mt-3.5 sm:mt-4 block h-1 w-20 rounded-full uf-gradient-bg"
          />

          {/* Quick Prize Highlights Pill Badges */}
          <div className="mt-4 sm:mt-5 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#FFE600]/30 bg-[#FFE600]/10 text-xs sm:text-sm font-bold text-[#FFE600]">
              <Trophy className="size-3.5 sm:size-4 shrink-0 text-[#FFE600]" />
              <span>Men&apos;s Winner: <b>Royal Enfield Bullet + Gada</b></span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/15 bg-white/5 text-xs sm:text-sm font-semibold text-white/90">
              <Medal className="size-3.5 sm:size-4 shrink-0 text-[#FF6A00]" />
              <span>Women&apos;s Winner: <b>₹1,00,000 + Gada</b></span>
            </span>
          </div>

          {/* Paragraph text */}
          <p className="mt-3.5 text-sm sm:text-base text-white/75 leading-relaxed font-normal max-w-2xl">
            Rooted in India’s wrestling tradition. Traditional mud wrestling (Matti Kusti) returns to Odisha after a quarter of a century. Plus weight-category bouts for men and women across all divisions — entry fee just ₹1,000.
          </p>
        </div>

        {/* Bottom: Register for Dangal CTA */}
        <div className="relative z-10 pt-2 flex flex-wrap items-center justify-between gap-3">
          <Link
            href={registerHref("dangal")}
            className="group relative inline-flex items-center justify-between w-full sm:w-auto min-h-[48px] h-12 sm:h-12 px-1 rounded-full p-[1px] uf-gradient-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF9A00] select-none"
          >
            <span className="flex items-center justify-between gap-3 w-full h-full px-5 rounded-full bg-[#0A0A0A] group-hover:bg-[#0A0A0A]/85 transition-colors duration-300">
              <span className="text-sm sm:text-base font-bold text-white tracking-wide">
                Register for Dangal
              </span>
              <span className="size-7 rounded-full uf-gradient-bg flex items-center justify-center text-black shrink-0 transition-transform duration-300 group-hover:translate-x-1 shadow-sm shadow-orange-500/30">
                <ArrowRight className="size-4 stroke-[2.5]" />
              </span>
            </span>
          </Link>

          <span className="text-xs font-semibold text-white/50 uppercase tracking-widest hidden sm:inline">
            Baramunda Ground · 4–6 Dec 2026
          </span>
        </div>
      </article>

      {/* ============================================================== */}
      {/* CARD 2: STAR CATEGORY · PARA-ATHLETES (Cols 8-12, 5 cols)       */}
      {/* ============================================================== */}
      <article
        style={{
          "--uf-anim-state": isInView && !isReduced ? "running" : "paused",
        } as React.CSSProperties}
        className={`group relative rounded-3xl bg-[#0A0A0A] border border-white/12 p-6 sm:p-8 lg:p-10 flex flex-col justify-between overflow-hidden lg:col-span-5 uf-card-hover active:scale-[0.99] transition-transform ${
          hasEntered && !isReduced ? "uf-slash-right-active uf-shake-active" : ""
        }`}
      >
        {/* Conic/radial glow from bottom-left corner */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-16 -left-16 w-[360px] h-[360px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(255, 106, 0, 0.18) 0%, transparent 65%)",
            filter: "blur(90px)",
          }}
        />

        {/* Top-Right: 3 Pulsing Concentric Circles centered behind Accessibility Icon */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-6 right-6 sm:top-8 sm:right-8 flex items-center justify-center size-[72px]"
        >
          {/* Concentric circles 120px, 200px, 280px */}
          <span className="absolute size-[120px] rounded-full border border-white/[0.08] uf-pulse-1" />
          <span className="absolute size-[200px] rounded-full border border-white/[0.08] uf-pulse-2" />
          <span className="absolute size-[280px] rounded-full border border-white/[0.08] uf-pulse-3" />

          {/* 72px Gradient Rounded-2xl Box with Accessibility Icon */}
          <div className="relative z-10 size-[72px] rounded-2xl uf-gradient-bg flex items-center justify-center shadow-lg shadow-orange-500/20">
            <Accessibility className="size-9 text-black stroke-[2.2]" />
          </div>
        </div>

        {/* Animated SVG Border Draw during entrance */}
        {hasEntered && !isReduced && (
          <svg
            aria-hidden="true"
            className="absolute inset-0 size-full pointer-events-none rounded-3xl overflow-hidden"
          >
            <rect
              x="1"
              y="1"
              width="calc(100% - 2px)"
              height="calc(100% - 2px)"
              rx="24"
              fill="none"
              stroke="url(#uf-border-gradient)"
              strokeWidth="2"
              pathLength="1"
              className="uf-border-svg-draw"
            />
          </svg>
        )}

        {/* Top: Eyebrow label */}
        <div className={`relative z-10 flex items-center ${hasEntered && !isReduced ? "uf-seq-1" : ""}`}>
          <span className="size-2 rounded-full uf-gradient-bg mr-2.5 inline-block shrink-0 shadow-sm shadow-orange-500/50" />
          <p className="text-xs font-semibold tracking-[0.25em] text-white/85 uppercase">
            Star Category · Para-athletes
          </p>
        </div>

        {/* Middle: Big Headline "FREE" + Subtitle */}
        <div className="relative z-10 my-6 sm:my-8">
          <h3 className="display leading-[0.85] tracking-tight text-white uppercase">
            <span className="block text-[clamp(4rem,13vw,9rem)] font-black leading-[0.85] text-transparent bg-clip-text bg-gradient-to-r from-[#FFE600] to-[#FF9A00] drop-shadow-[0_4px_24px_rgba(255,230,0,0.35)]">
              FREE
            </span>
            <span className="block text-[clamp(1.2rem,2.6vw,2rem)] text-white font-black mt-2 leading-tight uppercase">
              registration · ₹2,10,000 prizes
            </span>
          </h3>

          {/* Paragraph */}
          <p
            className={`mt-4 sm:mt-5 text-base md:text-lg text-white/70 leading-relaxed font-normal ${
              hasEntered && !isReduced ? "uf-seq-3" : ""
            }`}
          >
            For athletes with physical disabilities. Different bodies, same spirit.
          </p>
        </div>

        {/* Bottom: Proper Button-Link with 1px Gradient Border */}
        <div className={`relative z-10 pt-2 ${hasEntered && !isReduced ? "uf-seq-4" : ""}`}>
          <Link
            href={registerHref("bodybuilding", "star", "Open")}
            className="group relative inline-flex items-center justify-between w-full sm:w-auto min-h-[48px] h-12 sm:h-12 px-1 rounded-full p-[1px] uf-gradient-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF9A00] select-none"
          >
            {/* Inner Dark Background that fades to subtle gradient on hover */}
            <span className="flex items-center justify-between gap-3 w-full h-full px-5 rounded-full bg-[#0A0A0A] group-hover:bg-[#0A0A0A]/85 transition-colors duration-300">
              <span className="text-sm sm:text-base font-bold text-white tracking-wide">
                Register free
              </span>
              <span className="size-7 rounded-full uf-gradient-bg flex items-center justify-center text-black shrink-0 transition-transform duration-300 group-hover:translate-x-1 shadow-sm shadow-orange-500/30">
                <ArrowRight className="size-4 stroke-[2.5]" />
              </span>
            </span>
          </Link>
        </div>
      </article>
    </div>
  );
}
