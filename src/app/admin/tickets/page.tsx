import type { Metadata } from "next";
import { Wordmark } from "@/components/icons";
import { TicketAdminTabs } from "./TicketAdminTabs";

export const metadata: Metadata = {
  title: "Ticket Management & Directory · Staff",
  robots: { index: false, follow: false },
};

export default function TicketDeskPage() {
  return (
    <main className="t-ink min-h-[100svh] px-4 sm:px-6 py-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <Wordmark />
        <TicketAdminTabs />
      </div>
    </main>
  );
}
