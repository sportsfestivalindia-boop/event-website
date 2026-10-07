import type { Metadata } from "next";
import { Wordmark } from "@/components/icons";
import { TicketDesk } from "./TicketDesk";

export const metadata: Metadata = { title: "Ticket desk · Staff", robots: { index: false, follow: false } };

export default function TicketDeskPage() {
  return (
    <main className="t-ink min-h-[100svh] px-5 py-8">
      <div className="mx-auto max-w-xl">
        <Wordmark />
        <h1 className="display mt-10 text-5xl">
          Ticket <span className="text-gold">desk</span>
        </h1>
        <p className="mt-2 mb-8 text-muted">Staff only. Verify the payment screenshot against the bank, then issue and send the athlete’s ticket.</p>
        <TicketDesk />
      </div>
    </main>
  );
}
