"use client";

import Image from "next/image";
import { useState } from "react";

// The "how to register, pay and get your ticket" video (built in ~/Motion/sports-festival-tutorial; demo athlete,
// non-payable sample QR). Loads nothing until tapped, then plays full screen with sound.
const SRC = "/video/how-to-register.mp4";
const POSTER = "/video/how-to-register.jpg";

/** Tappable card → full-screen player. `start` (seconds) jumps straight to a part, e.g. the payment steps. */
export function TutorialVideo({ title, note, tag, start = 0 }: { title: string; note: string; tag?: string; start?: number }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} className="group flex w-full items-center gap-4 rounded-2xl border border-yellow/40 bg-gradient-to-r from-yellow/[0.08] via-black to-orange/[0.08] p-3.5 text-left transition-all hover:border-yellow hover:bg-black/80 hover:shadow-[0_4px_25px_-5px_rgba(255,222,0,0.25)]">
        <span className="relative shrink-0 overflow-hidden rounded-xl">
          <Image src={POSTER} alt="" width={60} height={96} className="h-24 w-[60px] rounded-xl object-cover transition-transform duration-300 group-hover:scale-105" />
          <span className="absolute inset-0 grid place-items-center bg-black/30">
            <span className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-yellow to-orange text-black shadow-[0_0_15px_rgba(255,222,0,0.5)] transition-transform duration-300 group-hover:scale-110">
              <svg viewBox="0 0 24 24" className="ml-0.5 size-4" fill="currentColor" aria-hidden>
                <path d="M7 4.5v15l13-7.5z" />
              </svg>
            </span>
          </span>
        </span>
        <span className="min-w-0 flex-1">
          {tag && <span className="mb-1 inline-block rounded-md bg-gradient-to-r from-orange to-yellow px-2 py-0.5 text-[10px] font-extrabold tracking-wider text-black uppercase">{tag}</span>}
          <span className="block font-bold text-white group-hover:text-yellow transition-colors">{title}</span>
          <span className="mt-0.5 block text-xs text-white/70">{note}</span>
        </span>
      </button>
      {open && (
        <div role="dialog" aria-modal="true" aria-label={title} className="fixed inset-0 z-50 grid place-items-center bg-black/90 p-4" onClick={() => setOpen(false)}>
          <video
            src={`${SRC}#t=${start}`}
            poster={start ? undefined : POSTER}
            controls
            autoPlay
            playsInline
            className="max-h-[85svh] w-auto max-w-full rounded-xl bg-black"
            onClick={(e) => e.stopPropagation()}
          />
          <button onClick={() => setOpen(false)} className="btn btn-line absolute top-4 right-4 !min-h-0 !px-4 !py-2 text-sm">
            ✕ Close
          </button>
        </div>
      )}
    </>
  );
}
