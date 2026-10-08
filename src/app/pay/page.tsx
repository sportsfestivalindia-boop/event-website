import type { Metadata } from "next";
import Link from "next/link";
import QRCode from "qrcode";
import { RegisterFlow } from "@/components/RegisterFlow";
import { Wordmark } from "@/components/icons";
import { CHAMPIONSHIPS, EVENT } from "@/data/festival";
import { upiLink } from "@/lib/pay";
import { toSheet } from "@/lib/sheet";

export const metadata: Metadata = { title: "Complete your payment · Sports Festival 2026", robots: { index: false, follow: false } };

type Row = { ok?: boolean; name?: string; phone?: string; email?: string; city?: string; dob?: string; category?: string; fee?: number; status?: string; ticketUrl?: string };

/** Personal payment link from the reminder email: reopens this athlete's payment step (QR, UTR, WhatsApp screenshot). */
export default async function PayPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const id = String((await searchParams).id ?? "").trim().toUpperCase();
  const r = /^SF26-[0-9A-F]{6}$/.test(id) ? ((await toSheet("lookup", { regId: id })) as Row | null) : { ok: false };

  if (!r) return <Note title="Please try again">We couldn’t load your registration just now. Refresh this page in a minute, or WhatsApp us your payment screenshot.</Note>;
  if (!r.ok) return <Note title="Registration not found">This link looks incomplete. Open the exact link from your email, or register again — if you already paid, WhatsApp us your payment screenshot.</Note>;
  if (r.status === "Verified")
    return (
      <Note title="You’re already confirmed 🎉">
        Your payment for {r.category} is verified.{" "}
        {r.ticketUrl ? (
          <a href={r.ticketUrl} className="font-semibold text-gold underline underline-offset-2">
            Open your ticket
          </a>
        ) : (
          "Your ticket has been emailed to you."
        )}
      </Note>
    );

  const upi = upiLink(r.fee ?? 0, id);
  const qr = upi ? await QRCode.toDataURL(upi, { margin: 1, width: 520, errorCorrectionLevel: "M" }) : null;
  return (
    <main className="t-ink min-h-[100svh]">
      <RegisterFlow
        initial={{}}
        resume={{
          pending: { regId: id, amount: r.fee ?? 0, label: r.category ?? "", upi, qr },
          sport: CHAMPIONSHIPS.find((c) => (r.category ?? "").startsWith(c.sport))?.id,
          name: r.name ?? "",
          dob: r.dob ?? "",
          phone: r.phone ?? "",
          email: r.email ?? "",
          city: r.city ?? "",
        }}
      />
    </main>
  );
}

function Note({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="t-ink grid min-h-[100svh] place-items-center px-5 text-center">
      <div className="max-w-sm">
        <Wordmark />
        <h1 className="display mt-10 text-4xl">{title}</h1>
        <p className="mt-3 text-muted">{children}</p>
        <div className="mt-8 flex flex-col gap-3">
          <a href={EVENT.whatsappHref} target="_blank" rel="noopener" className="btn bg-wa text-white">
            WhatsApp {EVENT.paymentsWhatsApp.display}
          </a>
          <Link href="/register" className="btn btn-line">
            Register
          </Link>
        </div>
      </div>
    </main>
  );
}
