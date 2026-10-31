"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  Headphones,
  HeartPulse,
  QrCode,
  ScrollText,
  ShieldCheck,
  User,
  Users,
} from "lucide-react";
import { COMMITTEE, DOCUMENTS, EVENT, ORGANISERS } from "@/data/festival";
import { useReplayOnScroll } from "@/hooks/useReplayOnScroll";

/* Precomputed 60 dial tick marks for the AOGA Seal */
const SEAL_TICKS = Array.from({ length: 60 }, (_, i) => {
  const angleDeg = i * 6;
  const angleRad = (angleDeg * Math.PI) / 180;
  const isMajor = i % 5 === 0;
  const rOuter = 196;
  const rInner = isMajor ? 180 : 188;
  const cx = 210;
  const cy = 210;
  const x1 = +(cx + rInner * Math.sin(angleRad)).toFixed(2);
  const y1 = +(cy - rInner * Math.cos(angleRad)).toFixed(2);
  const x2 = +(cx + rOuter * Math.sin(angleRad)).toFixed(2);
  const y2 = +(cy - rOuter * Math.cos(angleRad)).toFixed(2);
  return { id: i, x1, y1, x2, y2, isMajor };
});

/* Heading word & letter configuration */
const HEADING_WORDS = [
  { text: "ORGANISED", isAoga: false },
  { text: "BY", isAoga: false },
  { text: "AOGA", isAoga: true },
];

/* 6 Info cards data with exact text and semantic icons */
const INFO_ITEMS = [
  {
    icon: Users,
    num: "01",
    t: "Qualified judging panel",
    b: "Chief Judge, judges, jury and statisticians appointed by the Technical Committee. Judges must stay impartial.",
  },
  {
    icon: ScrollText,
    num: "02",
    t: "Official rules",
    b: "Conducted under rules approved by the Organising and Technical Committees. Weigh-in is compulsory.",
  },
  {
    icon: HeartPulse,
    num: "03",
    t: "Medical support",
    b: "First aid, medical personnel and ambulance / emergency coordination at the venue.",
  },
  {
    icon: QrCode,
    num: "04",
    t: "Instant Payment",
    b: "Pay securely via PayU hosted checkout using UPI, Net Banking, Cards, or Wallets. Instant confirmation on WhatsApp.",
  },
  {
    icon: BadgeCheck,
    num: "05",
    t: "Official organiser",
    b: `${EVENT.organiser}${EVENT.regdNo ? ` · Regd. No. ${EVENT.regdNo}` : ""} · ${EVENT.address}`,
  },
  {
    icon: Headphones,
    num: "06",
    t: "Real people, real help",
    b: `${EVENT.phone} · ${EVENT.email}`,
  },
];

/* 4 Viewfinder corner brackets (L-shaped, 2px gradient, 18px) */
function ViewfinderBrackets() {
  return (
    <>
      <svg
        aria-hidden="true"
        className="og-bracket og-bracket-tl absolute -top-1 -left-1 size-[18px] pointer-events-none select-none z-10"
        viewBox="0 0 18 18"
        fill="none"
      >
        <path
          d="M 0 18 L 0 0 L 18 0"
          stroke="url(#og-bracket-grad)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <svg
        aria-hidden="true"
        className="og-bracket og-bracket-tr absolute -top-1 -right-1 size-[18px] pointer-events-none select-none z-10"
        viewBox="0 0 18 18"
        fill="none"
      >
        <path
          d="M 0 0 L 18 0 L 18 18"
          stroke="url(#og-bracket-grad)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <svg
        aria-hidden="true"
        className="og-bracket og-bracket-bl absolute -bottom-1 -left-1 size-[18px] pointer-events-none select-none z-10"
        viewBox="0 0 18 18"
        fill="none"
      >
        <path
          d="M 0 0 L 0 18 L 18 18"
          stroke="url(#og-bracket-grad)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <svg
        aria-hidden="true"
        className="og-bracket og-bracket-br absolute -bottom-1 -right-1 size-[18px] pointer-events-none select-none z-10"
        viewBox="0 0 18 18"
        fill="none"
      >
        <path
          d="M 0 18 L 18 18 L 18 0"
          stroke="url(#og-bracket-grad)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </>
  );
}

