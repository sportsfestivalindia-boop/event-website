"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Dumbbell,
  BicepsFlexed,
  Trophy,
  Footprints,
  Swords,
  HandFist,
  Handshake,
  Utensils,
  Clock,
  MapPin,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Flag,
  LucideIcon,
} from "lucide-react";
import { useReplayOnScroll } from "@/hooks/useReplayOnScroll";
import { EVENT, registerHref } from "@/data/festival";
import { WhatsAppGlyph } from "@/components/icons";

interface ScheduleDay {
  dayNum: string;
  date: string;
  title: string;
  icon: LucideIcon;
  gradient: string;
  items: string[];
}

const SCHEDULE_DATA: ScheduleDay[] = [
  {
    dayNum: "DAY 1",
    date: "Fri · 4 Dec",
    title: "MARATHON & STRENGTH GAMES KICK-OFF",
    icon: Dumbbell,
    gradient: "linear-gradient(135deg, #FFE600 0%, #FF9A00 50%, #FF6A00 100%)",
    items: [
      "3:30 AM — Marathon race flag-off (all distances)",
      "8:00 AM – 10:00 AM — Registrations for all games",
      "8:00 AM – 11:00 AM — Breakfast for officials and athletes (Baramunda Field)",
      "11:00 AM onwards — Games start: Boxing, Dangal, Arm Wrestling, Powerlifting",
      "2:00 PM — Lunch for officials and athletes",
      "5:00 PM — Grand Opening Ceremony",
      "9:00 PM — Dinner",
    ],
  },
  {
    dayNum: "DAY 2",
    date: "Sat · 5 Dec",
    title: "BODYBUILDING PREJUDGING & CONTINUOUS ACTION",
    icon: BicepsFlexed,
    gradient: "linear-gradient(225deg, #FFE600 0%, #FF9A00 50%, #FF6A00 100%)",
    items: [
      "8:00 AM — Breakfast for officials and athletes",
      "8:00 AM – 1:00 PM — Bodybuilding spot registrations & weigh-in",
      "9:00 AM – 9:00 PM — Competitions continue: Arm Wrestling, Dangal, Boxing, Powerlifting",
      "2:00 PM — Lunch for officials and athletes",
      "5:00 PM — Bodybuilding prejudging starts",
      "9:00 PM — Dinner",
    ],
  },
  {
    dayNum: "DAY 3",
    date: "Sun · 6 Dec",
    title: "CHAMPIONSHIP FINALS & MEGA PRIZE DISTRIBUTION",
    icon: Trophy,
    gradient: "linear-gradient(315deg, #FFE600 0%, #FF9A00 50%, #FF6A00 100%)",
    items: [
      "8:00 AM — Breakfast for officials and athletes",
      "9:00 AM – 9:00 PM — All games continue: Arm Wrestling, Powerlifting, Boxing, Dangal",
      "2:00 PM — Lunch for officials and athletes",
      "4:00 PM — Grand Closing Ceremony begins",
      "6:00 PM — Bodybuilding finals & all games prize distribution",
      "9:00 PM — Dinner",
    ],
  },
];

