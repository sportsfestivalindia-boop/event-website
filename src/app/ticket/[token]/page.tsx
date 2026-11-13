import type { Metadata } from "next";
import Link from "next/link";
import QRCode from "qrcode";
import { DOCUMENTS, EVENT } from "@/data/festival";
import { inr } from "@/lib/format";
import { unseal, whenFor, ticketNo, Ticket } from "@/lib/ticket";
import { getRegistrationFromFirestore, getAllRegistrationsFromFirestore } from "@/lib/firebase";
import { toSheet } from "@/lib/sheet";
import { Icon, Wordmark, WhatsAppGlyph } from "@/components/icons";

export const metadata: Metadata = { title: "Your ticket · Sports Festival 2026", robots: { index: false, follow: false } };

export default async function TicketPage({ params }: PageProps<"/ticket/[token]">) {
  const { token } = await params;
  let t: Ticket | null = unseal(token);

  if (!t) {
    const raw = decodeURIComponent(token).trim();
    const regMatch = raw.match(/SF26-[0-9A-Z]{6}/i);
    const lookupId = regMatch ? regMatch[0].toUpperCase() : raw.toUpperCase();

    // 1. Try Firestore direct lookup
    let dbRec = await getRegistrationFromFirestore(lookupId).catch(() => null);

    // If not found directly, search all records for matching ticketNo, phone or ticketUrl
    if (!dbRec) {
      const all = await getAllRegistrationsFromFirestore().catch(() => []);
      dbRec = all.find(
        (r) =>
          r.regId === lookupId ||
          r.ticketNo === lookupId ||
          (raw.length > 10 && r.phone === raw) ||
          (token.length > 20 && r.ticketUrl && r.ticketUrl.includes(token.slice(0, 20)))
      ) || null;
    }

    if (dbRec && (dbRec.status === "Paid" || dbRec.status === "Verified")) {
      t = {
        t: dbRec.ticketNo || ticketNo(dbRec.utr || dbRec.regId || lookupId),
        n: dbRec.name,
        c: dbRec.category,
        w: whenFor(dbRec.category),
        a: dbRec.fee || 5000,
        u: dbRec.utr || "",
        r: dbRec.regId || lookupId,
        p: dbRec.phone ? dbRec.phone.replace(/\D/g, "").slice(-10) : undefined,
        i: typeof dbRec.createdAt === "string" ? dbRec.createdAt : new Date().toISOString(),
        isTest: dbRec.isTest,
      };
    } else {
      // 2. Try Google Sheet lookup
      const sheetRec = (await toSheet("lookup", { regId: lookupId }).catch(() => null)) as Record<string, unknown> | null;
      if (sheetRec?.ok && (sheetRec.status === "Verified" || sheetRec.status === "Paid")) {
        t = {
          t: (sheetRec.ticketNo as string) || ticketNo((sheetRec.utr as string) || lookupId),
          n: String(sheetRec.name || "Athlete"),
          c: String(sheetRec.category || ""),
          w: whenFor(String(sheetRec.category || "")),
          a: Number(sheetRec.fee) || 5000,
          u: String(sheetRec.utr || ""),
          r: String(sheetRec.regId || lookupId),
          p: sheetRec.phone ? String(sheetRec.phone).replace(/\D/g, "").slice(-10) : undefined,
          i: new Date().toISOString(),
        };
      }
    }
  }

  // If token was unsealed from legacy token without phone, look up phone
  if (t && !t.p && t.r) {
    const dbRec = await getRegistrationFromFirestore(t.r).catch(() => null);
    if (dbRec?.phone) {
      t.p = dbRec.phone.replace(/\D/g, "").slice(-10);
    }
  }

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

  const isTest = Boolean(t.isTest || t.c.includes("TEST"));
  const qr = await QRCode.toDataURL(`${t.t} · ${t.n} · ${t.c}`, { margin: 1, width: 360 });
  const issued = new Date(t.i).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });

  const cleanPhone = t.p ? t.p.replace(/\D/g, "").slice(-10) : "";
  const ticketPermLink = `https://sportsfestivalindia.com/ticket/${t.r || token}`;
  const waTicketMsg = `✅ Official Athlete Ticket — ${EVENT.name}\n\nHi ${t.n}, your ticket (${t.t}) is ready!\nCategory: ${t.c}\nRegistration ID: ${t.r || t.t}\n\nOpen & Download your ticket:\n${ticketPermLink}\n\nShow this ticket and your Government ID at check-in desk.\n${EVENT.datesFull} · ${EVENT.venue}, Bhubaneswar.\n— All Odisha Gym Association`;
  const waTicketUrl = cleanPhone
    ? `https://api.whatsapp.com/send/?phone=91${cleanPhone}&text=${encodeURIComponent(waTicketMsg)}`
    : `https://api.whatsapp.com/send/?text=${encodeURIComponent(waTicketMsg)}`;

  return (
    <main className="t-ink min-h-[100svh] px-5 py-10">
      <div className="mx-auto max-w-md">
        {isTest && (
          <div className="mb-4 rounded-xl border border-amber-500/60 bg-amber-500/15 p-3.5 text-center text-xs font-bold text-amber-300 uppercase tracking-widest shadow-lg">
            ⚠️ TEST TICKET — Gateway Verification Only (Not Valid for Festival Entry)
          </div>
        )}
        <div className="overflow-hidden rounded-2xl bg-black ring-1 ring-gold/60 shadow-[0_30px_80px_-30px_#ff450077]">
          <div className="flex items-center justify-between bg-gold px-5 py-3 text-black">
            <span className="text-xs font-bold tracking-[0.2em] uppercase">
              {isTest ? "TEST VERIFICATION PASS" : "Official athlete ticket"}
            </span>
            <span className="text-xs font-bold">4–6 DEC 2026</span>
          </div>
          <div className="p-6">
            <div className="flex items-start justify-between gap-3">
              <Wordmark />
              <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${isTest ? "bg-amber-500/20 text-amber-300" : "bg-wa/15 text-wa"}`}>
                <Icon name="check" className="size-3" /> {isTest ? "Test Payment Verified" : "Payment verified"}
              </span>
            </div>
            <p className="mt-6 text-xs text-muted uppercase">Athlete</p>
            <p className="display text-4xl leading-tight">{t.n}</p>
            <p className="mt-4 text-xs text-muted uppercase">Category</p>
            <p className="font-semibold text-gold">{t.c}</p>
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
        <a href={`/ticket/${token}/image`} download className="btn btn-gold mt-6 w-full">
          Download ticket
        </a>
        <a
          href={waTicketUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn mt-3 w-full bg-wa text-white hover:brightness-110 flex items-center justify-center gap-2 cursor-pointer font-bold text-sm py-3 rounded-xl shadow-lg"
        >
          <WhatsAppGlyph className="size-5" />
          <span>📲 Send Ticket to WhatsApp {cleanPhone ? `(+91 ${cleanPhone})` : ""}</span>
        </a>
        <p className="mt-3 text-center text-xs text-muted">
          {isTest ? "This is a test pass generated for live payment confirmation." : "Show this ticket (screenshot is fine) and your Government ID at the check-in desk."}
        </p>

        {!isTest && (
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
        )}
        <Link href="/" className="btn btn-line mt-8 w-full">
          Festival website
        </Link>
      </div>
    </main>
  );
}
