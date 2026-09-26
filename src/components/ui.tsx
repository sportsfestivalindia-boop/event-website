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
    <span
      title={note}
      className="ml-1.5 inline-flex h-fit shrink-0 self-start -translate-y-px items-center rounded-sm border border-sindoor/70 bg-sindoor/15 px-1.5 py-px align-middle font-sans text-[10px] font-bold tracking-[.14em] text-[#ff8a80] normal-case"
    >
      TBC{note ? <span className="sr-only">: {note}</span> : null}
    </span>
  );
}

export function Cta({
  label = `Register now — ${inr(EVENT.fee)}`,
  href = registerHref(),
  micro = true,
  id,
  className = "",
  wide = false,
}: {
  label?: string;
  href?: string;
  micro?: boolean;
  id?: string;
  className?: string;
  wide?: boolean;
}) {
  return (
    <div className={`flex flex-col gap-2 ${wide ? "w-full" : "w-full sm:w-fit"} ${className}`}>
      <Link id={id} href={href} className={`btn btn-gold ${wide ? "w-full" : "w-full sm:w-auto"}`} data-cta={id ?? label}>
        {label}
        <Icon name="arrow" className="size-5" />
      </Link>
      {micro && <p className="text-center text-xs text-mute sm:text-left">2-min signup · UPI · Instant WhatsApp confirmation</p>}
    </div>
  );
}

export function WhatsAppLink({ label = "Questions? WhatsApp us", className = "" }: { label?: string; className?: string }) {
  return (
    <a href={EVENT.whatsappHref} target="_blank" rel="noopener" className={`inline-flex items-center gap-2 text-sm font-semibold text-ivory/90 hover:text-molten ${className}`}>
      <Icon name="whatsapp" className="size-5 text-[#3ecf6e]" />
      {label}
    </a>
  );
}

export function SectionHead({ eyebrow, title, lead, center = false }: { eyebrow: string; title: React.ReactNode; lead?: React.ReactNode; center?: boolean }) {
  return (
    <header className={`mb-10 md:mb-14 ${center ? "mx-auto text-center" : ""} max-w-3xl`} data-reveal>
      <p className="eyebrow mb-4">{eyebrow}</p>
      <h2 className="display text-[clamp(2.9rem,11vw,5.6rem)]">{title}</h2>
      {lead && <p className="mt-5 text-lg text-ivory/75 md:text-xl">{lead}</p>}
    </header>
  );
}

export function Section({ id, children, className = "" }: { id?: string; children: React.ReactNode; className?: string }) {
  return (
    <section id={id} className={`relative scroll-mt-20 px-5 py-20 md:py-32 ${className}`}>
      <div className="mx-auto max-w-[1240px]">{children}</div>
    </section>
  );
}

/** Placeholder for original photography/film — swapped file-for-file later. */
export function MediaSlot({ label, className = "" }: { label: string; className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-[10px] border border-line bg-[radial-gradient(80%_70%_at_70%_20%,#d4a53733,transparent_60%),linear-gradient(180deg,#211a14,#0b0a08)] ${className}`}>
      <div className="haze absolute inset-0" />
      {PREVIEW && (
        <span className="absolute bottom-3 left-3 rounded-sm bg-ink/80 px-2 py-1 text-[10px] font-semibold tracking-[.14em] text-mute uppercase">
          Placeholder · {label}
        </span>
      )}
    </div>
  );
}
