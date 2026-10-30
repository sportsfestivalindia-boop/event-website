"use client";

import React, { useEffect, useRef, useState } from "react";
import { Dumbbell, BicepsFlexed, Trophy, LucideIcon } from "lucide-react";
import { useReplayOnScroll } from "@/hooks/useReplayOnScroll";

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
    title: "STRENGTH DAY",
    icon: Dumbbell,
    gradient: "linear-gradient(135deg, #FFE600 0%, #FF9A00 50%, #FF6A00 100%)",
    items: [
      "5:30 AM — Dutee’s Marathon start",
      "8–10 AM — Athlete spot registration",
      "10 AM — Athlete check-in",
      "11 AM onwards — Boxing, Powerlifting, Arm Wrestling, Matti Kusti",
      "5 PM — Cultural programme",
      "7 PM — Stage inauguration & marathon prizes",
    ],
  },
  {
    dayNum: "DAY 2",
    date: "Sat · 5 Dec",
    title: "BODYBUILDING PRELIMS",
    icon: BicepsFlexed,
    gradient: "linear-gradient(225deg, #FFE600 0%, #FF9A00 50%, #FF6A00 100%)",
    items: [
      "8 AM — Registration / check-in, strength-sport competitions",
      "5 PM — Bodybuilding preliminary rounds",
      "Cultural programme",
    ],
  },
  {
    dayNum: "DAY 3",
    date: "Sun · 6 Dec",
    title: "THE GRAND FINALE",
    icon: Trophy,
    gradient: "linear-gradient(315deg, #FFE600 0%, #FF9A00 50%, #FF6A00 100%)",
    items: [
      "5 PM — Bodybuilding finals",
      "Championship finals & Champion of Champions",
      "Prize distribution & closing ceremony",
    ],
  },
];

// Helper to render part before " — " in bolder white and the rest in white 75%
function renderScheduleItem(text: string) {
  const dashIdx = text.indexOf(" — ");
  if (dashIdx === -1) {
    return <span className="text-white/75">{text}</span>;
  }
  const timePart = text.slice(0, dashIdx);
  const rest = text.slice(dashIdx);
  return (
    <>
      <span className="font-bold text-white tracking-wide">{timePart}</span>
      <span className="text-white/75">{rest}</span>
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

  return (
    <section
      ref={sectionRef}
      data-play={play}
      id="schedule"
      aria-labelledby="tk-heading"
      className="relative w-full bg-[#000000] text-white py-24 sm:py-28 lg:py-32 overflow-hidden select-none"
    >
      <div className="w-full page-gutter max-w-[2000px] mx-auto">
        {/* ================================================================= */}
        {/* SECTION HEADER                                                    */}
        {/* ================================================================= */}
        <div
          ref={headingRef}
          className={`grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-end mb-16 lg:mb-20 ${
            headingEntered ? "tk-animate-neon" : ""
          }`}
        >
          {/* Left Column (about 7/12): Heading with Neon Flicker-on */}
          <div className="lg:col-span-7">
            <h2
              id="tk-heading"
              className="display text-[clamp(3rem,8vw,9rem)] font-black leading-[0.9] tracking-tight uppercase"
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

          {/* Right Column (about 5/12): Paragraph bottom-aligned */}
          <div className="lg:col-span-5 flex flex-col justify-end">
            <div className="max-w-xl">
              {/* Short gradient line */}
              <span
                aria-hidden="true"
                className="block h-1 w-20 rounded-full pk-gradient-bg mb-5"
              />
              <p className="text-base sm:text-lg lg:text-xl text-white/75 font-normal leading-relaxed">
                Strength sports and the marathon on Day 1. Bodybuilding prelims on Day 2, finals on Day 3. Detailed timings are finalised by the Technical Committee.
              </p>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* BOARDING-PASS TICKETS STACK                                       */}
        {/* ================================================================= */}
        <div className="flex flex-col gap-7 sm:gap-8 w-full">
          {SCHEDULE_DATA.map((ticket, ticketIdx) => {
            const IconComp = ticket.icon;
            const isPrinted = printedTickets[ticketIdx];
            const isDay1 = ticketIdx === 0;

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

                    {/* ------------------------------------------------------- */}
                    {/* STUB: Left on desktop (22% / 26%), Top on mobile        */}
                    {/* ------------------------------------------------------- */}
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

                    {/* ------------------------------------------------------- */}
                    {/* PERFORATION & SEMICIRCLE NOTCHES                        */}
                    {/* ------------------------------------------------------- */}
                    {/* Desktop & Tablet Vertical Perforation Line */}
                    <div
                      aria-hidden="true"
                      className="hidden md:block absolute top-3.5 bottom-3.5 w-0 border-r-2 border-dashed border-black/35 z-20 pointer-events-none origin-top tk-perf-v left-[var(--stub-w)]"
                    />

                    {/* Desktop & Tablet Top Notch */}
                    <div
                      aria-hidden="true"
                      className="hidden md:block absolute top-0 -translate-y-1/2 -translate-x-1/2 size-7 rounded-full bg-[#000000] border border-white/12 z-30 pointer-events-none left-[var(--stub-w)]"
                    />

                    {/* Desktop & Tablet Bottom Notch */}
                    <div
                      aria-hidden="true"
                      className="hidden md:block absolute bottom-0 translate-y-1/2 -translate-x-1/2 size-7 rounded-full bg-[#000000] border border-white/12 z-30 pointer-events-none left-[var(--stub-w)]"
                    />

                    {/* Mobile Horizontal Perforation Line */}
                    <div
                      aria-hidden="true"
                      className="md:hidden absolute left-3.5 right-3.5 h-0 border-b-2 border-dashed border-black/35 z-20 pointer-events-none origin-left tk-perf-h top-[96px] sm:top-[104px]"
                    />

                    {/* Mobile Left Notch */}
                    <div
                      aria-hidden="true"
                      className="md:hidden absolute left-0 -translate-x-1/2 -translate-y-1/2 size-7 rounded-full bg-[#000000] border border-white/12 z-30 pointer-events-none top-[96px] sm:top-[104px]"
                    />

                    {/* Mobile Right Notch */}
                    <div
                      aria-hidden="true"
                      className="md:hidden absolute right-0 translate-x-1/2 -translate-y-1/2 size-7 rounded-full bg-[#000000] border border-white/12 z-30 pointer-events-none top-[96px] sm:top-[104px]"
                    />

                    {/* ------------------------------------------------------- */}
                    {/* MAIN: Title, Decorative Watermark, Schedule Timeline    */}
                    {/* ------------------------------------------------------- */}
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

                        <h3 className="display text-[clamp(1.7rem,2.8vw,2.8rem)] font-normal text-white uppercase tracking-wide leading-none">
                          {ticket.title}
                        </h3>
                      </div>

                      {/* Timeline Items List */}
                      <ul
                        className={`relative z-10 mt-2 list-none p-0 ${
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
                            {/* 14px Punch-hole Circle Marker */}
                            <span
                              aria-hidden="true"
                              className="tk-punch-marker mt-1.5"
                            />
                            {/* Item Text */}
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
    </section>
  );
}
