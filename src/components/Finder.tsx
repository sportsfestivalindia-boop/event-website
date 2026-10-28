"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useReplayOnScroll } from "@/hooks/useReplayOnScroll";
import {
  CHAMPIONSHIPS,
  EVENT,
  registerHref,
  type Championship,
} from "@/data/festival";
import { inr } from "@/lib/format";
import { track } from "@/lib/track";

import { SportDropdown } from "./finder/SportDropdown";
import { DivisionTabs } from "./finder/DivisionTabs";
import { WeightRuler } from "./finder/WeightRuler";
import { CategoryCard } from "./finder/CategoryCard";

const defaultClass = (classes: string[]) =>
  classes[Math.min(4, classes.length - 1)] ?? "";

type Sel = { sport: string; div: string; cls: string };

const selFor = (c: Championship): Sel => ({
  sport: c.id,
  div: c.divisions[0]?.id ?? "",
  cls: defaultClass(c.divisions[0]?.classes ?? []),
});

const noSub = () => () => {};

function StepHeader({ n, title }: { n: number; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="flex size-7 items-center justify-center rounded-full bg-[#FFE600] text-black text-xs font-black shrink-0 shadow-sm">
        {n}
      </span>
      <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
        {title}
      </h3>
    </div>
  );
}

export function Finder() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardContainerRef = useRef<HTMLDivElement>(null);
  const play = useReplayOnScroll(sectionRef);
  const [isMobileCardVisible, setIsMobileCardVisible] = useState(true);

  // Deep links from poster QR codes: /?sport=powerlifting (null on server)
  const urlSport = useSyncExternalStore(
    noSub,
    () => new URLSearchParams(location.search).get("sport"),
    () => null
  );

  const [picked, setPicked] = useState<Sel | null>(null);
  const sel =
    picked ??
    selFor(
      CHAMPIONSHIPS.find((x) => x.id === urlSport) ?? CHAMPIONSHIPS[0]
    );
  const { sport, div, cls } = sel;

  const chooseSport = (c: Championship) => {
    setPicked(selFor(c));
    track("viewSport", c.sport);
  };

  const champ = CHAMPIONSHIPS.find((c) => c.id === sport)!;
  const division = champ.divisions.find((d) => d.id === div);
  const fee = division?.fee ?? EVENT.fee;
  const hasClasses = (division?.classes.length ?? 0) > 1;

  // Monitor visibility of the summary card on mobile to show/hide sticky bottom bar
  useEffect(() => {
    const cardEl = cardContainerRef.current;
    if (!cardEl) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsMobileCardVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    observer.observe(cardEl);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={sectionRef}
      data-play={play}
      className="finder-root relative w-full"
    >
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-10 items-start">
        {/* Left Column (about 58%) */}
        <div className="min-w-0 space-y-10 lg:col-span-7">
          {/* Step 1: Choose your sport */}
          <div
            className="finder-step finder-step-1 relative z-30"
            style={{ ["--step-delay" as string]: "0s" }}
          >
            <StepHeader n={1} title="Choose your sport" />
            <SportDropdown
              championships={CHAMPIONSHIPS}
              selectedId={sport}
              onSelect={chooseSport}
            />
          </div>

          {/* Step 2: Choose your division */}
          {champ.divisions.length > 1 && (
            <div
              className="finder-step finder-step-2 relative z-20"
              style={{ ["--step-delay" as string]: "0.12s" }}
            >
              <StepHeader n={2} title="Choose your division" />
              <DivisionTabs
                divisions={champ.divisions}
                selectedId={div}
                onSelect={(newDivId) => {
                  const targetDiv = champ.divisions.find(
                    (d) => d.id === newDivId
                  );
                  setPicked({
                    ...sel,
                    div: newDivId,
                    cls: defaultClass(targetDiv?.classes ?? []),
                  });
                }}
              />
            </div>
          )}

          {/* Step 3: Choose your weight / height class */}
          {division && hasClasses && (
            <div
              className="finder-step finder-step-3 relative z-10"
              style={{ ["--step-delay" as string]: "0.24s" }}
            >
              <StepHeader
                n={champ.divisions.length > 1 ? 3 : 2}
                title="Choose your weight / height class"
              />
              <WeightRuler
                classes={division.classes}
                selectedClass={cls}
                onSelect={(newCls) => setPicked({ ...sel, cls: newCls })}
              />
            </div>
          )}
        </div>

        {/* Right Column (about 42%): Sticky Category Card */}
        <div
          ref={cardContainerRef}
          className="finder-card-col min-w-0 lg:col-span-5 lg:sticky lg:top-28"
          style={{ ["--card-delay" as string]: "0.15s" }}
        >
          <CategoryCard
            champ={champ}
            division={division}
            cls={cls}
            hasClasses={hasClasses}
            fee={fee}
          />
        </div>
      </div>

      {/* Mobile Sticky Registration Bar: appears only when main register button is scrolled out of view */}
      <div
        className={`fixed inset-x-0 bottom-0 z-50 border-t border-white/15 bg-black/95 px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] backdrop-blur-lg transition-transform duration-300 lg:hidden ${
          !isMobileCardVisible ? "translate-y-0 shadow-2xl" : "translate-y-full pointer-events-none"
        }`}
      >
        <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wider text-[#FFE600] font-bold truncate">
              {hasClasses ? cls : division?.name ?? champ.name}
            </p>
            <p className="display text-lg font-black text-white leading-none truncate">
              {champ.sport}
            </p>
          </div>

          <Link
            href={registerHref(champ.id, division?.id ?? "", cls)}
            className="flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF6A00] to-[#FFE600] px-5 text-sm font-black uppercase text-black shrink-0 shadow-lg"
          >
            <span>{fee === 0 ? "FREE" : inr(fee)}</span>
            <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
