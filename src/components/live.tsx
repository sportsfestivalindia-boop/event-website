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
          } else {
            e.target.classList.remove("in");
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
    let timer: ReturnType<typeof setTimeout>;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        timer = setTimeout(() => setRun(true), 400);
      } else {
        clearTimeout(timer);
        setRun(false);
      }
    });
    io.observe(el);
    return () => {
      clearTimeout(timer);
      io.disconnect();
    };
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Lock scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") setMobileMenuOpen(false);
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleKeyDown);
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [mobileMenuOpen]);

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
      <header className={`t-ink fixed inset-x-0 top-0 z-[70] transition-[background-color,border-color] duration-300 ${past || mobileMenuOpen ? "border-b border-line !bg-black/95 backdrop-blur-xl" : "border-b border-transparent !bg-transparent"}`}>
        <div className="content-contain page-gutter flex h-16 w-full items-center justify-between gap-4 md:h-20">
          <Link href="#top" onClick={() => setMobileMenuOpen(false)} aria-label="Sports Festival — back to top" className="shrink-0">
            <Wordmark />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-7 text-sm font-medium text-white/80 lg:flex ml-auto mr-4">
            {[
              ["Categories", "#arena"],
              ["Prizes", "#prizes"],
              ["Schedule", "#schedule"],
              ["Organisers", "#trust"],
              ["FAQ", "#faq"],
              ["Book a stall", "/partner#stalls"],
            ].map(([l, h]) => (
              <a key={h} href={h} className="transition-colors hover:text-gold">
                {l}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* WhatsApp Direct Link */}
            <a
              href={EVENT.whatsappHref}
              target="_blank"
              rel="noopener"
              aria-label="WhatsApp us"
              className={`grid size-10 place-items-center rounded-full border border-line text-wa hover:border-wa transition-colors ${
                mobileMenuOpen ? "hidden sm:grid" : "grid"
              }`}
            >
              <WhatsAppGlyph className="size-5" />
            </a>

            {/* Desktop Register Button */}
            <Link href={registerHref()} className="btn btn-gold hidden !min-h-10 !px-5 !text-xs font-extrabold uppercase tracking-wider md:inline-flex shadow-md">
              Register now
            </Link>

            {/* Mobile Hamburger / Close Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              className={`flex size-10 items-center justify-center rounded-full border transition-all active:scale-95 lg:hidden cursor-pointer ${
                mobileMenuOpen
                  ? "border-gold/80 bg-gold text-ink hover:bg-gold/90 shadow-[0_0_12px_rgba(255,222,0,0.35)]"
                  : "border-white/20 bg-black/60 backdrop-blur-md text-white hover:text-yellow hover:border-yellow/50"
              }`}
            >
              {mobileMenuOpen ? (
                <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="4" y1="7" x2="20" y2="7" />
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="17" x2="20" y2="17" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Full-Screen Mobile Navigation Menu Drawer */}
      <div
        className={`fixed inset-0 z-[60] flex flex-col justify-between bg-black/95 backdrop-blur-2xl px-6 pt-20 pb-8 transition-all duration-300 lg:hidden overflow-y-auto ${
          mobileMenuOpen ? "opacity-100 pointer-events-auto translate-y-0" : "opacity-0 pointer-events-none -translate-y-4"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Navigation"
      >
        <div>
          {/* Mobile Drawer Sub-bar with Close Button */}
          <div className="flex items-center justify-between pb-3 pt-1 border-b border-white/10">
            <span className="text-xs font-bold uppercase tracking-widest text-gold/80">Menu</span>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
              className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/20 bg-white/10 text-xs font-semibold text-white/90 hover:text-gold hover:border-gold/50 active:scale-95 transition-all cursor-pointer"
            >
              <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              <span>Close</span>
            </button>
          </div>

          {/* Navigation Links List */}
          <nav className="flex flex-col gap-1 text-base font-bold pt-2">
            {[
              { label: "Categories & Sports", href: "#arena", icon: "🏆", sub: "6 Championships" },
              { label: "Prize Money", href: "#prizes", icon: "💰", sub: "₹1.5 Crore Pool" },
              { label: "Event Schedule", href: "#schedule", icon: "📅", sub: "4–6 Dec 2026" },
              { label: "Organisers (AOGA)", href: "#trust", icon: "🛡️", sub: "Official Federation" },
              { label: "Venue & Directions", href: "#venue", icon: "📍", sub: "Baramunda, Bhubaneswar" },
              { label: "FAQ", href: "#faq", icon: "❓", sub: "Rules & Policies" },
              { label: "Book a Stall", href: "/partner#stalls", icon: "🎪", sub: "Brand Expo" },
              ...(process.env.NEXT_PUBLIC_ENABLE_GOOGLE_LOGIN === "true"
                ? [{ label: "My Profile & Passes", href: "/profile", icon: "👤", sub: "Login with Google" }]
                : []),
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between py-3 border-b border-white/10 text-white/90 hover:text-yellow transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{item.icon}</span>
                  <div className="text-left">
                    <span className="block text-white group-hover:text-yellow transition-colors">{item.label}</span>
                    <span className="block text-[11px] font-normal text-white/50">{item.sub}</span>
                  </div>
                </div>
                <span className="text-white/40 text-sm group-hover:translate-x-1 group-hover:text-yellow transition-all">›</span>
              </a>
            ))}
          </nav>
        </div>

        {/* Mobile Menu Action CTAs */}
        <div className="pt-6 mt-4 flex flex-col gap-3 border-t border-white/15">
          <Link
            href={registerHref()}
            onClick={() => setMobileMenuOpen(false)}
            className="btn btn-gold w-full !py-3.5 flex items-center justify-center gap-2 text-sm font-extrabold uppercase tracking-wider shadow-xl"
          >
            <span>Register now — from {inr(600)}</span>
            <Icon name="arrow" className="size-4" />
          </Link>

          <a
            href={EVENT.whatsappHref}
            target="_blank"
            rel="noopener"
            className="flex items-center justify-center gap-2 py-3 rounded-xl border border-wa/40 bg-wa/10 text-wa hover:bg-wa hover:text-white transition-all text-xs font-bold"
          >
            <WhatsAppGlyph className="size-4" />
            <span>Need Help? WhatsApp {EVENT.phone}</span>
          </a>
        </div>
      </div>

      {/* mobile: price + prize + CTA always one thumb away */}
      <div
        className={`t-ink fixed inset-x-0 bottom-0 z-50 border-t border-gold/40 px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] transition-transform duration-500 [transition-timing-function:var(--ease-out)] md:hidden ${showBar ? "translate-y-0" : "translate-y-full"}`}
        aria-hidden={!showBar}
      >
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1 leading-tight">
            <p className="display text-xl leading-none text-gold">4–6 Dec · Bhubaneswar</p>
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
