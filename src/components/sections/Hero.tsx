"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CHAMPIONSHIPS, EVENT, categoryCount, minFee, paidPlaces, registerHref } from "@/data/festival";
import { inr } from "@/lib/format";
import { useReplayOnScroll } from "@/hooks/useReplayOnScroll";
import { HeroVideo } from "../HeroVideo";
import { Icon } from "../icons";
import { Countdown, Odometer } from "../live";
import { PAY_LINE } from "../ui";
import { openRegisterModal } from "../RegisterModal";

const d = (i: number) => ({ "--i": i }) as React.CSSProperties;

/** Floating golden embers overlay matching the championship arena atmosphere */
function HeroEmbers() {
  const embers = [
    { left: "8%", delay: "0s", dur: "7.2s", size: "3px", drift: "-20px" },
    { left: "16%", delay: "2.4s", dur: "8.5s", size: "4px", drift: "30px" },
    { left: "26%", delay: "1.1s", dur: "7.8s", size: "2px", drift: "18px" },
    { left: "36%", delay: "3.9s", dur: "9.5s", size: "3.5px", drift: "-25px" },
    { left: "46%", delay: "0.6s", dur: "7s", size: "2.5px", drift: "15px" },
    { left: "56%", delay: "3.1s", dur: "8.2s", size: "3px", drift: "-20px" },
    { left: "66%", delay: "1.7s", dur: "9s", size: "4px", drift: "35px" },
    { left: "76%", delay: "4.5s", dur: "7.6s", size: "2px", drift: "-15px" },
    { left: "86%", delay: "2s", dur: "8.4s", size: "3.5px", drift: "25px" },
    { left: "92%", delay: "0.3s", dur: "9.2s", size: "2.5px", drift: "-30px" },
    { left: "21%", delay: "5.2s", dur: "8s", size: "3px", drift: "15px" },
    { left: "81%", delay: "3.7s", dur: "7.4s", size: "4px", drift: "-18px" },
  ];

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden z-0">
      {embers.map((e, idx) => (
        <span
          key={idx}
          className="absolute rounded-full bg-gradient-to-t from-yellow via-orange-400 to-amber-200 shadow-[0_0_8px_#ffde00]"
          style={{
            left: e.left,
            bottom: "-10px",
            width: e.size,
            height: e.size,
            animation: `ember-float ${e.dur} linear infinite`,
            animationDelay: e.delay,
            ["--drift" as string]: e.drift,
          }}
        />
      ))}
    </div>
  );
}

