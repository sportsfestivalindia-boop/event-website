import type { Metadata } from "next";
import Link from "next/link";
import QRCode from "qrcode";
import { DOCUMENTS, EVENT } from "@/data/festival";
import { inr } from "@/lib/format";
import { unseal } from "@/lib/ticket";
import { Icon, Wordmark } from "@/components/icons";

export const metadata: Metadata = { title: "Your ticket · Sports Festival 2026", robots: { index: false, follow: false } };

export default async function TicketPage({ params }: PageProps<"/ticket/[token]">) {
  const { token } = await params;
  const t = unseal(token);

  if (!t)
    return (
      <main className="t-ink grid min-h-[100svh] place-items-center px-5 text-center">
        <div className="max-w-sm">
          <Wordmark />
          <h1 className="display mt-10 text-5xl">Ticket not valid</h1>
          <p className="mt-3 text-muted">This link is incomplete or has been changed. Open the exact link AOGA sent you on WhatsApp, or message {EVENT.phone}.</p>
        </div>
      </main>
    );

  const qr = await QRCode.toDataURL(`${t.t} · ${t.n} · ${t.c}`, { margin: 1, width: 360 });
  const issued = new Date(t.i).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });

  return (
    <main className="t-ink min-h-[100svh] px-5 py-10">
      <div className="mx-auto max-w-md">
        <div className="overflow-hidden rounded-2xl bg-ink ring-1 ring-gold/60 shadow-[0_30px_80px_-30px_#ffb81c77]">
          <div className="flex items-center justify-between bg-gold px-5 py-3 text-ink">
            <span className="text-xs font-bold tracking-[0.2em] uppercase">Official athlete ticket</span>
            <span className="text-xs font-bold">4–6 DEC 2026</span>
          </div>
          <div className="p-6">
            <div className="flex items-start justify-between gap-3">
              <Wordmark />
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-wa/15 px-2.5 py-1 text-[10px] font-bold text-wa uppercase">
                <Icon name="check" className="size-3" /> Payment verified
              </span>
            </div>
            <p className="mt-6 text-xs text-muted uppercase">Athlete</p>
            <p className="display text-4xl leading-tight">{t.n}</p>
            <p className="mt-4 text-xs text-muted uppercase">Category</p>
            <p className="font-semibold">{t.c}</p>
            {t.w && <p className="mt-1 text-sm text-gold">{t.w}</p>}

            <div className="mt-6 grid grid-cols-[1fr_auto] items-end gap-4 border-t border-dashed border-line pt-5">
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted uppercase">Ticket no.</p>
                  <p className="display text-3xl tracking-wider whitespace-nowrap text-gold">{t.t}</p>
                </div>
                {t.r && (
                  <div>
                    <p className="text-xs text-muted uppercase">Registration ID</p>
                    <p className="font-semibold tracking-wide">{t.r}</p>
                  </div>
                )}
                <div className="text-xs text-muted">
                  {inr(t.a)} paid · UTR ••••{t.u.slice(-4)}
                  <br />
                  Issued {issued}
                </div>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element -- generated data URL */}
              <img src={qr} alt={`Check-in code for ticket ${t.t}`} width={120} height={120} className="size-28 rounded-md bg-white p-1.5" />
            </div>
            <p className="mt-5 text-xs text-muted">
              {EVENT.venue}, {EVENT.city}
            </p>
          </div>
        </div>
        <p className="mt-4 text-center text-xs text-muted">Show this ticket (screenshot is fine) and your Government ID at the check-in desk.</p>

        <div className="card mt-6 p-5">
          <p className="text-sm font-semibold">Bring on event day</p>
          <ul className="mt-3 space-y-1.5 text-sm text-muted">
            {DOCUMENTS.map((d) => (
              <li key={d} className="flex gap-2">
                <Icon name="check" className="size-4 shrink-0 text-gold" /> {d}
              </li>
            ))}
          </ul>
        </div>
        <Link href="/" className="btn btn-line mt-8 w-full">
          Festival website
        </Link>
      </div>
    </main>
  );
}
