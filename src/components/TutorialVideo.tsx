"use client";

import Image from "next/image";
import { useState } from "react";

// The "how to register, pay and get your ticket" video (built in ~/Motion/sports-festival-tutorial; demo athlete,
// non-payable sample QR). Loads nothing until tapped, then plays full screen with sound.
const SRC = "/video/how-to-register.mp4";
const POSTER = "/video/how-to-register.jpg";

/** Tappable card → full-screen player. `start` (seconds) jumps straight to a part, e.g. the payment steps. */
export function TutorialVideo({ title, note, start = 0 }: { title: string; note: string; start?: number }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} className="flex w-full items-center gap-4 rounded-xl border border-gold/60 bg-gold/10 p-3 text-left transition-colors hover:bg-gold/15">
        <span className="relative shrink-0">
          <Image src={POSTER} alt="" width={54} height={96} className="h-24 w-[54px] rounded-md object-cover" />
          <span className="absolute inset-0 grid place-items-center">
            <span className="grid size-9 place-items-center rounded-full bg-gold text-ink shadow-lg">
              <svg viewBox="0 0 24 24" className="ml-0.5 size-4" fill="currentColor" aria-hidden>
                <path d="M7 4.5v15l13-7.5z" />
              </svg>
            </span>
          </span>
        </span>
        <span>
          <span className="block font-semibold">{title}</span>
          <span className="mt-0.5 block text-sm text-muted">{note}</span>
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
