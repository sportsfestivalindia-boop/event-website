"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BedDouble,
  Camera,
  Medal,
  Radio,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { registerHref } from "@/data/festival";

const FEATURES = [
  {
    num: "01",
    title: "Official athlete ID",
    body: "Your entry pass and access to the athlete zone on your competition day.",
    icon: BadgeCheck,
  },
  {
    num: "02",
    title: "Medal, certificate & T-shirt",
    body: "Festival medal, participation certificate and official athlete T-shirt.",
    icon: Medal,
  },
  {
    num: "03",
    title: "Your photos & reel",
    body: "10 professional stage photos + a 15-second Instagram reel of you, within 72 hours.",
    icon: Camera,
  },
  {
    num: "04",
    title: "Live on stream",
    body: "Your category is broadcast live — family and friends can watch from home.",
    icon: Radio,
  },
  {
    num: "05",
    title: "Warm-up zone & medical",
    body: "Pump-up area, drinking water, and doctors on site all 3 days.",
    icon: ShieldCheck,
  },
  {
    num: "06",
    title: "Hotel & travel help",
    body: "Special athlete rates at partner hotels in Bhubaneswar.",
    icon: BedDouble,
  },
];

export function ValueSection() {
  return (
    <section
      id="value"
      aria-labelledby="pk-heading"
      className="relative bg-[#000000] text-white w-full page-gutter py-20 md:py-28 overflow-hidden scroll-mt-20 select-none"
    >
      {/* Ambient background glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/4 w-[600px] h-[600px] rounded-full opacity-20"
        style={{
          background:
            "radial-gradient(circle, rgba(255, 106, 0, 0.35) 0%, rgba(255, 154, 0, 0.1) 45%, transparent 70%)",
          filter: "blur(120px)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 right-10 w-[500px] h-[500px] rounded-full opacity-25"
        style={{
          background:
            "radial-gradient(circle, rgba(255, 154, 0, 0.3) 0%, rgba(255, 106, 0, 0.08) 50%, transparent 70%)",
          filter: "blur(100px)",
        }}
      />

      <div className="max-w-7xl mx-auto w-full relative z-10">
        {/* Section Header */}
        <header className="max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-white/10 mb-6 backdrop-blur-sm">
            <Sparkles className="size-3.5 text-[#FF9A00]" />
            <span className="text-xs uppercase tracking-widest font-semibold text-white/80">
              All Included In Your Entry
            </span>
          </div>

          <h2
            id="pk-heading"
            className="display text-[clamp(2.6rem,7vw,6.5rem)] font-black leading-[0.92] tracking-tight text-white uppercase"
          >
            WHAT A <span className="pk-gradient-text font-normal">₹5,000</span> ENTRY GETS YOU
          </h2>

          {/* Short yellow-to-orange gradient line */}
          <span
            aria-hidden="true"
            className="mt-6 block h-1.5 w-24 rounded-full pk-gradient-bg"
          />

          <p className="mt-5 text-base sm:text-lg text-white/70 max-w-2xl font-normal leading-relaxed">
            Every registered athlete receives the complete championship package with full access,
            media coverage, and official credentials.
          </p>
        </header>

        {/* 6 Feature Bento Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mt-12 sm:mt-16">
          {FEATURES.map((item) => {
            const IconComponent = item.icon;

            return (
              <div
                key={item.num}
                className="group relative rounded-2xl bg-[#0A0A0A] border border-white/10 p-7 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:border-[#FF9A00]/50 hover:bg-[#111111] hover:shadow-[0_12px_40px_-15px_rgba(255,106,0,0.3)] hover:-translate-y-1 overflow-hidden"
              >
                {/* Giant Outlined Number in Background */}
                <span
                  aria-hidden="true"
                  className="absolute top-4 right-6 display text-7xl sm:text-8xl pk-outlined-number pointer-events-none select-none transition-transform duration-300 group-hover:scale-105 opacity-80"
                >
                  {item.num}
                </span>

                {/* 1px Vertical Gradient Line on Left Edge on hover */}
                <span
                  aria-hidden="true"
                  className="absolute left-0 top-0 bottom-0 w-[2px] pk-gradient-bg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                />

                <div>
                  {/* Circular Icon Holder with 1px Gradient Ring */}
                  <div
                    aria-hidden="true"
                    className="size-16 sm:size-[72px] rounded-full border border-white/10 p-[1px] pk-gradient-ring relative flex items-center justify-center bg-[#141414] mb-6 shadow-lg shadow-orange-500/10 transition-transform duration-300 group-hover:scale-105"
                  >
                    <div className="text-white group-hover:text-[#FF9A00] transition-colors duration-300">
                      <IconComponent className="size-7 sm:size-8 stroke-[1.8]" />
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div className="relative z-10">
                    <h3 className="display text-2xl sm:text-3xl text-white tracking-tight uppercase leading-snug">
                      {item.title}
                    </h3>

                    <p className="text-sm sm:text-base text-white/70 mt-3 font-normal leading-relaxed">
                      {item.body}
                    </p>
                  </div>
                </div>

                {/* Bottom subtle gradient accent line */}
                <div
                  aria-hidden="true"
                  className="mt-8 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs text-white/40 group-hover:text-white/70 transition-colors uppercase tracking-wider font-semibold"
                >
                  <span>Included</span>
                  <span className="text-[#FF9A00]">0{parseInt(item.num, 10)} / 06</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Closing Podium Banner */}
        <div className="mt-14 sm:mt-20 relative rounded-3xl bg-gradient-to-br from-[#141414] via-[#0d0d0d] to-[#140a02] border border-orange-500/30 p-8 sm:p-12 lg:p-14 overflow-hidden shadow-2xl">
          {/* Sunrise Radial Glow Effect */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/4 w-[500px] h-[500px] rounded-full opacity-80"
            style={{
              background:
                "radial-gradient(circle, rgba(255, 106, 0, 0.3) 0%, rgba(255, 154, 0, 0.1) 45%, transparent 70%)",
              filter: "blur(80px)",
            }}
          />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="max-w-2xl">
              <p className="display text-[clamp(2.2rem,5vw,3.8rem)] leading-[0.95] text-white tracking-tight uppercase">
                ALL THIS – AND YOUR SHOT AT THE{" "}
                <span className="pk-gradient-text font-normal">PODIUM</span>
              </p>
              <p className="text-white/70 text-base sm:text-lg mt-3 font-normal leading-relaxed max-w-xl">
                Ready to represent your state, prove your training, and compete on the grandest stage?
              </p>
            </div>

            <div className="shrink-0">
              <Link
                href={registerHref()}
                className="pk-book-btn group relative inline-flex items-center justify-between gap-6 h-16 px-9 rounded-full pk-gradient-bg text-black font-black text-lg uppercase select-none shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF9A00] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                <span className="tracking-wide">BOOK MY SPOT</span>
                <span
                  aria-hidden="true"
                  className="size-10 rounded-full bg-black text-[#FFE600] flex items-center justify-center transition-transform duration-300 group-hover:translate-x-1.5 shadow-md"
                >
                  <ArrowRight className="size-5 stroke-[2.5]" />
                </span>
                <span aria-hidden="true" className="pk-btn-shine" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
