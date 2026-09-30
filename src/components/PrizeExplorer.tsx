"use client";

import { useState } from "react";
import { CHAMPIONSHIPS, championshipTotal, divisionTotal } from "@/data/festival";
import { inr, inrShort, ordinal, prizeLabel } from "@/lib/format";
import { Icon } from "./icons";
import { Tbc } from "./ui";

/** The prize sheet: ₹1.5 Cr as one bar split by championship, then every category on demand. */
export function PrizeExplorer() {
  const ranked = [...CHAMPIONSHIPS].sort((a, b) => championshipTotal(b) - championshipTotal(a));
  const [open, setOpen] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const shown = ranked.reduce((t, c) => t + championshipTotal(c), 0);
  const pct = (n: number) => (n / shown) * 100;
  const hot = hover ?? open;

  return (
    <div>
      <div className="flex h-16 w-full gap-[3px] md:h-24" role="img" aria-label="Prize pool split by championship">
        {ranked.map((c) =>
          championshipTotal(c) ? (
            <button
              key={c.id}
              onClick={() => setOpen(c.id)}
              onMouseEnter={() => setHover(c.id)}
              onMouseLeave={() => setHover(null)}
              title={`${c.sport}: ${inr(championshipTotal(c))}`}
              style={{ width: `${pct(championshipTotal(c))}%` }}
              className={`h-full transition-colors duration-300 ${hot === c.id ? "bg-gold" : "bg-ink"}`}
            >
              <span className="sr-only">{c.sport}</span>
            </button>
          ) : null,
        )}
      </div>

      <ul className="mt-12 border-b border-line">
        {ranked.map((c, i) => {
          const total = championshipTotal(c);
          const isOpen = open === c.id;
          return (
            <li key={c.id} className="border-t border-line" onMouseEnter={() => setHover(c.id)} onMouseLeave={() => setHover(null)}>
              <button onClick={() => setOpen(isOpen ? null : c.id)} aria-expanded={isOpen} className="grid w-full grid-cols-[2rem_1fr_auto_1.5rem] items-center gap-3 py-5 text-left md:grid-cols-[3rem_1fr_16rem_9rem_2rem] md:py-6">
                <span className="text-sm font-semibold text-muted">0{i + 1}</span>
                <span className="display text-2xl md:text-4xl">{c.sport}</span>
                <span className="hidden h-[3px] bg-line md:block">
                  <span className={`block h-full transition-colors ${hot === c.id ? "bg-gold" : "bg-fg"}`} style={{ width: `${Math.min(100, (total / 6000000) * 100)}%` }} />
                </span>
                <span className="display tnum text-right text-xl md:text-3xl">{total ? inrShort(total) : "Soon"}</span>
                <Icon name="plus" className={`size-5 justify-self-end transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`} />
              </button>

              {isOpen && (
                <div className="pb-10 md:pl-[3.75rem]">
                  {c.divisions.length === 0 ? (
                    <p className="text-muted">
                      Prize table to be announced.
                      <Tbc note={c.tbc} />
                    </p>
                  ) : (
                    <div className="grid gap-x-10 gap-y-8 md:grid-cols-2">
                      {c.divisions.map((d) => (
                        <div key={d.id}>
                          <div className="flex items-baseline justify-between border-b border-fg pb-2">
                            <p className="font-bold">
                              {d.name}
                              {d.tbc && <Tbc note={d.tbc} />}
                            </p>
                            <p className="tnum text-sm font-semibold">{inr(divisionTotal(d))}</p>
                          </div>
                          <p className="mt-2 text-xs text-muted">{d.classes.length > 1 ? `${d.classes.length} classes · ${d.classes.join(" · ")}` : "Single open category"}</p>
                          <table className="tnum mt-3 w-full text-sm">
                            <tbody>
                              {d.prizes.map((p, j) => (
                                <tr key={j} className="border-b border-line">
                                  <td className="py-1.5"><span className="flex items-center gap-2"><span className={`medal !size-6 !text-[10px] ${j < 3 ? `medal-${j + 1}` : ""}`}>{j + 1}</span>{ordinal(j)}</span></td>
                                  <td className="py-1.5 text-right font-semibold">{prizeLabel(p)}</td>
                                </tr>
                              ))}
                              {d.extras?.map((e) => (
                                <tr key={e.label} className="border-b border-line">
                                  <td className="py-1.5 font-semibold">🏆 {e.label}</td>
                                  <td className="py-1.5 text-right font-semibold">{prizeLabel(e.prize)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
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
