"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface WeightRulerProps {
  classes: string[];
  selectedClass: string;
  onSelect: (k: string) => void;
}

export function WeightRuler({
  classes,
  selectedClass,
  onSelect,
}: WeightRulerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const tickRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const isDraggingRef = useRef(false);

  const currentIndex = Math.max(0, classes.indexOf(selectedClass));

  const [markerStyle, setMarkerStyle] = useState<{
    left: number;
    width: number;
  }>({ left: 0, width: 0 });

  // Update marker position
  useEffect(() => {
    const activeTick = tickRefs.current[selectedClass];
    const track = trackRef.current;
    if (activeTick && track) {
      const trackRect = track.getBoundingClientRect();
      const tickRect = activeTick.getBoundingClientRect();

      setMarkerStyle({
        left: tickRect.left - trackRect.left + track.scrollLeft,
        width: tickRect.width,
      });

      // Auto center active tick in scroll view
      activeTick.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [selectedClass, classes]);

  const handlePrev = () => {
    if (currentIndex > 0) {
      onSelect(classes[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (currentIndex < classes.length - 1) {
      onSelect(classes[currentIndex + 1]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      handlePrev();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      handleNext();
    }
  };

  // Dragging interaction
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    handlePointerMove(e);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || !trackRef.current) return;
    const trackRect = trackRef.current.getBoundingClientRect();
    const x = e.clientX - trackRect.left;
    const progress = Math.max(0, Math.min(x / trackRect.width, 1));
    const targetIdx = Math.round(progress * (classes.length - 1));
    if (classes[targetIdx] && classes[targetIdx] !== selectedClass) {
      onSelect(classes[targetIdx]);
    }
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  return (
    <div
      ref={containerRef}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="slider"
      aria-label="Weight or height class"
      aria-valuemin={0}
      aria-valuemax={classes.length - 1}
      aria-valuenow={currentIndex}
      aria-valuetext={selectedClass}
      className="relative w-full select-none outline-none focus-visible:ring-1 focus-visible:ring-[#FFE600]"
    >
      {/* Big Header Value Display */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-white/50 block font-semibold">
            Selected Class
          </span>
          <div className="display text-3xl sm:text-4xl font-black text-[#FFE600] leading-tight">
            {selectedClass}
          </div>
        </div>

        {/* Prev / Next Arrows */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentIndex <= 0}
            aria-label="Previous class"
            className="flex size-9 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-white transition-colors hover:border-[#FFE600] hover:bg-[#FFE600] hover:text-black disabled:opacity-30 disabled:pointer-events-none"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={currentIndex >= classes.length - 1}
            aria-label="Next class"
            className="flex size-9 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-white transition-colors hover:border-[#FFE600] hover:bg-[#FFE600] hover:text-black disabled:opacity-30 disabled:pointer-events-none"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      </div>

      {/* Ruler Selector Box */}
      <div className="relative rounded-2xl border border-white/15 bg-black/60 p-4 sm:p-5 overflow-hidden">
        {/* Horizontal Center Guide Line */}
        <div
          aria-hidden
          className="absolute left-4 right-4 top-[38px] h-[1px] bg-white/15 pointer-events-none"
        />

        {/* Scrollable / Draggable Track */}
        <div
          ref={trackRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="relative flex items-center overflow-x-auto scrollbar-none snap-x py-2 px-4 cursor-grab active:cursor-grabbing scroll-smooth"
        >
          {/* Sliding Yellow Thumb / Marker */}
          <div
            aria-hidden
            className="absolute top-1 bottom-1 bg-[#FFE600]/15 border border-[#FFE600] rounded-xl transition-all duration-300 ease-out pointer-events-none shadow-[0_0_20px_rgba(255,230,0,0.25)]"
            style={{
              transform: `translateX(${markerStyle.left}px)`,
              width: `${markerStyle.width}px`,
            }}
          />

          {classes.map((cls, idx) => {
            const isSelected = cls === selectedClass;
            return (
              <button
                key={cls}
                ref={(el) => {
                  tickRefs.current[cls] = el;
                }}
                type="button"
                onClick={() => onSelect(cls)}
                className="snap-center relative flex min-w-[76px] sm:min-w-[88px] flex-col items-center justify-center px-3 py-2 transition-transform duration-200"
              >
                {/* Tick Mark */}
                <span
                  aria-hidden
                  className={`block rounded-full transition-all duration-200 ${
                    isSelected
                      ? "h-6 w-[3px] bg-[#FFE600] shadow-[0_0_10px_#FFE600]"
                      : idx % 2 === 0
                      ? "h-3.5 w-[2px] bg-white/35"
                      : "h-2.5 w-[1.5px] bg-white/20"
                  }`}
                />

                {/* Tick Label */}
                <span
                  className={`mt-3 text-xs sm:text-sm font-semibold tracking-wide whitespace-nowrap transition-colors ${
                    isSelected
                      ? "text-[#FFE600] font-black scale-105"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  {cls}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
