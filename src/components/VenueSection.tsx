"use client";

import React, { useState, useRef } from "react";
import { 
  Plane, 
  Train, 
  Bus, 
  Hotel, 
  MapPin, 
  Navigation, 
  ExternalLink, 
  Copy, 
  Check, 
  Compass, 
  Layers, 
  ShieldCheck, 
  Dumbbell, 
  Car, 
  Sparkles,
  Phone
} from "lucide-react";
import { EVENT } from "@/data/festival";
import { useReplayOnScroll } from "@/hooks/useReplayOnScroll";
import { WhatsAppGlyph } from "./icons";

type MapMode = "arena" | "city";

interface VenueZone {
  id: string;
  name: string;
  tag: string;
  desc: string;
  color: string;
}

const VENUE_ZONES: Record<string, VenueZone> = {
  stage: {
    id: "stage",
    name: "Main Championship Stage",
    tag: "Zone A · Center Arena",
    desc: "Six championships: Bodybuilding, Powerlifting, Arm Wrestling, Boxing, Dangal & Marathon finish line.",
    color: "#FF9A00",
  },
  warmup: {
    id: "warmup",
    name: "Athlete Warm-Up & Pump Zone",
    tag: "Zone B · Athletes Only",
    desc: "Fully equipped backstage warmup gym with weights, dumbbells, benches, mirrors & tan touch-up station.",
    color: "#FFE600",
  },
  expo: {
    id: "expo",
    name: "Brand Expo & Nutrition Village",
    tag: "Zone C · Public & Athletes",
    desc: "Exhibition stalls, supplement testing, fitness apparel, food court & recovery lounge.",
    color: "#FF6A00",
  },
  gate1: {
    id: "gate1",
    name: "Gate 1 · Athlete Registration",
    tag: "North Gate · Entry Point",
    desc: "Official athlete check-in, government ID verification, athlete pass handover & official festival kit collection.",
    color: "#22C55E",
  },
  gate2: {
    id: "gate2",
    name: "Gate 2 · Spectators & VIP",
    tag: "East Gate · Ticket Entry",
    desc: "General admission entry, ticket scanning counter, VIP lounge access & grandstand seating pathways.",
    color: "#3B82F6",
  },
  parking: {
    id: "parking",
    name: "Free Athlete & Visitor Parking",
    tag: "Zone P · Secured Lot",
    desc: "Large dedicated vehicle parking for 500+ cars and 2,000+ two-wheelers with round-the-clock security.",
    color: "#A855F7",
  },
};

