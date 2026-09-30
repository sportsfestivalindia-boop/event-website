import Link from "next/link";
import { EVENT, registerHref } from "@/data/festival";
import { inr } from "@/lib/format";
import { Icon, WhatsAppGlyph } from "./icons";

/** Preview builds show unconfirmed facts with a TBC badge; production (NEXT_PUBLIC_SHOW_TBC=0) hides them. */
export const PREVIEW = process.env.NEXT_PUBLIC_SHOW_TBC !== "0";
export const live = <T extends { tbc?: unknown }>(items: T[]) => (PREVIEW ? items : items.filter((i) => !i.tbc));

export function Tbc({ note }: { note?: string }) {
  if (!PREVIEW) return null;
  return (
    <span title={note} className="ml-2 inline-block shrink-0 self-start rounded-sm border border-red-500 px-1 align-middle font-sans text-[9px] leading-[14px] font-semibold tracking-normal text-red-500 normal-case">
      TBC{note ? <span className="sr-only">: {note}</span> : null}
    </span>
  );
}

export function Cta({
  label = "Register now",
  href = registerHref(),
  micro = true,
  tone = "gold",
  id,
  className = "",
  wide = false,
}: {
  label?: string;
  href?: string;
  micro?: boolean;
  tone?: "gold" | "ink";
  id?: string;
  className?: string;
  wide?: boolean;
}) {
  return (
    <div className={`flex flex-col gap-3 ${wide ? "w-full" : "w-full sm:w-fit"} ${className}`}>
      <Link id={id} href={href} className={`btn btn-${tone} ${wide ? "w-full" : "w-full sm:min-w-[260px]"}`} data-cta={id ?? label}>
        {label}
        <Icon name="arrow" className="arr size-5" />
      </Link>
      {micro && <p className="text-xs text-muted">2-min signup · UPI enabled · Instant WhatsApp confirmation</p>}
    </div>
  );
}

export function WhatsAppLink({ label = "Questions? WhatsApp us", className = "" }: { label?: string; className?: string }) {
  return (
    <a href={EVENT.whatsappHref} target="_blank" rel="noopener" className={`group inline-flex items-center gap-2 text-sm font-semibold ${className}`}>
      <WhatsAppGlyph className="size-5 text-wa" />
      <span className="underline decoration-line underline-offset-4 group-hover:decoration-current">{label}</span>
    </a>
  );
}

/** Headline + short gold rule (from the hero) + optional lead. */
export function SectionHead({ title, lead, className = "", center = false }: { title: React.ReactNode; lead?: React.ReactNode; className?: string; center?: boolean }) {
  return (
    <header className={`mb-10 md:mb-14 ${center ? "mx-auto text-center" : ""} ${className}`}>
      <h2 className={`display text-[clamp(2.6rem,7vw,5.5rem)] ${center ? "mx-auto" : ""} max-w-[18ch]`} data-reveal style={{ "--i": 1 } as React.CSSProperties}>
        {title}
      </h2>
      <span data-rule className={`mt-6 block h-[3px] w-24 bg-gold ${center ? "mx-auto origin-center" : ""}`} />
      {lead && (
        <p className={`mt-6 max-w-[46ch] text-lg text-muted ${center ? "mx-auto" : ""}`} data-reveal style={{ "--i": 2 } as React.CSSProperties}>
          {lead}
        </p>
      )}
    </header>
  );
}

export const Gold = ({ children }: { children: React.ReactNode }) => <span className="text-gold">{children}</span>;

export function Section({ id, theme = "ink", children, className = "" }: { id?: string; theme?: "ink" | "paper" | "gold"; children: React.ReactNode; className?: string }) {
  return (
    <section id={id} className={`t-${theme} relative scroll-mt-16 px-5 py-20 md:px-10 md:py-28 ${className}`}>
      <div className="mx-auto w-full">{children}</div>
    </section>
  );
}

/** Art-directed slot for original photography — swapped file-for-file later. */
export function MediaSlot({ label, ratio, className = "" }: { label: string; ratio: string; className?: string }) {
  return (
    <div className={`finder-frame relative overflow-hidden rounded-xl ${className}`}>
      {PREVIEW && <span className="absolute top-4 left-6 text-[10px] tracking-wide text-muted uppercase">Photo · {label} · {ratio}</span>}
    </div>
  );
}

export const feeLabel = `Register — ${inr(EVENT.fee)}`;
