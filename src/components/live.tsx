"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { EVENT, registerHref } from "@/data/festival";
import { inr } from "@/lib/format";
import { Icon, WhatsAppGlyph, Wordmark } from "./icons";

/** One observer for every [data-reveal] / [data-rule] element on the page. */
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
    document.querySelectorAll("[data-reveal],[data-rule]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return null;
}

const pad = (n: number) => String(n).padStart(2, "0");
// ticking clock; null on the server so markup never mismatches
const tick = (cb: () => void) => {
  const t = setInterval(cb, 1000);
  return () => clearInterval(t);
};
const useLeft = () => {
  const now = useSyncExternalStore(
    tick,
    () => Math.floor(Date.now() / 1000) * 1000,
    () => null,
  );
  if (now == null) return null;
  const s = Math.max(0, Math.floor((new Date(EVENT.registrationCloses).getTime() - now) / 1000));
  return { total: s, d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
};

/** Inline countdown: "55d 08h" (last 72h → hh:mm:ss). Real close date only. */
export function Countdown({ className = "" }: { className?: string }) {
  const t = useLeft();
  if (t && t.total === 0) return <span className={className}>Closed</span>;
  const text = !t ? "--d --h" : t.total < 72 * 3600 ? `${pad(t.d * 24 + t.h)}:${pad(t.m)}:${pad(t.s)}` : `${t.d}d ${pad(t.h)}h`;
  return <span className={`tnum ${className}`}>{text}</span>;
}

/** Box countdown — Days / Hours / Mins / Secs, the format everyone reads instantly. */
export function CountdownBoxes({ className = "", glass = false }: { className?: string; glass?: boolean }) {
  const t = useLeft();
  const cells: [string, number | undefined][] = [
    ["Days", t?.d],
    ["Hours", t?.h],
    ["Mins", t?.m],
    ["Secs", t?.s],
  ];
  return (
    <div className={`grid grid-cols-4 gap-2 md:gap-3 ${className}`} role="timer" aria-label="Time left to register">
      {cells.map(([k, v]) => (
        <div key={k} className={`rounded-lg px-2 py-3 text-center text-white md:py-4 ${glass ? "border border-white/15 bg-white/[0.06] backdrop-blur" : "bg-ink"}`}>
          <p className="display tnum text-[clamp(1.9rem,6vw,3.2rem)] leading-none">{v == null ? "--" : pad(v)}</p>
          <p className="mt-1.5 text-[10px] font-semibold tracking-[0.18em] text-white/60 uppercase">{k}</p>
        </div>
      ))}
    </div>
  );
}

/** Odometer: each digit rolls to its value. Server-renders the final value. */
export function Odometer({ value, className = "" }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [run, setRun] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setTimeout(() => setRun(true), 400);
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

/** Header + mobile bottom bar + desktop floating WhatsApp. */
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
      { threshold: 0.15 },
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
      <header className={`t-ink fixed inset-x-0 top-0 z-50 !bg-transparent transition-[background-color,border-color] duration-300 ${past ? "border-b border-line !bg-ink/85 backdrop-blur-xl" : "border-b border-transparent"}`}>
        <div className="mx-auto flex h-16 max-w-[1680px] items-center gap-8 px-5 md:h-20 md:px-10">
          <Link href="#top" aria-label="Sports Festival — back to top">
            <Wordmark />
          </Link>
          <nav className="ml-auto hidden items-center gap-8 text-sm font-medium text-white/80 lg:flex">
            {[
              ["Categories", "#arena"],
              ["Prizes", "#prizes"],
              ["Schedule", "#schedule"],
              ["Organisers", "#trust"],
              ["FAQ", "#faq"],
            ].map(([l, h]) => (
              <a key={h} href={h} className="transition-colors hover:text-gold">
                {l}
              </a>
            ))}
          </nav>
          <a href={EVENT.whatsappHref} target="_blank" rel="noopener" aria-label="WhatsApp us" className="ml-auto grid size-10 place-items-center rounded-full border border-line text-wa hover:border-wa lg:ml-0">
            <WhatsAppGlyph className="size-5" />
          </a>
          <Link href={registerHref()} className={`btn btn-gold hidden !min-h-11 !px-5 !text-sm md:inline-flex ${past ? "" : "pointer-events-none opacity-0"} transition-opacity`} tabIndex={past ? 0 : -1}>
            Register {inr(EVENT.fee)}
          </Link>
        </div>
      </header>

      {/* mobile: price + prize + CTA always one thumb away */}
      <div
        className={`t-ink fixed inset-x-0 bottom-0 z-50 border-t border-gold/40 px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] transition-transform duration-500 [transition-timing-function:var(--ease-out)] md:hidden ${showBar ? "translate-y-0" : "translate-y-full"}`}
        aria-hidden={!showBar}
      >
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1 leading-tight">
            <p className="display text-xl leading-none text-gold">₹1.5 Crore</p>
            <p className="mt-1 text-[11px] whitespace-nowrap text-muted">
              Closes in <Countdown className="font-semibold text-white" />
            </p>
          </div>
          <a href={EVENT.whatsappHref} target="_blank" rel="noopener" aria-label="WhatsApp us" className="grid size-12 shrink-0 place-items-center rounded-md bg-wa text-white" tabIndex={showBar ? 0 : -1}>
            <WhatsAppGlyph className="size-6" />
          </a>
          <Link href={registerHref()} className="btn btn-gold !min-h-12 !px-4 !text-sm" tabIndex={showBar ? 0 : -1}>
            Register
            <Icon name="arrow" className="arr size-4" />
          </Link>
        </div>
      </div>

      {/* desktop: floating WhatsApp — the help channel Indian users trust most */}
      <a
        href={EVENT.whatsappHref}
        target="_blank"
        rel="noopener"
        className="wa-pulse fixed right-6 bottom-6 z-50 hidden items-center gap-2 rounded-full bg-wa py-3 pr-5 pl-4 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-105 md:flex"
      >
        <WhatsAppGlyph className="size-6" />
        Chat with us
      </a>
    </>
  );
}
