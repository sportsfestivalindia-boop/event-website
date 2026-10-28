"use client";

import { useEffect, useRef, useState } from "react";
import { IndianRupee, Trophy, Award, Users, CalendarDays } from "lucide-react";
import { useReplayOnScroll } from "@/hooks/useReplayOnScroll";

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

function RollDigit({ digit, delay }: { digit: number; delay: number }) {
  return (
    <span className="stat-roll-col" aria-hidden="true">
      <span
        className="stat-roll-track"
        style={{
          ["--target" as string]: digit,
          ["--delay" as string]: `${delay}s`,
        }}
      >
        {DIGITS.map((n) => (
          <span key={n} className="stat-gradient-char select-none">
            {n}
          </span>
        ))}
      </span>
    </span>
  );
}

export function StatsSection() {
  const ref = useRef<HTMLElement | null>(null);
  const play = useReplayOnScroll(ref);
  const [counts, setCounts] = useState({ c1: 0, c2: 0, c3: 0, c4: 0 });

  // Numbers count up when play triggers, reset to 0 when play is false
  useEffect(() => {
    if (!play) {
      setCounts({ c1: 0, c2: 0, c3: 0, c4: 0 });
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setCounts({ c1: 6, c2: 233, c3: 55, c4: 3 });
      return;
    }

    const duration = 1600; // ms
    const start = performance.now();
    let rafId: number;

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Smooth cubic ease out
      const ease = 1 - Math.pow(1 - progress, 3);

      setCounts({
        c1: Math.round(ease * 6),
        c2: Math.round(ease * 233),
        c3: Math.round(ease * 55),
        c4: Math.round(ease * 3),
      });

      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [play]);

  const stripStats = [
    {
      id: "championships",
      icon: Trophy,
      raw: "6",
      display: `${counts.c1}`,
      label: "Championships",
      delay: "0s",
      showDividerRight: true,
      showDividerBottomTablet: true,
    },
    {
      id: "podium",
      icon: Award,
      raw: "233+",
      display: `${counts.c2}+`,
      label: "Podium places with cash awards",
      delay: "0.1s",
      showDividerRight: true,
      showDividerBottomTablet: true,
    },
    {
      id: "categories",
      icon: Users,
      raw: "55+",
      display: `${counts.c3}+`,
      label: "Categories",
      delay: "0.2s",
      showDividerRight: true,
      showDividerBottomTablet: false,
    },
    {
      id: "days",
      icon: CalendarDays,
      raw: "3 Days",
      display: `${counts.c4} Days`,
      label: "4–6 December 2026",
      delay: "0.3s",
      showDividerRight: false,
      showDividerBottomTablet: false,
    },
  ];

  return (
    <section
      ref={ref}
      data-play={play}
      id="stats"
      className="relative w-full overflow-hidden bg-black py-20 sm:py-28"
    >
      <div className="content-contain page-gutter relative w-full">
        {/* A) HERO PRIZE BLOCK (full width) */}
        <div className="relative mb-14 sm:mb-20">
          {/* Soft orange radial glow behind prize (#FF6A00 at 20% opacity, blur 120px) */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[22rem] w-[50rem] max-w-full rounded-full bg-[#FF6A00]/20 blur-[120px]"
          />

          <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              {/* Above: small label "TOTAL PRIZE MONEY" with thin yellow line */}
              <div className="flex items-center gap-3 mb-3 sm:mb-5">
                <span className="h-[2px] w-8 sm:w-12 bg-[#FFE600]" />
                <span className="text-xs sm:text-sm font-bold uppercase tracking-[0.3em] text-[#FFE600]">
                  TOTAL PRIZE MONEY
                </span>
              </div>

              {/* HUGE prize number: clamp(3.5rem, 12vw, 11rem), font-black, leading-none, gradient text */}
              <div className="relative">
                <span className="sr-only">₹1,50,00,000</span>
                <div
                  aria-hidden="true"
                  className="stat-hero-prize display flex items-baseline flex-wrap text-[clamp(3.5rem,11.5vw,11rem)] font-black leading-none uppercase tracking-tight"
                >
                  <span className="stat-gradient-char mr-1 sm:mr-2">₹</span>
                  <RollDigit digit={1} delay={0} />
                  <span className="stat-gradient-char">,</span>
                  <RollDigit digit={5} delay={0.08} />
                  <RollDigit digit={0} delay={0.16} />
                  <span className="stat-gradient-char">,</span>
                  <RollDigit digit={0} delay={0.24} />
                  <RollDigit digit={0} delay={0.32} />
                  <span className="stat-gradient-char">,</span>
                  <RollDigit digit={0} delay={0.4} />
                  <RollDigit digit={0} delay={0.48} />
                  <RollDigit digit={0} delay={0.56} />
                </div>
              </div>
            </div>

            {/* Desktop right icon: IndianRupee inside yellow rounded square */}
            <div className="hidden lg:flex size-14 items-center justify-center rounded-2xl bg-[#FFE600] text-black shadow-[0_0_35px_rgba(255,230,0,0.35)] shrink-0 mb-4">
              <IndianRupee className="size-7" strokeWidth={2.6} />
            </div>
          </div>
        </div>

        {/* B) STATS STRIP (4 items in one row, scoreboard style, NO boxes) */}
        <div className="relative">
          {/* Thin horizontal line above whole strip (draws scaleX 0 to 1) */}
          <div className="stat-draw-x h-[1px] w-full bg-white/15" />

          {/* 4 columns desktop, 2x2 tablet, 1 column mobile */}
          <div className="stats-strip-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {stripStats.map((item, index) => (
              <div
                key={item.id}
                tabIndex={0}
                role="region"
                aria-label={`${item.raw} ${item.label}`}
                className="stat-strip-item stat-slide-up group relative flex flex-col justify-between p-6 sm:p-8 cursor-default"
                style={{ ["--delay" as string]: item.delay }}
              >
                {/* Soft yellow glow behind it (appears on hover) */}
                <div
                  aria-hidden
                  className="stat-item-glow pointer-events-none absolute inset-0 -z-10 rounded-2xl bg-[#FFE600]/10 blur-xl opacity-0 transition-opacity duration-300"
                />

                {/* Vertical Divider for desktop (draws scaleY 0 to 1) */}
                {item.showDividerRight && (
                  <div
                    aria-hidden
                    className="stat-draw-y hidden lg:block absolute right-0 top-0 bottom-0 w-[1px] bg-white/15 pointer-events-none"
                  />
                )}

                {/* Tablet (2x2) vertical divider between col 1 and col 2 */}
                {(index === 0 || index === 2) && (
                  <div
                    aria-hidden
                    className="stat-draw-y hidden sm:max-lg:block absolute right-0 top-0 bottom-0 w-[1px] bg-white/15 pointer-events-none"
                  />
                )}

                {/* Tablet (2x2) horizontal divider between row 1 and row 2 */}
                {(index === 0 || index === 1) && (
                  <div
                    aria-hidden
                    className="stat-draw-x hidden sm:max-lg:block absolute bottom-0 left-0 right-0 h-[1px] bg-white/15 pointer-events-none"
                  />
                )}

                {/* Mobile (1 col) horizontal divider between items */}
                {index < 3 && (
                  <div
                    aria-hidden
                    className="stat-draw-x max-sm:block absolute bottom-0 left-0 right-0 h-[1px] bg-white/15 pointer-events-none"
                  />
                )}

                <div>
                  {/* Small yellow icon on top (scales up on hover) */}
                  <div className="stat-item-icon mb-4 inline-flex text-[#FFE600] transition-transform duration-300 origin-left">
                    <item.icon className="size-6 sm:size-7" strokeWidth={2.2} />
                  </div>

                  {/* Big number in white (clamp(2.5rem, 5vw, 5rem), turns yellow on hover) */}
                  <div className="stat-item-num display text-white transition-colors duration-300 font-black text-[clamp(2.5rem,5vw,5rem)] leading-none">
                    <span className="sr-only">{item.raw}</span>
                    <span aria-hidden="true">{item.display}</span>
                  </div>

                  {/* Yellow underline draws below it on hover */}
                  <div className="stat-item-underline mt-3.5 h-[2px] w-12 bg-[#FFE600] transition-transform duration-300 scale-x-0 origin-left" />
                </div>

                {/* Label below in white 60% opacity */}
                <p className="mt-5 text-sm sm:text-base font-medium text-white/60 leading-snug">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// Re-export as Glance for seamless compatibility with page.tsx
export { StatsSection as Glance };