// Quick breakdown data by sport for easy athlete viewing
const SPORT_SCHEDULES = [
  {
    name: "Marathon",
    icon: Footprints,
    category: "Running & Endurance",
    regSlug: "marathon",
    checkpoints: [
      { time: "Wed 3 Dec · 8:00 AM", desc: "Marathon spot registration & bib collection (Baramunda Field)" },
      { time: "Fri 4 Dec · 3:30 AM", desc: "Race flag-off for all categories (21K, 10K, 5K, 2K)" },
      { time: "Fri 4 Dec · 8:00–11:00 AM", desc: "Athlete recovery & breakfast at Baramunda Field" },
    ],
  },
  {
    name: "Bodybuilding & Physique",
    icon: BicepsFlexed,
    category: "Anil Gochhikar Classic",
    regSlug: "bodybuilding",
    checkpoints: [
      { time: "Sat 5 Dec · 8:00 AM – 1:00 PM", desc: "Spot registration, height & weight measurement" },
      { time: "Sat 5 Dec · 5:00 PM", desc: "Prejudging rounds commence on main stage" },
      { time: "Sun 6 Dec · 6:00 PM", desc: "Grand Finals & Champion of Champions Trophy presentation" },
    ],
  },
  {
    name: "Powerlifting",
    icon: Dumbbell,
    category: "Ranu National Championship",
    regSlug: "powerlifting",
    checkpoints: [
      { time: "Fri 4 Dec · 8:00–10:00 AM", desc: "Spot registration & weigh-in check" },
      { time: "Fri 4 Dec · 11:00 AM", desc: "Lifting begins (Squat, Bench Press, Deadlift)" },
      { time: "Sat 5 & Sun 6 Dec · 9:00 AM – 9:00 PM", desc: "Competitions continue across all weight categories" },
      { time: "Sun 6 Dec · 6:00 PM", desc: "Strong Man & Strong Woman Titles & prize distribution" },
    ],
  },
  {
    name: "Arm Wrestling",
    icon: Handshake,
    category: "National Championship",
    regSlug: "armwrestling",
    checkpoints: [
      { time: "Fri 4 Dec · 8:00–10:00 AM", desc: "Spot registration & grip/weight inspection" },
      { time: "Fri 4 Dec · 11:00 AM", desc: "Matchups start" },
      { time: "Sat 5 & Sun 6 Dec · 9:00 AM – 9:00 PM", desc: "Elimination & knockout tables open daily" },
      { time: "Sun 6 Dec · 6:00 PM", desc: "Champion of Champions bouts & awards" },
    ],
  },
  {
    name: "Boxing",
    icon: HandFist,
    category: "State Championship",
    regSlug: "boxing",
    checkpoints: [
      { time: "Fri 4 Dec · 8:00–10:00 AM", desc: "Spot registration & official weigh-in" },
      { time: "Fri 4 Dec · 11:00 AM", desc: "Preliminary bouts start in the boxing ring" },
      { time: "Sat 5 & Sun 6 Dec · 9:00 AM – 9:00 PM", desc: "Quarter-finals, semi-finals & finals" },
      { time: "Sun 6 Dec · 6:00 PM", desc: "Best Boxer & Best Loser Bike awards & prizes" },
    ],
  },
  {
    name: "Dangal (Matti Kusti)",
    icon: Swords,
    category: "Utkal Kesari Dangal",
    regSlug: "dangal",
    checkpoints: [
      { time: "Fri 4 Dec · 8:00–10:00 AM", desc: "Spot registration & pit blessing" },
      { time: "Fri 4 Dec · 11:00 AM", desc: "Traditional clay bouts begin" },
      { time: "Sat 5 & Sun 6 Dec · 9:00 AM – 9:00 PM", desc: "Weight-category bouts & Open title matches" },
      { time: "Sun 6 Dec · 6:00 PM", desc: "Royal Enfield Bullet & GADA (Mace) handover" },
    ],
  },
];

const MEAL_SCHEDULE = [
  {
    meal: "Breakfast",
    time: "8:00 AM Daily (8:00–11:00 AM on Day 1)",
    venue: "Baramunda Ground Field Dining Pavilion",
    notes: "Special extended timing on Friday 4th Dec for early marathon finishers and morning arrivals. Wholesome high-protein athlete breakfast.",
  },
  {
    meal: "Lunch",
    time: "2:00 PM Daily",
    venue: "Baramunda Ground Field Dining Pavilion",
    notes: "Served daily from 4th to 6th December for all registered athletes, coaches, and technical officials.",
  },
  {
    meal: "Dinner",
    time: "9:00 PM Daily",
    venue: "Baramunda Ground Field Dining Pavilion",
    notes: "Served daily following evening bouts and pre-judging events.",
  },
];

// Helper to render part before " — " in bolder white and the rest in white 75%
function renderScheduleItem(text: string) {
  const dashIdx = text.indexOf(" — ");
  if (dashIdx === -1) {
    return <span className="text-white/80">{text}</span>;
  }
  const timePart = text.slice(0, dashIdx);
  const rest = text.slice(dashIdx);
  return (
    <>
      <span className="font-bold text-white tracking-wide">{timePart}</span>
      <span className="text-white/80">{rest}</span>
    </>
  );
}

