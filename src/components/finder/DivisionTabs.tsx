"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Division } from "@/data/festival";

interface DivisionTabsProps {
  divisions: Division[];
  selectedId: string;
  onSelect: (divId: string) => void;
}

export function DivisionTabs({
  divisions,
  selectedId,
  onSelect,
}: DivisionTabsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [underlineStyle, setUnderlineStyle] = useState<{
    left: number;
    width: number;
  }>({ left: 0, width: 0 });

  const checkScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  // Update underline indicator and scroll active tab into view
  useEffect(() => {
    const activeTab = tabRefs.current[selectedId];
    const container = containerRef.current;
    if (activeTab && container) {
      const containerRect = container.getBoundingClientRect();
      const tabRect = activeTab.getBoundingClientRect();

      setUnderlineStyle({
        left: tabRect.left - containerRect.left + container.scrollLeft,
        width: tabRect.width,
      });

      // Auto scroll active tab into view smoothly
      activeTab.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });

      checkScroll();
    }
  }, [selectedId, divisions]);

  // Recalculate on window resize and scroll
  useEffect(() => {
    const handleResize = () => {
      const activeTab = tabRefs.current[selectedId];
      const container = containerRef.current;
      if (activeTab && container) {
        const containerRect = container.getBoundingClientRect();
        const tabRect = activeTab.getBoundingClientRect();
        setUnderlineStyle({
          left: tabRect.left - containerRect.left + container.scrollLeft,
          width: tabRect.width,
        });
        checkScroll();
      }
    };

    checkScroll();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [selectedId, divisions]);

  const scrollByAmount = (amount: number) => {
    containerRef.current?.scrollBy({ left: amount, behavior: "smooth" });
  };

  return (
    <div className="relative w-full group/strip">
      {/* Left Scroll Arrow (shows when scrolled right) */}
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scrollByAmount(-180)}
          aria-label="Scroll divisions left"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 flex size-7 items-center justify-center rounded-full bg-black/90 border border-white/20 text-white hover:text-[#FFE600] hover:border-[#FFE600] shadow-lg transition-colors"
        >
          <ChevronLeft className="size-4" />
        </button>
      )}

      {/* Right Scroll Arrow (shows when more tabs exist on the right) */}
      {canScrollRight && (
        <button
          type="button"
          onClick={() => scrollByAmount(180)}
          aria-label="Scroll divisions right"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 flex size-7 items-center justify-center rounded-full bg-black/90 border border-white/20 text-[#FFE600] border-[#FFE600]/40 hover:border-[#FFE600] shadow-lg transition-colors animate-pulse hover:animate-none"
        >
          <ChevronRight className="size-4" />
        </button>
      )}

      {/* Scrollable Tab Strip Container */}
      <div
        ref={containerRef}
        role="tablist"
        aria-label="Divisions"
        onScroll={checkScroll}
        className="relative flex items-center overflow-x-auto scrollbar-none snap-x border-b border-white/15 scroll-smooth px-1"
      >
        {divisions.map((d) => {
          const isActive = d.id === selectedId;
          return (
            <button
              key={d.id}
              ref={(el) => {
                tabRefs.current[d.id] = el;
              }}
              role="tab"
              aria-selected={isActive}
              onClick={() => onSelect(d.id)}
              className={`snap-start relative shrink-0 px-3 py-2.5 sm:px-3.5 sm:py-3 text-xs sm:text-sm font-semibold transition-colors duration-200 whitespace-nowrap outline-none focus-visible:text-[#FFE600] ${
                isActive
                  ? "text-[#FFE600] font-bold"
                  : "text-white/60 hover:text-white"
              }`}
            >
              {d.name}
            </button>
          );
        })}

        {/* Sliding Yellow Underline Indicator */}
        <div
          aria-hidden
          className="absolute bottom-0 h-[3px] bg-[#FFE600] transition-all duration-300 ease-out pointer-events-none rounded-full"
          style={{
            transform: `translateX(${underlineStyle.left}px)`,
            width: `${underlineStyle.width}px`,
          }}
        />
      </div>

      {/* Right Edge Fade indicator when scrollable */}
      {canScrollRight && (
        <div
          aria-hidden
          className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-black via-black/80 to-transparent"
        />
      )}

      {/* Left Edge Fade indicator when scrolled */}
      {canScrollLeft && (
        <div
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black via-black/80 to-transparent"
        />
      )}
    </div>
  );
}
