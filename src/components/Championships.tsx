"use client";

import { useRef } from "react";
import {
  Swords,
  HandFist,
  Footprints,
  BicepsFlexed,
  Dumbbell,
  Handshake,
  ArrowUpRight,
} from "lucide-react";
import { useReplayOnScroll } from "@/hooks/useReplayOnScroll";

const SPORTS = [
  { no: "01", name: "Dangal", sub: "(Matti Kusti)", icon: Swords },
  { no: "02", name: "Boxing", sub: "Championship", icon: HandFist },
  { no: "03", name: "Marathon", sub: "Championship", icon: Footprints },
  { no: "04", name: "Bodybuilding", sub: "Championship", icon: BicepsFlexed },
  { no: "05", name: "Powerlifting", sub: "Championship", icon: Dumbbell },
  { no: "06", name: "Arm Wrestling", sub: "Championship", icon: Handshake },
];

export function Championships() {
  const ref = useRef<HTMLElement | null>(null);
  const play = useReplayOnScroll(ref);

  return (
    <section
      ref={ref}
      data-play={play}
      id="championships"
      className="relative w-full overflow-hidden bg-black py-10 sm:py-20 lg:py-28"
    >
      {/* Orange glow (Register button ke color se match) */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[26rem] w-[60rem] max-w-full -translate-x-1/2 rounded-full bg-[#FF6A00]/15 blur-[120px]"
      />

      <div className="content-contain page-gutter relative w-full">
        {/* Heading */}
        <div className="mb-8 sm:mb-16">
          <p
            className="cp-up text-sm font-semibold uppercase tracking-[0.3em] text-[#FF6A00]"
            style={{ ["--d" as string]: "0s" }}
          >
            6 Championships · 4–6 December 2026
          </p>
          <h2 className="display mt-3 text-5xl font-black uppercase leading-[0.95] text-white sm:text-7xl lg:text-8xl">
            <span className="cp-mask">
              <span style={{ ["--d" as string]: "0.15s" }}>Six Sports.</span>
            </span>
            <span className="cp-mask">
              <span
                className="text-[#FF0000]"
                style={{ ["--d" as string]: "0.3s" }}
              >
                One Arena.
              </span>
            </span>
          </h2>
        </div>

        {/* 6 pop-up cards */}
        <ul className="grid grid-cols-2 gap-3 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SPORTS.map((s, i) => (
            <li
              key={s.no}
              className="cp-pop"
              style={{
                ["--i" as string]: i,
                ["--r" as string]: i % 2 === 0 ? "-6deg" : "6deg",
              }}
            >
              <a
                href="#arena"
                className="cp-card group relative flex aspect-square sm:aspect-auto h-full sm:min-h-[260px] flex-col justify-between overflow-hidden rounded-2xl border border-white/15 bg-black p-3.5 min-[380px]:p-4 sm:p-7 transition-all duration-300 hover:-translate-y-2 hover:border-[#FFE600] hover:shadow-[0_24px_60px_-24px_rgba(255,230,0,0.55)]"
              >
                {/* Yellow fill neeche se upar (hover par) */}
                <span
                  aria-hidden
                  className="absolute inset-0 origin-bottom scale-y-0 bg-[#FFE600] transition-transform duration-500 ease-out group-hover:scale-y-100"
                />

                {/* Bada outline number */}
                <span
                  aria-hidden
                  className="cp-num pointer-events-none absolute -right-1 -top-2 sm:-right-3 sm:-top-6 select-none text-[4.5rem] min-[380px]:text-[5rem] sm:text-[9rem] font-black leading-none"
                >
                  {s.no}
                </span>

                {/* Upar: sport icon (orange background, hover pe yellow icon in black box) */}
                <div className="relative z-10 flex size-8 min-[380px]:size-9 sm:size-12 items-center justify-center rounded-lg sm:rounded-xl bg-[#FF6A00] text-black transition-colors duration-300 group-hover:bg-black group-hover:text-[#FFE600]">
                  <s.icon className="size-4 min-[380px]:size-4.5 sm:size-6" strokeWidth={2.2} />
                </div>

                {/* Neeche: sport ka naam */}
                <div className="relative z-10">
                  <h3 className="display text-xl min-[380px]:text-2xl font-black uppercase leading-none text-white transition-colors duration-300 group-hover:text-black sm:text-5xl">
                    {s.name}
                  </h3>
                  <div className="mt-1.5 sm:mt-3 flex items-center justify-between gap-1">
                    <span className="text-[10px] min-[380px]:text-xs sm:text-sm uppercase tracking-wider sm:tracking-widest text-white/60 transition-colors duration-300 group-hover:text-black/70 font-semibold truncate">
                      {s.sub}
                    </span>
                    <ArrowUpRight className="size-3.5 min-[380px]:size-4 sm:size-6 text-[#FF6A00] transition-all duration-300 group-hover:rotate-45 group-hover:text-black shrink-0" />
                  </div>
                </div>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
