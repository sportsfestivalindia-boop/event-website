"use client";

import Link from "next/link";
import { ArrowUpRight, Calendar, Check, MessageCircle } from "lucide-react";
import type { Championship, Division } from "@/data/festival";
import { EVENT, registerHref } from "@/data/festival";
import { inr, ordinal, prizeLabel } from "@/lib/format";

interface CategoryCardProps {
  champ: Championship;
  division?: Division;
  cls: string;
  hasClasses: boolean;
  fee: number;
}

export function CategoryCard({
  champ,
  division,
  cls,
  hasClasses,
  fee,
}: CategoryCardProps) {
  const displayTitle = division
    ? hasClasses
      ? cls
      : division.name
    : "Coming Soon";
  const displaySubtitle = division
    ? hasClasses
      ? division.name
      : champ.sport
    : "";

  return (
    <div className="w-full">
      {/* Dark Summary Card with subtle yellow top glow */}
      <div
        className="category-summary-card relative overflow-hidden rounded-2xl border border-white/15 bg-black shadow-[0_-15px_45px_-15px_rgba(255,230,0,0.22)]"
        aria-live="polite"
      >
        {/* Soft yellow radial top glow inside card */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-44 w-3/4 rounded-full bg-[#FFE600]/12 blur-3xl"
        />

        {/* Card Header */}
        <div className="relative flex flex-col items-start gap-1 border-b border-white/15 bg-white/[0.04] px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-0 sm:px-6 sm:py-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-white/60 sm:text-xs sm:font-bold sm:tracking-[0.25em] sm:text-white/80">
            Your Category
          </span>
          <span className="text-xs font-bold uppercase tracking-wide text-[#FFE600] sm:tracking-widest">
            {champ.name}
          </span>
        </div>

        {/* Card Body */}
        <div className="relative px-6 pt-6 pb-6 sm:px-8">
          {division ? (
            <>
              {/* Big Weight / Category with smooth roll transition */}
              <div
                key={displayTitle}
                className="category-num-anim display text-[clamp(3.5rem,10.5vw,5.5rem)] font-black text-white leading-none tracking-tight uppercase"
              >
                {displayTitle}
              </div>

              {/* Division / Sport Name */}
              <p className="mt-2 text-lg sm:text-xl font-bold text-white tracking-wide">
                {displaySubtitle}
              </p>

              {division.note && (
                <p className="mt-1 text-sm font-semibold text-amber-400">
                  {division.note}
                </p>
              )}

              {/* Date & Time Line */}
              <p className="mt-3 flex items-center gap-2 text-sm font-medium text-white/60">
                <Calendar className="size-4 shrink-0 text-[#FFE600]" />
                <span>{champ.when}</span>
              </p>

              {division.prizes.length === 0 && (
                <p className="mt-6 border-y border-white/10 py-4 text-sm text-white/60 text-center">
                  Prizes will be announced by AOGA.
                </p>
              )}

              {/* Prize Rows 1st to 5th */}
              <ol
                key={`${division.id}-${cls}`}
                className="mt-6 divide-y divide-white/10 border-y border-white/10 empty:hidden"
              >
                {division.prizes.map((p, i) => (
                  <li
                    key={i}
                    className="category-prize-row flex items-center justify-between py-3.5"
                    style={{ ["--row-delay" as string]: `${i * 0.05}s` }}
                  >
                    {/* Left Column: Rank Badge + Label */}
                    <div className="flex items-center gap-3 text-sm sm:text-base font-semibold text-white">
                      <span
                        className={`size-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                          i === 0
                            ? "bg-[#FFE600] text-black shadow-[0_0_10px_rgba(255,230,0,0.5)]"
                            : i === 1
                            ? "bg-white/20 text-white font-bold"
                            : i === 2
                            ? "bg-[#FF6A00] text-white shadow-[0_0_10px_rgba(255,106,0,0.5)]"
                            : "bg-white/10 text-white/70"
                        }`}
                      >
                        {i + 1}
                      </span>
                      <span>{ordinal(i)} place</span>
                    </div>

                    {/* Right Column: Amount Right-Aligned */}
                    <span
                      className={`display tnum font-black text-white text-right ${
                        i === 0 ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl"
                      }`}
                    >
                      {prizeLabel(p)}
                    </span>
                  </li>
                ))}
              </ol>

              {/* Winners Also Compete For: Dark Zinc Panel */}
              {division.extras && division.extras.length > 0 && (
                <div className="mt-5 rounded-xl border border-white/10 bg-zinc-900/90 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-white/50">
                    Winners also compete for
                  </p>
                  <div className="mt-2 space-y-2">
                    {division.extras.map((e) => (
                      <div
                        key={e.label}
                        className="flex items-center justify-between gap-4 text-sm"
                      >
                        <span className="font-semibold text-white/90">
                          {e.label}
                        </span>
                        <span className="display tnum text-lg font-black text-white shrink-0">
                          {prizeLabel(e.prize)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="py-6">
              <p className="display text-[clamp(3.5rem,11vw,5.5rem)] font-black text-white leading-none">
                Coming soon
              </p>
              <p className="mt-3 text-base text-white/60">
                Categories and prizes for {champ.name} will be announced
                shortly. Get them on WhatsApp first.
              </p>
            </div>
          )}
        </div>

        {/* Bottom Note Strip: Stays Yellow with Black Text */}
        <div className="flex items-center gap-2.5 bg-[#FFE600] px-6 py-3.5 text-sm font-bold text-black sm:px-8">
          <Check className="size-5 shrink-0 stroke-[2.5]" />
          <span>
            {fee === 0
              ? "Free registration for this category"
              : "Winners decided by qualified judges under official rules"}
          </span>
        </div>
      </div>

      {/* Button & WhatsApp Below Card */}
      <div className="mt-6 flex flex-col gap-4">
        {division ? (
          <Link
            href={registerHref(champ.id, division.id, cls)}
            data-cta="finder"
            className="group relative flex h-16 w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-[#FF6A00] to-[#FFE600] text-base sm:text-lg font-black uppercase tracking-wider text-black shadow-[0_8px_30px_rgba(255,106,0,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_45px_rgba(255,106,0,0.55)] active:translate-y-0"
          >
            {/* Light shine sweep effect on hover */}
            <span
              aria-hidden
              className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full pointer-events-none"
            />

            <span key={fee} className="category-price-anim relative z-10">
              {fee === 0 ? "REGISTER FREE" : `REGISTER NOW — ${inr(fee)}`}
            </span>
            <ArrowUpRight className="relative z-10 size-6 text-black transition-transform duration-300 group-hover:rotate-45" />
          </Link>
        ) : (
          <a
            href={EVENT.whatsappHref}
            target="_blank"
            rel="noopener"
            className="flex h-16 w-full items-center justify-center gap-2.5 rounded-2xl bg-[#25D366] text-base sm:text-lg font-bold text-white shadow-lg transition-transform duration-200 hover:-translate-y-0.5"
          >
            <MessageCircle className="size-5" />
            <span>Notify me on WhatsApp</span>
          </a>
        )}

        {/* WhatsApp Inquiry Line centered under button */}
        <div className="flex justify-center">
          <a
            href={EVENT.whatsappHref}
            target="_blank"
            rel="noopener"
            className="group inline-flex items-center gap-2 text-sm font-semibold text-white/80 transition-colors hover:text-white"
          >
            <MessageCircle className="size-4 text-[#25D366]" />
            <span className="underline decoration-white/30 underline-offset-4 group-hover:decoration-white">
              Not sure which category? Ask us on WhatsApp
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}