export function Hero() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const play = useReplayOnScroll(sectionRef);
  const [introDismissed, setIntroDismissed] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    // Check if intro was already dismissed in this session
    if (typeof window !== "undefined" && (window as any).__introDismissed) {
      setIntroDismissed(true);
      return;
    }

    const hasIntro =
      typeof window !== "undefined" &&
      ((window as any).__hasBullIntro || document.getElementById("bull-intro"));

    // If there is truly no intro, start immediately
    if (!hasIntro) {
      setIntroDismissed(true);
      return;
    }

    // Intro exists: wait for dismissal
    const onDismissed = () => {
      setIntroDismissed(true);
    };
    window.addEventListener("intro-dismissed", onDismissed, { once: true });

    // Fallback in case intro element is removed from DOM directly
    const observer = new MutationObserver(() => {
      if (!document.getElementById("bull-intro")) {
        observer.disconnect();
        setIntroDismissed(true);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("intro-dismissed", onDismissed);
      observer.disconnect();
    };
  }, []);

  // Text animation starts ONLY after intro is dismissed AND hero is in view;
  // resets when scrolled away, replays when scrolled back in
  useEffect(() => {
    if (!introDismissed) {
      setIsRevealed(false);
      return;
    }
    if (play) {
      const t = setTimeout(() => setIsRevealed(true), 60);
      return () => clearTimeout(t);
    } else {
      setIsRevealed(false);
    }
  }, [introDismissed, play]);

  return (
    <section
      ref={sectionRef}
      id="top"
      data-play={isRevealed}
      className="t-ink relative isolate overflow-hidden h-[100dvh] min-h-[100dvh] max-h-[100dvh] flex flex-col justify-between pt-16 md:pt-20 pb-4 md:pb-6 page-gutter w-full"
    >
      {/* Hero background video - starts after intro, pauses off-screen, restarts on return */}
      <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden bg-black">
        <HeroVideo active={introDismissed && play} />
      </div>

      {/* Atmospheric floating golden embers */}
      <HeroEmbers />

      <span className="sr-only">Champion bodybuilder at India’s Biggest Sports Festival 2026</span>

      {/* Hidden for accessibility & SEO since it's already in the Sports.webp artwork */}
      <h1 className="sr-only">
        India’s Biggest Sports Festival 2026 · 4–6 December 2026 · Baramunda Ground Field, Bhubaneswar · ₹1.5 Crore Prize Pool
      </h1>

      {/* Inner full-width container capped at content-contain */}
      <div className="content-contain relative z-10 flex flex-1 flex-col justify-between w-full">
        {/* Main Content Area: Interactive CTAs & Ticket Fee positioned below the artwork graphic */}
        <div className="relative w-full flex-1 flex flex-col justify-end items-center lg:items-start pb-4 sm:pb-6 max-w-[580px] text-center lg:text-left mx-auto lg:mx-0 z-10">
          {/* Atmospheric ambient glow behind the CTA container */}
          <div
            aria-hidden
            className="pointer-events-none absolute -left-10 -bottom-8 w-80 sm:w-96 h-72 sm:h-80 bg-[radial-gradient(circle,rgba(255,100,0,0.2)_0%,rgba(255,222,0,0.08)_40%,transparent_70%)] blur-2xl -z-10 animate-pulse"
            style={{ animationDuration: "5s" }}
          />

          {/* Ticket pricing badge with glassmorphism and pulsing ticket icon */}
          <div
            className={`hero-enter flex items-center justify-center lg:justify-start ${
              isRevealed ? "hero-enter-active" : ""
            }`}
            style={{ "--delay": "100ms" } as React.CSSProperties}
          >
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-yellow/35 bg-black/60 backdrop-blur-md shadow-[0_0_20px_rgba(255,222,0,0.15)]">
              <span className="relative flex size-5 sm:size-6 items-center justify-center">
                <Icon name="ticket" className="size-4 sm:size-5 text-yellow animate-pulse shrink-0" />
              </span>
              <div className="text-left flex items-baseline gap-1.5">
                <span className="text-[11px] sm:text-xs uppercase tracking-wider text-white/80 font-bold">Entry from</span>
                <span className="display text-xl sm:text-2xl text-yellow font-extrabold drop-shadow-[0_2px_8px_rgba(255,222,0,0.5)]">
                  {inr(minFee)}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons: Register CTA with gold shimmer/glow + Find Category with down arrow bounce */}
          <div
            className={`hero-enter mt-3.5 flex flex-col sm:flex-row items-center sm:items-stretch gap-3 w-full sm:w-auto justify-center lg:justify-start ${
              isRevealed ? "hero-enter-active" : ""
            }`}
            style={{ "--delay": "260ms" } as React.CSSProperties}
          >
            <Link
              id="hero-cta"
              href={registerHref()}
              onClick={(e) => {
                e.preventDefault();
                openRegisterModal();
              }}
              className="btn btn-gold hero-shimmer hero-cta-glow relative group w-full sm:w-auto px-7 py-3.5 min-h-[50px] flex items-center justify-center gap-2.5 text-sm sm:text-base font-extrabold uppercase tracking-wider transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap cursor-pointer"
              data-cta="hero-cta"
            >
              <span>Register now</span>
              <Icon name="arrow" className="size-5 transition-transform duration-300 group-hover:translate-x-1.5 shrink-0" />
            </Link>

            <a
              href="#arena"
              className="btn btn-line group w-full sm:w-auto px-6 py-3.5 min-h-[50px] flex items-center justify-center gap-2.5 border-1.5 border-white/25 bg-black/45 backdrop-blur-sm text-white hover:border-yellow hover:text-yellow hover:bg-yellow/10 text-sm sm:text-base font-bold uppercase tracking-wider transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
            >
              <span>Find my category</span>
              <Icon name="down" className="size-5 down-arrow-bounce text-yellow transition-transform group-hover:translate-y-1 shrink-0" />
            </a>
          </div>

          {/* Microcopy with verification link */}
          <p
            className={`hero-enter mt-2.5 text-xs text-white/80 drop-shadow-[0_1px_4px_rgba(0,0,0,0.95)] ${
              isRevealed ? "hero-enter-active" : ""
            }`}
            style={{ "--delay": "380ms" } as React.CSSProperties}
          >
            {PAY_LINE} · Already paid?{" "}
            <Link href="/verify" className="font-semibold text-yellow underline underline-offset-2 hover:text-white transition-colors whitespace-nowrap">
              Verify your payment
            </Link>
          </p>
        </div>

        {/* Bottom Metadata Row (Always visible in single screen hero with live radar indicator) */}
        <div
          className={`hero-enter relative w-full border-t border-white/15 pt-3 sm:pt-4 backdrop-blur-[2px] z-10 ${
            isRevealed ? "hero-enter-active" : ""
          }`}
          style={{ "--delay": "480ms" } as React.CSSProperties}
        >
          <ul className="flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2.5 text-xs sm:text-sm text-white/90 drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)]">
            <li className="flex items-center gap-2 hover:text-yellow transition-colors cursor-default">
              <Icon name="calendar" className="size-4 sm:size-5 text-yellow" />
              <b className="font-semibold text-white tracking-wide">4–6 DEC 2026</b>
            </li>
            <li className="flex items-center gap-2 hover:text-yellow transition-colors cursor-default">
              <Icon name="pin" className="size-4 sm:size-5 text-yellow" />
              <span>{EVENT.venue}, Bhubaneswar</span>
            </li>
            <li className="flex items-center gap-2 bg-black/45 px-3 py-1 rounded-full border border-yellow/25">
              <span className="relative flex size-2.5 items-center justify-center">
                <span className="absolute inline-flex size-full rounded-full bg-yellow opacity-75 animate-ping" />
                <span className="relative inline-flex size-2 rounded-full bg-yellow" />
              </span>
              <span>Registrations close in</span>
              <Countdown className="font-bold text-yellow tracking-wide" />
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}

/** Gold marquee of the seven championships, separated by the bolt. */
export function Ticker() {
  const names = CHAMPIONSHIPS.map((c) => c.sport.replace(" & Physique", "").replace(" (Wrestling)", ""));
  const run = [...names, ...names];
  return (
    <div className="t-gold overflow-hidden py-3.5 md:py-4" aria-label={names.join(", ")}>
      <div className="marquee flex w-max items-center" aria-hidden>
        {run.map((n, i) => (
          <span key={i} className="display flex items-center text-[clamp(1.4rem,3vw,2.2rem)]">
            <span className="px-5 md:px-8">{n}</span>
            <Icon name="bolt" className="size-6 fill-ink stroke-none md:size-7" />
          </span>
        ))}
      </div>
    </div>
  );
}

export { StatsSection as Glance, StatsSection } from "@/components/StatsSection";
