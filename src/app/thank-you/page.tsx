import type { Metadata } from "next";
import Link from "next/link";
import { getRegistrationFromFirestore } from "@/lib/firebase";
import { toSheet } from "@/lib/sheet";
import { inr } from "@/lib/format";
import { EVENT } from "@/data/festival";
import { Wordmark } from "@/components/icons";

export const metadata: Metadata = {
  title: "Registration Confirmed — Sports Festival 2026",
  robots: { index: false, follow: false },
};

export default async function ThankYouPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const regId = String(params.id ?? "").trim().toUpperCase();

  // Read record from database (Firestore first, fallback to Sheet lookup)
  let record = regId ? await getRegistrationFromFirestore(regId) : null;
  if (!record && regId && /^SF26-[0-9A-F]{6}$/.test(regId)) {
    const sheetData = (await toSheet("lookup", { regId })) as Record<string, unknown> | null;
    if (sheetData && sheetData.ok) {
      record = {
        regId,
        name: String(sheetData.name || "Athlete"),
        phone: String(sheetData.phone || ""),
        email: String(sheetData.email || ""),
        category: String(sheetData.category || "Sports Festival 2026"),
        fee: Number(sheetData.fee || 0),
        status: (sheetData.status as any) || "Paid",
        ticketUrl: sheetData.ticketUrl ? String(sheetData.ticketUrl) : undefined,
        utr: sheetData.utr ? String(sheetData.utr) : undefined,
      };
    }
  }

  return (
    <main className="t-ink min-h-[100svh] px-4 py-12 flex flex-col items-center justify-center">
      <div className="w-full max-w-xl mx-auto">
        <div className="flex justify-center mb-6">
          <Link href="/" aria-label="Home">
            <Wordmark />
          </Link>
        </div>

        <div className="rounded-3xl border border-white/15 bg-white/[0.03] backdrop-blur-xl p-6 sm:p-8 shadow-2xl text-center">
          {/* Confirmed Icon */}
          <div className="mx-auto size-16 sm:size-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-3xl sm:text-4xl shadow-inner mb-5">
            🎉
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-2">
            Payment Verified & Confirmed
          </span>

          <h1 className="display text-3xl sm:text-4xl font-extrabold text-white mt-1">
            You&apos;re Officially In!
          </h1>
          <p className="mt-2 text-sm sm:text-base text-white/70">
            Welcome to the arena. Your athlete registration has been confirmed and locked.
          </p>

          {/* Details Card */}
          <div className="mt-6 rounded-2xl border border-white/10 bg-black/40 p-4 sm:p-5 text-left space-y-3.5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs uppercase tracking-wider text-white/50 font-bold">
                Registration ID
              </span>
              <span className="font-mono text-sm sm:text-base font-extrabold text-gold">
                {regId || "SF26-PENDING"}
              </span>
            </div>

            {record?.name && (
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-xs uppercase tracking-wider text-white/50 font-bold">
                  Athlete Name
                </span>
                <span className="text-sm sm:text-base font-bold text-white">
                  {record.name}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs uppercase tracking-wider text-white/50 font-bold">
                Category
              </span>
              <span className="text-sm font-semibold text-white/90 text-right truncate max-w-[240px]">
                {record?.category || "Registered Category"}
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs uppercase tracking-wider text-white/50 font-bold">
                Amount Paid
              </span>
              <span className="text-sm sm:text-base font-bold text-emerald-400">
                {record?.isTest || record?.fee === 1
                  ? "₹1 (Test Fee)"
                  : record?.fee
                  ? inr(record.fee)
                  : "Paid"}
              </span>
            </div>

            {record?.utr && (
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-white/50 font-bold">
                  PayU / Bank Ref
                </span>
                <span className="font-mono text-xs sm:text-sm text-white/70">
                  {record.utr}
                </span>
              </div>
            )}
          </div>

          {/* Ticket / Actions */}
          <div className="mt-6 space-y-3">
            {record?.ticketUrl ? (
              <a
                href={record.ticketUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-gold w-full !min-h-13 rounded-xl text-black font-extrabold text-base tracking-wide shadow-lg flex items-center justify-center gap-2"
              >
                <span>View & Download Official Ticket</span>
                <span aria-hidden="true">→</span>
              </a>
            ) : (
              <Link
                href={`/ticket/${regId}`}
                className="btn btn-gold w-full !min-h-13 rounded-xl text-black font-extrabold text-base tracking-wide shadow-lg flex items-center justify-center gap-2"
              >
                <span>View Official Ticket</span>
                <span aria-hidden="true">→</span>
              </Link>
            )}

            <Link
              href="/profile"
              className="btn btn-line w-full !min-h-12 rounded-xl border-white/20 text-white font-semibold text-sm hover:border-gold hover:text-gold flex items-center justify-center gap-2"
            >
              <span>Login with Google to view your profile and events</span>
            </Link>
          </div>

          {/* Delivery Note */}
          <div className="mt-6 pt-5 border-t border-white/10 text-xs text-white/60 space-y-1">
            <p>
              Your digital ticket has been sent to your registered WhatsApp and email.
            </p>
            <p>
              Need help? Reach out on WhatsApp:{" "}
              <a
                href={EVENT.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold underline underline-offset-2"
              >
                {EVENT.paymentsWhatsApp.display}
              </a>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-xs uppercase tracking-wider text-white/50 hover:text-white font-medium"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}