export function VenueSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const play = useReplayOnScroll(sectionRef);

  const [mapMode, setMapMode] = useState<MapMode>("arena");
  const [activeZone, setActiveZone] = useState<string>("stage");
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(EVENT.address).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }).catch(() => {});
    }
  };

  const currentZone = VENUE_ZONES[activeZone] || VENUE_ZONES.stage;

  const transitRows = [
    {
      id: "air",
      category: "By air",
      title: "Biju Patnaik International Airport (BBI), Bhubaneswar",
      eta: "7.8 km · ~15 mins",
      tip: "Direct prepaid taxi, Ola & Uber available 24/7 right outside Terminal 1.",
      icon: Plane,
      badge: "Airport Hub",
    },
    {
      id: "train",
      category: "By train",
      title: "Bhubaneswar Railway Station (BBS)",
      eta: "6.5 km · ~12 mins",
      tip: "Connected directly via NH16 / Cuttack-Puri Road. Mo Bus & autos available round the clock.",
      icon: Train,
      badge: "Main Station",
    },
    {
      id: "bus",
      category: "By bus / local",
      title: "Baramunda ISBT (Central Bus Stand)",
      eta: "500m · 4 mins walk",
      tip: "Odisha's premier transit hub located right next to the ground. Express buses from all states.",
      icon: Bus,
      badge: "Adjacent Hub",
    },
    {
      id: "stay",
      category: "Stay",
      title: "Partner hotels at athlete rates — details after you register",
      eta: "1–3 km radius",
      tip: "Special discounted rates negotiated for registered athletes & teams in Nayapalli and Khandagiri.",
      icon: Hotel,
      badge: "Athlete Stays",
    },
  ];

  const highlights = [
    { icon: Compass, title: "50,000+ Sq. Ft.", sub: "Festival grounds" },
    { icon: Dumbbell, title: "6 Championships", sub: "Dedicated arenas" },
    { icon: Car, title: "Free Parking", sub: "Dedicated athlete bay" },
    { icon: ShieldCheck, title: "Medical & ICU", sub: "24/7 on-site team" },
  ];

  return (
    <section 
      ref={sectionRef} 
      data-play={play} 
      id="venue" 
      className="vn-section relative w-full page-gutter py-20 md:py-28 overflow-hidden bg-black text-white"
    >
      {/* Subtle ambient orange/gold glow background */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute -top-40 left-1/4 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[#FF6A00] opacity-10 blur-[140px]" 
      />
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute bottom-0 right-10 h-[400px] w-[400px] rounded-full bg-[#FF9A00] opacity-[0.07] blur-[130px]" 
      />

      <div className="content-contain mx-auto w-full max-w-[2000px] relative z-10">
        
        {/* Top Header Row */}
        <div className="mb-12 md:mb-16">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-semibold tracking-wider text-amber-300 uppercase">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
              </span>
              Official Festival Venue · 4–6 Dec 2026
            </span>

            <span className="text-xs font-mono text-white/50 tracking-widest hidden sm:inline-block">
              20°16&apos;47&quot;N · 85°47&apos;21&quot;E
            </span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <h2 className="display text-[clamp(2.8rem,6.5vw,5.6rem)] font-extrabold uppercase leading-[0.92] tracking-tight">
                {EVENT.venue}
              </h2>
              {/* Short gradient line */}
              <div className="mt-4 h-1 w-24 rounded-full bg-gradient-to-r from-[#FFE600] via-[#FF9A00] to-[#FF6A00]" />
              <p className="mt-4 text-xl md:text-2xl font-medium text-white/70">
                {EVENT.city}
              </p>
            </div>

            {/* Quick Actions (Copy Address & Open Maps) */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleCopyAddress}
                className="group relative inline-flex items-center gap-2.5 rounded-xl border border-white/12 bg-white/5 px-4 py-3 text-sm font-semibold text-white/90 backdrop-blur-md transition-all hover:border-amber-400/40 hover:bg-white/10 active:scale-[0.98]"
                aria-label="Copy venue address"
              >
                {copied ? (
                  <>
                    <Check className="size-4 text-green-400" />
                    <span className="text-green-400">Address Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="size-4 text-amber-400 transition-transform group-hover:scale-110" />
                    <span>Copy Full Address</span>
                  </>
                )}
              </button>

              <a
                href={EVENT.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#FFE600] via-[#FF9A00] to-[#FF6A00] px-5 py-3 text-sm font-bold tracking-wide text-black transition-all hover:shadow-[0_0_24px_rgba(255,154,0,0.4)] active:scale-[0.98]"
              >
                <span>Open in Google Maps</span>
                <ExternalLink className="size-4" />
              </a>
            </div>
          </div>

          {/* 4 Micro Highlights Chips */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 md:gap-4">
            {highlights.map((h, idx) => (
              <div 
                key={idx}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3.5 backdrop-blur-md transition-colors hover:border-white/20 hover:bg-white/[0.05]"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  <h.icon className="size-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white leading-tight">{h.title}</p>
                  <p className="text-xs text-white/50 leading-tight mt-0.5">{h.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main 2-Column Content Grid: Left Travel Guide, Right Interactive Map */}
        <div className="grid gap-8 lg:grid-cols-12 lg:items-stretch">
          
          {/* Left Column: Transit & Accommodation Cards (5/12 on lg) */}
          <div className="flex flex-col justify-between space-y-4 lg:col-span-5">
            <div className="space-y-3.5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold tracking-[0.2em] text-white/60 uppercase">
                  Travel &amp; Arrival Logistics
                </p>
                <span className="text-xs text-amber-400/80 font-mono">
                  NH16 Direct Access
                </span>
              </div>

              {transitRows.map((row) => {
                const IconComponent = row.icon;
                return (
                  <div
                    key={row.id}
                    className="group relative rounded-2xl border border-white/10 bg-gradient-to-b from-[#111111] to-[#0A0A0A] p-4.5 transition-all duration-300 hover:border-amber-400/40 hover:bg-[#141414] hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)]"
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400/20 to-orange-500/10 border border-amber-400/30 text-amber-400 transition-transform group-hover:scale-105">
                        <IconComponent className="size-5.5" />
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-bold tracking-widest text-amber-400 uppercase">
                            {row.category}
                          </span>
                          <span className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-white/80">
                            {row.eta}
                          </span>
                        </div>

                        <h3 className="mt-1 text-sm md:text-base font-semibold font-sans normal-case text-white leading-snug">
                          {row.title}
                        </h3>

                        <p className="mt-1 text-xs text-white/60 leading-relaxed">
                          {row.tip}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Support / WhatsApp Help Callout */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-white">Need arrival assistance?</p>
                <p className="text-xs text-white/60 mt-0.5">Team buses &amp; outstation athletes can reach AOGA helpdesk.</p>
              </div>
              <a
                href={EVENT.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-xs font-bold text-white transition-transform hover:brightness-110 shrink-0"
              >
                <WhatsAppGlyph className="size-4" />
                <span>WhatsApp Helpdesk</span>
              </a>
            </div>
          </div>

          {/* Right Column: High-Tech Interactive Radar & Stadium Map (7/12 on lg) */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="relative flex flex-col h-full rounded-3xl border border-white/12 bg-[#0A0A0A] overflow-hidden shadow-2xl">
              
              {/* Map Header / Mode Switcher */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-[#0E0E0E]/90 px-5 py-3.5 backdrop-blur-md">
                
                {/* View Switcher Tabs */}
                <div className="inline-flex rounded-xl bg-black/60 p-1 border border-white/10">
                  <button
                    type="button"
                    onClick={() => setMapMode("arena")}
                    className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-bold tracking-wide transition-all ${
                      mapMode === "arena"
                        ? "bg-gradient-to-r from-[#FFE600] to-[#FF9A00] text-black shadow-md"
                        : "text-white/70 hover:text-white"
                    }`}
                  >
                    <Layers className="size-3.5" />
                    <span>Arena Grounds Layout</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMapMode("city")}
                    className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-bold tracking-wide transition-all ${
                      mapMode === "city"
                        ? "bg-gradient-to-r from-[#FFE600] to-[#FF9A00] text-black shadow-md"
                        : "text-white/70 hover:text-white"
                    }`}
                  >
                    <Compass className="size-3.5" />
                    <span>City Transit Routes</span>
                  </button>
                </div>

                {/* Radar Live Indicator */}
                <div className="flex items-center gap-2 text-xs font-mono text-white/60">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span className="hidden sm:inline">LIVE RADAR ACTIVE</span>
                </div>
              </div>

              {/* Map Canvas Area */}
              <div className="relative min-h-[380px] sm:min-h-[440px] flex-1 bg-[#070707] overflow-hidden select-none">
                
                {/* Grid Background Pattern */}
                <div 
                  className="absolute inset-0 opacity-[0.07]" 
                  style={{
                    backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
                    backgroundSize: "24px 24px",
                  }}
                />

                {/* Tactical Radar Ring Sweeps in Background */}
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="vn-sonar-ring vn-sonar-1 absolute size-[200px] rounded-full border border-amber-500/20" />
                  <div className="vn-sonar-ring vn-sonar-2 absolute size-[340px] rounded-full border border-amber-500/15" />
                  <div className="vn-sonar-ring vn-sonar-3 absolute size-[500px] rounded-full border border-amber-500/10" />
                  {/* Rotating radar sweep arm */}
                  <div className="vn-radar-sweep absolute size-[460px] rounded-full [background:conic-gradient(from_0deg_at_50%_50%,rgba(255,170,0,0.14)_0deg,transparent_60deg)]" />
                </div>

                {/* ======================================================== */}
                {/* MODE 1: ARENA GROUNDS SCHEMATIC (STADIUM LAYOUT) */}
                {/* ======================================================== */}
                {mapMode === "arena" && (
                  <div className="relative size-full p-4 sm:p-6 flex flex-col justify-between">
                    <svg
                      viewBox="0 0 700 480"
                      className="size-full max-h-[380px] drop-shadow-[0_0_20px_rgba(0,0,0,0.8)]"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      {/* Outer boundary perimeter road */}
                      <rect x="30" y="30" width="640" height="420" rx="40" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" strokeDasharray="8 6" />

                      {/* Main Stadium Outer Track (400m curve running track) */}
                      <rect x="90" y="65" width="520" height="350" rx="90" fill="#0C0C0C" stroke="#FF9A00" strokeWidth="2.5" strokeOpacity="0.8" />
                      <rect x="105" y="80" width="490" height="320" rx="75" stroke="#FFE600" strokeWidth="1" strokeOpacity="0.4" strokeDasharray="6 4" />
                      <rect x="120" y="95" width="460" height="290" rx="60" fill="#0F140F" fillOpacity="0.7" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

                      {/* Sports Field Center Grass Lines */}
                      <line x1="350" y1="95" x2="350" y2="385" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" strokeDasharray="4 4" />
                      <circle cx="350" cy="240" r="55" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" fill="none" />

                      {/* ZONE A: Main Championship Stage */}
                      <g 
                        onClick={() => setActiveZone("stage")}
                        className="cursor-pointer group/zone transition-transform hover:scale-[1.02]"
                      >
                        <rect 
                          x="230" 
                          y="180" 
                          width="240" 
                          height="120" 
                          rx="16" 
                          fill={activeZone === "stage" ? "rgba(255, 154, 0, 0.22)" : "rgba(255, 154, 0, 0.08)"}
                          stroke="#FF9A00" 
                          strokeWidth={activeZone === "stage" ? "2.5" : "1.5"}
                        />
                        <rect x="245" y="195" width="210" height="20" rx="6" fill="#FF9A00" fillOpacity="0.25" />
                        <text x="350" y="210" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="bold" letterSpacing="0.08em">MAIN CHAMPIONSHIP STAGE</text>
                        <text x="350" y="240" textAnchor="middle" fill="#FFE600" fontSize="13" fontWeight="900" letterSpacing="0.04em">ANIL GOCHHIKAR CLASSIC</text>
                        <text x="350" y="260" textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="10">6 Championships · Prelims &amp; Finals</text>
                        <text x="350" y="280" textAnchor="middle" fill="#FF9A00" fontSize="9" fontWeight="bold">★ CENTER PODIUM ARENA</text>
                      </g>

                      {/* ZONE B: Athlete Warm-up Pavilion */}
                      <g 
                        onClick={() => setActiveZone("warmup")}
                        className="cursor-pointer group/zone"
                      >
                        <rect 
                          x="135" 
                          y="130" 
                          width="85" 
                          height="220" 
                          rx="12" 
                          fill={activeZone === "warmup" ? "rgba(255, 230, 0, 0.2)" : "rgba(255, 230, 0, 0.06)"}
                          stroke="#FFE600" 
                          strokeWidth={activeZone === "warmup" ? "2" : "1"}
                          strokeDasharray={activeZone === "warmup" ? "none" : "4 2"}
                        />
                        <text x="177" y="220" textAnchor="middle" fill="#FFE600" fontSize="11" fontWeight="bold" transform="rotate(-90 177 220)">ATHLETE WARM-UP</text>
                        <text x="177" y="240" textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="9" transform="rotate(-90 177 240)">Gym &amp; Pump Station</text>
                      </g>

                      {/* ZONE C: Brand Expo & Nutrition Stalls */}
                      <g 
                        onClick={() => setActiveZone("expo")}
                        className="cursor-pointer group/zone"
                      >
                        <rect 
                          x="480" 
                          y="130" 
                          width="85" 
                          height="220" 
                          rx="12" 
                          fill={activeZone === "expo" ? "rgba(255, 106, 0, 0.2)" : "rgba(255, 106, 0, 0.06)"}
                          stroke="#FF6A00" 
                          strokeWidth={activeZone === "expo" ? "2" : "1"}
                        />
                        <text x="522" y="220" textAnchor="middle" fill="#FF6A00" fontSize="11" fontWeight="bold" transform="rotate(90 522 220)">EXPO &amp; STALLS</text>
                        <text x="522" y="240" textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="9" transform="rotate(90 522 240)">Nutrition &amp; Apparel</text>
                      </g>

                      {/* GATE 1: Athlete Check-in (Top / North) */}
                      <g 
                        onClick={() => setActiveZone("gate1")}
                        className="cursor-pointer group/zone"
                      >
                        <rect 
                          x="270" 
                          y="32" 
                          width="160" 
                          height="28" 
                          rx="8" 
                          fill={activeZone === "gate1" ? "rgba(34, 197, 94, 0.25)" : "rgba(34, 197, 94, 0.1)"}
                          stroke="#22C55E" 
                          strokeWidth={activeZone === "gate1" ? "2" : "1"}
                        />
                        <circle cx="285" cy="46" r="4" fill="#22C55E" />
                        <text x="355" y="50" textAnchor="middle" fill="#22C55E" fontSize="10" fontWeight="bold">GATE 1 · ATHLETES ENTRY</text>
                      </g>

                      {/* GATE 2: Spectators & VIP Entrance (Bottom / South) */}
                      <g 
                        onClick={() => setActiveZone("gate2")}
                        className="cursor-pointer group/zone"
                      >
                        <rect 
                          x="270" 
                          y="420" 
                          width="160" 
                          height="28" 
                          rx="8" 
                          fill={activeZone === "gate2" ? "rgba(59, 130, 246, 0.25)" : "rgba(59, 130, 246, 0.1)"}
                          stroke="#3B82F6" 
                          strokeWidth={activeZone === "gate2" ? "2" : "1"}
                        />
                        <circle cx="285" cy="434" r="4" fill="#3B82F6" />
                        <text x="355" y="438" textAnchor="middle" fill="#3B82F6" fontSize="10" fontWeight="bold">GATE 2 · SPECTATORS / VIP</text>
                      </g>

                      {/* ZONE P: Free Athlete Parking Lot (West) */}
                      <g 
                        onClick={() => setActiveZone("parking")}
                        className="cursor-pointer group/zone"
                      >
                        <rect 
                          x="35" 
                          y="180" 
                          width="48" 
                          height="120" 
                          rx="8" 
                          fill={activeZone === "parking" ? "rgba(168, 85, 247, 0.25)" : "rgba(168, 85, 247, 0.08)"}
                          stroke="#A855F7" 
                          strokeWidth={activeZone === "parking" ? "2" : "1"}
                        />
                        <text x="59" y="240" textAnchor="middle" fill="#A855F7" fontSize="13" fontWeight="black" transform="rotate(-90 59 240)">PARKING</text>
                      </g>

                      {/* Center Target Crosshairs & GPS Pin */}
                      <g transform="translate(350, 160)">
                        <circle cx="0" cy="0" r="14" fill="#FF9A00" fillOpacity="0.2" className="animate-ping" />
                        <circle cx="0" cy="0" r="6" fill="#FF9A00" />
                        <line x1="-20" y1="0" x2="20" y2="0" stroke="#FF9A00" strokeWidth="1.5" />
                        <line x1="0" y1="-20" x2="0" y2="20" stroke="#FF9A00" strokeWidth="1.5" />
                      </g>
                    </svg>

                    {/* Zone Selector Strip at Bottom */}
                    <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
                      {Object.values(VENUE_ZONES).map((z) => (
                        <button
                          key={z.id}
                          type="button"
                          onClick={() => setActiveZone(z.id)}
                          className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all ${
                            activeZone === z.id
                              ? "bg-white text-black shadow"
                              : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                          }`}
                        >
                          {z.name.split("·")[0]}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* ======================================================== */}
                {/* MODE 2: CITY ACCESS & HIGHWAY TRANSIT MAP */}
                {/* ======================================================== */}
                {mapMode === "city" && (
                  <div className="relative size-full p-4 sm:p-6 flex flex-col justify-between">
                    <svg
                      viewBox="0 0 700 480"
                      className="size-full max-h-[380px]"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      {/* Arterial Road: NH-16 Highway (Diagonal glowing arterial) */}
                      <path 
                        d="M-20 400 L720 120" 
                        stroke="#262626" 
                        strokeWidth="28" 
                        strokeLinecap="round" 
                      />
                      <path 
                        d="M-20 400 L720 120" 
                        stroke="#FF9A00" 
                        strokeWidth="3" 
                        strokeOpacity="0.8" 
                      />
                      <path 
                        d="M-20 400 L720 120" 
                        stroke="#FFFFFF" 
                        strokeWidth="2" 
                        strokeDasharray="12 12" 
                        strokeOpacity="0.5" 
                        className="vn-highway-flow"
                      />
                      <text x="180" y="310" fill="#FF9A00" fontSize="12" fontWeight="bold" letterSpacing="0.1em" transform="rotate(-21 180 310)">
                        NATIONAL HIGHWAY 16 (NH-16 / AH-45)
                      </text>

                      {/* Khandagiri Marg Connector */}
                      <path d="M220 490 L400 -10" stroke="#333333" strokeWidth="16" />
                      <path d="M220 490 L400 -10" stroke="#FFE600" strokeWidth="2" strokeOpacity="0.5" strokeDasharray="8 6" />
                      <text x="290" y="370" fill="rgba(255,255,255,0.5)" fontSize="10" transform="rotate(-70 290 370)">
                        Khandagiri Marg
                      </text>

                      {/* Cuttack-Puri Bypass to Railway Station */}
                      <path d="M420 230 L720 380" stroke="#333333" strokeWidth="12" />
                      <path d="M420 230 L720 380" stroke="#3B82F6" strokeWidth="2" strokeOpacity="0.6" strokeDasharray="6 4" />

                      {/* Airport Link (BBI Route) */}
                      <path d="M380 250 L120 450" stroke="#22C55E" strokeWidth="2.5" strokeDasharray="6 4" strokeOpacity="0.8" />

                      {/* HUB 1: Biju Patnaik Airport Marker (South) */}
                      <g transform="translate(100, 420)">
                        <circle cx="0" cy="0" r="26" fill="rgba(34, 197, 94, 0.15)" stroke="#22C55E" strokeWidth="1.5" />
                        <circle cx="0" cy="0" r="14" fill="#22C55E" fillOpacity="0.3" />
                        <text x="0" y="4" textAnchor="middle" fill="#FFFFFF" fontSize="12">✈️</text>
                        <rect x="-80" y="32" width="160" height="22" rx="6" fill="#111" stroke="rgba(255,255,255,0.2)" />
                        <text x="0" y="46" textAnchor="middle" fill="#22C55E" fontSize="10" fontWeight="bold">BBI AIRPORT (7.8 KM)</text>
                      </g>

                      {/* HUB 2: Bhubaneswar Railway Station (East) */}
                      <g transform="translate(620, 340)">
                        <circle cx="0" cy="0" r="26" fill="rgba(59, 130, 246, 0.15)" stroke="#3B82F6" strokeWidth="1.5" />
                        <circle cx="0" cy="0" r="14" fill="#3B82F6" fillOpacity="0.3" />
                        <text x="0" y="4" textAnchor="middle" fill="#FFFFFF" fontSize="12">🚆</text>
                        <rect x="-80" y="32" width="160" height="22" rx="6" fill="#111" stroke="rgba(255,255,255,0.2)" />
                        <text x="0" y="46" textAnchor="middle" fill="#3B82F6" fontSize="10" fontWeight="bold">BBS RAILWAY (6.5 KM)</text>
                      </g>

                      {/* HUB 3: Baramunda ISBT Bus Terminal (Directly North-West) */}
                      <g transform="translate(290, 170)">
                        <circle cx="0" cy="0" r="22" fill="rgba(255, 230, 0, 0.15)" stroke="#FFE600" strokeWidth="1.5" />
                        <text x="0" y="4" textAnchor="middle" fill="#FFFFFF" fontSize="11">🚌</text>
                        <rect x="-70" y="-32" width="140" height="20" rx="6" fill="#111" stroke="#FFE600" strokeWidth="1" />
                        <text x="0" y="-18" textAnchor="middle" fill="#FFE600" fontSize="9" fontWeight="bold">BARAMUNDA ISBT (500M)</text>
                      </g>

                      {/* CENTRAL DESTINATION: BARAMUNDA GROUND FIELD */}
                      <g transform="translate(380, 240)">
                        {/* Target Pulse Beacon */}
                        <circle cx="0" cy="0" r="45" fill="rgba(255, 154, 0, 0.15)" className="animate-ping" />
                        <circle cx="0" cy="0" r="30" fill="rgba(255, 154, 0, 0.25)" stroke="#FF9A00" strokeWidth="2" />
                        <circle cx="0" cy="0" r="10" fill="#FF9A00" />
                        
                        {/* Floating Stadium Badge */}
                        <g transform="translate(0, -55)">
                          <rect x="-115" y="-16" width="230" height="34" rx="8" fill="#0A0A0A" stroke="#FF9A00" strokeWidth="2" />
                          <text x="0" y="4" textAnchor="middle" fill="#FFE600" fontSize="11" fontWeight="900" letterSpacing="0.05em">
                            BARAMUNDA GROUND FIELD
                          </text>
                          <polygon points="0,18 -6,26 6,26" fill="#FF9A00" />
                        </g>
                      </g>
                    </svg>

                    <div className="mt-2 text-center">
                      <p className="text-xs text-white/60">
                        Conveniently located at the intersection of NH16 and Khandagiri Marg · Rapid highway connection to all transit hubs
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Active Zone Info Banner */}
              <div className="border-t border-white/10 bg-[#0E0E0E] p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span 
                        className="size-2.5 rounded-full" 
                        style={{ backgroundColor: currentZone.color }} 
                      />
                      <span className="text-xs font-bold tracking-wider uppercase text-white/50">
                        {currentZone.tag}
                      </span>
                    </div>
                    <h4 className="mt-0.5 text-base sm:text-lg font-bold font-sans text-white">
                      {currentZone.name}
                    </h4>
                    <p className="mt-0.5 text-xs sm:text-sm text-white/70 max-w-xl">
                      {currentZone.desc}
                    </p>
                  </div>

                  {/* Direction Buttons */}
                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href="https://www.google.com/maps/dir/?api=1&destination=Baramunda+Ground+Bhubaneswar"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-bold text-white transition-all hover:bg-white/10 hover:border-amber-400/40 active:scale-[0.98]"
                    >
                      <Navigation className="size-3.5 text-amber-400" />
                      <span>Directions</span>
                    </a>

                    <a
                      href={EVENT.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#FFE600] to-[#FF9A00] px-4 py-2.5 text-xs font-bold text-black transition-all hover:shadow-[0_0_15px_rgba(255,154,0,0.3)] active:scale-[0.98]"
                    >
                      <MapPin className="size-3.5" />
                      <span>Maps</span>
                      <ExternalLink className="size-3" />
                    </a>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
