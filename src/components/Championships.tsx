"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Swords,
  HandFist,
  Footprints,
  BicepsFlexed,
  Dumbbell,
  Handshake,
  ArrowUpRight,
  ArrowRight,
  X,
  Calendar,
  MapPin,
  Trophy,
  CheckCircle2,
} from "lucide-react";
import { useReplayOnScroll } from "@/hooks/useReplayOnScroll";
import { CHAMPIONSHIPS, EVENT, registerHref } from "@/data/festival";
import { WhatsAppGlyph } from "@/components/icons";

interface SportItem {
  no: string;
  id: string;
  name: string;
  sub: string;
  tagline: string;
  desc: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  highlight: string;
  image: string;
}

const SPORTS: SportItem[] = [
  {
    no: "01",
    id: "dangal",
    name: "Dangal",
    sub: "(Matti Kusti)",
    tagline: "Celebrating India's Wrestling Heritage",
    desc: "Rooted in India's rich tradition of wrestling, Dangal is a powerful display of strength, technique, courage, and determination. The competition celebrates traditional wrestling culture while bringing talented wrestlers together to showcase their skills and competitive excellence.",
    icon: Swords,
    highlight: "Winner takes home a Royal Enfield Bullet motorcycle and the GADA (mace)",
    image: "/img/sport-dangal.jpg",
  },
  {
    no: "02",
    id: "boxing",
    name: "Boxing",
    sub: "Championship",
    tagline: "The Spirit of Combat",
    desc: "An electrifying combat sport where speed, precision, agility, and strategy take centre stage. Boxing brings together skilled fighters who demonstrate discipline, resilience, defensive techniques, and fighting spirit in every round.",
    icon: HandFist,
    highlight: "Best Boxer & Best Loser win official motorcycles + cash prizes",
    image: "/img/sport-boxing.jpg",
  },
  {
    no: "03",
    id: "marathon",
    name: "Marathon",
    sub: "Championship",
    tagline: "The Ultimate Test of Endurance",
    desc: "A celebration of stamina, perseverance, and mental strength. The marathon brings together runners from different backgrounds to challenge their limits, embrace the spirit of fitness, and demonstrate that every step forward is a victory in itself.",
    icon: Footprints,
    highlight: "21 KM Half Marathon · 10 KM · 5 KM · 2 KM with ₹1,00,000 top cash prize",
    image: "/img/sport-marathon.jpg",
  },
  {
    no: "04",
    id: "bodybuilding",
    name: "Bodybuilding",
    sub: "Championship",
    tagline: "The Art of Strength & Physique",
    desc: "A spectacular showcase of muscular development, symmetry, conditioning, and physical excellence. Bodybuilding brings together dedicated athletes who demonstrate years of discipline, rigorous training, and commitment to achieving peak physical performance.",
    icon: BicepsFlexed,
    highlight: "Champion of Champions: ₹20,00,000 · Runner-up: ₹5,00,000",
    image: "/img/sport-bodybuilding.jpg",
  },
  {
    no: "05",
    id: "powerlifting",
    name: "Powerlifting",
    sub: "Championship",
    tagline: "Strength Beyond Limits",
    desc: "A true test of raw strength, technique, and determination. Athletes compete across three fundamental lifts – Squat, Bench Press, and Deadlift – pushing their physical limits to lift extraordinary weights and establish new benchmarks of strength.",
    icon: Dumbbell,
    highlight: "Strong Man & Strong Woman Titles with ₹1,00,000 each",
    image: "/img/sport-powerlifting.jpg",
  },
  {
    no: "06",
    id: "armwrestling",
    name: "Arm Wrestling",
    sub: "Championship",
    tagline: "The Ultimate Test of Power",
    desc: "More than just a battle of hands, arm wrestling combines grip strength, technique, strategy, and endurance. Competitors go head-to-head in intense matchups, showcasing exceptional upper-body strength, control, and competitive spirit.",
    icon: Handshake,
    highlight: "Men's & Women's Champion of Champions: ₹1,00,000 each",
    image: "/img/sport-arm-wrestling.jpg",
  },
];

