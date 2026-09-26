"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { EVENT, registerHref } from "@/data/festival";
import { inr } from "@/lib/format";
import { Icon, Wordmark } from "./icons";

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

/** Real countdown to registration close. Final 72h → live hh:mm:ss. Never fake. */
export function Countdown({ className = "" }: { className?: string }) {
  const now = useNow();
  const ms = now == null ? null : new Date(EVENT.registrationCloses).getTime() - now;
  if (ms != null && ms <= 0) return <span className={`mono ${className}`}>Closed</span>;
  const final = ms != null && ms < H72;
  let text = "--d --h --m";
  if (ms != null) {
    const s = Math.floor(ms / 1000);
    const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60);
    text = final ? `${pad(d * 24 + h)}:${pad(m)}:${pad(s % 60)}` : `${d}d ${pad(h)}h ${pad(m)}m`;
  }
  return (
    <span className={`mono inline-flex items-center gap-2 ${className}`}>
      <span aria-hidden className={`live-dot size-1.5 rounded-full ${final ? "bg-signal" : "bg-current"}`} />
      {text}
    </span>
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
        setTimeout(() => setRun(true), 500);
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

/** Header (all sizes) + mobile bottom bar that appears once the hero CTA scrolls away. */
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
      <header className={`t-ink fixed inset-x-0 top-0 z-50 !bg-transparent transition-[background-color,border-color] duration-300 ${past ? "border-b border-line !bg-ink/80 backdrop-blur-xl" : "border-b border-transparent"}`}>
        <div className="mx-auto flex h-16 max-w-[1360px] items-center gap-8 px-5 md:px-10">
          <Link href="#top" aria-label="India’s Biggest Sports Festival — back to top">
            <Wordmark />
          </Link>
          <nav className="label ml-auto hidden items-center gap-8 !text-[10px] lg:flex">
            {[
              ["Categories", "#arena"],
              ["Prizes", "#prizes"],
              ["Schedule", "#schedule"],
              ["Organisers", "#trust"],
              ["FAQ", "#faq"],
            ].map(([l, h]) => (
              <a key={h} href={h} className="text-muted transition-colors hover:text-fg">
                {l}
              </a>
            ))}
          </nav>
          <a href={EVENT.whatsappHref} target="_blank" rel="noopener" aria-label="WhatsApp us" className="ml-auto grid size-10 place-items-center text-muted hover:text-fg lg:ml-0">
            <Icon name="whatsapp" />
          </a>
          <Link href={registerHref()} className="btn btn-signal hidden !min-h-10 !gap-4 !px-4 !text-[11px] md:inline-flex">
            Register {inr(EVENT.fee)}
            <Icon name="arrow" className="arr size-4" />
          </Link>
        </div>
      </header>

      <div
        className={`t-ink fixed inset-x-0 bottom-0 z-50 border-t border-line px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] transition-transform duration-500 [transition-timing-function:var(--ease-out)] md:hidden ${showBar ? "translate-y-0" : "translate-y-full"}`}
        aria-hidden={!showBar}
      >
        <div className="flex items-center gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold tracking-tight">₹1.5 Cr prize pool</p>
            <p className="text-[11px] text-muted">
              Closes in <Countdown />
            </p>
          </div>
          <Link href={registerHref()} className="btn btn-signal !min-h-12 !gap-3 !px-4 !text-xs" tabIndex={showBar ? 0 : -1}>
            Register {inr(EVENT.fee)}
            <Icon name="arrow" className="arr size-4" />
          </Link>
        </div>
      </div>
    </>
  );
}
