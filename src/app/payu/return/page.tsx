import { unseal, type Ticket } from "@/lib/ticket";
import Link from "next/link";

/**
 * PayU redirects the athlete here after payment (both success and failure).
 * PayU POSTs the form, which browser follows as a GET with query params via surl/furl.
 * We read status from the query string and show appropriate UI.
 */
export default async function PayUReturnPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const p = await searchParams;
  const status   = String(p.status   ?? "").toLowerCase();
  const txnid    = String(p.txnid    ?? "").toUpperCase();
  const error    = String(p.error_Message ?? p.field9 ?? "");
  const ticketUrl = String(p.ticketUrl ?? "");

  // ── Success ──────────────────────────────────────────────────────────────
  if (status === "success") {
    return (
      <main className="t-ink grid min-h-[100svh] place-items-center px-5 text-center">
        <div className="max-w-sm">
          <div className="text-5xl mb-4">🎉</div>
          <h1 className="display text-4xl font-bold">Payment Successful!</h1>
          <p className="mt-3 text-muted">
            Your registration <strong>{txnid}</strong> is confirmed. Your ticket has been
            emailed to you and sent on WhatsApp.
          </p>
          {ticketUrl && (
            <a
              href={ticketUrl}
              className="btn mt-8 block bg-gold text-black font-semibold"
            >
              Open your ticket
            </a>
          )}
          {!ticketUrl && (
            <p className="mt-6 text-sm text-muted">
              If your ticket doesn&apos;t arrive in 2 minutes, use the{" "}
              <Link href="/verify" className="underline text-gold">
                /verify
              </Link>{" "}
              page or WhatsApp us.
            </p>
          )}
          <Link href="/" className="btn btn-line mt-4 block">
            Back to home
          </Link>
        </div>
      </main>
    );
  }

  // ── Failure / cancellation ────────────────────────────────────────────────
  return (
    <main className="t-ink grid min-h-[100svh] place-items-center px-5 text-center">
      <div className="max-w-sm">
        <div className="text-5xl mb-4">❌</div>
        <h1 className="display text-4xl font-bold">Payment Failed</h1>
        <p className="mt-3 text-muted">
          {error || "Your payment could not be processed. No money has been deducted."}
        </p>
        <p className="mt-2 text-sm text-muted">Registration ID: {txnid}</p>
        <Link
          href={`/pay?id=${txnid}`}
          className="btn mt-8 block bg-gold text-black font-semibold"
        >
          Try again
        </Link>
        <Link href="/" className="btn btn-line mt-4 block">
          Back to home
        </Link>
      </div>
    </main>
  );
}
