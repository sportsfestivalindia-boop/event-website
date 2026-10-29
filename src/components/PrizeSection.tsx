"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { ArrowRight, Bike, Crown, Dumbbell, Medal } from "lucide-react";
import { registerHref } from "@/data/festival";
import { useReplayOnScroll } from "@/hooks/useReplayOnScroll";

/** Formats number in Indian numbering system: 2000000 -> 20,00,000 */
const formatInr = (n: number) => new Intl.NumberFormat("en-IN").format(n);

/** Hook to count up numbers with easeOutExpo */
function useCountUp(endVal: number, duration = 1600, start = false, reduced = false) {
  const [val, setVal] = useState(reduced ? endVal : 0);

  useEffect(() => {
    if (reduced) {
      setVal(endVal);
      return;
    }
    if (!start) {
      setVal(0);
      return;
    }

    let startTime: number | null = null;
    let raf: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.round(ease * endVal);
      setVal(current);

      if (progress < 1) {
        raf = requestAnimationFrame(animate);
      } else {
        setVal(endVal);
      }
    };

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [endVal, duration, start, reduced]);

  return val;
}

export function PrizeSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const carouselRef = useRef<HTMLUListElement>(null);
  const cardRefs = useRef<(HTMLLIElement | null)[]>([]);

  const play = useReplayOnScroll(sectionRef);
  const hasAnimated = play;
  const isInView = play;
  const [isReduced, setIsReduced] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  // Check prefers-reduced-motion
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setIsReduced(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => setIsReduced(e.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Mobile carousel center-detection via IntersectionObserver
  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const cards = cardRefs.current.filter(Boolean) as HTMLElement[];
    if (cards.length === 0) return;

    const ratios = [0, 0, 0, 0];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const idxStr = entry.target.getAttribute("data-card-index");
          const idx = idxStr !== null ? Number(idxStr) : -1;
          if (idx >= 0 && idx < 4) {
            ratios[idx] = entry.intersectionRatio;
          }
        });

        let maxR = -1;
        let maxIdx = 0;
        ratios.forEach((r, i) => {
          if (r > maxR) {
            maxR = r;
            maxIdx = i;
          }
        });

        if (maxR > 0.35) {
          setActiveIndex(maxIdx);
        }
      },
      {
        root: carousel,
        threshold: [0.2, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
      }
    );

    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, []);

  // Scroll mobile carousel to a specific card
  const scrollToCard = useCallback((index: number) => {
    setActiveIndex(index);
    const card = cardRefs.current[index];
    if (card) {
      card.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }, []);

  // Desktop 3D Tilt and Spotlight handler
  const rafCardRef = useRef<number | null>(null);
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLLIElement>) => {
      if (isReduced) return;
      if (typeof window !== "undefined" && !window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
        return;
      }
      const card = e.currentTarget;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (rafCardRef.current) cancelAnimationFrame(rafCardRef.current);
      rafCardRef.current = requestAnimationFrame(() => {
        card.style.setProperty("--mx", `${x}px`);
        card.style.setProperty("--my", `${y}px`);

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -5; // max 5deg
        const rotateY = ((x - centerX) / centerX) * 5;  // max 5deg

        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;
      });
    },
    [isReduced]
  );

  const handleMouseLeave = useCallback((e: React.MouseEvent<HTMLLIElement>) => {
    const card = e.currentTarget;
    card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg)";
  }, []);

  // Animated amounts
  const count1 = useCountUp(2000000, 1600, hasAnimated, isReduced);
  const count2 = useCountUp(500000, 1600, hasAnimated, isReduced);
  const count4 = useCountUp(100000, 1600, hasAnimated, isReduced);

  return (
    <section
      id="prizes"
      aria-labelledby="pz-heading"
      ref={sectionRef}
      data-play={play}
      className="relative bg-[#000000] text-white w-full page-gutter py-20 md:py-28 overflow-hidden scroll-mt-16"
    >
      {/* Soft orange radial glow behind heading (#FF6A00 at 15% opacity, blur 120px) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-16 left-1/4 -translate-x-1/2 w-[540px] h-[400px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(255, 106, 0, 0.15) 0%, rgba(255, 106, 0, 0) 70%)",
          filter: "blur(120px)",
        }}
      />

      <div className="content-contain mx-auto w-full">
        {/* Bento Prize Wall Desktop 12-column grid */}
        <div className="grid grid-cols-1 md:gap-5 lg:grid-cols-12 lg:gap-5 items-stretch">
          
          {/* Row 1, left (cols 1-7): Heading block */}
          <div className="lg:col-span-7 lg:row-start-1 flex flex-col justify-center mb-8 md:mb-10 lg:mb-0">
            <header>
              <div className="relative inline-block w-fit">
                <h2 id="pz-heading" className="display flex flex-col leading-none">
                  {/* Huge Prize Number with Curtain Wipe */}
                  <span
                    className={`block pz-gradient-text leading-none tracking-tight text-[clamp(2.6rem,13vw,4.2rem)] md:text-[clamp(3.6rem,7.5vw,6rem)] lg:text-[clamp(4.2rem,8.2vw,8.5rem)] font-normal ${
                      hasAnimated ? "pz-curtain-active" : (isReduced ? "" : "opacity-0")
                    }`}
                  >
                    ₹1,50,00,000
                  </span>
                  {/* PRIZE MONEY below in white */}
                  <span className="block text-white leading-none tracking-wider text-[clamp(1.5rem,5vw,2.4rem)] md:text-[clamp(1.8rem,3.2vw,3rem)] mt-2 font-normal">
                    PRIZE MONEY
                  </span>
                </h2>

                {/* Traveling Bright Gradient Streak */}
                {hasAnimated && !isReduced && (
                  <span
                    aria-hidden="true"
                    className="pz-streak-active pointer-events-none absolute inset-y-0 w-[4px] -ml-[2px] pz-gradient-bg shadow-[0_0_16px_#FFE600]"
                  />
                )}

                {/* Sweep Shine across gradient text */}
                {hasAnimated && !isReduced && (
                  <span
                    aria-hidden="true"
                    className="pz-shine-active pointer-events-none absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                  />
                )}
              </div>

              {/* Short yellow-to-orange gradient line */}
              <span
                aria-hidden="true"
                className="mt-4 md:mt-5 block h-1 w-24 rounded-full pz-gradient-bg"
              />

              {/* Paragraph */}
              <p className="mt-4 md:mt-5 max-w-xl text-base md:text-lg text-white/70 leading-relaxed font-normal">
                233+ podium places with cash awards — up to 5 per category, decided on merit by qualified judges and official results.
              </p>
            </header>

            {/* Mobile Swipe Hint with arrow that nudges once */}
            <div
              aria-hidden="true"
              className={`md:hidden flex items-center gap-1.5 text-xs font-semibold text-white/50 tracking-wider uppercase mt-4 ${
                hasAnimated ? "pz-swipe-nudge" : ""
              }`}
            >
              <span>Swipe</span>
              <ArrowRight className="size-3.5 text-[#FF9A00] pz-nudge-arrow" />
            </div>
          </div>

          {/* Cards List (Semantic ul) */}
          <ul
            ref={carouselRef}
            className="flex overflow-x-auto snap-x snap-mandatory gap-[14px] px-5 sm:px-6 pz-no-scrollbar -mx-5 sm:-mx-6 md:mx-0 md:px-0 md:grid md:grid-cols-2 md:gap-5 lg:contents"
          >
            {/* CARD 1: FEATURED CARD (₹20,00,000 - Champion of Champions - Men's Bodybuilding) */}
            <li
              ref={(el) => { cardRefs.current[0] = el; }}
              data-card-index="0"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{
                "--pz-rotation-state": isInView && !isReduced ? "running" : "paused",
                "--pz-stagger": "0s",
              } as React.CSSProperties}
              className={`group relative shrink-0 snap-center w-[78vw] max-w-[340px] md:w-auto md:max-w-none rounded-3xl bg-white/[0.03] border border-white/[0.12] backdrop-blur-md p-6 sm:p-7 lg:p-8 flex flex-col justify-between overflow-hidden transition-[transform,opacity] duration-300 active:scale-[0.98] ${
                activeIndex === 0 ? "scale-100 opacity-100" : "scale-[0.92] opacity-60"
              } md:scale-100 md:opacity-100 md:col-span-2 md:order-1 lg:col-span-5 lg:col-start-8 lg:row-start-1 lg:row-span-2 pz-featured-card ${
                hasAnimated ? "pz-card-assembled" : (isReduced ? "" : "pz-card-enter-right")
              }`}
            >
              {/* Desktop Hover Spotlight Overlay */}
              <div
                aria-hidden="true"
                className="pz-card-spotlight absolute inset-0 rounded-[inherit] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              />

              {/* Top Row: Crown Icon & TOP PRIZE Tag */}
              <div className="relative z-10 flex items-center justify-between gap-4">
                <div className="size-12 sm:size-14 rounded-2xl pz-gradient-bg flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/20">
                  <Crown className="size-6 sm:size-7 text-black stroke-[2.2]" />
                </div>
                <span className="pz-gradient-pill inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider text-white uppercase backdrop-blur-md">
                  TOP PRIZE
                </span>
              </div>

              {/* Amount & Label */}
              <div className="relative z-10 my-6 sm:my-8">
                <p className="display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-normal tracking-tight pz-gradient-text leading-none">
                  <span className="sr-only">₹20,00,000</span>
                  <span aria-hidden="true">₹{formatInr(count1)}</span>
                </p>
                <p className="text-xl sm:text-2xl font-bold text-white mt-3 leading-snug">
                  Champion of Champions
                </p>
                <p className="text-sm sm:text-base text-white/60 flex items-center mt-2 font-medium">
                  <span className="size-2 rounded-full pz-gradient-bg mr-2 inline-block shrink-0" />
                  Men&apos;s Bodybuilding
                </p>
              </div>

              {/* Bottom detail row */}
              <div className="relative z-10 pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs text-white/40">
                <span className="uppercase tracking-wider font-semibold">Gold Standard Trophy</span>
                <span>Baramunda Stage</span>
              </div>
            </li>

            {/* CARD 2: ₹5,00,000 (Champion of Champions - Men's Physique) */}
            <li
              ref={(el) => { cardRefs.current[1] = el; }}
              data-card-index="1"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{
                "--pz-stagger": "0.1s",
              } as React.CSSProperties}
              className={`group relative shrink-0 snap-center w-[78vw] max-w-[340px] md:w-auto md:max-w-none rounded-3xl bg-white/[0.03] border border-white/[0.12] backdrop-blur-md p-6 sm:p-7 flex flex-col justify-between overflow-hidden transition-[transform,opacity] duration-300 active:scale-[0.98] ${
                activeIndex === 1 ? "scale-100 opacity-100" : "scale-[0.92] opacity-60"
              } md:scale-100 md:opacity-100 md:col-span-1 md:order-2 lg:col-span-2 lg:col-start-1 lg:row-start-2 ${
                hasAnimated ? "pz-card-assembled" : (isReduced ? "" : "pz-card-enter-left")
              }`}
            >
              {/* Desktop Hover Spotlight Overlay */}
              <div
                aria-hidden="true"
                className="pz-card-spotlight absolute inset-0 rounded-[inherit] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              />

              <div className="relative z-10">
                <div className="size-11 sm:size-12 rounded-xl pz-gradient-bg flex items-center justify-center shrink-0 shadow-md shadow-orange-500/20">
                  <Medal className="size-5 sm:size-6 text-black stroke-[2.2]" />
                </div>
                <p className="display text-2xl sm:text-3xl lg:text-[2rem] font-normal tracking-tight text-white leading-none mt-4 sm:mt-5">
                  <span className="sr-only">₹5,00,000</span>
                  <span aria-hidden="true">₹{formatInr(count2)}</span>
                </p>
                <p className="text-base sm:text-lg font-bold text-white mt-2 leading-snug">
                  Champion of Champions
                </p>
                <p className="text-xs sm:text-sm text-white/60 flex items-center mt-1.5 font-medium">
                  <span className="size-1.5 rounded-full pz-gradient-bg mr-2 inline-block shrink-0" />
                  Men&apos;s Physique
                </p>
              </div>
            </li>

            {/* CARD 3: ROYAL ENFIELD BULLET (Utkal Kesari - Dangal · men's winner) */}
            <li
              ref={(el) => { cardRefs.current[2] = el; }}
              data-card-index="2"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{
                "--pz-stagger": "0.2s",
              } as React.CSSProperties}
              className={`group relative shrink-0 snap-center w-[78vw] max-w-[340px] md:w-auto md:max-w-none rounded-3xl bg-white/[0.03] border border-white/[0.12] backdrop-blur-md p-6 sm:p-7 flex flex-col justify-between overflow-hidden transition-[transform,opacity] duration-300 active:scale-[0.98] ${
                activeIndex === 2 ? "scale-100 opacity-100" : "scale-[0.92] opacity-60"
              } md:scale-100 md:opacity-100 md:col-span-2 md:order-4 lg:col-span-3 lg:col-start-3 lg:row-start-2 ${
                hasAnimated ? "pz-card-assembled" : (isReduced ? "" : "pz-card-enter-bottom")
              }`}
            >
              {/* Desktop Hover Spotlight Overlay */}
              <div
                aria-hidden="true"
                className="pz-card-spotlight absolute inset-0 rounded-[inherit] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              />

              <div className="relative z-10">
                <div className="size-11 sm:size-12 rounded-xl pz-gradient-bg flex items-center justify-center shrink-0 shadow-md shadow-orange-500/20">
                  <Bike className="size-5 sm:size-6 text-black stroke-[2.2]" />
                </div>
                {/* Bike name in smaller condensed size wrapped in 2 lines */}
                <p className="display text-xl sm:text-2xl lg:text-[1.65rem] font-normal tracking-tight text-white leading-[1.08] mt-4 sm:mt-5 max-w-[13ch]">
                  ROYAL ENFIELD BULLET
                </p>
                <p className="text-base sm:text-lg font-bold text-white mt-2 leading-snug">
                  Utkal Kesari
                </p>
                <p className="text-xs sm:text-sm text-white/60 flex items-center mt-1.5 font-medium">
                  <span className="size-1.5 rounded-full pz-gradient-bg mr-2 inline-block shrink-0" />
                  Dangal · men&apos;s winner
                </p>
              </div>
            </li>

            {/* CARD 4: ₹1,00,000 (Strong Man · Strong Woman - Powerlifting) */}
            <li
              ref={(el) => { cardRefs.current[3] = el; }}
              data-card-index="3"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{
                "--pz-stagger": "0.3s",
              } as React.CSSProperties}
              className={`group relative shrink-0 snap-center w-[78vw] max-w-[340px] md:w-auto md:max-w-none rounded-3xl bg-white/[0.03] border border-white/[0.12] backdrop-blur-md p-6 sm:p-7 flex flex-col justify-between overflow-hidden transition-[transform,opacity] duration-300 active:scale-[0.98] ${
                activeIndex === 3 ? "scale-100 opacity-100" : "scale-[0.92] opacity-60"
              } md:scale-100 md:opacity-100 md:col-span-1 md:order-3 lg:col-span-2 lg:col-start-6 lg:row-start-2 ${
                hasAnimated ? "pz-card-assembled" : (isReduced ? "" : "pz-card-enter-bottom-right")
              }`}
            >
              {/* Desktop Hover Spotlight Overlay */}
              <div
                aria-hidden="true"
                className="pz-card-spotlight absolute inset-0 rounded-[inherit] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              />

              <div className="relative z-10">
                <div className="size-11 sm:size-12 rounded-xl pz-gradient-bg flex items-center justify-center shrink-0 shadow-md shadow-orange-500/20">
                  <Dumbbell className="size-5 sm:size-6 text-black stroke-[2.2]" />
                </div>
                <p className="display text-2xl sm:text-3xl lg:text-[2rem] font-normal tracking-tight text-white leading-none mt-4 sm:mt-5">
                  <span className="sr-only">₹1,00,000</span>
                  <span aria-hidden="true">₹{formatInr(count4)}</span>
                </p>
                <p className="text-base sm:text-lg font-bold text-white mt-2 leading-snug">
                  Strong Man · Strong Woman
                </p>
                <p className="text-xs sm:text-sm text-white/60 flex items-center mt-1.5 font-medium">
                  <span className="size-1.5 rounded-full pz-gradient-bg mr-2 inline-block shrink-0" />
                  Powerlifting
                </p>
              </div>
            </li>
          </ul>
        </div>

        {/* Mobile Horizontal Carousel Progress Dots */}
        <div className="flex md:hidden items-center justify-center gap-2 mt-6">
          {[0, 1, 2, 3].map((idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => scrollToCard(idx)}
              aria-label={`Go to prize ${idx + 1}`}
              className={`h-2 transition-all duration-300 rounded-full min-w-[24px] min-h-[24px] flex items-center justify-center p-1`}
            >
              <span
                className={`block h-2 rounded-full transition-all duration-300 ${
                  activeIndex === idx
                    ? "w-7 pz-gradient-bg shadow-sm shadow-orange-500/50"
                    : "w-2 bg-white/20 hover:bg-white/40"
                }`}
              />
            </button>
          ))}
        </div>

        {/* Register CTA Button & Pay Line below the grid */}
        <div className="mt-8 md:mt-10 lg:mt-12 flex flex-col items-center md:items-start gap-3 w-full">
          <Link
            href={registerHref()}
            className="pz-register-btn group relative flex items-center justify-center gap-3 w-full sm:w-auto px-8 h-14 rounded-2xl text-black font-extrabold tracking-wide uppercase text-base sm:text-lg overflow-hidden active:scale-[0.98] select-none"
          >
            <span>REGISTER NOW — FROM ₹600</span>
            <ArrowRight className="size-5 transition-transform duration-300 group-hover:translate-x-1" />
            <span aria-hidden="true" className="pz-btn-shine" />
          </Link>
          <p className="text-xs text-white/60 tracking-normal text-center md:text-left">
            2-min signup · Instant PayU Checkout · Confirmation on WhatsApp
          </p>
        </div>
      </div>
    </section>
  );
}