// Decorative barcode SVG component
function TicketBarcode({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 160 40"
      className={`tk-barcode pointer-events-none select-none ${className}`}
      fill="rgba(0,0,0,0.8)"
    >
      <rect x="0" y="0" width="3" height="40" />
      <rect x="5" y="0" width="1.5" height="40" />
      <rect x="9" y="0" width="4" height="40" />
      <rect x="15" y="0" width="2" height="40" />
      <rect x="19" y="0" width="1" height="40" />
      <rect x="22" y="0" width="3" height="40" />
      <rect x="27" y="0" width="5" height="40" />
      <rect x="34" y="0" width="1.5" height="40" />
      <rect x="38" y="0" width="3" height="40" />
      <rect x="43" y="0" width="1" height="40" />
      <rect x="46" y="0" width="4" height="40" />
      <rect x="52" y="0" width="2" height="40" />
      <rect x="56" y="0" width="3" height="40" />
      <rect x="61" y="0" width="1.5" height="40" />
      <rect x="65" y="0" width="5" height="40" />
      <rect x="72" y="0" width="2" height="40" />
      <rect x="76" y="0" width="1" height="40" />
      <rect x="79" y="0" width="4" height="40" />
      <rect x="85" y="0" width="1.5" height="40" />
      <rect x="89" y="0" width="3" height="40" />
      <rect x="94" y="0" width="2" height="40" />
      <rect x="98" y="0" width="4" height="40" />
      <rect x="104" y="0" width="1" height="40" />
      <rect x="107" y="0" width="3" height="40" />
      <rect x="112" y="0" width="5" height="40" />
      <rect x="119" y="0" width="1.5" height="40" />
      <rect x="123" y="0" width="2" height="40" />
      <rect x="127" y="0" width="4" height="40" />
      <rect x="133" y="0" width="1" height="40" />
      <rect x="136" y="0" width="3" height="40" />
      <rect x="141" y="0" width="2" height="40" />
      <rect x="145" y="0" width="5" height="40" />
      <rect x="152" y="0" width="1.5" height="40" />
      <rect x="156" y="0" width="4" height="40" />
    </svg>
  );
}

