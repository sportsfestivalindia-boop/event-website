"use client";

import { useState } from "react";
import { AllTicketsDirectory } from "./AllTicketsDirectory";
import { TicketDesk } from "./TicketDesk";
import { TicketLookup } from "./TicketLookup";

export function TicketAdminTabs() {
  const [activeTab, setActiveTab] = useState<"directory" | "issue" | "lookup">("directory");

  return (
    <div className="space-y-8">
      {/* Navigation Tabs */}
      <div className="flex border-b border-line gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("directory")}
          className={`pb-3 px-4 font-semibold text-sm whitespace-nowrap transition-colors border-b-2 cursor-pointer ${
            activeTab === "directory" ? "border-gold text-gold" : "border-transparent text-muted hover:text-white"
          }`}
        >
          📋 All Tickets & Athletes List
        </button>
        <button
          onClick={() => setActiveTab("issue")}
          className={`pb-3 px-4 font-semibold text-sm whitespace-nowrap transition-colors border-b-2 cursor-pointer ${
            activeTab === "issue" ? "border-gold text-gold" : "border-transparent text-muted hover:text-white"
          }`}
        >
          🎟️ Issue Ticket (Spot / UPI)
        </button>
        <button
          onClick={() => setActiveTab("lookup")}
          className={`pb-3 px-4 font-semibold text-sm whitespace-nowrap transition-colors border-b-2 cursor-pointer ${
            activeTab === "lookup" ? "border-gold text-gold" : "border-transparent text-muted hover:text-white"
          }`}
        >
          🔍 Single Ticket Search
        </button>
      </div>

      {activeTab === "directory" && (
        <section>
          <div className="mb-4">
            <h2 className="display text-3xl">
              All <span className="text-gold">Tickets & Registrations</span>
            </h2>
            <p className="text-sm text-muted">
              Live directory of all registered athletes and tickets. Search by name, change categories with 1 click, or export to Excel/CSV.
            </p>
          </div>
          <AllTicketsDirectory />
        </section>
      )}

      {activeTab === "issue" && (
        <section className="max-w-xl mx-auto">
          <div className="mb-6">
            <h2 className="display text-4xl">
              Issue <span className="text-gold">Ticket</span>
            </h2>
            <p className="text-sm text-muted">
              Staff only. Verify payment screenshot or collect spot cash, then generate athlete ticket.
            </p>
          </div>
          <TicketDesk />
        </section>
      )}

      {activeTab === "lookup" && (
        <section className="max-w-xl mx-auto">
          <div className="mb-6">
            <h2 className="display text-3xl">
              Find <span className="text-gold">Single Ticket</span>
            </h2>
            <p className="text-sm text-muted">
              Look up any athlete by Registration ID or 10-digit WhatsApp number to view or resend their ticket.
            </p>
          </div>
          <TicketLookup />
        </section>
      )}
    </div>
  );
}