export function Championships() {
  const ref = useRef<HTMLElement | null>(null);
  const play = useReplayOnScroll(ref);
  const [selectedSport, setSelectedSport] = useState<SportItem | null>(null);

  // Manage body scroll lock and escape key when modal is open
  useEffect(() => {
    if (selectedSport) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") setSelectedSport(null);
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = originalOverflow;
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [selectedSport]);

  const handleExploreInArena = (sportId: string) => {
    setSelectedSport(null);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("pick-arena-sport", { detail: { sportId } }));
      const arenaEl = document.getElementById("arena");
      if (arenaEl) {
        arenaEl.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  // Find corresponding detailed championship object from festival dataset
  const currentChamp = selectedSport
    ? CHAMPIONSHIPS.find((c) => c.id === selectedSport.id)
    : null;

  return (
    <section
      ref={ref}
      data-play={play}
      id="championships"
      className="relative w-full overflow-hidden bg-black py-10 sm:py-20 lg:py-28"
    >
      {/* Orange glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[26rem] w-[60rem] max-w-full -translate-x-1/2 rounded-full bg-[#FF6A00]/15 blur-[120px]"
      />

      <div className="content-contain page-gutter relative w-full">
        {/* Heading & Intro */}
        <div className="mb-8 sm:mb-14">
          <p
            className="cp-up text-xs sm:text-sm font-semibold uppercase tracking-[0.3em] text-[#FF6A00]"
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
          {/* User requested introduction */}
          <p
            className="cp-up mt-4 sm:mt-6 max-w-3xl text-sm sm:text-base lg:text-lg font-medium text-white/80 leading-relaxed"
            style={{ ["--d" as string]: "0.45s" }}
          >
            Six disciplines. Countless stories of strength. One grand sporting celebration. From the power of the arena to the endurance of the track, experience India&apos;s sporting spirit come alive at Sports Festival India 2026.
          </p>
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
              <button
                type="button"
                onClick={() => setSelectedSport(s)}
                className="cp-card group relative flex aspect-square sm:aspect-auto h-full w-full sm:min-h-[290px] flex-col justify-between overflow-hidden rounded-2xl border border-white/15 bg-black p-3.5 min-[380px]:p-4 sm:p-7 text-left transition-all duration-300 hover:-translate-y-2 hover:border-[#FFE600] hover:shadow-[0_24px_60px_-24px_rgba(255,230,0,0.55)] cursor-pointer"
              >
                {/* Subtle warm golden ambient sheen on hover */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#FFE600]/25 via-[#FFE600]/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 z-10"
                />

                {/* Sport background image - High clarity & sharp display */}
                <span aria-hidden className="absolute inset-0 overflow-hidden rounded-2xl">
                  <Image
                    src={s.image}
                    alt=""
                    fill
                    className="object-cover object-center opacity-80 sm:opacity-85 transition-all duration-500 ease-out group-hover:scale-105 group-hover:opacity-100"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
                    priority={i < 3}
                  />
                  {/* Bottom dark gradient so text is razor sharp & readable, leaving top/center 100% clear */}
                  <span className="absolute inset-0 bg-gradient-to-t from-black via-black/60 via-45% to-transparent" />
                </span>

                {/* Big outline number */}
                <span
                  aria-hidden
                  className="cp-num pointer-events-none absolute -right-1 -top-2 sm:-right-3 sm:-top-6 select-none text-[4.5rem] min-[380px]:text-[5rem] sm:text-[9rem] font-black leading-none z-10"
                >
                  {s.no}
                </span>

                {/* Top: sport icon */}
                <div className="relative z-10 flex size-8 min-[380px]:size-9 sm:size-12 items-center justify-center rounded-lg sm:rounded-xl bg-[#FF6A00] text-black transition-all duration-300 group-hover:bg-[#FFE600] group-hover:text-black group-hover:shadow-[0_0_20px_rgba(255,230,0,0.5)]">
                  <s.icon className="size-4 min-[380px]:size-4.5 sm:size-6" strokeWidth={2.2} />
                </div>

                {/* Bottom: sport name, sub, and Know More button */}
                <div className="relative z-10 w-full">
                  <h3 className="display text-xl min-[380px]:text-2xl font-black uppercase leading-none text-white transition-colors duration-300 group-hover:text-[#FFE600] sm:text-5xl drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
                    {s.name}
                  </h3>
                  <p className="mt-1 sm:mt-2 text-[10px] min-[380px]:text-xs sm:text-sm uppercase tracking-wider sm:tracking-widest text-white/80 transition-colors duration-300 group-hover:text-white font-semibold truncate drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                    {s.sub}
                  </p>

                  {/* Know More Action Button */}
                  <div className="mt-2.5 sm:mt-4 flex items-center justify-between gap-1.5">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-sm px-2.5 py-1 sm:px-3.5 sm:py-1.5 text-[11px] sm:text-xs font-black uppercase tracking-wider text-white transition-all duration-300 group-hover:bg-[#FFE600] group-hover:text-black group-hover:shadow-[0_0_15px_rgba(255,230,0,0.5)]">
                      <span>Know More</span>
                      <ArrowUpRight className="size-3.5 sm:size-4 transition-transform duration-300 group-hover:rotate-45" />
                    </span>
                    <span className="text-[10px] sm:text-[11px] font-semibold text-white/70 group-hover:text-white transition-colors uppercase tracking-wider hidden min-[400px]:inline drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
                      View details
                    </span>
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Sport Details Pop-up Modal */}
      {selectedSport && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="sport-modal-title"
          onClick={() => setSelectedSport(null)}
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl border border-white/20 bg-gradient-to-b from-zinc-900 via-black to-black p-5 sm:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.95),0_0_50px_rgba(255,106,0,0.3)] text-white my-auto"
          >
            {/* Top soft yellow glow */}
            <div
              aria-hidden
              className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 h-36 w-3/4 rounded-full bg-[#FFE600]/15 blur-3xl"
            />

            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedSport(null)}
              aria-label="Close dialog"
              className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 flex size-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white/80 hover:bg-white/20 hover:text-white hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-lg"
            >
              <X className="size-5 stroke-[2.5]" />
            </button>

            {/* Modal Header */}
            <div className="relative pr-12">
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 sm:size-11 items-center justify-center rounded-xl bg-[#FF6A00] text-black shadow-md shrink-0">
                  <selectedSport.icon className="size-5 sm:size-6" strokeWidth={2.4} />
                </div>
                <div>
                  <span className="text-[11px] sm:text-xs font-black uppercase tracking-[0.2em] text-[#FFE600]">
                    Discipline {selectedSport.no} · {currentChamp?.level || "National"} Level
                  </span>
                  <h3
                    id="sport-modal-title"
                    className="display text-3xl sm:text-5xl font-black uppercase leading-none tracking-tight text-white mt-0.5"
                  >
                    {selectedSport.name}
                  </h3>
                </div>
              </div>

              {/* Tagline */}
              <p className="mt-3 text-base sm:text-lg font-bold text-[#FFE600] tracking-wide">
                {selectedSport.tagline}
              </p>

              {currentChamp?.name && (
                <p className="text-xs sm:text-sm font-semibold text-white/60 uppercase tracking-wider mt-0.5">
                  Official Title: {currentChamp.name}
                </p>
              )}
            </div>

            {/* User Provided Detailed Description */}
            <div className="relative mt-5 rounded-2xl border border-white/15 bg-white/[0.04] p-4 sm:p-6 backdrop-blur-sm">
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#FF6A00] mb-2">
                About the Championship
              </h4>
              <p className="text-sm sm:text-base leading-relaxed text-white/90 font-normal">
                {selectedSport.desc}
              </p>
            </div>

            {/* Key Information Badges */}
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Timing */}
              <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3.5">
                <Calendar className="size-5 text-[#FFE600] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-white/50 block">
                    Schedule & Timing
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-white">
                    {currentChamp?.when || "4–6 December 2026"}
                  </span>
                </div>
              </div>

              {/* Venue */}
              <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3.5">
                <MapPin className="size-5 text-[#FF6A00] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-white/50 block">
                    Competition Arena
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-white">
                    {EVENT.venue}, {EVENT.city}
                  </span>
                </div>
              </div>
            </div>

            {/* Special Highlight / Headline Prize */}
            <div className="mt-3 flex items-start gap-3 rounded-xl border border-[#FFE600]/30 bg-[#FFE600]/10 p-3.5">
              <Trophy className="size-5 text-[#FFE600] shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-[#FFE600] block">
                  Championship Stakes & Titles
                </span>
                <span className="text-xs sm:text-sm font-bold text-white">
                  {selectedSport.highlight}
                </span>
              </div>
            </div>

            {/* Divisions Preview */}
            {currentChamp && currentChamp.divisions.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-bold uppercase tracking-wider text-white/60 mb-2">
                  Divisions & Categories ({currentChamp.divisions.length}):
                </p>
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
                  {currentChamp.divisions.map((d) => (
                    <span
                      key={d.id}
                      className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-white/90"
                    >
                      <CheckCircle2 className="size-3 text-[#FFE600]" />
                      <span>{d.name}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Link
                href={registerHref(selectedSport.id)}
                onClick={() => setSelectedSport(null)}
                className="btn btn-gold flex-1 !min-h-[52px] !py-3.5 flex items-center justify-center gap-2.5 text-sm sm:text-base !font-black uppercase tracking-wider shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <span>REGISTER NOW FOR {selectedSport.name.toUpperCase()}</span>
                <ArrowRight className="size-4.5 stroke-[3]" />
              </Link>

              <button
                type="button"
                onClick={() => handleExploreInArena(selectedSport.id)}
                className="btn btn-line !min-h-[52px] !py-3.5 px-5 flex items-center justify-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-wider text-white border-white/20 hover:border-[#FFE600] hover:text-[#FFE600] transition-colors"
              >
                <span>Explore Weight Classes</span>
                <ArrowUpRight className="size-4" />
              </button>
            </div>

            {/* Direct WhatsApp Query Line */}
            <div className="mt-4 text-center">
              <a
                href={
                  "https://wa.me/918018958655?text=" +
                  encodeURIComponent(
                    `Hi, I have a question about the ${selectedSport.name} championship (${selectedSport.tagline}) at Sports Festival India 2026.`
                  )
                }
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-white/70 hover:text-white transition-colors"
              >
                <WhatsAppGlyph className="size-4 text-wa" />
                <span>
                  Questions about {selectedSport.name}? Chat with AOGA on WhatsApp
                </span>
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
