import { CHAMPIONSHIPS, EVENT, categoryCount, paidPlaces } from "@/data/festival";
import { Icon } from "../icons";
import { Tbc } from "../ui";

export function FactRail() {
  const facts = [
    { icon: "calendar", v: EVENT.dateLabel, l: "3 days of competition" },
    { icon: "pin", v: "Bhubaneswar", l: EVENT.venue, tbc: EVENT.tbc.venue },
    { icon: "trophy", v: `${CHAMPIONSHIPS.length} championships`, l: `${categoryCount}+ categories` },
    { icon: "medal", v: `${paidPlaces}+ cash prizes`, l: "Up to 5 paid places per category" },
    { icon: "shield", v: "Organised by AOGA", l: EVENT.regdNo, tbc: EVENT.tbc.identity },
  ];
  return (
    <div className="border-y border-line bg-stone/60">
      <ul className="rail mx-auto max-w-[1240px] py-5 md:grid md:grid-cols-5 md:gap-0 md:px-5">
        {facts.map((f, i) => (
          <li key={f.v} className="flex w-[70vw] max-w-[260px] items-start gap-3 md:w-auto md:max-w-none md:border-l md:border-line md:px-5 md:first:border-l-0 md:first:pl-0" data-reveal style={{ "--i": i } as React.CSSProperties}>
            <Icon name={f.icon} className="mt-1 size-5 shrink-0 text-gold" />
            <div>
              <p className="display text-2xl leading-none">{f.v}</p>
              <p className="mt-1 text-xs text-mute">
                {f.l}
                {f.tbc && <Tbc note={f.tbc} />}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
