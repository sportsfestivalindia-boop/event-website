import type { Metadata } from "next";
import { Wordmark } from "@/components/icons";
import { TicketDesk } from "./TicketDesk";
import { TicketLookup } from "./TicketLookup";

export const metadata: Metadata = { title: "Ticket desk · Staff", robots: { index: false, follow: false } };

export default function TicketDeskPage() {
  return (
    <main className="t-ink min-h-[100svh] px-5 py-8">
      <div className="mx-auto max-w-xl space-y-10">
        <Wordmark />

        {/* ── Lookup / Resend ── */}
        <section>
          <h2 className="display mt-6 text-3xl">
            Find <span className="text-gold">ticket</span>
          </h2>
          <p className="mt-1 mb-4 text-sm text-muted">Look up any athlete by Registration ID or name to open and resend their ticket.</p>
          <TicketLookup />
        </section>

        <hr className="border-line" />

        {/* ── Issue new ── */}
        <section>
          <h2 className="display text-5xl">
            Issue <span className="text-gold">ticket</span>
          </h2>
          <p className="mt-2 mb-8 text-muted">Staff only. Verify the payment screenshot against the bank, then issue and send the athlete's ticket.</p>
          <TicketDesk />
        </section>
      </div>
    </main>
  );
}
