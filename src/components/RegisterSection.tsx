"use client";

import React, { useEffect, useRef, useState, useSyncExternalStore, useCallback } from "react";
import Link from "next/link";
import { ArrowRight, Flag, Lock, Trophy, Users } from "lucide-react";
import { EVENT, REFUND, minFee, registerHref } from "@/data/festival";
import { STALLS } from "@/data/partners";
import { inr } from "@/lib/format";
import { useReplayOnScroll } from "@/hooks/useReplayOnScroll";
import { WhatsAppGlyph } from "./icons";

const HEADING_TEXT = "REGISTER IN 3 EASY STEPS – JUST 2 MINUTES";

const STEPS = [
  {
    num: "1",
    title: "CHOOSE YOUR CATEGORY",
    body: "Sport and weight class. Already chosen above? It's filled in for you.",
    icon: Trophy,
  },
  {
    num: "2",
    title: "FILL YOUR DETAILS",
    body: "Name, date of birth, mobile, email, city and association. Takes a minute.",
    icon: Users,
  },
  {
    num: "3",
    title: "PAY BY UPI QR",
    body: "Scan with GPay, PhonePe, Paytm or any UPI app, then send your UTR number. AOGA confirms your pass on WhatsApp.",
    icon: Lock,
  },
];

const pad = (n: number) => String(n).padStart(2, "0");

const tick = (cb: () => void) => {
  const t = setInterval(cb, 1000);
  return () => clearInterval(t);
};

const useCountdown = () => {
  const now = useSyncExternalStore(
    tick,
    () => Math.floor(Date.now() / 1000) * 1000,
    () => null
  );
  if (now == null) return null;
  const s = Math.max(0, Math.floor((new Date(EVENT.registrationCloses).getTime() - now) / 1000));
  return {
    total: s,
    d: Math.floor(s / 86400),
    h: Math.floor((s % 86400) / 3600),
    m: Math.floor((s % 3600) / 60),
    s: s % 60,
  };
};

