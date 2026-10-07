import Link from "next/link";
import { EVENT, registerHref } from "@/data/festival";
import { inr } from "@/lib/format";
import { Icon, WhatsAppGlyph } from "./icons";

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
      {micro && <p className="text-xs text-muted">{PAY_LINE}</p>}
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

/** One line under every CTA: how payment works. */
export const PAY_LINE = "2-min signup · Pay by UPI QR · Confirmation on WhatsApp";

/** Policy links athletes expect on every page, checkout included. */
export const POLICY_LINKS = [
  ["About us", "/about"],
  ["Contact us", "/contact"],
  ["Terms & conditions", "/terms"],
  ["Privacy policy", "/privacy"],
  ["Refund & cancellation", "/refund"],
  ["Shipping & delivery", "/shipping"],
  ["Prize & payout policy", "/prizes"],
  ["Rules", "/rules"],
] as const;

export function PolicyLinks({ className = "" }: { className?: string }) {
  return (
    <nav aria-label="Policies" className={`flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-muted ${className}`}>
      {POLICY_LINKS.map(([l, h]) => (
        <Link key={h} href={h} className="underline-offset-4 hover:text-white hover:underline">
          {l}
        </Link>
      ))}
    </nav>
  );
}

export const feeLabel = `Register — ${inr(EVENT.fee)}`;
