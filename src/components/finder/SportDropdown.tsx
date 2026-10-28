"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  BicepsFlexed,
  Dumbbell,
  Handshake,
  Swords,
  HandFist,
  Footprints,
  ChevronDown,
  Check,
  type LucideIcon,
} from "lucide-react";
import type { Championship } from "@/data/festival";
import { championshipTotal, EVENT } from "@/data/festival";
import { inr, inrShort } from "@/lib/format";

const SPORT_ICONS: Record<string, LucideIcon> = {
  bodybuilding: BicepsFlexed,
  powerlifting: Dumbbell,
  "arm-wrestling": Handshake,
  dangal: Swords,
  boxing: HandFist,
  marathon: Footprints,
};

export function getSportSubtext(c: Championship): string {
  const total = championshipTotal(c);
  if (total) return `Prizes up to ${inrShort(total)}`;
  if (c.divisions.length) {
    const minFee = Math.min(...c.divisions.map((d) => d.fee ?? EVENT.fee));
    return `Registration open · ${inr(minFee)}`;
  }
  return "Details coming soon";
}

interface SportDropdownProps {
  championships: Championship[];
  selectedId: string;
  onSelect: (c: Championship) => void;
}

export function SportDropdown({
  championships,
  selectedId,
  onSelect,
}: SportDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef<Record<string, HTMLLIElement | null>>({});

  const [panelPos, setPanelPos] = useState({
    top: 0,
    left: 0,
    width: 0,
    maxHeight: 360,
    isFlipped: false,
  });

  const selectedSport =
    championships.find((c) => c.id === selectedId) ?? championships[0];
  const selectedIndex = championships.findIndex((c) => c.id === selectedId);

  // Mount detection for Portal
  useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Sync highlighted option when opened
  useEffect(() => {
    if (isOpen) {
      setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0);
    }
  }, [isOpen, selectedIndex]);

  // Position recalculation for floating portal on desktop
  useEffect(() => {
    if (!isOpen || isMobile) return;

    const updatePosition = () => {
      const btn = buttonRef.current;
      if (!btn) return;

      const rect = btn.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.bottom - 16;
      const spaceAbove = rect.top - 16;
      const panelEstHeight = Math.min(360, championships.length * 62 + 16);

      const shouldFlip = spaceBelow < panelEstHeight && spaceAbove > spaceBelow;
      const availableSpace = shouldFlip ? spaceAbove : spaceBelow;
      const maxH = Math.min(360, Math.max(160, availableSpace));
      const top = shouldFlip
        ? Math.max(8, rect.top - 8 - maxH)
        : rect.bottom + 8;

      setPanelPos({
        top,
        left: rect.left,
        width: rect.width,
        maxHeight: maxH,
        isFlipped: shouldFlip,
      });
    };

    updatePosition();
    let rafId: number;
    const onScrollOrResize = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updatePosition);
    };

    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [isOpen, isMobile, championships.length]);

  // Scroll active option into view when navigating via keyboard
  useEffect(() => {
    if (isOpen && championships[highlightedIndex]) {
      const activeEl = itemRefs.current[championships[highlightedIndex].id];
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [highlightedIndex, isOpen, championships]);

  // Lock body scroll on mobile bottom sheet
  useEffect(() => {
    if (isOpen && isMobile) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen, isMobile]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    function handleOutsideClick(e: MouseEvent) {
      const target = e.target as Node;
      if (buttonRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      setIsOpen(false);
      buttonRef.current?.focus();
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        buttonRef.current?.focus();
        break;
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < championships.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : championships.length - 1
        );
        break;
      case "Home":
        e.preventDefault();
        setHighlightedIndex(0);
        break;
      case "End":
        e.preventDefault();
        setHighlightedIndex(championships.length - 1);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (championships[highlightedIndex]) {
          onSelect(championships[highlightedIndex]);
          setIsOpen(false);
          buttonRef.current?.focus();
        }
        break;
      default:
        break;
    }
  };

  const SelectedIcon = SPORT_ICONS[selectedSport.id] ?? BicepsFlexed;

  return (
    <div className="w-full">
      {/* Closed State Trigger Button: 64px height, clean separation */}
      <button
        ref={buttonRef}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls="sport-listbox"
        aria-label="Choose your sport"
        aria-activedescendant={
          isOpen ? `sport-opt-${championships[highlightedIndex]?.id}` : undefined
        }
        onClick={() => setIsOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        className={`group relative flex h-16 w-full items-center justify-between rounded-2xl bg-white/[0.04] px-4 transition-all duration-200 outline-none ${
          isOpen
            ? "border border-[#FF9A00] ring-1 ring-[#FF9A00]/40 shadow-[0_0_25px_rgba(255,154,0,0.15)]"
            : "border border-white/[0.14] hover:border-white/30 hover:bg-white/[0.06] focus-visible:ring-2 focus-visible:ring-[#FF9A00]"
        }`}
      >
        <div className="flex items-center gap-3.5 min-w-0 pr-3">
          {/* 40px rounded-xl box with gradient background and black icon */}
          <div className="sd-grad-bg flex size-10 shrink-0 items-center justify-center rounded-xl text-black shadow-sm">
            <SelectedIcon className="size-5" strokeWidth={2.5} />
          </div>

          <div className="min-w-0 text-left">
            <span className="display block text-[22px] sm:text-[24px] font-black uppercase text-white leading-none tracking-wide truncate">
              {selectedSport.sport}
            </span>
            <span className="block text-xs sm:text-[13px] font-medium text-white/60 tracking-normal truncate mt-0.5">
              {getSportSubtext(selectedSport)}
            </span>
          </div>
        </div>

        {/* Right: chevron that rotates 180deg when open */}
        <ChevronDown
          className={`size-5 text-white/70 transition-transform duration-300 shrink-0 ${
            isOpen ? "rotate-180 text-[#FFE600]" : "group-hover:text-white"
          }`}
          strokeWidth={2.4}
        />
      </button>

      {/* Render Options Panel via Portal */}
      {mounted &&
        isOpen &&
        createPortal(
          isMobile ? (
            /* Mobile Bottom Sheet (below md) */
            <div className="fixed inset-0 z-[1000] flex flex-col justify-end">
              {/* Dark backdrop (60%) */}
              <div
                aria-hidden
                onClick={() => {
                  setIsOpen(false);
                  buttonRef.current?.focus();
                }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
              />

              {/* Bottom Sheet Container */}
              <div
                ref={panelRef}
                style={{ backgroundColor: "#0A0A0A" }}
                className="sd-sheet-anim relative z-10 flex max-h-[70svh] w-full flex-col rounded-t-3xl border-t border-white/[0.14] bg-[#0A0A0A] shadow-2xl pb-[max(16px,env(safe-area-inset-bottom))]"
              >
                {/* Drag handle */}
                <div className="mx-auto my-3 h-1.5 w-12 rounded-full bg-white/20" />

                <div className="px-5 pb-3">
                  <span className="text-xs font-bold uppercase tracking-[0.25em] text-white/60">
                    Select a Sport
                  </span>
                </div>

                {/* Option Rows */}
                <ul
                  id="sport-listbox"
                  role="listbox"
                  aria-label="Sports"
                  className="sd-scrollbar overflow-y-auto px-3 divide-y divide-white/[0.06]"
                >
                  {championships.map((c, index) => {
                    const isSelected = c.id === selectedId;
                    const isHighlighted = index === highlightedIndex;
                    const IconComp = SPORT_ICONS[c.id] ?? BicepsFlexed;

                    return (
                      <li
                        key={c.id}
                        id={`sport-opt-${c.id}`}
                        ref={(el) => {
                          itemRefs.current[c.id] = el;
                        }}
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => {
                          onSelect(c);
                          setIsOpen(false);
                          buttonRef.current?.focus();
                        }}
                        className={`group relative flex h-16 items-center justify-between gap-3 rounded-xl px-3 transition-colors ${
                          isSelected
                            ? "bg-white/[0.06]"
                            : isHighlighted
                            ? "bg-white/[0.05]"
                            : "active:bg-white/[0.04]"
                        }`}
                      >
                        {/* 3px gradient bar on left edge for selected */}
                        {isSelected && (
                          <div className="sd-grad-bg absolute left-0 top-2.5 bottom-2.5 w-[3px] rounded-full" />
                        )}

                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`flex size-9 shrink-0 items-center justify-center rounded-xl transition-colors ${
                              isSelected
                                ? "sd-grad-bg text-black shadow-sm"
                                : "bg-white/[0.08] text-white"
                            }`}
                          >
                            <IconComp className="size-5" strokeWidth={2.2} />
                          </div>
                          <span className="display text-[18px] font-black uppercase text-white tracking-wide truncate">
                            {c.sport}
                          </span>
                        </div>

                        <div className="flex items-center gap-2.5 shrink-0 ml-auto">
                          <span
                            className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white/85 ${
                              isSelected
                                ? "border-[#FF9A00] text-white"
                                : "border-white/20 bg-transparent"
                            }`}
                          >
                            {getSportSubtext(c)}
                          </span>

                          {isSelected && (
                            <Check
                              className="size-4.5 text-[#FFE600] shrink-0"
                              strokeWidth={3}
                            />
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          ) : (
            /* Desktop Floating Portal Panel (md and above) */
            <div
              ref={panelRef}
              style={{
                position: "fixed",
                top: `${panelPos.top}px`,
                left: `${panelPos.left}px`,
                width: `${panelPos.width}px`,
                maxHeight: `${panelPos.maxHeight}px`,
                backgroundColor: "#0A0A0A",
                zIndex: 1000,
              }}
              className={`${
                panelPos.isFlipped ? "sd-panel-anim-flipped" : "sd-panel-anim"
              } flex flex-col overflow-hidden rounded-2xl border border-white/[0.14] bg-[#0A0A0A] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,106,0,0.12)]`}
            >
              {/* Thin gradient line on top edge of panel */}
              <div className="sd-grad-bg h-[2px] w-full shrink-0" />

              {/* Option Rows with 6px padding around list */}
              <ul
                id="sport-listbox"
                ref={listRef}
                role="listbox"
                aria-label="Sports"
                className="sd-scrollbar overflow-y-auto p-1.5 space-y-0.5"
              >
                {championships.map((c, index) => {
                  const isSelected = c.id === selectedId;
                  const isHighlighted = index === highlightedIndex;
                  const IconComp = SPORT_ICONS[c.id] ?? BicepsFlexed;

                  return (
                    <li
                      key={c.id}
                      id={`sport-opt-${c.id}`}
                      ref={(el) => {
                        itemRefs.current[c.id] = el;
                      }}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => {
                        onSelect(c);
                        setIsOpen(false);
                        buttonRef.current?.focus();
                      }}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      className={`group relative flex h-[60px] items-center justify-between gap-3 rounded-xl px-3 cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-white/[0.06]"
                          : isHighlighted
                          ? "bg-white/[0.05]"
                          : "hover:bg-white/[0.04]"
                      }`}
                    >
                      {/* 3px gradient bar on left edge for selected row */}
                      {isSelected && (
                        <div className="sd-grad-bg absolute left-1 top-2.5 bottom-2.5 w-[3px] rounded-full" />
                      )}

                      {/* Left: 36px icon box + Middle: Sport Name */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`flex size-9 shrink-0 items-center justify-center rounded-xl transition-colors ${
                            isSelected
                              ? "sd-grad-bg text-black shadow-sm"
                              : "bg-white/[0.08] text-white"
                          }`}
                        >
                          <IconComp className="size-5" strokeWidth={2.2} />
                        </div>
                        <span className="display text-[18px] sm:text-[19px] font-black uppercase text-white tracking-wide truncate">
                          {c.sport}
                        </span>
                      </div>

                      {/* Right: small pill with subtext + Check icon */}
                      <div className="flex items-center gap-2.5 shrink-0 ml-auto">
                        <span
                          className={`rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white/85 ${
                            isSelected
                              ? "border-[#FF9A00] text-white"
                              : "border-white/20 bg-transparent"
                          }`}
                        >
                          {getSportSubtext(c)}
                        </span>

                        {isSelected && (
                          <Check
                            className="size-4.5 text-[#FFE600] shrink-0"
                            strokeWidth={3}
                          />
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ),
          document.body
        )}
    </div>
  );
}
