"use client";

import React, { useEffect, useRef, useState } from "react";
import { CircleHelp, Phone } from "lucide-react";
import { EVENT, FAQ } from "@/data/festival";
import { useReplayOnScroll } from "@/hooks/useReplayOnScroll";
import { WhatsAppGlyph } from "./icons";

export function FaqSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const play = useReplayOnScroll(sectionRef);
  const [armed, setArmed] = useState(false);

  // Open / Close state: independent items (same as <details>)
  const [openIndices, setOpenIndices] = useState<Set<number>>(() => new Set());
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Arm animations after mount (Never Blank Rule); 1.5s failsafe
  useEffect(() => {
    setArmed(true);
    const timer = setTimeout(() => {
      setArmed(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const toggleIndex = (idx: number) => {
    setOpenIndices((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  };

  // Keyboard navigation across accordion questions
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const nextIdx = (index + 1) % FAQ.length;
      buttonRefs.current[nextIdx]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prevIdx = (index - 1 + FAQ.length) % FAQ.length;
      buttonRefs.current[prevIdx]?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      buttonRefs.current[0]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      buttonRefs.current[FAQ.length - 1]?.focus();
    }
  };

  const renderContactCard = (isTabletOrMobile = false) => (
    <div
      className={`fq-contact-outer w-full rounded-3xl p-[1px] relative shadow-lg ${
        isTabletOrMobile ? "" : ""
      }`}
      style={{
        background:
          "linear-gradient(135deg, #FFC400 0%, #FF8A00 45%, #FF5A00 100%)",
      }}
    >
      <div className="w-full rounded-[calc(1.5rem-1px)] bg-[#0A0A0A] p-8 sm:p-9 lg:p-10 relative overflow-hidden">
        {/* Background Decorative Chat Bubbles */}
        <div
          aria-hidden="true"
          className="absolute -top-6 -right-6 w-60 h-36 rounded-3xl border border-white/[0.07] -rotate-6 pointer-events-none select-none"
        />
        <div
          aria-hidden="true"
          className="absolute top-12 -right-8 w-48 h-32 rounded-3xl border border-white/[0.07] rotate-[8deg] pointer-events-none select-none"
        />

        {/* Faint orange corner glow (max 18% opacity for dark card) */}
        <div
          aria-hidden="true"
          className="absolute -top-10 -right-10 size-60 rounded-full pointer-events-none select-none"
          style={{
            background:
              "radial-gradient(circle, rgba(255,138,0,0.16) 0%, rgba(255,90,0,0) 70%)",
          }}
        />

        <div
          className={
            isTabletOrMobile
              ? "md:grid md:grid-cols-12 md:gap-8 md:items-center relative z-10"
              : "relative z-10"
          }
        >
          {/* Top Info Area */}
          <div className={isTabletOrMobile ? "md:col-span-6" : ""}>
            {/* Top: Typing dots bubble morphing to 64px WhatsApp avatar */}
            <div className="h-16 relative flex items-center mb-6">
              {/* Typing Bubble */}
              <div
                aria-hidden="true"
                className="fq-typing-bubble absolute left-0 top-0 h-16 px-5 rounded-2xl bg-white/[0.08] border border-white/15 flex items-center gap-2 select-none"
              >
                <span className="fq-dot fq-dot-1 size-2.5 rounded-full bg-white/90" />
                <span className="fq-dot fq-dot-2 size-2.5 rounded-full bg-white/90" />
                <span className="fq-dot fq-dot-3 size-2.5 rounded-full bg-white/90" />
              </div>

              {/* WhatsApp 64px avatar */}
              <div
                aria-hidden="true"
                className="fq-wa-avatar absolute left-0 top-0 size-16 rounded-full bg-[#25D366] flex items-center justify-center shadow-md select-none"
              >
                <WhatsAppGlyph className="size-8 text-white" />
              </div>
            </div>

            {/* Heading */}
            <h3 className="fq-card-title font-display text-[clamp(2rem,3vw,3.2rem)] leading-[0.95] text-white uppercase tracking-tight">
              STILL HAVE A QUESTION?
            </h3>

            {/* Paragraph */}
            <p className="fq-card-lead mt-3 text-sm md:text-base text-white/70 leading-relaxed font-normal">
              Message us on WhatsApp. A real person replies, usually within minutes.
            </p>
          </div>

          {/* Action Area */}
          <div className={isTabletOrMobile ? "md:col-span-6 mt-6 md:mt-0" : "mt-8"}>
            {/* WhatsApp CTA Button */}
            <a
              href={EVENT.whatsappHref}
              target="_blank"
              rel="noopener"
              className="fq-wa-btn flex w-full h-14 lg:h-16 rounded-2xl bg-[#25D366] text-white font-display uppercase tracking-wide items-center justify-center gap-3 text-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <WhatsAppGlyph className="size-5 text-white" />
              CHAT ON WHATSAPP
            </a>

            {/* Phone link pill */}
            <div className="fq-phone-wrap mt-4 flex justify-center">
              <a
                href={EVENT.phoneHref}
                className="fq-phone-link group inline-flex items-center gap-3 rounded-full p-[1px] min-h-[44px] transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8A00]"
                style={{
                  background:
                    "linear-gradient(135deg, #FFC400 0%, #FF8A00 45%, #FF5A00 100%)",
                }}
              >
                <span className="inline-flex items-center gap-3 rounded-full bg-[#0A0A0A] px-5 py-2 text-sm font-semibold text-white">
                  <span
                    className="fq-phone-icon-holder flex size-8 items-center justify-center rounded-full text-black shrink-0"
                    style={{
                      background:
                        "linear-gradient(135deg, #FFC400 0%, #FF8A00 45%, #FF5A00 100%)",
                    }}
                  >
                    <Phone className="fq-phone-icon size-4 text-black" strokeWidth={2.4} />
                  </span>
                  <span>or call {EVENT.phone}</span>
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <section
      ref={sectionRef}
      id="faq"
      aria-labelledby="faq-heading"
      data-armed={armed ? "true" : "false"}
      data-play={play ? "true" : "false"}
      className="relative w-full bg-white text-[#0A0A0A] page-gutter py-20 md:py-28 lg:py-32 overflow-x-clip scroll-mt-[5.5rem] selection:bg-[#FF8A00]/20"
      style={{ scrollMarginTop: "var(--nav-h, 5.5rem)" }}
    >
      <div className="w-full max-w-[2000px] mx-auto">
        {/* ──────────────────────────────────────────────────────────
            HEADER (All screen sizes)
            Heading with Rubber-Band animation + large CircleHelp on lg+
           ────────────────────────────────────────────────────────── */}
        <div className="relative flex items-center justify-between mb-12 md:mb-16">
          <div className="max-w-3xl">
            <h2
              id="faq-heading"
              className="font-display text-[clamp(2.8rem,8vw,9rem)] leading-[0.9] text-[#0A0A0A] uppercase tracking-tight"
            >
              <span className="sr-only">YOUR QUESTIONS, ANSWERED</span>
              <span
                aria-hidden="true"
                className="flex flex-wrap items-baseline gap-x-[0.25em] gap-y-1 select-none"
              >
                {["YOUR", "QUESTIONS,", "ANSWERED"].map((word, wIdx) => (
                  <span
                    key={wIdx}
                    className="fq-heading-word inline-block origin-left"
                    style={{ "--w-i": wIdx } as React.CSSProperties}
                  >
                    {word}
                  </span>
                ))}
              </span>
            </h2>

            {/* Short gradient line */}
            <div
              aria-hidden="true"
              className="fq-heading-line h-1 w-20 rounded-full mt-6"
              style={{
                background:
                  "linear-gradient(135deg, #FFC400 0%, #FF8A00 45%, #FF5A00 100%)",
              }}
            />
          </div>

          {/* Large decorative CircleHelp icon on lg+ (stroke black at 6%, no fill) */}
          <div
            aria-hidden="true"
            className="fq-header-icon hidden lg:flex items-center justify-end pointer-events-none select-none -mr-4 -mt-4"
          >
            <CircleHelp
              className="size-[240px] text-black/[0.06]"
              strokeWidth={1.2}
            />
          </div>
        </div>

        {/* ──────────────────────────────────────────────────────────
            TWO COLUMNS: 7/12 (FAQ LEDGER) & 5/12 (STICKY CONTACT CARD)
           ────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-[clamp(2rem,4vw,5rem)] items-start">
          {/* LEFT: THE FAQ LEDGER (7/12 on lg+) */}
          <div className="lg:col-span-7 w-full">
            <ul className="w-full list-none p-0 m-0 space-y-0 divide-y-0">
              {FAQ.map((item, idx) => {
                const isOpen = openIndices.has(idx);
                const paddedNum = String(idx + 1).padStart(2, "0");
                const staggerDelay = `${Math.min(idx * 0.06, 0.9).toFixed(3)}s`;

                return (
                  <li
                    key={item.q}
                    className={`fq-row relative w-full transition-[background-color,padding,border-radius] duration-300 ease-out ${
                      isOpen
                        ? "bg-[linear-gradient(135deg,rgba(255,196,0,0.06)_0%,rgba(255,138,0,0.06)_45%,rgba(255,90,0,0.06)_100%)] rounded-2xl px-3 sm:px-4 py-2"
                        : "px-0 py-0"
                    }`}
                    style={{ "--stagger-d": staggerDelay } as React.CSSProperties}
                  >
                    {/* Hairline 1px bottom border (draws from left on entrance) */}
                    <div
                      aria-hidden="true"
                      className={`fq-row-hairline absolute bottom-0 left-0 right-0 h-[1px] bg-black/10 pointer-events-none ${
                        isOpen ? "opacity-0" : "opacity-100"
                      }`}
                    />

                    {/* 3px Gradient Spine (left edge across row + answer when open) */}
                    <span
                      aria-hidden="true"
                      className={`fq-spine absolute left-0 top-0 bottom-0 w-[3px] rounded-full pointer-events-none ${
                        isOpen ? "scale-y-100 opacity-100" : "scale-y-0 opacity-0"
                      }`}
                      style={{
                        background:
                          "linear-gradient(135deg, #FFC400 0%, #FF8A00 45%, #FF5A00 100%)",
                      }}
                    />

                    {/* Row Content (Fades and rises on entrance) */}
                    <div className="fq-row-content w-full">
                      {/* Interactive Button */}
                      <button
                        ref={(el) => {
                          buttonRefs.current[idx] = el;
                        }}
                        type="button"
                        id={`faq-btn-${idx}`}
                        aria-expanded={isOpen}
                        aria-controls={`faq-answer-${idx}`}
                        onClick={() => toggleIndex(idx)}
                        onKeyDown={(e) => handleKeyDown(e, idx)}
                        className="group w-full min-h-[76px] py-4 sm:py-5 flex items-center justify-between text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8A00] focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded-xl select-none"
                      >
                        {/* Grid: [index column 72px / 48px] [question] [toggle 44px] */}
                        <div className="grid grid-cols-[48px_1fr_44px] sm:grid-cols-[72px_1fr_44px] items-center gap-3 sm:gap-4 w-full">
                          {/* Index Column */}
                          <div className="relative font-display flex items-center justify-start select-none">
                            {/* Outlined index number */}
                            <span
                              aria-hidden="true"
                              className={`fq-index-outline font-display text-[clamp(1.4rem,7vw,1.8rem)] sm:text-[clamp(1.8rem,2.6vw,2.8rem)] leading-none transition-opacity duration-300 ${
                                isOpen ? "opacity-0" : "opacity-100"
                              }`}
                              style={{
                                WebkitTextStroke: "1.5px rgba(0, 0, 0, 0.14)",
                                color: "transparent",
                              }}
                            >
                              {paddedNum}
                            </span>

                            {/* Solid gradient index number (crossfade on open) */}
                            <span
                              aria-hidden="true"
                              className={`fq-index-solid absolute left-0 font-display text-[clamp(1.4rem,7vw,1.8rem)] sm:text-[clamp(1.8rem,2.6vw,2.8rem)] leading-none transition-opacity duration-300 pointer-events-none ${
                                isOpen ? "opacity-100" : "opacity-0"
                              }`}
                              style={{
                                background:
                                  "linear-gradient(135deg, #FFC400 0%, #FF8A00 45%, #FF5A00 100%)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                color: "transparent",
                              }}
                            >
                              {paddedNum}
                            </span>
                          </div>

                          {/* Question Text */}
                          <div className="pr-2 sm:pr-4">
                            <span className="fq-question-text block font-semibold text-[clamp(1.05rem,1.35vw,1.4rem)] leading-snug text-[#0A0A0A] break-words">
                              {item.q}
                            </span>
                          </div>

                          {/* Toggle 44px Circle */}
                          <div className="flex items-center justify-end">
                            <div
                              aria-hidden="true"
                              className={`fq-toggle-circle relative size-11 rounded-full border border-black/15 bg-white flex items-center justify-center shrink-0 overflow-hidden shadow-2xs ${
                                isOpen ? "fq-toggle-open" : ""
                              }`}
                            >
                              {/* Gradient circle fill from center */}
                              <span
                                className={`absolute inset-0 rounded-full transition-transform duration-300 ease-out origin-center pointer-events-none ${
                                  isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0"
                                }`}
                                style={{
                                  background:
                                    "linear-gradient(135deg, #FFC400 0%, #FF8A00 45%, #FF5A00 100%)",
                                }}
                              />

                              {/* Horizontal Bar (16px x 2px, black) */}
                              <span className="absolute w-4 h-[2px] bg-black rounded-full z-10 pointer-events-none" />

                              {/* Vertical Bar (2px x 16px, black; rotates 90deg and collapses) */}
                              <span
                                className={`absolute h-4 w-[2px] bg-black rounded-full z-10 pointer-events-none transition-transform duration-300 ease-out origin-center ${
                                  isOpen
                                    ? "rotate-90 scale-y-0 opacity-0"
                                    : "rotate-0 scale-y-100 opacity-100"
                                }`}
                              />
                            </div>
                          </div>
                        </div>
                      </button>

                      {/* Accordion Answer Region (grid-template-rows animation) */}
                      <div
                        id={`faq-answer-${idx}`}
                        role="region"
                        aria-labelledby={`faq-btn-${idx}`}
                        className={`grid transition-[grid-template-rows] duration-350 ease-out ${
                          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                        }`}
                        inert={!isOpen}
                      >
                        <div className="overflow-hidden min-h-0">
                          <div className="pt-1 pb-5 pr-4 pl-[48px] sm:pl-[72px] max-w-2xl">
                            <p
                              className={`fq-answer-text text-zinc-600 text-base md:text-lg leading-relaxed ${
                                isOpen ? "fq-answer-open" : "fq-answer-closed"
                              }`}
                            >
                              {item.a}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* RIGHT: THE CONTACT CARD (5/12 on lg+; Sticky) */}
          <div className="hidden lg:block lg:col-span-5 w-full">
            <div className="sticky top-[calc(var(--nav-h,5.5rem)+1.5rem)]">
              {renderContactCard(false)}
            </div>
          </div>
        </div>

        {/* Tablet & Mobile Fallback: Contact Card Below the List */}
        <div className="block lg:hidden mt-14 w-full">
          {renderContactCard(true)}
        </div>
      </div>
    </section>
  );
}
