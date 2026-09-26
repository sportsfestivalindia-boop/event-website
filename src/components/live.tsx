"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { EVENT, registerHref } from "@/data/festival";
import { inr } from "@/lib/format";
import { Crest, Icon } from "./icons";

/** One observer for every [data-reveal] element on the page. */
export function Reveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }),
      { rootMargin: "0px 0px -8% 0px" },
    );
    document.querySelectorAll("[data-reveal]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return null;
}

const H72 = 72 * 3600_000;
const pad = (n: number) => String(n).padStart(2, "0");

// ticking clock; null on the server so markup never mismatches
const tick = (cb: () => void) => {
  const t = setInterval(cb, 1000);
  return () => clearInterval(t);
};
const useNow = () =>
  useSyncExternalStore(
    tick,
    () => Math.floor(Date.now() / 1000) * 1000,
    () => null,
  );

/** Real countdown to registration close. Final 72h → red hh:mm:ss. Never fake. */
export function Countdown({ prefix = "Registrations close in", className = "" }: { prefix?: string; className?: string }) {
  const now = useNow();
  const ms = now == null ? null : new Date(EVENT.registrationCloses).getTime() - now;
  const final = ms != null && ms < H72;
  let text = "—";
  if (ms != null) {
    const s = Math.max(0, Math.floor(ms / 1000));
    const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60);
    text = ms <= 0 ? "Registrations closed" : final ? `${pad(d * 24 + h)}:${pad(m)}:${pad(s % 60)}` : `${d}d ${pad(h)}h`;
  }
  return (
    <span className={`inline-flex items-center gap-2 ${final ? "text-[#ff6b5e]" : ""} ${className}`}>
      <Icon name="clock" className="size-4 shrink-0" />
      {ms != null && ms <= 0 ? null : <span className="opacity-80">{prefix}</span>}
      <b className="tnum min-w-[6.5ch] font-semibold">{text}</b>
    </span>
  );
}

/** Odometer: each digit rolls to its value like a plate dropping onto the bar. Server-renders the final value. */
export function Odometer({ value, className = "" }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [run, setRun] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setTimeout(() => setRun(true), 250);
        io.disconnect();
      }
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  let di = 0;
  return (
    <span ref={ref} className={`odo inline-flex leading-none ${run ? "run" : ""} ${className}`} aria-label={value} role="img">
      {[...value].map((ch, i) =>
        /\d/.test(ch) ? (
          <span key={i} aria-hidden className="relative inline-block h-[1em] overflow-hidden">
            <span className="invisible">{ch}</span>
            <span className="strip absolute inset-x-[-50%] top-0 text-center" style={{ "--d": ch, "--k": di++ } as React.CSSProperties}>
              {"0123456789".split("").map((n) => (
                <span key={n} className="block h-[1em] leading-none">
                  {n}
                </span>
              ))}
            </span>
          </span>
        ) : (
          <span key={i} aria-hidden>
            {ch}
          </span>
        ),
      )}
    </span>
  );
}

/** Header (all sizes) + mobile bottom bar. Both appear once the hero CTA scrolls away. */
export function Chrome() {
  const [past, setPast] = useState(false);
  const [hide, setHide] = useState(false);
  useEffect(() => {
    const hero = document.getElementById("hero-cta");
    const io1 = new IntersectionObserver(([e]) => setPast(!e.isIntersecting && e.boundingClientRect.top < 0));
    if (hero) io1.observe(hero);
    const seen = new Set<Element>();
    const io2 = new IntersectionObserver(
      (es) => {
        es.forEach((e) => (e.isIntersecting ? seen.add(e.target) : seen.delete(e.target)));
        setHide(seen.size > 0);
      },
      { threshold: 0.2 },
    );
    ["register", "final"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) io2.observe(el);
    });
    return () => {
      io1.disconnect();
      io2.disconnect();
    };
  }, []);
  const showBar = past && !hide;

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${past ? "border-b border-line/70 bg-ink/85 backdrop-blur-md" : "bg-gradient-to-b from-ink/80 to-transparent"}`}
      >
        <div className="mx-auto flex h-16 max-w-[1240px] items-center gap-4 px-5">
          <Link href="#top" className="flex items-center gap-3" aria-label="Back to top">
            <Crest className="size-10" />
            <span className="hidden leading-tight sm:block">
              <span className="display block text-lg">India’s Biggest</span>
              <span className="block text-[10px] font-semibold tracking-[.2em] text-gold uppercase">Sports Festival 2026</span>
            </span>
          </Link>
          <nav className="ml-auto hidden items-center gap-7 text-sm font-medium text-ivory/80 lg:flex">
            <a href="#arena" className="hover:text-molten">Categories</a>
            <a href="#prizes" className="hover:text-molten">Prizes</a>
            <a href="#schedule" className="hover:text-molten">Schedule</a>
            <a href="#trust" className="hover:text-molten">Organisers</a>
            <a href="#faq" className="hover:text-molten">FAQ</a>
          </nav>
          <span className="ml-auto whitespace-nowrap text-xs font-semibold tracking-[.14em] text-ivory/80 uppercase lg:hidden">{EVENT.dateLabel}</span>
          <a href={EVENT.whatsappHref} target="_blank" rel="noopener" aria-label="WhatsApp us" className="grid size-10 place-items-center rounded-full border border-line text-[#3ecf6e] hover:border-gold">
            <Icon name="whatsapp" />
          </a>
          <Link
            href={registerHref()}
            className={`btn btn-gold hidden !min-h-11 !px-5 !text-base md:inline-flex ${past ? "" : "pointer-events-none opacity-0"} transition-opacity`}
            tabIndex={past ? 0 : -1}
          >
            Register {inr(EVENT.fee)}
          </Link>
        </div>
      </header>

      <div
        className={`fixed inset-x-0 bottom-0 z-50 border-t border-gold/40 bg-ink/95 px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] backdrop-blur-md transition-transform duration-300 [transition-timing-function:var(--ease-iron)] md:hidden ${showBar ? "translate-y-0" : "translate-y-full"}`}
        aria-hidden={!showBar}
      >
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1 leading-tight">
            <p className="display text-xl text-gold">₹1.5 Cr prize pool</p>
            <Countdown prefix="Closes in" className="text-[11px] text-ivory/80" />
          </div>
          <Link href={registerHref()} className="btn btn-gold !min-h-12 !px-4 !text-lg" tabIndex={showBar ? 0 : -1}>
            Register {inr(EVENT.fee)}
          </Link>
        </div>
      </div>
    </>
  );
}