export function ScheduleSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const ticketRefs = useRef<(HTMLDivElement | null)[]>([]);

  const play = useReplayOnScroll(sectionRef);
  const [headingEntered, setHeadingEntered] = useState(false);
  const [printedTickets, setPrintedTickets] = useState<boolean[]>([false, false, false]);
  const [isReduced, setIsReduced] = useState(false);

  // Single unified navigation view
  type ScheduleView = "days" | "sports" | "meals" | "registration" | "ceremonies";
  const [activeView, setActiveView] = useState<ScheduleView>("days");
  const [selectedDayFilter, setSelectedDayFilter] = useState<"all" | "day1" | "day2" | "day3">("all");

  // Prefers reduced motion detection
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setIsReduced(mq.matches);
    if (mq.matches) {
      setHeadingEntered(true);
      setPrintedTickets([true, true, true]);
    }
    const handler = (e: MediaQueryListEvent) => {
      setIsReduced(e.matches);
      if (e.matches) {
        setHeadingEntered(true);
        setPrintedTickets([true, true, true]);
      }
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Sync heading and ticket animations with section presence
  useEffect(() => {
    if (isReduced) return;
    if (play) {
      setHeadingEntered(true);
      setPrintedTickets([true, true, true]);
    } else {
      setHeadingEntered(false);
      setPrintedTickets([false, false, false]);
    }
  }, [play, isReduced]);

  const scheduleShareText = `🏆 India's Biggest Sports Festival 2026 — Official Timetable:\n\n📍 Wed 3 Dec: Marathon Spot Reg at Baramunda Field (8 AM)\n🏃 Fri 4 Dec (Day 1): Marathon Starts 3:30 AM · Spot Reg 8-10 AM · Breakfast 8-11 AM · Games 11 AM · Lunch 2 PM · Opening Ceremony 5 PM · Dinner 9 PM\n💪 Sat 5 Dec (Day 2): Breakfast 8 AM · Bodybuilding Spot Reg 8 AM-1 PM · Games 9 AM-9 PM · Lunch 2 PM · Bodybuilding Prejudging 5 PM · Dinner 9 PM\n🥇 Sun 6 Dec (Day 3): Breakfast 8 AM · All Games Continue 9 AM-9 PM · Lunch 2 PM · Closing Ceremony 4 PM · Bodybuilding Finals & Prize Distribution 6 PM · Dinner 9 PM\n\nFull Schedule & Registration: https://sportsfestivalindia.com/#schedule`;

  const displayedTickets = SCHEDULE_DATA.filter((ticket, idx) => {
    if (selectedDayFilter === "day1") return idx === 0;
    if (selectedDayFilter === "day2") return idx === 1;
    if (selectedDayFilter === "day3") return idx === 2;
    return true;
  });

  return (
    <section
      ref={sectionRef}
      data-play={play}
      id="schedule"
      aria-labelledby="tk-heading"
      className="relative w-full bg-[#000000] text-white py-20 sm:py-28 lg:py-32 overflow-hidden select-none"
    >
      <div className="w-full page-gutter max-w-[2000px] mx-auto">
        {/* ================================================================= */}
        {/* SECTION HEADER                                                    */}
        {/* ================================================================= */}
        <div
          ref={headingRef}
          className={`grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-end mb-10 lg:mb-14 ${
            headingEntered ? "tk-animate-neon" : ""
          }`}
        >
          {/* Left Column: Heading with Neon Flicker-on */}
          <div className="lg:col-span-7">
            <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.25em] text-[#FFE600] mb-2 flex items-center gap-2">
              <Calendar className="size-4" />
              <span>Official Festival Timetable · 4–6 December 2026</span>
            </p>
            <h2
              id="tk-heading"
              className="display text-[clamp(2.8rem,7.5vw,8.5rem)] font-black leading-[0.9] tracking-tight uppercase"
            >
              <span className="sr-only">
                3 DAYS OF ACTION. FIND YOUR DAY.
              </span>
              <span aria-hidden="true" className="block">
                <span className="block">
                  <span className="tk-neon-word tk-neon-w1 mr-[0.25em]">3</span>
                  <span className="tk-neon-word tk-neon-w2 mr-[0.25em]">DAYS</span>
                  <span className="tk-neon-word tk-neon-w3 mr-[0.25em]">OF</span>
                  <span className="tk-neon-word tk-neon-w4">ACTION.</span>
                </span>
                <span className="block mt-1 sm:mt-2 tk-neon-word tk-neon-line2">
                  FIND YOUR DAY.
                </span>
              </span>
            </h2>
          </div>

          {/* Right Column: Paragraph and Quick Actions */}
          <div className="lg:col-span-5 flex flex-col justify-end">
            <div className="max-w-xl">
              <span
                aria-hidden="true"
                className="block h-1 w-20 rounded-full pk-gradient-bg mb-4"
              />
              <p className="text-sm sm:text-base lg:text-lg text-white/80 font-normal leading-relaxed">
                Full festival championship events run from 4th to 6th December 2026 at Baramunda Ground Field, Bhubaneswar. (Pre-event marathon spot registration opens 3rd Dec).
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <a
                  href={`https://api.whatsapp.com/send/?text=${encodeURIComponent(scheduleShareText)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-xs sm:text-sm font-bold text-white hover:bg-white/10 hover:border-wa transition-all"
                  title="Share schedule on WhatsApp"
                >
                  <WhatsAppGlyph className="size-4 text-wa" />
                  <span>Share Schedule</span>
                </a>
                <Link
                  href={registerHref()}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gold px-4 py-2 text-xs sm:text-sm font-black uppercase tracking-wider text-black hover:brightness-110 shadow-lg"
                >
                  <span>Register Now</span>
                  <ChevronRight className="size-4 stroke-[3]" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* UNIFIED SCHEDULE DASHBOARD VIEW SELECTOR TABS                     */}
        {/* ================================================================= */}
        <div className="mb-8 border-b border-white/12 pb-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveView("days")}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                activeView === "days"
                  ? "bg-[#FFE600] text-black shadow-lg scale-105"
                  : "bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Calendar className="size-4" />
              <span>Day-by-Day (3 Days)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView("sports")}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                activeView === "sports"
                  ? "bg-[#FFE600] text-black shadow-lg scale-105"
                  : "bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Trophy className="size-4" />
              <span>By Sport (6 Events)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView("meals")}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                activeView === "meals"
                  ? "bg-[#FFE600] text-black shadow-lg scale-105"
                  : "bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Utensils className="size-4" />
              <span>Meal Timings</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView("registration")}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                activeView === "registration"
                  ? "bg-[#FFE600] text-black shadow-lg scale-105"
                  : "bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <CheckCircle2 className="size-4" />
              <span>Spot Registrations</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView("ceremonies")}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                activeView === "ceremonies"
                  ? "bg-[#FFE600] text-black shadow-lg scale-105"
                  : "bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Sparkles className="size-4" />
              <span>Ceremonies & Finals</span>
            </button>
          </div>
        </div>

        {/* ================================================================= */}
        {/* VIEW 1: DAY-BY-DAY TICKETS TIMETABLE                              */}
        {/* ================================================================= */}
        {activeView === "days" && (
          <div>
            {/* Day Filter Sub-chips */}
            <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-white/50 mr-1">
                  Filter:
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedDayFilter("all")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                    selectedDayFilter === "all"
                      ? "bg-white text-black font-black"
                      : "bg-white/5 text-white/70 hover:text-white"
                  }`}
                >
                  All 3 Days
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDayFilter("day1")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                    selectedDayFilter === "day1"
                      ? "bg-white text-black font-black"
                      : "bg-white/5 text-white/70 hover:text-white"
                  }`}
                >
                  Day 1 (Fri 4 Dec)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDayFilter("day2")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                    selectedDayFilter === "day2"
                      ? "bg-white text-black font-black"
                      : "bg-white/5 text-white/70 hover:text-white"
                  }`}
                >
                  Day 2 (Sat 5 Dec)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDayFilter("day3")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                    selectedDayFilter === "day3"
                      ? "bg-white text-black font-black"
                      : "bg-white/5 text-white/70 hover:text-white"
                  }`}
                >
                  Day 3 (Sun 6 Dec)
                </button>
              </div>

              <span className="text-xs text-white/60">
                Venue: <span className="text-white font-semibold">{EVENT.venueFull}</span>
              </span>
            </div>

            {/* PRE-EVENT SPOTLIGHT (Shown on 'all' or 'day1') */}
            {(selectedDayFilter === "all" || selectedDayFilter === "day1") && (
              <div className="mb-8 rounded-2xl border border-[#FFE600]/40 bg-gradient-to-r from-[#FFE600]/15 via-black to-[#FF6A00]/15 p-5 sm:p-6 backdrop-blur-md shadow-[0_10px_35px_rgba(255,230,0,0.12)]">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
                  <div className="flex items-start sm:items-center gap-4">
                    <div className="flex size-12 sm:size-14 shrink-0 items-center justify-center rounded-2xl bg-[#FFE600] text-black shadow-lg">
                      <Footprints className="size-6 sm:size-7 stroke-[2.5]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="rounded-full bg-[#FFE600] px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider text-black">
                          Pre-Event Day
                        </span>
                        <span className="text-xs font-bold text-white/70">
                          Wednesday · 3rd December 2026
                        </span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-black uppercase text-white mt-1">
                        Marathon Spot Registration & Bib Collection
                      </h3>
                      <p className="text-xs sm:text-sm font-medium text-white/80 mt-1 max-w-2xl leading-relaxed">
                        <span className="font-bold text-[#FFE600]">8:00 AM onwards</span> — Athletes can register on the spot, collect their official race bibs and runner kits at Baramunda Ground Field (Bermunda Field), Bhubaneswar.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
                    <Link
                      href="/register?sport=marathon"
                      className="btn btn-gold w-full sm:w-auto !min-h-[44px] !px-5 !text-xs font-black uppercase tracking-wider shadow-lg"
                    >
                      Register for Marathon
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* BOARDING-PASS TICKETS STACK */}
            <div className="flex flex-col gap-7 sm:gap-8 w-full mb-10">
              {displayedTickets.map((ticket, ticketIdx) => {
                const IconComp = ticket.icon;
                const isPrinted = printedTickets[ticketIdx];
                const isDay1 = ticket.dayNum === "DAY 1";

                return (
                  <div
                    key={ticket.dayNum}
                    ref={(el) => {
                      ticketRefs.current[ticketIdx] = el;
                    }}
                    className={`tk-ticket-container relative w-full pt-4 ${
                      isPrinted ? "tk-ticket-printed" : ""
                    }`}
                  >
                    {/* Mechanical Printer Slot Line with LED Dot */}
                    <div
                      aria-hidden="true"
                      className="relative w-full flex items-center mb-1.5 pointer-events-none z-20"
                    >
                      <div
                        className="h-[3px] w-full rounded-full"
                        style={{ background: ticket.gradient }}
                      />
                      <div
                        className={`absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 size-2.5 rounded-full border border-black/40 ${
                          isPrinted
                            ? "opacity-30 bg-[#FFE600]"
                            : "tk-led-blinking bg-[#FFE600]"
                        }`}
                      />
                    </div>

                    {/* Overflow-hidden Wrapper that clips ticket feeding from slot */}
                    <div className="overflow-hidden w-full rounded-2xl relative">
                      {/* The Boarding Pass Ticket */}
                      <article
                        className="tk-ticket-card tk-ticket-element md:[--stub-w:26%] lg:[--stub-w:22%] relative w-full rounded-2xl border border-white/12 bg-[#0A0A0A] overflow-hidden flex flex-col md:flex-row shadow-2xl"
                      >
                        {/* Laser Scan Line */}
                        <div aria-hidden="true" className="tk-laser-line" />

                        {/* STUB: Left on desktop, Top on mobile */}
                        <div
                          style={{ background: ticket.gradient }}
                          className="w-full md:w-[var(--stub-w,26%)] shrink-0 p-6 sm:p-7 lg:p-8 flex flex-col justify-between text-black relative select-none min-h-[96px] sm:min-h-[104px] md:min-h-0"
                        >
                          {/* Mobile Stub Row: DAY number + Date */}
                          <div className="flex items-baseline justify-between md:block">
                            <div>
                              <p className="display text-4xl sm:text-5xl md:text-[clamp(2.5rem,4.5vw,4.8rem)] font-black leading-none uppercase tracking-tight text-black">
                                {ticket.dayNum}
                              </p>
                              <p className="text-xs sm:text-sm md:text-base font-extrabold uppercase tracking-widest text-black/90 mt-1 md:mt-3">
                                {ticket.date}
                              </p>
                            </div>

                            {/* Mobile Barcode inline on right */}
                            <div className="md:hidden w-28 sm:w-32 h-9 flex items-center">
                              <TicketBarcode className="w-full h-full" />
                            </div>
                          </div>

                          {/* Desktop Barcode at bottom of stub */}
                          <div className="hidden md:block w-full mt-8 pt-4">
                            <TicketBarcode className="w-full h-11" />
                          </div>
                        </div>

                        {/* Perforation Lines & Notches */}
                        <div
                          aria-hidden="true"
                          className="hidden md:block absolute top-3.5 bottom-3.5 w-0 border-r-2 border-dashed border-black/35 z-20 pointer-events-none origin-top tk-perf-v left-[var(--stub-w)]"
                        />
                        <div
                          aria-hidden="true"
                          className="hidden md:block absolute top-0 -translate-y-1/2 -translate-x-1/2 size-7 rounded-full bg-[#000000] border border-white/12 z-30 pointer-events-none left-[var(--stub-w)]"
                        />
                        <div
                          aria-hidden="true"
                          className="hidden md:block absolute bottom-0 translate-y-1/2 -translate-x-1/2 size-7 rounded-full bg-[#000000] border border-white/12 z-30 pointer-events-none left-[var(--stub-w)]"
                        />
                        <div
                          aria-hidden="true"
                          className="md:hidden absolute left-3.5 right-3.5 h-0 border-b-2 border-dashed border-black/35 z-20 pointer-events-none origin-left tk-perf-h top-[96px] sm:top-[104px]"
                        />
                        <div
                          aria-hidden="true"
                          className="md:hidden absolute left-0 -translate-x-1/2 -translate-y-1/2 size-7 rounded-full bg-[#000000] border border-white/12 z-30 pointer-events-none top-[96px] sm:top-[104px]"
                        />
                        <div
                          aria-hidden="true"
                          className="md:hidden absolute right-0 translate-x-1/2 -translate-y-1/2 size-7 rounded-full bg-[#000000] border border-white/12 z-30 pointer-events-none top-[96px] sm:top-[104px]"
                        />

                        {/* MAIN: Title, Decorative Watermark, Schedule Timeline */}
                        <div className="flex-1 p-6 sm:p-8 lg:p-10 relative overflow-hidden flex flex-col justify-between">
                          {/* Decorative Giant Icon Watermark */}
                          <div
                            aria-hidden="true"
                            className="absolute -right-12 -bottom-12 pointer-events-none select-none text-white/[0.045]"
                          >
                            <IconComp className="size-72 lg:size-80 stroke-[1.2]" />
                          </div>

                          {/* Header Row: Title & Gradient Icon Holder */}
                          <div className="relative z-10 flex items-center gap-4 sm:gap-5 pb-5 border-b border-white/[0.08]">
                            <div
                              aria-hidden="true"
                              className="size-11 sm:size-12 rounded-xl p-[1px] relative flex items-center justify-center shrink-0 shadow-lg"
                              style={{ background: ticket.gradient }}
                            >
                              <div className="size-full bg-[#0A0A0A] rounded-[11px] flex items-center justify-center text-white">
                                <IconComp className="size-6 stroke-[2]" />
                              </div>
                            </div>

                            <h3 className="display text-[clamp(1.5rem,2.5vw,2.5rem)] font-normal text-white uppercase tracking-wide leading-none">
                              {ticket.title}
                            </h3>
                          </div>

                          {/* Timeline Items List */}
                          <ul
                            className={`relative z-10 mt-3 list-none p-0 ${
                              isDay1
                                ? "columns-1 xl:columns-2 xl:gap-12"
                                : "columns-1"
                            }`}
                          >
                            {ticket.items.map((item, itemIdx) => (
                              <li
                                key={item}
                                style={
                                  {
                                    "--i": itemIdx,
                                    "--n": ticket.items.length,
                                  } as React.CSSProperties
                                }
                                className="tk-row-item flex items-start gap-3.5 py-3 border-b border-white/[0.08] last:border-b-0 break-inside-avoid"
                              >
                                <span
                                  aria-hidden="true"
                                  className="tk-punch-marker mt-1.5 shrink-0"
                                />
                                <p className="text-sm sm:text-base lg:text-[17px] leading-relaxed flex-1 m-0">
                                  {renderScheduleItem(item)}
                                </p>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </article>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* VIEW 2: BY SPORT (6 EVENTS)                                       */}
        {/* ================================================================= */}
        {activeView === "sports" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 mb-10">
            {SPORT_SCHEDULES.map((s) => {
              const SIcon = s.icon;
              return (
                <div
                  key={s.name}
                  className="rounded-2xl border border-white/12 bg-[#0A0A0A] p-6 hover:border-[#FFE600]/60 transition-all flex flex-col justify-between shadow-xl group"
                >
                  <div>
                    <div className="flex items-center gap-3.5 mb-5">
                      <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#FFE600] to-[#FF6A00] text-black font-black shadow-md group-hover:scale-105 transition-transform">
                        <SIcon className="size-5 stroke-[2.5]" />
                      </div>
                      <div>
                        <h4 className="text-base sm:text-lg font-black uppercase text-white leading-tight">
                          {s.name}
                        </h4>
                        <p className="text-[11px] font-bold text-[#FFE600] uppercase tracking-wider">
                          {s.category}
                        </p>
                      </div>
                    </div>

                    <ul className="space-y-3.5">
                      {s.checkpoints.map((c, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm">
                          <CheckCircle2 className="size-4 text-[#FFE600] shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-white block">
                              {c.time}
                            </span>
                            <span className="text-white/70">
                              {c.desc}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                    <Link
                      href={`/register?sport=${s.regSlug}`}
                      className="text-xs font-black uppercase tracking-wider text-[#FFE600] hover:text-white inline-flex items-center gap-1.5 transition-colors"
                    >
                      <span>Register for {s.name}</span>
                      <ChevronRight className="size-3.5 stroke-[3]" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ================================================================= */}
        {/* VIEW 3: MEAL TIMINGS                                              */}
        {/* ================================================================= */}
        {activeView === "meals" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {MEAL_SCHEDULE.map((m, idx) => (
              <div
                key={m.meal}
                className="rounded-2xl border border-white/12 bg-[#0A0A0A] p-6 sm:p-7 flex flex-col justify-between shadow-xl"
              >
                <div>
                  <div className="flex items-center gap-3.5 mb-5">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-[#FFE600] text-black font-black shadow-md">
                      <Utensils className="size-6 stroke-[2.5]" />
                    </div>
                    <div>
                      <span className="text-[11px] font-black uppercase tracking-wider text-white/50">
                        Meal 0{idx + 1}
                      </span>
                      <h4 className="text-2xl font-black uppercase text-white leading-none">
                        {m.meal}
                      </h4>
                    </div>
                  </div>

                  <div className="mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#FFE600] block">
                      Timing
                    </span>
                    <p className="text-lg sm:text-xl font-black text-white mt-0.5">
                      {m.time}
                    </p>
                  </div>

                  <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
                    {m.notes}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-2 text-xs text-white/70">
                  <MapPin className="size-4 text-[#FF6A00] shrink-0" />
                  <span>{m.venue}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ================================================================= */}
        {/* VIEW 4: SPOT REGISTRATIONS                                        */}
        {/* ================================================================= */}
        {activeView === "registration" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {/* Marathon Spot Reg */}
            <div className="rounded-2xl border border-[#FFE600]/40 bg-gradient-to-b from-[#FFE600]/10 to-transparent p-6 sm:p-7 shadow-xl">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFE600]/20 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-[#FFE600] mb-3">
                Marathon Spot Reg
              </span>
              <h4 className="text-xl sm:text-2xl font-black uppercase text-white mb-1">
                Wed · 3rd December 2026
              </h4>
              <p className="text-sm font-bold text-[#FFE600] mb-3">
                8:00 AM onwards @ Baramunda Field
              </p>
              <p className="text-xs sm:text-sm text-white/80 leading-relaxed mb-5">
                Dedicated spot registration, race kit distribution, and timing chip handover for all marathon distances (21 KM, 10 KM, 5 KM, 2 KM).
              </p>
              <Link
                href="/register?sport=marathon"
                className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider text-[#FFE600] hover:underline"
              >
                Register Marathon Online →
              </Link>
            </div>

            {/* Strength Sports Spot Reg */}
            <div className="rounded-2xl border border-white/12 bg-[#0A0A0A] p-6 sm:p-7 shadow-xl">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FF6A00]/20 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-[#FF6A00] mb-3">
                All Strength Sports Spot Reg
              </span>
              <h4 className="text-xl sm:text-2xl font-black uppercase text-white mb-1">
                Fri · 4th December 2026
              </h4>
              <p className="text-sm font-bold text-[#FF6A00] mb-3">
                8:00 AM – 10:00 AM @ Baramunda Field
              </p>
              <p className="text-xs sm:text-sm text-white/80 leading-relaxed mb-5">
                On-ground spot registration and reporting for Boxing, Dangal, Arm Wrestling, and Powerlifting athletes before 11:00 AM kick-off.
              </p>
              <Link
                href="/register"
                className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider text-[#FF6A00] hover:underline"
              >
                Register Strength Games Online →
              </Link>
            </div>

            {/* Bodybuilding Spot Reg */}
            <div className="rounded-2xl border border-white/12 bg-[#0A0A0A] p-6 sm:p-7 shadow-xl">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-white mb-3">
                Bodybuilding Spot Reg
              </span>
              <h4 className="text-xl sm:text-2xl font-black uppercase text-white mb-1">
                Sat · 5th December 2026
              </h4>
              <p className="text-sm font-bold text-white mb-3">
                8:00 AM – 1:00 PM @ Baramunda Field
              </p>
              <p className="text-xs sm:text-sm text-white/80 leading-relaxed mb-5">
                Official spot registration, stature measurement, and weight-in for all bodybuilding and physique divisions before 5:00 PM prejudging.
              </p>
              <Link
                href="/register?sport=bodybuilding"
                className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider text-white hover:underline"
              >
                Register Bodybuilding Online →
              </Link>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* VIEW 5: CEREMONIES & FINALS                                       */}
        {/* ================================================================= */}
        {activeView === "ceremonies" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="rounded-2xl border border-white/12 bg-[#0A0A0A] p-6 sm:p-7 shadow-xl">
              <div className="flex size-12 items-center justify-center rounded-xl bg-[#FF6A00] text-black font-black mb-4">
                <Sparkles className="size-6 stroke-[2.5]" />
              </div>
              <span className="text-[11px] font-black uppercase tracking-wider text-[#FF6A00] block mb-1">
                Fri · 4th Dec · 5:00 PM
              </span>
              <h4 className="text-xl sm:text-2xl font-black uppercase text-white mb-2">
                Grand Opening Ceremony
              </h4>
              <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
                Lighting of the ceremonial festival torch, march-past of state delegates & sports legends, guest of honour speeches, and cultural presentation.
              </p>
            </div>

            <div className="rounded-2xl border border-white/12 bg-[#0A0A0A] p-6 sm:p-7 shadow-xl">
              <div className="flex size-12 items-center justify-center rounded-xl bg-white/20 text-white font-black mb-4">
                <Flag className="size-6 stroke-[2.5]" />
              </div>
              <span className="text-[11px] font-black uppercase tracking-wider text-white/70 block mb-1">
                Sun · 6th Dec · 4:00 PM
              </span>
              <h4 className="text-xl sm:text-2xl font-black uppercase text-white mb-2">
                Official Closing Ceremony
              </h4>
              <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
                Formal closing address by AOGA leadership, felicitation of technical officials, coaches, referees, and national sports luminaries.
              </p>
            </div>

            <div className="rounded-2xl border border-[#FFE600]/40 bg-gradient-to-b from-[#FFE600]/15 to-transparent p-6 sm:p-7 shadow-xl">
              <div className="flex size-12 items-center justify-center rounded-xl bg-[#FFE600] text-black font-black mb-4">
                <Trophy className="size-6 stroke-[2.5]" />
              </div>
              <span className="text-[11px] font-black uppercase tracking-wider text-[#FFE600] block mb-1">
                Sun · 6th Dec · 6:00 PM
              </span>
              <h4 className="text-xl sm:text-2xl font-black uppercase text-white mb-2">
                Mega Prize Distribution & Finals
              </h4>
              <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
                Anil Gochhikar Classic bodybuilding finals, Champion of Champions crowning, Royal Enfield Bullet & GADA handover for Dangal, and distribution of ₹1.5 Crore total prize pool!
              </p>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* UNIFIED FOOTER HELPER                                             */}
        {/* ================================================================= */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/70">
          <p className="text-center sm:text-left">
            Need special reporting accommodations or technical clarification? Contact AOGA Technical Desk at{" "}
            <span className="text-white font-bold">{EVENT.phone}</span>
          </p>
          <a
            href={EVENT.whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-wa/30 bg-wa/10 px-4 py-2 text-xs font-bold text-wa hover:bg-wa/20 transition-all shrink-0"
          >
            <WhatsAppGlyph className="size-4" />
            <span>Chat on WhatsApp</span>
          </a>
        </div>
      </div>
    </section>
  );
}