export function OrganisedBySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const play = useReplayOnScroll(sectionRef);
  const [armed, setArmed] = useState(false);

  // Arm animations after mount (Never Blank Rule); 1.5s failsafe
  useEffect(() => {
    setArmed(true);
    const timer = setTimeout(() => {
      setArmed(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Compute running global letter count for stagger
  let runningLetterIdx = 0;

  return (
    <section
      ref={sectionRef}
      id="trust"
      aria-labelledby="og-main-heading"
      data-armed={armed ? "true" : "false"}
      data-play={play ? "true" : "false"}
      className="relative w-full bg-white text-[#0A0A0A] page-gutter py-20 md:py-28 lg:py-32 overflow-hidden selection:bg-[#FF8A00]/20"
    >
      {/* SVG Definitions for shared gradients */}
      <svg
        className="absolute size-0 pointer-events-none overflow-hidden"
        aria-hidden="true"
        tabIndex={-1}
      >
        <defs>
          <linearGradient id="og-bracket-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFC400" />
            <stop offset="45%" stopColor="#FF8A00" />
            <stop offset="100%" stopColor="#FF5A00" />
          </linearGradient>
          <linearGradient id="og-seal-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFC400" />
            <stop offset="45%" stopColor="#FF8A00" />
            <stop offset="100%" stopColor="#FF5A00" />
          </linearGradient>
        </defs>
      </svg>

      <div className="w-full max-w-[2000px] mx-auto space-y-16 md:space-y-20 lg:space-y-24">
        {/* ──────────────────────────────────────────────────────────
            BAND 1: HEADER + SEAL
            Desktop (lg+): 7/12 & 5/12; Mobile: Stacked
           ────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left: Heading clamp(3rem, 8vw, 9rem), highlight bar behind AOGA, paragraph */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <h2
              id="og-main-heading"
              className="font-display text-[clamp(3rem,8vw,9rem)] leading-[0.9] text-[#0A0A0A] uppercase tracking-tight"
            >
              <span className="sr-only">ORGANISED BY AOGA</span>
              <span
                aria-hidden="true"
                className="flex flex-wrap items-baseline gap-x-[0.28em] gap-y-1 select-none"
              >
                {HEADING_WORDS.map((w) => {
                  const letters = w.text.split("");
                  if (!w.isAoga) {
                    return (
                      <span key={w.text} className="inline-block whitespace-nowrap">
                        {letters.map((char) => {
                          const currentIdx = runningLetterIdx++;
                          return (
                            <span
                              key={currentIdx}
                              className="og-letter inline-block"
                              style={
                                {
                                  "--i": currentIdx,
                                  "--rot": currentIdx % 2 === 0 ? "6deg" : "-6deg",
                                } as React.CSSProperties
                              }
                            >
                              {char}
                            </span>
                          );
                        })}
                      </span>
                    );
                  }

                  // Word 3: AOGA with thick gradient bar behind
                  return (
                    <span
                      key={w.text}
                      className="relative inline-block whitespace-nowrap px-1.5 -mx-1"
                    >
                      {/* Gradient highlight bar growing upward from baseline */}
                      <span
                        aria-hidden="true"
                        className="og-heading-bar absolute inset-x-0 bottom-[4%] top-[10%] rounded-sm z-0 pointer-events-none"
                        style={{
                          background:
                            "linear-gradient(135deg, #FFC400 0%, #FF8A00 45%, #FF5A00 100%)",
                        }}
                      />
                      <span className="relative z-10 text-[#0A0A0A]">
                        {letters.map((char) => {
                          const currentIdx = runningLetterIdx++;
                          return (
                            <span
                              key={currentIdx}
                              className="og-letter inline-block"
                              style={
                                {
                                  "--i": currentIdx,
                                  "--rot": currentIdx % 2 === 0 ? "6deg" : "-6deg",
                                } as React.CSSProperties
                              }
                            >
                              {char}
                            </span>
                          );
                        })}
                      </span>
                    </span>
                  );
                })}
              </span>
            </h2>

            {/* Short gradient line */}
            <div
              aria-hidden="true"
              className="og-heading-line h-1 w-20 rounded-full mt-6 mb-5"
              style={{
                background:
                  "linear-gradient(135deg, #FFC400 0%, #FF8A00 45%, #FF5A00 100%)",
              }}
            />

            {/* Paragraph */}
            <p className="og-header-lead max-w-xl text-zinc-600 text-base sm:text-lg lg:text-xl font-normal leading-relaxed">
              All Odisha Gym Association — the state body for gyms and fitness in Odisha.
            </p>
          </div>

          {/* Right: AOGA Seal (clock-wipe reveal, 60 tick marks, 1px outer gradient ring) */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative size-[clamp(200px,26vw,420px)] flex items-center justify-center">
              {/* Very soft orange glow (max 6% opacity) */}
              <div
                aria-hidden="true"
                className="absolute -inset-5 rounded-full pointer-events-none"
                style={{
                  background:
                    "radial-gradient(circle, rgba(255,138,0,0.055) 0%, rgba(255,90,0,0) 70%)",
                }}
              />

              {/* Seal clock-wipe sweep container */}
              <div className="og-seal-sweep relative size-full rounded-full flex items-center justify-center">
                {/* SVG Dial with 60 decorative tick marks and 1px gradient outer ring */}
                <svg
                  viewBox="0 0 420 420"
                  className="absolute inset-0 size-full pointer-events-none select-none z-0"
                  aria-hidden="true"
                >
                  <circle
                    cx="210"
                    cy="210"
                    r="202"
                    fill="none"
                    stroke="url(#og-seal-grad)"
                    strokeWidth="1.5"
                  />
                  {SEAL_TICKS.map((t) => (
                    <line
                      key={t.id}
                      x1={t.x1}
                      y1={t.y1}
                      x2={t.x2}
                      y2={t.y2}
                      stroke="rgba(0, 0, 0, 0.18)"
                      strokeWidth={t.isMajor ? 1.75 : 1}
                      strokeLinecap="round"
                    />
                  ))}
                </svg>

                {/* Crest Image */}
                <Image
                  src="/img/aoga.webp"
                  alt="All Odisha Gym Association crest"
                  width={320}
                  height={331}
                  quality={100}
                  sizes="(max-width: 640px) 220px, (max-width: 1024px) 280px, 360px"
                  className="w-[66%] h-[66%] object-contain relative z-10 select-none drop-shadow-sm"
                  priority={false}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ──────────────────────────────────────────────────────────
            BAND 2: OFFICE BEARERS ORG RAIL
            Desktop: 4 columns with horizontal center-out rail & drop connectors
            Tablet: 2x2 grid with rail segments
            Mobile: Single column with vertical rail on the left
           ────────────────────────────────────────────────────────── */}
        <div className="w-full">
          {/* Desktop Rail (hidden on mobile & tablet) */}
          <div className="hidden lg:block w-full mb-3" aria-hidden="true">
            <div className="relative w-full h-[52px]">
              {/* Horizontal rail line with gradient end caps */}
              <div className="og-rail-horizontal absolute top-[5px] left-0 right-0 h-[2px] bg-black/12 rounded-full overflow-hidden">
                <div
                  className="absolute left-0 top-0 bottom-0 w-3 rounded-full"
                  style={{
                    background:
                      "linear-gradient(135deg, #FFC400 0%, #FF8A00 45%, #FF5A00 100%)",
                  }}
                />
                <div
                  className="absolute right-0 top-0 bottom-0 w-3 rounded-full"
                  style={{
                    background:
                      "linear-gradient(135deg, #FFC400 0%, #FF8A00 45%, #FF5A00 100%)",
                  }}
                />
              </div>

              {/* 4 Nodes and Connectors aligned with 4 columns */}
              <div className="grid grid-cols-4 gap-6 w-full h-full">
                {ORGANISERS.map((_, idx) => (
                  <div key={idx} className="flex flex-col items-center h-full">
                    <div
                      className={`og-rail-node og-rail-node-${idx} size-3 rounded-full shadow-sm z-10 shrink-0`}
                      style={{
                        background:
                          "linear-gradient(135deg, #FFC400 0%, #FF8A00 45%, #FF5A00 100%)",
                      }}
                    />
                    <div
                      className={`og-rail-connector og-rail-conn-${idx} w-[1px] h-[40px] bg-black/15 shrink-0`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Cards Container with responsive rails */}
          <div className="relative w-full">
            {/* Mobile Vertical Rail on the left (hidden on md+) */}
            <div
              aria-hidden="true"
              className="og-rail-vertical absolute left-2 top-8 bottom-8 w-[2px] bg-black/12 rounded-full overflow-hidden md:hidden pointer-events-none"
            >
              <div
                className="absolute top-0 left-0 right-0 h-3 rounded-full"
                style={{
                  background:
                    "linear-gradient(135deg, #FFC400 0%, #FF8A00 45%, #FF5A00 100%)",
                }}
              />
              <div
                className="absolute bottom-0 left-0 right-0 h-3 rounded-full"
                style={{
                  background:
                    "linear-gradient(135deg, #FFC400 0%, #FF8A00 45%, #FF5A00 100%)",
                }}
              />
            </div>

            {/* List of Office Bearers */}
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full list-none p-0 m-0 pl-8 md:pl-0">
              {ORGANISERS.map((o, idx) => (
                <li
                  key={o.name}
                  className={`og-officer-card og-officer-card-${idx} group relative rounded-3xl border border-black/10 bg-white p-7 shadow-sm transition-all hover:shadow-md flex flex-col justify-between overflow-hidden`}
                  style={{
                    boxShadow: "0 4px 20px -2px rgba(0, 0, 0, 0.05)",
                  }}
                >
                  {/* Mobile horizontal branch connector from left vertical rail */}
                  <div
                    aria-hidden="true"
                    className="md:hidden absolute -left-8 top-10 flex items-center pointer-events-none"
                  >
                    <div
                      className="size-3 rounded-full shadow-sm shrink-0"
                      style={{
                        background:
                          "linear-gradient(135deg, #FFC400 0%, #FF8A00 45%, #FF5A00 100%)",
                      }}
                    />
                    <div className="w-5 h-[1px] bg-black/15 shrink-0" />
                  </div>

                  {/* Giant outlined index number 01-04 (aria-hidden) */}
                  <span
                    aria-hidden="true"
                    className="og-giant-num absolute -top-3 right-4 font-display text-[clamp(6rem,10vw,9rem)] leading-none select-none pointer-events-none z-0"
                  >
                    0{idx + 1}
                  </span>

                  {/* Top: Officer Portrait / Avatar */}
                  <div className="relative z-10 flex items-center justify-between">
                    {o.image ? (
                      <div className="relative size-16 md:size-20 rounded-full overflow-hidden border-2 border-[#FF8A00] shadow-md ring-4 ring-black/5 shrink-0 bg-zinc-100">
                        <Image
                          src={o.image}
                          alt={o.name}
                          fill
                          sizes="(max-width: 768px) 64px, 80px"
                          className="object-cover object-top"
                        />
                      </div>
                    ) : (
                      <div
                        className="size-14 rounded-full flex items-center justify-center shrink-0 shadow-sm"
                        style={{
                          background:
                            "linear-gradient(135deg, #FFC400 0%, #FF8A00 45%, #FF5A00 100%)",
                        }}
                      >
                        <User className="size-6 text-black" strokeWidth={2.4} />
                      </div>
                    )}
                  </div>

                  {/* Bottom: Name and Role converging */}
                  <div className="relative z-10 mt-10">
                    <h3 className="og-officer-name font-display text-[clamp(1.5rem,2vw,2.2rem)] leading-[1.05] text-[#0A0A0A] uppercase tracking-normal">
                      {o.name}
                    </h3>

                    {/* Thin divider */}
                    <div className="w-full h-[1px] bg-black/10 my-4" />

                    {/* Role Pill */}
                    <div className="og-officer-role self-start">
                      <span className="inline-flex items-center rounded-full border border-black/15 bg-white px-3.5 py-1 text-xs uppercase tracking-wider text-zinc-700 font-medium">
                        {o.role}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ──────────────────────────────────────────────────────────
            BAND 3: PRIZE GUARANTEE BANNER (Sliding Doors Black Card)
           ────────────────────────────────────────────────────────── */}
        <div
          className="og-banner-outer w-full rounded-3xl p-[1px] relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, #FFC400 0%, #FF8A00 45%, #FF5A00 100%)",
          }}
        >
          <div className="og-banner-inner relative w-full rounded-[calc(1.5rem-1px)] bg-[#0A0A0A] overflow-hidden p-8 sm:p-10 lg:p-14">
            {/* Sliding Door Left */}
            <div
              aria-hidden="true"
              className="og-door-left absolute inset-y-0 left-0 w-1/2 bg-[#0A0A0A] z-0 pointer-events-none"
            />
            {/* Sliding Door Right */}
            <div
              aria-hidden="true"
              className="og-door-right absolute inset-y-0 right-0 w-1/2 bg-[#0A0A0A] z-0 pointer-events-none"
            />
            {/* Center Seam Flash */}
            <div
              aria-hidden="true"
              className="og-banner-seam absolute inset-y-0 left-1/2 -translate-x-1/2 w-[2px] z-10 pointer-events-none"
              style={{
                background:
                  "linear-gradient(180deg, transparent, #FFC400, #FF8A00, #FF5A00, transparent)",
              }}
            />

            {/* Right decorative watermark (ShieldCheck + concentric circles, hidden on mobile) */}
            <div
              aria-hidden="true"
              className="og-banner-watermark absolute -right-12 top-1/2 -translate-y-1/2 pointer-events-none hidden lg:flex items-center justify-center z-10 select-none"
            >
              <div className="relative size-[380px] flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border border-white/[0.08]" />
                <div className="absolute inset-14 rounded-full border border-white/[0.08]" />
                <ShieldCheck className="size-48 text-white/[0.08]" strokeWidth={1.2} />
              </div>
            </div>

            {/* Content (z-20) */}
            <div className="relative z-20 max-w-4xl flex flex-col items-start gap-6">
              {/* Tag: PRIZE GUARANTEE */}
              <div className="og-banner-tag">
                <span
                  className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold text-black uppercase tracking-wider shadow-sm"
                  style={{
                    background:
                      "linear-gradient(135deg, #FFC400 0%, #FF8A00 45%, #FF5A00 100%)",
                  }}
                >
                  <ShieldCheck className="size-4 text-black" strokeWidth={2.4} />
                  PRIZE GUARANTEE
                </span>
              </div>

              {/* Statement with ₹1.5 CRORE in gradient text */}
              <p className="og-banner-statement font-display text-white text-[clamp(1.6rem,4vw,3.8rem)] leading-[1.05] tracking-tight uppercase">
                THE{" "}
                <span className="og-gradient-text">₹1.5 CRORE</span>{" "}
                PRIZE MONEY IS COMMITTED. IT DOES NOT DEPEND ON HOW MANY ATHLETES REGISTER.
              </p>

              {/* Link: Prize & payout policy */}
              <div className="og-banner-link">
                <Link
                  href="/prizes"
                  className="og-policy-link group inline-flex items-center gap-3 rounded-full border border-transparent p-[1px] min-h-[44px] transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8A00]"
                  style={{
                    background:
                      "linear-gradient(135deg, #FFC400 0%, #FF8A00 45%, #FF5A00 100%)",
                  }}
                >
                  <span className="inline-flex items-center gap-3 rounded-full bg-[#0A0A0A] px-5 py-2.5 text-sm font-semibold text-white">
                    Prize &amp; payout policy
                    <span
                      className="flex size-6 items-center justify-center rounded-full text-black transition-transform group-hover:translate-x-0.5"
                      style={{
                        background:
                          "linear-gradient(135deg, #FFC400 0%, #FF8A00 45%, #FF5A00 100%)",
                      }}
                    >
                      <ArrowRight className="size-3.5 text-black" strokeWidth={2.5} />
                    </span>
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ──────────────────────────────────────────────────────────
            BAND 4: SIX INFO CARDS (Viewfinder Focus + Corner Brackets)
           ────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 w-full">
          {INFO_ITEMS.map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <article
                key={item.t}
                className="og-info-card group relative rounded-2xl border border-black/10 bg-white p-6 sm:p-7 lg:p-8 flex flex-col justify-between"
                style={
                  {
                    "--card-i": idx,
                    boxShadow: "0 4px 18px -2px rgba(0, 0, 0, 0.05)",
                  } as React.CSSProperties
                }
              >
                {/* 4 Camera Viewfinder Corner Brackets */}
                <ViewfinderBrackets />

                {/* Card Content container that fades in on bracket snap */}
                <div className="og-info-card-content flex flex-col h-full justify-between">
                  <div>
                    {/* Top row: 48px gradient icon holder + tiny index number 01-06 */}
                    <div className="flex items-center justify-between mb-5">
                      <div
                        className="size-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                        style={{
                          background:
                            "linear-gradient(135deg, #FFC400 0%, #FF8A00 45%, #FF5A00 100%)",
                        }}
                      >
                        <IconComponent className="size-6 text-black" strokeWidth={2.2} />
                      </div>
                      <span
                        aria-hidden="true"
                        className="font-mono text-xs font-semibold text-zinc-400 tracking-wider"
                      >
                        {item.num}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-display text-[clamp(1.4rem,1.8vw,1.9rem)] leading-tight text-[#0A0A0A] uppercase tracking-normal">
                      {item.t}
                    </h3>
                  </div>

                  {/* Description with wrapping for long strings */}
                  <p className="mt-3 text-zinc-600 text-sm leading-relaxed break-words">
                    {item.b}
                  </p>
                </div>
              </article>
            );
          })}
        </div>

        {/* ──────────────────────────────────────────────────────────
            BAND 5: ROLL CALL + CHECKLIST
            lg+: 7/12 (Organising Committee) & 5/12 (Bring On Event Day)
           ────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Card A: Organising Committee (16 Chips with Radial Fade) */}
          <div
            className="lg:col-span-7 rounded-3xl border border-black/10 bg-white p-7 sm:p-8 shadow-sm"
            style={{ boxShadow: "0 4px 20px -2px rgba(0, 0, 0, 0.05)" }}
          >
            <div className="flex items-center gap-2 mb-6">
              <span
                aria-hidden="true"
                className="inline-block h-0.5 w-6 rounded-full"
                style={{
                  background:
                    "linear-gradient(135deg, #FFC400 0%, #FF8A00 45%, #FF5A00 100%)",
                }}
              />
              <p className="text-xs uppercase tracking-[0.25em] text-zinc-700 font-bold">
                ORGANISING COMMITTEE
              </p>
            </div>

            <ul className="flex flex-wrap gap-3 list-none p-0 m-0">
              {COMMITTEE.map((name, idx) => {
                // Distance from center (16 names -> center is 7.5)
                const dist = Math.abs(idx - 7.5);
                return (
                  <li
                    key={name}
                    className="og-chip inline-flex items-center gap-2.5 h-11 px-5 rounded-full border border-black/12 bg-white text-[#0A0A0A] text-sm font-medium shadow-2xs hover:border-black/25 transition-colors select-none"
                    style={{ "--chip-dist": dist } as React.CSSProperties}
                  >
                    <span
                      aria-hidden="true"
                      className="size-1.5 rounded-full shrink-0"
                      style={{
                        background:
                          "linear-gradient(135deg, #FFC400 0%, #FF8A00 45%, #FF5A00 100%)",
                      }}
                    />
                    <span>{name}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Card B: Bring On Event Day (6 Checklist items with Ink Ripple) */}
          <div
            className="lg:col-span-5 rounded-3xl border border-black/10 bg-white p-7 sm:p-8 shadow-sm"
            style={{ boxShadow: "0 4px 20px -2px rgba(0, 0, 0, 0.05)" }}
          >
            <div className="flex items-center gap-2 mb-6">
              <span
                aria-hidden="true"
                className="inline-block h-0.5 w-6 rounded-full"
                style={{
                  background:
                    "linear-gradient(135deg, #FFC400 0%, #FF8A00 45%, #FF5A00 100%)",
                }}
              />
              <p className="text-xs uppercase tracking-[0.25em] text-zinc-700 font-bold">
                BRING ON EVENT DAY
              </p>
            </div>

            <ul className="divide-y divide-black/8 list-none p-0 m-0">
              {DOCUMENTS.map((doc, idx) => (
                <li
                  key={doc}
                  className="og-check-row relative overflow-hidden py-3.5 first:pt-1 last:pb-1 flex items-center gap-3.5"
                  style={{ "--row-i": idx } as React.CSSProperties}
                >
                  {/* Expanding Ink Ripple circle from the check center */}
                  <span
                    aria-hidden="true"
                    className="og-ink-ripple absolute left-4 top-1/2 -translate-x-1/2 -translate-y-1/2 size-10 rounded-full pointer-events-none"
                    style={{
                      background:
                        "radial-gradient(circle, rgba(255,138,0,0.18) 0%, rgba(255,90,0,0.08) 60%, transparent 100%)",
                    }}
                  />

                  {/* Check Circle 28px */}
                  <div className="og-check-circle size-7 rounded-full flex items-center justify-center shrink-0 z-10 border border-black/15 shadow-2xs">
                    <Check className="size-4 text-black" strokeWidth={2.8} />
                  </div>

                  {/* Document text */}
                  <span className="text-base sm:text-lg text-[#0A0A0A] font-medium leading-snug break-words z-10">
                    {doc}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ──────────────────────────────────────────────────────────
            FOOTNOTE & SEPARATOR LINE
           ────────────────────────────────────────────────────────── */}
        <div className="og-footnote-wrap pt-6 border-t border-black/10 w-full text-left">
          <p className="text-xs text-zinc-500 font-normal">
            Information as per the AOGA official circular, Ref. {EVENT.circularRef}.
          </p>
        </div>
      </div>
    </section>
  );
}
