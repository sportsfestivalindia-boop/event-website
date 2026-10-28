"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Gavel, Megaphone, Award, Radio, ShieldCheck } from "lucide-react";
import { useReplayOnScroll } from "@/hooks/useReplayOnScroll";
import { SpecialFeatureCards } from "./SpecialFeatureCards";

export interface ChampionPerson {
  name: string;
  role: string;
  tag: string;
  tagIcon: React.ComponentType<{ className?: string }>;
  image: string;
  alt: string;
  badgeVariant?: "gold" | "orange";
  indexStr: string;
}

// Group 1 - JUDGES (3 in one line)
const JUDGES_DATA: ChampionPerson[] = [
  {
    name: "PRASAD KUMAR",
    role: "Judge at Anil Gochhikar Classic · 15× Mr India Gold · 5× Champion of Champions",
    tag: "Judge",
    tagIcon: Gavel,
    image: "https://res.cloudinary.com/jxvpizz0/image/upload/v1793169641/MR.PRASAD_KUMAR.jpg",
    alt: "Prasad Kumar, judge at Anil Gochhikar Classic",
    indexStr: "01",
  },
  {
    name: "SHIKHA THAPA",
    role: "Judge at Bikini Model",
    tag: "Judge",
    tagIcon: Gavel,
    image: "https://res.cloudinary.com/jxvpizz0/image/upload/v1793169642/MS.SHIKHA_THAPA.jpg",
    alt: "Shikha Thapa, judge at Bikini Model",
    indexStr: "02",
  },
  {
    name: "EDWIN WILSON",
    role: "Judge at Anil Gochhikar Classic",
    tag: "Judge",
    tagIcon: Gavel,
    image: "https://res.cloudinary.com/jxvpizz0/image/upload/v1793169642/EDWIN_WILSON.jpg",
    alt: "Edwin Wilson, judge at Anil Gochhikar Classic",
    indexStr: "03",
  },
];

// Group 2 - SPECIAL GUESTS (2 VIP Spotlight Cards with Different UI & Animations)
const GUESTS_DATA: ChampionPerson[] = [
  {
    name: "NIPUN AGARWAL",
    role: "Social Media Influencer",
    tag: "Voice of Athletes",
    tagIcon: Megaphone,
    image: "https://res.cloudinary.com/jxvpizz0/image/upload/v1793169638/MR.NIPUN_AGARWAL.jpg",
    alt: "Nipun Agarwal, social media influencer and voice of athletes",
    badgeVariant: "orange",
    indexStr: "01",
  },
  {
    name: "SURYABANSHI SURAJ",
    role: "Minister of Sports & Youth Services, Government of Odisha",
    tag: "Honourable Guest",
    tagIcon: Award,
    image: "https://res.cloudinary.com/jxvpizz0/image/upload/v1793169643/MR.SURYABANSHI_SURAJ.jpg",
    alt: "Suryabanshi Suraj, Minister of Sports & Youth Services, Government of Odisha",
    badgeVariant: "gold",
    indexStr: "02",
  },
];

// Group 3 - ASSOCIATION (Official Federation Leadership · 3 in one line)
const ASSOCIATION_DATA: ChampionPerson[] = [
  {
    name: "SANTOSH MOHANTY",
    role: "President · All Odisha Gym Association (AOGA)",
    tag: "President",
    tagIcon: ShieldCheck,
    image: "https://res.cloudinary.com/jxvpizz0/image/upload/v1793193881/SANTOSH_MOHANTY.png",
    alt: "Santosh Mohanty, President of All Odisha Gym Association (AOGA)",
    badgeVariant: "gold",
    indexStr: "01",
  },
  {
    name: "ANIL GOCHHIKAR",
    role: "Senior Vice-President · International Bodybuilder · Mr World Bronze",
    tag: "Sr. Vice-President",
    tagIcon: Award,
    image: "https://res.cloudinary.com/jxvpizz0/image/upload/v1793193881/Anil_gochhikar.jpg",
    alt: "Anil Gochhikar, Senior Vice-President and International Bodybuilder",
    badgeVariant: "gold",
    indexStr: "02",
  },
  {
    name: "DWITI KRUSHNA BEHERA",
    role: "Secretary · All Odisha Gym Association (AOGA)",
    tag: "Secretary",
    tagIcon: ShieldCheck,
    image: "https://res.cloudinary.com/jxvpizz0/image/upload/v1793193881/Dwiti_Krushna_Behera.jpg",
    alt: "Dwiti Krushna Behera, Secretary of All Odisha Gym Association (AOGA)",
    badgeVariant: "gold",
    indexStr: "03",
  },
];

