import Link from "next/link";
import { EVENT, registerHref } from "@/data/festival";
import { inr } from "@/lib/format";
import { Icon } from "./icons";

/** Preview builds show unconfirmed facts with a TBC badge; production (NEXT_PUBLIC_SHOW_TBC=0) hides them. */
export const PREVIEW = process.env.NEXT_PUBLIC_SHOW_TBC !== "0";
export const live = <T extends { tbc?: unknown }>(items: T[]) => (PREVIEW ? items : items.filter((i) => !i.tbc));

export function Tbc({ note }: { note?: string }) {
  if (!PREVIEW) return null;
  return (
    <span title={note} className="mono ml-2 inline-block shrink-0 self-start border border-signal px-1 align-middle text-[9px] leading-[14px] font-medium tracking-normal text-signal normal-case">
      TBC{note ? <span className="sr-only">: {note}</span> : null}
    </span>
  );
}

export function Cta({
  label = `Register — ${inr(EVENT.fee)}`,
  href = registerHref(),
  micro = true,
  tone = "signal",
  id,
  className = "",
  wide = false,
}: {
  label?: string;
  href?: string;
  micro?: boolean;
  tone?: "signal" | "ink";
  id?: string;
  className?: string;
  wide?: boolean;
}) {
  return (
    <div className={`flex flex-col gap-3 ${wide ? "w-full" : "w-full sm:w-fit"} ${className}`}>
      <Link id={id} href={href} className={`btn btn-${tone} ${wide ? "w-full" : "w-full sm:min-w-[300px]"}`} data-cta={id ?? label}>
        {label}
        <Icon name="arrow" className="arr size-5" />
      </Link>
      {micro && <p className="text-xs text-muted">2-minute signup · UPI · Instant WhatsApp confirmation</p>}
    </div>
  );
}

export function WhatsAppLink({ label = "Questions? WhatsApp us", className = "" }: { label?: string; className?: string }) {
  return (
    <a href={EVENT.whatsappHref} target="_blank" rel="noopener" className={`group inline-flex items-center gap-2 text-sm font-medium ${className}`}>
      <Icon name="whatsapp" className="size-5" />
      <span className="underline decoration-line underline-offset-4 group-hover:decoration-current">{label}</span>
    </a>
  );
}

export function SectionHead({ index, label, title, lead, className = "" }: { index: string; label: string; title: React.ReactNode; lead?: React.ReactNode; className?: string }) {
  return (
    <header className={`mb-12 md:mb-20 ${className}`}>
      <div className="mb-10 flex items-center gap-4 md:mb-14">
        <span className="mono text-xs text-muted">{index}</span>
        <span className="label">{label}</span>
        <span data-rule className="h-px flex-1 bg-line" />
      </div>
      <h2 className="display max-w-[15ch] text-[clamp(2.7rem,8.2vw,7rem)]" data-reveal>
        {title}
      </h2>
      {lead && (
        <p className="lede mt-6 md:mt-8" data-reveal style={{ "--i": 1 } as React.CSSProperties}>
          {lead}
        </p>
      )}
    </header>
  );
}

export function Section({ id, theme = "ink", children, className = "" }: { id?: string; theme?: "ink" | "paper" | "signal"; children: React.ReactNode; className?: string }) {
  return (
    <section id={id} className={`t-${theme} relative scroll-mt-16 px-5 py-24 md:px-10 md:py-40 ${className}`}>
      <div className="mx-auto max-w-[1360px]">{children}</div>
    </section>
  );
}

/** Art-directed slot for original photography/film — swapped file-for-file later. */
export function MediaSlot({ label, ratio, className = "" }: { label: string; ratio: string; className?: string }) {
  return (
    <div className={`finder-frame relative overflow-hidden ${className}`}>
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,#0000002e)]" />
      {PREVIEW && (
        <span className="mono absolute top-4 left-6 text-[10px] tracking-wide text-muted uppercase">
          IMG · {label} · {ratio}
        </span>
      )}
    </div>
  );
}