export function RegisterSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const play = useReplayOnScroll(sectionRef);

  const [armedState, setArmedState] = useState<"initial" | "true" | "done">("initial");

  // Arming lifecycle with 1.5s failsafe
  useEffect(() => {
    setArmedState("true");

    const timer = setTimeout(() => {
      setArmedState((prev) => (prev === "true" ? "true" : "done"));
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Countdown timer hook
  const timeLeft = useCountdown();

  // Flip detection for clock cards
  const prevTimeRef = useRef<{ d?: number; h?: number; m?: number; s?: number }>({});
  const [flipped, setFlipped] = useState({ d: false, h: false, m: false, s: false });

  useEffect(() => {
    if (!timeLeft) return;
    const prev = prevTimeRef.current;
    const newFlipped = {
      d: prev.d !== undefined && prev.d !== timeLeft.d,
      h: prev.h !== undefined && prev.h !== timeLeft.h,
      m: prev.m !== undefined && prev.m !== timeLeft.m,
      s: prev.s !== undefined && prev.s !== timeLeft.s,
    };
    prevTimeRef.current = { d: timeLeft.d, h: timeLeft.h, m: timeLeft.m, s: timeLeft.s };
    setFlipped(newFlipped);

    const timer = setTimeout(() => {
      setFlipped({ d: false, h: false, m: false, s: false });
    }, 350);

    return () => clearTimeout(timer);
  }, [timeLeft?.s, timeLeft?.m, timeLeft?.h, timeLeft?.d]);

  // Magnetic button pull (desktop with mouse only)
  const regBtnRef = useRef<HTMLAnchorElement>(null);

  const handleBtnMouseMove = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const btn = regBtnRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dist = Math.hypot(e.clientX - centerX, e.clientY - centerY);
    if (dist < 90) {
      const pull = (1 - dist / 90) * 10;
      const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
      const mx = Math.cos(angle) * pull;
      const my = Math.sin(angle) * pull;
      btn.style.transform = `translate3d(${mx.toFixed(1)}px, ${my.toFixed(1)}px, 0)`;
    }
  }, []);

  const handleBtnMouseLeave = useCallback(() => {
    const btn = regBtnRef.current;
    if (!btn) return;
    btn.style.transform = "translate3d(0px, 0px, 0)";
  }, []);

  const clockUnits: [string, number | undefined, boolean][] = [
    ["DAYS", timeLeft?.d, flipped.d],
    ["HOURS", timeLeft?.h, flipped.h],
    ["MINS", timeLeft?.m, flipped.m],
    ["SECS", timeLeft?.s, flipped.s],
  ];

  return (
    <section
      ref={sectionRef}
      id="register"
      aria-labelledby="rg-heading"
      data-play={play}
      data-armed={armedState === "initial" ? undefined : armedState}
      className="relative bg-[#000000] text-white w-full overflow-hidden py-20 md:py-28 lg:py-32 select-none"
    >
      {/* 8 Horizontal Track Lane Lines across full width (faint diagonal fade) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex flex-col justify-between py-12 opacity-80"
        style={{
          maskImage: "linear-gradient(135deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0.15) 75%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(135deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0.15) 75%, transparent 100%)",
        }}
      >
        {[...Array(8)].map((_, i) => (
          <div key={i} className="w-full h-[1px] bg-white/[0.05]" />
        ))}
      </div>

      {/* Soft Orange Radial Glow behind heading (#FF6A00 at 14%, blur 120px) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-16 left-10 w-[650px] h-[650px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(255, 106, 0, 0.14) 0%, transparent 70%)",
          filter: "blur(120px)",
        }}
      />

      {/* Main Content Container (Full Width, page-gutter, capped at 2000px on ultra-wide) */}
      <div className="w-full max-w-[2000px] mx-auto page-gutter relative z-10">
        {/* ================================================================= */}
        {/* BAND 1 - HEADING (all sizes)                                      */}
        {/* ================================================================= */}
        <header className="w-full relative">
          <div className="flex items-start justify-between gap-6">
            <div className="max-w-5xl">
              <h2
                id="rg-heading"
                className="display text-[clamp(2.6rem,7vw,8rem)] font-black leading-[0.92] tracking-tight text-white uppercase"
              >
                <span className="sr-only">{HEADING_TEXT}</span>
                <span aria-hidden="true" className="inline-block">
                  {(() => {
                    let charCount = 0;
                    return HEADING_TEXT.split(" ").map((word, wIdx) => (
                      <span key={wIdx} className="inline-block whitespace-nowrap mr-[0.25em]">
                        {word.split("").map((ch, cIdx) => {
                          const delay = 0.08 + charCount * 0.022;
                          charCount++;
                          return (
                            <span
                              key={cIdx}
                              className="rg-split-flap-char"
                              style={{ animationDelay: `${delay.toFixed(3)}s` }}
                            >
                              {ch}
                            </span>
                          );
                        })}
                      </span>
                    ));
                  })()}
                </span>
              </h2>

              {/* Short yellow-to-orange gradient line */}
              <span
                aria-hidden="true"
                className="mt-6 block h-1 w-20 rounded-full pk-gradient-bg"
              />
            </div>

            {/* Decorative Finish Flag on lg+ */}
            <div
              aria-hidden="true"
              className="hidden lg:flex size-16 shrink-0 rounded-2xl border border-white/10 p-[1px] pk-gradient-ring items-center justify-center bg-[#0A0A0A] pointer-events-none mt-2 shadow-xl shadow-orange-500/10"
            >
              <Flag className="size-8 text-[#FF9A00] stroke-[1.8]" />
            </div>
          </div>
        </header>

        {/* ================================================================= */}
        {/* BAND 2 - THE STAIRCASE (THE 3 STEPS)                              */}
        {/* ================================================================= */}
        <div className="mt-14 sm:mt-20 relative">
          {/* 2px Gradient Baseline Floor line */}
          <div
            aria-hidden="true"
            className="rg-floor-line absolute bottom-0 left-0 right-0 h-[2px] pk-gradient-bg z-20 pointer-events-none"
          />

          {/* Hopping Ball (Desktop) */}
          <div
            aria-hidden="true"
            className="rg-ball rg-ball-desktop hidden lg:block absolute bottom-0 left-0 size-3.5 rounded-full pk-gradient-bg shadow-[0_0_14px_#FF9A00] pointer-events-none z-30"
          />

          {/* DESKTOP & TABLET: THE 3 CONNECTED PODIUM BLOCKS */}
          <ol className="hidden md:flex items-end w-full list-none p-0 m-0 relative z-10">
            {STEPS.map((s, idx) => {
              const IconComp = s.icon;
              const isWinner = idx === 2; // Step 3: tallest podium block

              // Desktop height: block 1 clamp(240px, 22vw, 320px), block 2 1.25x, block 3 1.5x
              // Tablet height: 200px / 240px / 280px
              const heightClass =
                idx === 0
                  ? "h-[200px] lg:h-[clamp(240px,22vw,320px)]"
                  : idx === 1
                  ? "h-[240px] lg:h-[clamp(300px,27.5vw,400px)]"
                  : "h-[280px] lg:h-[clamp(360px,33vw,480px)]";

              return (
                <li
                  key={s.num}
                  className="flex-1 overflow-hidden relative"
                >
                  <div
                    className={`rg-step-block rg-step-block-${idx + 1} ${heightClass} relative w-full rounded-t-3xl bg-[#0A0A0A] border-t border-l ${
                      idx === 2 ? "border-r" : ""
                    } border-white/12 p-6 lg:p-8 flex flex-col justify-between overflow-hidden`}
                    style={{
                      background:
                        "linear-gradient(to top, rgba(255, 154, 0, 0.08) 0%, #0A0A0A 65%)",
                    }}
                  >
                    {/* Winner's 3px Gradient Top Cap Line on Block 3 */}
                    {isWinner && (
                      <div
                        aria-hidden="true"
                        className="absolute top-0 inset-x-0 h-[3px] rounded-t-3xl pk-gradient-bg pointer-events-none z-20"
                      />
                    )}

                    {/* Giant Outlined Step Number behind content */}
                    <span
                      aria-hidden="true"
                      className="absolute -bottom-6 right-2 display text-[clamp(7rem,12vw,13rem)] leading-none pk-outlined-number pointer-events-none select-none z-0"
                    >
                      {s.num}
                    </span>

                    {/* Block Header: 56px Circular Step Badge & Top-Right Icon */}
                    <div className="relative z-10 flex items-start justify-between w-full">
                      <div
                        className={`rg-step-badge rg-badge-${idx + 1} size-12 lg:size-14 rounded-full border border-white/20 p-[1.5px] pk-gradient-ring flex items-center justify-center font-black text-xl lg:text-2xl shadow-lg`}
                      >
                        <span className="display leading-none">{s.num}</span>
                      </div>

                      <div className="text-white/85 p-1">
                        <IconComp className="size-7 lg:size-8 stroke-[1.8]" />
                      </div>
                    </div>

                    {/* Block Body: Title and Description */}
                    <div className="rg-step-content relative z-10 mt-auto pt-4">
                      <h3 className="display text-[clamp(1.4rem,2.2vw,2.4rem)] text-white font-black tracking-tight uppercase leading-snug">
                        {s.title}
                      </h3>
                      <p className="mt-2 text-xs lg:text-sm text-white/70 font-normal leading-relaxed max-w-sm">
                        {s.body}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>

          {/* MOBILE: THE 3 CASCADE CARDS (stacked vertically with offset) */}
          <div className="md:hidden relative w-full py-2">
            {/* Hopping Ball (Mobile) */}
            <div
              aria-hidden="true"
              className="rg-ball rg-ball-mobile absolute top-0 left-0 size-3.5 rounded-full pk-gradient-bg shadow-[0_0_14px_#FF9A00] pointer-events-none z-30"
            />

            <ol className="flex flex-col gap-4 list-none p-0 m-0 w-full">
              {STEPS.map((s, idx) => {
                const IconComp = s.icon;
                return (
                  <li
                    key={s.num}
                    style={{
                      marginLeft: `calc(${idx} * 6vw)`,
                      width: `calc(100% - ${idx} * 6vw)`,
                    }}
                    className={`rg-step-block rg-step-block-${idx + 1} relative rounded-2xl bg-[#0A0A0A] border border-white/12 p-6 flex flex-col justify-between overflow-hidden shadow-xl`}
                  >
                    {/* 2px Gradient Line on Left Edge */}
                    <span
                      aria-hidden="true"
                      className="absolute left-0 inset-y-0 w-[2px] pk-gradient-bg rounded-l-2xl pointer-events-none"
                    />

                    {/* Giant Outlined Number in background */}
                    <span
                      aria-hidden="true"
                      className="absolute -bottom-4 right-2 display text-8xl leading-none pk-outlined-number pointer-events-none select-none z-0"
                    >
                      {s.num}
                    </span>

                    <div className="relative z-10 flex items-start justify-between w-full mb-4">
                      <div
                        className={`rg-step-badge rg-badge-${idx + 1} size-12 rounded-full border border-white/20 p-[1.5px] pk-gradient-ring flex items-center justify-center font-black text-xl shadow-md`}
                      >
                        <span className="display leading-none">{s.num}</span>
                      </div>
                      <div className="text-white/85">
                        <IconComp className="size-7 stroke-[1.8]" />
                      </div>
                    </div>

                    <div className="rg-step-content relative z-10">
                      <h3 className="display text-xl sm:text-2xl text-white font-black tracking-tight uppercase leading-snug">
                        {s.title}
                      </h3>
                      <p className="mt-2 text-xs sm:text-sm text-white/70 font-normal leading-relaxed">
                        {s.body}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>

        {/* ================================================================= */}
        {/* BAND 3 - DEPARTURE BOARD (COUNTDOWN + ACTIONS)                    */}
        {/* ================================================================= */}
        <div className="mt-14 sm:mt-20 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* LEFT COLUMN: FLIP CLOCK & REFUND LINE (5 / 12) */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              {/* Header label with gradient dash */}
              <div className="flex items-center gap-3 mb-4">
                <span
                  aria-hidden="true"
                  className="h-[2px] w-5 rounded-full pk-gradient-bg"
                />
                <p className="text-white/85 text-xs font-bold uppercase tracking-[0.25em]">
                  REGISTRATIONS CLOSE IN
                </p>
              </div>

              {/* Visually hidden static text for screen readers (no spamming every second) */}
              <p className="sr-only">
                {timeLeft
                  ? `${timeLeft.d} days, ${timeLeft.h} hours, ${timeLeft.m} minutes left until registrations close`
                  : "Registrations close soon"}
              </p>

              {/* 4 Split-Flap Clock Tiles */}
              <div
                aria-hidden="true"
                className="grid grid-cols-4 gap-2.5 sm:gap-3.5"
                role="timer"
              >
                {clockUnits.map(([unit, val, isFlip], uIdx) => (
                  <div
                    key={unit}
                    className={`rg-clock-tile rg-clock-tile-${uIdx} ${
                      isFlip ? "rg-tile-flipped" : ""
                    } relative rounded-2xl bg-[#0A0A0A] border border-white/12 py-4 px-2 sm:py-5 sm:px-3 text-center overflow-hidden shadow-lg`}
                  >
                    {/* Horizontal split hairline */}
                    <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[1px] bg-white/15 z-10 pointer-events-none" />

                    {/* Hinge dots on left & right */}
                    <div className="absolute left-1 top-1/2 -translate-y-1/2 size-1.5 rounded-full bg-white/30 z-20 pointer-events-none" />
                    <div className="absolute right-1 top-1/2 -translate-y-1/2 size-1.5 rounded-full bg-white/30 z-20 pointer-events-none" />

                    {/* Number Tile */}
                    <p className="display text-[clamp(2.2rem,5vw,4.5rem)] font-black leading-none pk-gradient-text tracking-tight">
                      {val == null ? "--" : pad(val)}
                    </p>

                    {/* Unit Label */}
                    <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-white/60 mt-2">
                      {unit}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Refund line */}
            <p className="rg-action-item rg-action-refund mt-6 text-xs sm:text-sm text-white/70 font-normal leading-relaxed">
              Full refund if the event is cancelled. {REFUND.partialPct}% refund until{" "}
              {REFUND.partialUntil}. Free category change until registrations close.{" "}
              <Link
                href="/refund"
                className="rg-refund-link font-semibold text-white inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF9A00] rounded"
              >
                Refund policy
              </Link>
            </p>
          </div>

          {/* RIGHT COLUMN: ACTION STACK (7 / 12) */}
          <div className="lg:col-span-7 flex flex-col gap-3.5 w-full">
            {/* 1. REGISTER NOW Button with Magnetic Pull & Arrow Exit/Enter Swap */}
            <div className="rg-action-item rg-action-item-1 w-full">
              <Link
                ref={regBtnRef}
                href={registerHref()}
                onMouseMove={handleBtnMouseMove}
                onMouseLeave={handleBtnMouseLeave}
                className="group relative flex items-center justify-between w-full h-14 sm:h-16 px-6 sm:px-8 rounded-2xl pk-gradient-bg text-black font-black uppercase tracking-wide text-base sm:text-lg select-none shadow-xl active:scale-[0.98] transition-transform duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF9A00] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                <span className="display font-black tracking-wide text-black text-lg sm:text-xl">
                  REGISTER NOW — FROM {inr(minFee)}
                </span>

                {/* Arrow Exit and Enter Swap Container */}
                <span
                  aria-hidden="true"
                  className="size-10 rounded-full bg-black text-[#FFE600] flex items-center justify-center shrink-0 relative overflow-hidden shadow-md"
                >
                  <ArrowRight className="rg-arrow-swap-1 size-5 stroke-[2.5] absolute" />
                  <ArrowRight className="rg-arrow-swap-2 size-5 stroke-[2.5] absolute" />
                </span>
              </Link>
            </div>

            {/* 2. TEAM REGISTRATION ON WHATSAPP */}
            <div className="rg-action-item rg-action-item-2 w-full">
              <a
                href={EVENT.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-center gap-3 w-full h-14 px-6 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-base uppercase tracking-wide select-none shadow-lg active:scale-[0.98] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                <WhatsAppGlyph className="size-6 text-white" />
                <span className="tracking-wide">TEAM REGISTRATION ON WHATSAPP</span>
              </a>
            </div>

            {/* 3. Small Coaches Line */}
            <p className="rg-action-item rg-action-item-3 text-center text-xs sm:text-sm text-white/60 font-normal">
              Coaches: register your whole team in one message on WhatsApp.
            </p>

            {/* 4. EXHIBITORS & BRANDS BAR with Gradient Border & Arrow Swap */}
            <div className="rg-action-item rg-action-item-4 w-full">
              <Link
                href="/partner#stalls"
                className="group relative block w-full rounded-2xl p-[1px] pk-gradient-ring hover:shadow-[0_0_25px_rgba(255,154,0,0.3)] transition-shadow duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF9A00]"
              >
                <div className="w-full bg-[#0A0A0A] group-hover:bg-[#111111] rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 transition-colors duration-200">
                  <div>
                    <span className="block text-xs font-bold tracking-[0.25em] text-white/70 uppercase">
                      EXHIBITORS &amp; BRANDS
                    </span>
                    <span className="text-base sm:text-lg lg:text-xl font-bold text-white block mt-0.5">
                      Book a stall at the venue — from {inr(STALLS[0].price)}
                    </span>
                  </div>

                  {/* 40px Gradient Circle with Black Arrow Swap */}
                  <div
                    aria-hidden="true"
                    className="size-10 rounded-full pk-gradient-bg text-black flex items-center justify-center shrink-0 relative overflow-hidden shadow-md"
                  >
                    <ArrowRight className="rg-arrow-swap-1 size-5 stroke-[2.5] absolute" />
                    <ArrowRight className="rg-arrow-swap-2 size-5 stroke-[2.5] absolute" />
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
