import type { Metadata } from "next";
import Link from "next/link";
import { VerifyForm } from "@/components/VerifyForm";
import { Wordmark } from "@/components/icons";

export const metadata: Metadata = { title: "Verify my payment · Sports Festival 2026", description: "Already paid by UPI? Enter your mobile number and UTR to get your ticket." };

export default function VerifyPage() {
  return (
    <main className="t-ink min-h-[100svh] px-5 py-8">
      <div className="mx-auto max-w-md">
        <Link href="/" aria-label="Back to home">
          <Wordmark />
        </Link>
        <h1 className="display mt-10 text-5xl">
          Verify my <span className="text-gold">payment</span>
        </h1>
        <p className="mt-2 mb-8 text-muted">Already paid by UPI? Enter the mobile number you registered with and the 12-digit UTR from your payment screen to get your ticket.</p>
        <VerifyForm />
      </div>
    </main>
  );
}
