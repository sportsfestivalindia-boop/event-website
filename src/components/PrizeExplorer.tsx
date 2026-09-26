"use client";

import { useState } from "react";
import { CHAMPIONSHIPS, EVENT, championshipTotal, divisionTotal, unallocated } from "@/data/festival";
import { inr, inrShort, ordinal, prizeLabel } from "@/lib/format";
import { Icon, Pictogram } from "./icons";
import { PREVIEW, Tbc } from "./ui";

const SHADES = ["#f6d27a", "#e7bd52", "#d4a537", "#bf9230", "#a97f28", "#936d21", "#7d5c1b"];

export function PrizeExplorer() {
  const ranked = [...CHAMPIONSHIPS].sort((a, b) => championshipTotal(b) - championshipTotal(a));
  const [open, setOpen] = useState<string | null>(null);
  const pct = (n: number) => (n / EVENT.prizePool) * 100;

  return (
    <div>
      {/* the gold bar: ₹1.5 Cr split by championship */}
      <div className="flex h-14 w-full overflow-hidden rounded-md border border-gold/50 md:h-20" role="img" aria-label="Prize pool split by championship">
        {ranked.map((c, i) =>
          championshipTotal(c) ? (
            <button
              key={c.id}
              onClick={() => setOpen(c.id)}
              title={`${c.sport}: ${inr(championshipTotal(c))}`}
              style={{ width: `${pct(championshipTotal(c))}%`, background: SHADES[i] }}
              className="relative h-full border-r border-ink/40 transition-[filter] hover:brightness-110"
            >
              <span className="sr-only">{c.sport}</span>
            </button>
          ) : null,
        )}
        {PREVIEW && unallocated > 0 && (
          <div
            style={{ width: `${pct(unallocated)}%` }}
            className="grid h-full place-items-center bg-[repeating-linear-gradient(135deg,#c8241c33_0_8px,transparent_8px_16px)] px-2 text-center text-[10px] font-bold tracking-[.12em] text-[#ff8a80] uppercase"
          >
            {inrShort(unallocated)} not yet allocated
          </div>
        )}
      </div>
      {PREVIEW && unallocated > 0 && (
        <p className="mt-2 text-xs text-[#ff8a80]">
          Preview only: published prize tables total {inr(EVENT.prizePool - unallocated)}. Boxing, weightlifting and marathon prizes needed (blocker B2).
        </p>
      )}

      {/* ranked list → expand to category tables */}
      <ul className="mt-8 divide-y divide-line border-y border-line">
        {ranked.map((c, i) => {
          const total = championshipTotal(c);
          const isOpen = open === c.id;
          return (
            <li key={c.id}>
              <button onClick={() => setOpen(isOpen ? null : c.id)} aria-expanded={isOpen} className="grid w-full grid-cols-[auto_1fr_auto] items-center gap-4 py-4 text-left">
                <Pictogram id={c.pictogram} className="size-8 text-gold" />
                <span>
                  <span className="display block text-2xl md:text-3xl">{c.sport}</span>
                  <span className="mt-1.5 block h-1.5 w-full max-w-md overflow-hidden rounded-full bg-line">
                    <span className="block h-full rounded-full" style={{ width: `${Math.max(pct(total) * 2.4, total ? 4 : 0)}%`, background: SHADES[i] }} />
                  </span>
                </span>
                <span className="flex items-center gap-3">
                  <span className="display tnum text-2xl text-gold md:text-3xl">{total ? inrShort(total) : "TBA"}</span>
                  <Icon name="plus" className={`size-5 text-mute transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`} />
                </span>
              </button>
              {isOpen && (
                <div className="pb-6">
                  {c.divisions.length === 0 ? (
                    <p className="text-sm text-ivory/70">
                      Prize table to be announced.
                      <Tbc note={c.tbc} />
                    </p>
                  ) : (
                    <div className="grid gap-3 md:grid-cols-2">
                      {c.divisions.map((d) => (
                        <div key={d.id} className="card p-4">
                          <div className="flex items-baseline justify-between gap-3">
                            <p className="display text-xl">
                              {d.name}
                              {d.tbc && <Tbc note={d.tbc} />}
                            </p>
                            <p className="tnum text-sm text-gold">{inr(divisionTotal(d))}</p>
                          </div>
                          <p className="mt-1 text-xs text-mute">
                            {d.classes.length > 1 ? `${d.classes.length} classes: ${d.classes.join(" · ")}` : "Single open category"}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                            {d.prizes.map((p, j) => (
                              <span key={j} className="tnum">
                                <span className="text-mute">{ordinal(j)}</span> {prizeLabel(p)}
                              </span>
                            ))}
                          </div>
                          {d.extras?.map((e) => (
                            <p key={e.label} className="mt-2 flex justify-between border-t border-line pt-2 text-sm">
                              <span className="text-molten">{e.label}</span>
                              <b className="tnum">{prizeLabel(e.prize)}</b>
                            </p>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
