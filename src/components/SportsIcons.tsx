"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { useReplayOnScroll } from "@/hooks/useReplayOnScroll";

const PARAGRAPH =
  "Our event features distinguished sports personalities, including international powerlifters, national weightlifting medalists, professional bodybuilders, and fitness icons, celebrating their achievements and inspiring the next generation of athletes.";

// Floating sparks (left %, size px, duration s, delay s)
const EMBERS = [
  [48, 6, 7, 0], [55, 4, 9, 1.2], [62, 8, 8, 2.4], [68, 5, 10, 0.6],
  [74, 7, 7.5, 3], [80, 4, 9.5, 1.8], [86, 6, 8, 0.3], [91, 5, 10, 2.1],
  [96, 7, 7, 3.6], [58, 5, 11, 4.2], [78, 6, 9, 4.8], [88, 4, 8.5, 5.4],
];

export function SportsIcons() {
  const ref = useRef<HTMLElement | null>(null);
  const play = useReplayOnScroll(ref);

  // 2) Scroll progress (sparks ka parallax)
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const update = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
      el.style.setProperty("--p", p.toFixed(3));
      raf = 0;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section
      ref={ref}
      data-play={play}
      className="relative w-full overflow-hidden bg-black"
    >
      {/* Frame: scroll par rounded card se full width mein khulta hai */}
      <div className="si-frame relative min-h-[100svh] w-full md:aspect-[2576/1449] md:min-h-0">
        {/* Background image (full width, original ratio, full quality) */}
        <div className="si-zoom absolute inset-0">
          <Image
            src="https://res.cloudinary.com/jxvpizz0/image/upload/v1793168940/after-hero.jpg"
            alt="India’s Biggest Sports Festival 2026 sports icons"
            fill
            quality={100}
            sizes="100vw"
            unoptimized
            className="select-none object-cover object-[72%_center] md:object-center"
          />
        </div>

        {/* Hero se smooth blend ke liye upar ka fade */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-24 bg-gradient-to-b from-black to-transparent" />

        {/* Light shine (ek baar image ke upar se guzarti hai) */}
        <div className="si-shine pointer-events-none absolute inset-y-0 left-0 z-10 w-1/4 bg-gradient-to-r from-transparent via-white/15 to-transparent" />

        {/* Floating sparks */}
        <div aria-hidden className="si-embers pointer-events-none absolute inset-0 z-10">
          {EMBERS.map(([x, size, dur, delay], i) => (
            <span
              key={i}
              className="si-ember"
              style={{
                left: `${x}%`,
                bottom: "-2%",
                width: size,
                height: size,
                animationDuration: `${dur}s`,
                animationDelay: `${delay}s`,
              }}
            />
          ))}
        </div>

        {/* Mobile bottom gradient */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-15 h-3/5 bg-gradient-to-t from-black via-black/75 to-transparent md:hidden" />

        {/* Text: image ke left blank part par, aligned to page-gutter */}
        <div className="pointer-events-none absolute inset-0 z-20 flex items-end md:items-center page-gutter">
          <div className="content-contain w-full">
            <div className="pointer-events-auto w-full md:w-[48%] max-w-[40rem] pb-10 pt-40 md:py-0">
              <div className="mb-[1.2vw] flex items-center gap-3 md:mb-[1vw]">
                <span
                  className="si-bar block h-1 rounded-full bg-gradient-to-r from-orange-500 to-yellow-400"
                  style={{ ["--d" as string]: "0.7s" }}
                />
                <span
                  className="si-fade text-xs font-semibold uppercase tracking-[0.3em] text-orange-400 md:text-[clamp(0.6rem,0.9vw,0.95rem)]"
                  style={{ ["--d" as string]: "0.9s" }}
                >
                  Featured Guests
                </span>
              </div>

              <h2 className="text-4xl font-extrabold uppercase leading-[1.05] text-white md:text-[clamp(2rem,4vw,4.5rem)]">
                <span className="si-mask">
                  <span style={{ ["--d" as string]: "1s" }}>Meet the</span>
                </span>
                <span className="si-mask">
                  <span style={{ ["--d" as string]: "1.2s" }}>
                    <em className="si-grad not-italic">Sports Icons</em>
                  </span>
                </span>
              </h2>

              <p className="mt-5 text-base leading-relaxed text-white/80 md:mt-[1.2vw] md:text-[clamp(0.8rem,1.15vw,1.25rem)]">
                {PARAGRAPH.split(" ").map((word, i) => (
                  <span key={i}>
                    <span
                      className="si-word"
                      style={{ ["--d" as string]: `${1.5 + i * 0.03}s` }}
                    >
                      {word}
                    </span>{" "}
                  </span>
                ))}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
