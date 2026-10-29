import type { Metadata } from "next";
import Link from "next/link";
import { Wordmark } from "@/components/icons";
import { EVENT } from "@/data/festival";
import { inr } from "@/lib/format";
import { toSheet } from "@/lib/sheet";
import { getRegistrationFromFirestore } from "@/lib/firebase";
import { PayResumeButton } from "./PayResumeButton";

export const metadata: Metadata = {
  title: "Complete your payment · Sports Festival 2026",
  robots: { index: false, follow: false },
};

type Row = {
  ok?: boolean;
  name?: string;
  phone?: string;
  email?: string;
  category?: string;
  fee?: number;
  status?: string;
  ticketUrl?: string;
};

export default async function PayPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const id = String((await searchParams).id ?? "").trim().toUpperCase();

  // Try Firestore first
  const dbRec = id && /^SF26-[0-9A-F]{6}$/.test(id) ? await getRegistrationFromFirestore(id) : null;
  const sheetRec = !dbRec && id && /^SF26-[0-9A-F]{6}$/.test(id)
    ? ((await toSheet("lookup", { regId: id })) as Row | null)
    : null;

  const r = dbRec || (sheetRec?.ok ? sheetRec : null);

  if (!r && id && /^SF26-[0-9A-F]{6}$/.test(id) && !sheetRec) {
    return (
      <Note title="Please try again">
        We couldn’t load your registration just now. Refresh this page in a minute or reach out on WhatsApp.
      </Note>
    );
  }

  if (!r) {
    return (
      <Note title="Registration not found">
        This link looks incomplete. Open the exact link from your email or register again.
      </Note>
    );
  }

  if (r.status === "Paid" || r.status === "Verified") {
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
  }

  const fee = r.fee ?? 0;
  const label = r.category ?? "Sports Festival 2026";
  const isTest = Boolean((r as any).isTest || fee === 1);

  return (
    <main className="t-ink min-h-[100svh] px-4 py-12 flex flex-col items-center justify-center">
      <div className="w-full max-w-md mx-auto">
        <div className="flex justify-center mb-6">
          <Link href="/" aria-label="Home">
            <Wordmark />
          </Link>
        </div>

        <div className="rounded-3xl border border-white/15 bg-white/[0.03] backdrop-blur-xl p-6 sm:p-8 shadow-2xl text-center">
          <div className="mx-auto size-14 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-2xl mb-4">
            💳
          </div>

          <h1 className="display text-2xl sm:text-3xl font-extrabold text-white">
            Complete Your Registration
          </h1>
          <p className="mt-2 text-sm text-white/70">
            Pay securely through PayU hosted checkout using UPI, Cards, Net Banking, or Wallets.
          </p>

          <div className="mt-6 rounded-2xl border border-white/10 bg-black/40 p-4 text-left text-xs space-y-2.5 mb-6">
            <div className="flex justify-between border-b border-white/10 pb-2">
              <span className="text-white/50 uppercase font-bold">Registration ID</span>
              <span className="font-mono font-bold text-gold">{id}</span>
            </div>
            {r.name && (
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-white/50 uppercase font-bold">Athlete Name</span>
                <span className="font-bold text-white">{r.name}</span>
              </div>
            )}
            <div className="flex justify-between border-b border-white/10 pb-2">
              <span className="text-white/50 uppercase font-bold">Category</span>
              <span className="font-semibold text-white/90 truncate max-w-[200px]">{label}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50 uppercase font-bold">Payable Fee</span>
              <span className="font-bold text-white">
                {isTest ? "₹1 (Test Fee)" : inr(fee)}
              </span>
            </div>
          </div>

          <PayResumeButton regId={id} amount={fee} label={label} isTest={isTest} />

          <div className="mt-6 pt-5 border-t border-white/10 text-xs text-white/50">
            <Link
              href={`/verify?id=${encodeURIComponent(id)}`}
              className="text-gold underline underline-offset-2 hover:text-yellow"
            >
              Payment done but no confirmation? Verify your payment
            </Link>
          </div>
        </div>
      </div>
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