// =========================================================================
// GROUP 1: JUDGES (3 IN ONE LINE - ZERO HEAD CUT, ZERO BODY CUT)
// =========================================================================
function JudgesSection({ isReduced }: { isReduced: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const play = useReplayOnScroll(containerRef);
  const hasEntered = play;

  return (
    <div
      ref={containerRef}
      role="group"
      aria-label="Judges"
      className="w-full"
    >
      {/* Eyebrow and Sub-label Row */}
      <div className="flex items-center justify-between gap-6 mb-6 md:mb-8">
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="h-0.5 w-6 rounded-full ch-gradient-bg" />
          <p className="text-xs font-semibold tracking-[0.25em] text-white/85 uppercase">
            JUDGES
          </p>
        </div>

        <div
          aria-hidden="true"
          className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/60"
        >
          <span className="size-1.5 rounded-full bg-[#FF9A00]" />
          <span>Official Festival Jury · 03</span>
        </div>
      </div>

      {/* 3 Judges in One Line (Desktop & Tablet: 3 columns; Mobile: 1 column) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 w-full">
        {JUDGES_DATA.map((person, idx) => {
          const TagIcon = person.tagIcon;
          const numStr = person.indexStr;

          return (
            <article
              key={person.name}
              style={{
                transitionDelay: hasEntered && !isReduced ? `${idx * 140}ms` : "0ms",
              }}
              className={`group relative rounded-3xl overflow-hidden border border-white/12 bg-gradient-to-b from-[#141414] via-[#0A0A0A] to-[#040404] p-3 transition-all duration-700 cubic-bezier(0.16, 1, 0.3, 1) hover:-translate-y-2 hover:border-[#FF9A00]/50 hover:shadow-[0_16px_44px_rgba(255,154,0,0.14)] ${
                hasEntered || isReduced
                  ? "opacity-100 translate-y-0 scale-100"
                  : "opacity-0 translate-y-8 scale-[0.98]"
              }`}
            >
              {/* Master Portrait Frame: Exact 4:5 Aspect Ratio (Matches 3375x4219 Photo) */}
              <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden bg-[#0d0d0d]">
                {/* 100% UNCUT IMAGE: Full Head & Full Body with ample headroom */}
                <Image
                  src={person.image}
                  alt={person.alt}
                  fill
                  priority={idx === 0}
                  sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                  className="object-cover object-[center_top] transition-transform duration-700 cubic-bezier(0.16, 1, 0.3, 1) group-hover:scale-105"
                />

                {/* Top Corner Pill Badge & Outlined Number */}
                <div className="absolute top-0 inset-x-0 p-4 sm:p-5 flex items-center justify-between z-10 pointer-events-none">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase text-white bg-black/65 backdrop-blur-md border border-white/20 shadow-lg">
                    <TagIcon className="size-3.5 text-[#FF9A00] shrink-0" />
                    <span>{person.tag}</span>
                  </span>

                  <span className="ch-outlined-number display text-4xl sm:text-5xl font-normal leading-none select-none opacity-85 group-hover:opacity-100 transition-opacity">
                    {numStr}
                  </span>
                </div>

                {/* Bottom Gradient Overlay: Protects Face & Chest, darkens suit for text legibility */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-black via-black/80 via-35% to-transparent pointer-events-none"
                />

                {/* Bottom Details Overlay */}
                <div className="absolute bottom-0 inset-x-0 p-5 sm:p-6 z-10 pointer-events-none">
                  {/* Expanding gold accent line on hover */}
                  <div className="h-0.5 w-10 group-hover:w-full ch-gradient-bg rounded-full transition-all duration-500 mb-2.5" />

                  <h3 className="display text-2xl sm:text-3xl lg:text-[1.9rem] text-white tracking-tight uppercase group-hover:text-[#FFE600] transition-colors duration-300 leading-tight">
                    {person.name}
                  </h3>

                  <p className="text-xs sm:text-sm text-white/75 mt-1.5 font-normal leading-relaxed line-clamp-2">
                    {person.role}
                  </p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

// =========================================================================
// GROUP 2: SPECIAL GUESTS (DIFFERENT UI & DIFFERENT ANIMATIONS)
// Widescreen Executive VIP Suites · Live Waveforms · Shimmer Sweep
// =========================================================================
function SpecialGuestsShowcase({ isReduced }: { isReduced: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const play = useReplayOnScroll(containerRef);
  const hasEntered = play;

  return (
    <div
      ref={containerRef}
      role="group"
      aria-label="Special guests"
      className="w-full"
    >
      {/* Eyebrow Header Row */}
      <div className="flex items-center justify-between gap-6 mb-6 md:mb-8">
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="h-0.5 w-6 rounded-full ch-gradient-bg" />
          <p className="text-xs font-semibold tracking-[0.25em] text-white/85 uppercase">
            SPECIAL GUESTS
          </p>
        </div>

        <div
          aria-hidden="true"
          className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#FF9A00]"
        >
          <span className="size-1.5 rounded-full bg-[#FF9A00] animate-ping" />
          <span>VIP Prestige Stage · 02</span>
        </div>
      </div>

      {/* 2-Column VIP Executive Dossier Suites (Different UI: Horizontal Split Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
        {GUESTS_DATA.map((guest, idx) => {
          const TagIcon = guest.tagIcon;
          const isGold = guest.badgeVariant === "gold";
          const isVoice = guest.tag === "Voice of Athletes";

          return (
            <article
              key={guest.name}
              style={{
                transitionDelay: hasEntered && !isReduced ? `${idx * 180}ms` : "0ms",
              }}
              className={`group relative rounded-3xl overflow-hidden border border-white/12 bg-gradient-to-br from-[#161616] via-[#0E0E0E] to-[#050505] p-5 sm:p-6 lg:p-7 transition-all duration-700 cubic-bezier(0.16, 1, 0.3, 1) hover:-translate-y-2.5 hover:border-[#FF9A00]/50 ${
                isGold
                  ? "hover:shadow-[0_24px_60px_rgba(245,158,11,0.22)]"
                  : "hover:shadow-[0_24px_60px_rgba(249,115,22,0.22)]"
              } ${
                hasEntered || isReduced
                  ? "opacity-100 translate-y-0 scale-100"
                  : "opacity-0 translate-y-8 scale-[0.98]"
              }`}
            >
              {/* ANIMATION 1: Metallic Light Sweep Shimmer Gliding Across the Card */}
              <div
                aria-hidden="true"
                className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl"
              >
                <div className="absolute -inset-full w-[300%] h-full bg-gradient-to-r from-transparent via-white/[0.07] to-transparent sg-shimmer-sweep" />
              </div>

              {/* ANIMATION 2: Atmospheric Breathing Radial Aura behind Card */}
              <div
                aria-hidden="true"
                className={`absolute inset-0 pointer-events-none rounded-3xl transition-opacity duration-700 ${
                  isGold
                    ? "bg-[radial-gradient(circle_at_25%_40%,_rgba(245,158,11,0.18),transparent_70%)]"
                    : "bg-[radial-gradient(circle_at_25%_40%,_rgba(249,115,22,0.16),transparent_70%)]"
                } ${isReduced ? "opacity-15" : "sg-aura-pulse"}`}
              />

              {/* Two-Column Internal Layout: Left = Framed Master Portrait Bay, Right = VIP Credentials Bay */}
              <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-stretch gap-6 lg:gap-7 h-full">
                {/* Master Framed Portrait Bay: Exact 4:5 Aspect Ratio (NO HEAD CUT, NO BODY CUT) */}
                <div className="relative w-full sm:w-[230px] lg:w-[250px] shrink-0 aspect-[4/5] rounded-2xl overflow-hidden border border-white/15 bg-black shadow-2xl">
                  {/* Photo with 100% Uncut Head & Body */}
                  <Image
                    src={guest.image}
                    alt={guest.alt}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 250px, 100vw"
                    className="object-cover object-[center_top] transition-transform duration-700 cubic-bezier(0.16, 1, 0.3, 1) group-hover:scale-105"
                  />

                  {/* Micro VIP Corner Monogram Tag */}
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-md border border-white/20 text-[10px] font-mono tracking-widest uppercase text-[#FF9A00] font-bold shadow-md pointer-events-none">
                    VIP · {guest.indexStr}
                  </div>

                  {/* Gentle vignette around edges */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/20 pointer-events-none"
                  />
                </div>

                {/* VIP Credentials & Dynamic Audio / Leadership Bay */}
                <div className="flex-1 flex flex-col justify-between py-1 w-full text-left">
                  {/* Top: VIP Status Pill Badge & Numeric Indicator */}
                  <div className="flex items-center justify-between gap-3">
                    <span
                      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase backdrop-blur-md shadow-md border ${
                        isGold
                          ? "bg-amber-500/15 border-amber-500/35 text-amber-300"
                          : "bg-orange-500/15 border-orange-500/35 text-orange-300"
                      }`}
                    >
                      <TagIcon className="size-3.5 shrink-0" />
                      <span>{guest.tag}</span>
                      <span className="size-1.5 rounded-full bg-current animate-pulse ml-0.5" />
                    </span>

                    <span className="ch-outlined-number display text-4xl sm:text-5xl font-normal leading-none select-none opacity-75 group-hover:opacity-100 transition-opacity">
                      {guest.indexStr}
                    </span>
                  </div>

                  {/* Middle: Prominent Name & Role */}
                  <div className="my-4 sm:my-3">
                    {/* Golden accent indicator */}
                    <div className="h-0.5 w-10 group-hover:w-20 ch-gradient-bg rounded-full transition-all duration-500 mb-2.5" />

                    <h3 className="display text-2xl sm:text-3xl lg:text-[2.2rem] text-white tracking-tight uppercase group-hover:text-[#FFE600] transition-colors duration-300 leading-[1.05]">
                      {guest.name}
                    </h3>

                    <p className="text-sm sm:text-base text-white/80 mt-2 font-normal leading-relaxed">
                      {guest.role}
                    </p>
                  </div>

                  {/* Bottom: BESPOKE SIGNATURE ANIMATIONS (Distinct per guest!) */}
                  {isVoice ? (
                    /* ANIMATION 3: Dynamic Live Soundwave Equalizer for Voice of Athletes */
                    <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-1.5 h-6">
                        <span className="w-1 bg-[#FF9A00] rounded-full sg-bar-1" />
                        <span className="w-1 bg-[#FF6A00] rounded-full sg-bar-2" />
                        <span className="w-1 bg-[#FFE600] rounded-full sg-bar-3" />
                        <span className="w-1 bg-[#FF9A00] rounded-full sg-bar-4" />
                        <span className="w-1 bg-[#FF6A00] rounded-full sg-bar-5" />
                        <span className="w-1 bg-[#FFE600] rounded-full sg-bar-2" />
                        <span className="w-1 bg-[#FF9A00] rounded-full sg-bar-4" />
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] font-mono tracking-widest uppercase text-white/60">
                        <Radio className="size-3 text-[#FF9A00] animate-pulse" />
                        <span>Voice of Athletes</span>
                      </div>
                    </div>
                  ) : (
                    /* ANIMATION 4: State Leadership Energy Ray for Minister Suraj */
                    <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
                      <div className="relative h-1 w-full bg-white/10 rounded-full overflow-hidden">
                        <div className="absolute top-0 bottom-0 w-1/3 ch-gradient-bg rounded-full sg-beam-glide" />
                      </div>

                      <div className="flex items-center justify-between gap-2 text-[11px] font-mono tracking-widest uppercase text-white/60">
                        <span className="flex items-center gap-1.5 text-amber-300/90">
                          <ShieldCheck className="size-3.5 text-amber-400" />
                          <span>Government of Odisha</span>
                        </span>
                        <span>Sports Leadership</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

// =========================================================================
// GROUP 3: ASSOCIATION (GOVERNING BODY · 3 IN ONE LINE - ZERO HEAD/BODY CUT)
// =========================================================================
function AssociationSection({ isReduced }: { isReduced: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const play = useReplayOnScroll(containerRef);
  const hasEntered = play;

  return (
    <div
      ref={containerRef}
      role="group"
      aria-label="Association leadership"
      className="w-full"
    >
      {/* Eyebrow and Sub-label Row */}
      <div className="flex items-center justify-between gap-6 mb-6 md:mb-8">
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="h-0.5 w-6 rounded-full ch-gradient-bg" />
          <p className="text-xs font-semibold tracking-[0.25em] text-white/85 uppercase">
            ASSOCIATION
          </p>
        </div>

        <div
          aria-hidden="true"
          className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#FFE600]/80 shrink-0"
        >
          <span className="size-1.5 rounded-full bg-[#FFE600] animate-pulse" />
          <span>
            <span className="hidden sm:inline">All Odisha Gym Association</span>
            <span className="sm:hidden">AOGA Federation</span> · 03
          </span>
        </div>
      </div>

      {/* 3 Association Leaders in One Line (Desktop & Tablet: 3 columns; Mobile: 1 column) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 w-full">
        {ASSOCIATION_DATA.map((person, idx) => {
          const TagIcon = person.tagIcon;
          const numStr = person.indexStr;

          return (
            <article
              key={person.name}
              style={{
                transitionDelay: hasEntered && !isReduced ? `${idx * 140}ms` : "0ms",
              }}
              className={`group relative rounded-3xl overflow-hidden border border-white/12 bg-gradient-to-b from-[#151515] via-[#0B0B0B] to-[#030303] p-3 transition-all duration-700 cubic-bezier(0.16, 1, 0.3, 1) hover:-translate-y-2 hover:border-[#FFE600]/50 hover:shadow-[0_20px_50px_rgba(255,230,0,0.15)] ${
                hasEntered || isReduced
                  ? "opacity-100 translate-y-0 scale-100"
                  : "opacity-0 translate-y-8 scale-[0.98]"
              }`}
            >
              {/* Master Portrait Frame: Exact 4:5 Aspect Ratio (NO HEAD CUT, NO BODY CUT) */}
              <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden bg-[#0d0d0d]">
                {/* 100% UNCUT IMAGE: Full Head & Full Body with ample headroom */}
                <Image
                  src={person.image}
                  alt={person.alt}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                  className="object-cover object-[center_top] transition-transform duration-700 cubic-bezier(0.16, 1, 0.3, 1) group-hover:scale-105"
                />

                {/* Top Corner Pill Badge & Outlined Number */}
                <div className="absolute top-0 inset-x-0 p-4 sm:p-5 flex items-center justify-between z-10 pointer-events-none">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase text-amber-300 bg-black/75 backdrop-blur-md border border-amber-400/35 shadow-lg">
                    <TagIcon className="size-3.5 text-[#FFE600] shrink-0" />
                    <span>{person.tag}</span>
                  </span>

                  <span className="ch-outlined-number display text-4xl sm:text-5xl font-normal leading-none select-none opacity-85 group-hover:opacity-100 transition-opacity">
                    {numStr}
                  </span>
                </div>

                {/* Bottom Gradient Overlay: Protects Face & Chest, darkens suit for text legibility */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-black via-black/80 via-35% to-transparent pointer-events-none"
                />

                {/* Bottom Details Overlay */}
                <div className="absolute bottom-0 inset-x-0 p-5 sm:p-6 z-10 pointer-events-none">
                  {/* Expanding gold accent line on hover */}
                  <div className="h-0.5 w-10 group-hover:w-full ch-gradient-bg rounded-full transition-all duration-500 mb-2.5" />

                  <h3 className="display text-2xl sm:text-3xl lg:text-[1.85rem] text-white tracking-tight uppercase group-hover:text-[#FFE600] transition-colors duration-300 leading-tight">
                    {person.name}
                  </h3>

                  <p className="text-xs sm:text-sm text-white/75 mt-1.5 font-normal leading-relaxed line-clamp-2">
                    {person.role}
                  </p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

// =========================================================================
// MAIN SECTION EXPORT
// =========================================================================
export function ChampionsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const play = useReplayOnScroll(sectionRef);
  const [isReduced, setIsReduced] = useState(false);

  // Check prefers-reduced-motion
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setIsReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Heading scroll-fill animation (pure CSS variables per word)
  useEffect(() => {
    if (isReduced) return;
    const heading = headingRef.current;
    if (!heading) return;

    let rafId: number | null = null;
    const handleScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        const rect = heading.getBoundingClientRect();
        const vh = window.innerHeight;
        const start = vh * 0.88;
        const end = vh * 0.35;
        const rawP = (start - rect.top) / (start - end);
        const p = Math.max(0, Math.min(1, rawP));

        const f0 = Math.max(0, Math.min(1, (p - 0.0) / 0.2));
        const f1 = Math.max(0, Math.min(1, (p - 0.2) / 0.2));
        const f2 = Math.max(0, Math.min(1, (p - 0.4) / 0.2));
        const f3 = Math.max(0, Math.min(1, (p - 0.6) / 0.25));
        const f4 = Math.max(0, Math.min(1, (p - 0.85) / 0.15));

        heading.style.setProperty("--ch-fill-0", f0.toFixed(3));
        heading.style.setProperty("--ch-fill-1", f1.toFixed(3));
        heading.style.setProperty("--ch-fill-2", f2.toFixed(3));
        heading.style.setProperty("--ch-fill-3", f3.toFixed(3));
        heading.style.setProperty("--ch-fill-4", f4.toFixed(3));
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [isReduced]);

  return (
    <section
      id="champions"
      aria-labelledby="ch-heading"
      ref={sectionRef}
      data-play={play}
      className="relative bg-[#000000] text-white w-full page-gutter py-20 md:py-28 overflow-hidden scroll-mt-16"
    >
      <div className="content-contain mx-auto w-full">
        {/* Main Section Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 md:mb-14">
          <div>
            <h2
              id="ch-heading"
              ref={headingRef}
              className="display text-[clamp(2.4rem,6.8vw,5.5rem)] leading-[0.96] tracking-tight uppercase"
            >
              <span className="ch-word" style={{ "--ch-fill": "var(--ch-fill-0, 0)" } as React.CSSProperties}>
                INDIA&apos;S
              </span>{" "}
              <span className="ch-word" style={{ "--ch-fill": "var(--ch-fill-1, 0)" } as React.CSSProperties}>
                CHAMPIONS
              </span>{" "}
              <span className="ch-word" style={{ "--ch-fill": "var(--ch-fill-2, 0)" } as React.CSSProperties}>
                ARE
              </span>{" "}
              <span
                className="ch-word-gradient inline-block"
                style={{ "--ch-fill": "var(--ch-fill-3, 0)" } as React.CSSProperties}
              >
                BEHIND THIS
              </span>{" "}
              <span className="ch-word" style={{ "--ch-fill": "var(--ch-fill-4, 0)" } as React.CSSProperties}>
                FESTIVAL.
              </span>
            </h2>

            {/* Short yellow-to-orange gradient line */}
            <span
              aria-hidden="true"
              className="mt-5 block h-1 w-24 rounded-full ch-gradient-bg"
            />
          </div>
        </div>

        {/* Groups Stacked Vertically with clamp(3.5rem, 7vw, 7rem) gap */}
        <div className="flex flex-col gap-[clamp(3.5rem,7vw,7rem)]">
          {/* Group 1: Judges (3 in one line, 100% uncut photos) */}
          <JudgesSection isReduced={isReduced} />

          {/* Group 2: Special Guests (Different UI: Widescreen VIP Executive Suites, Different Animations: Shimmer Sweep, Soundwave, Beam Glide) */}
          <SpecialGuestsShowcase isReduced={isReduced} />

          {/* Group 3: Association (Leadership & Governing Body · 3 cards in one line) */}
          <AssociationSection isReduced={isReduced} />
        </div>

        {/* Special Categories: Utkal Kesari & Star Category */}
        <div className="mt-[clamp(3.5rem,7vw,7rem)]">
          <SpecialFeatureCards />
        </div>
      </div>
    </section>
  );
}
