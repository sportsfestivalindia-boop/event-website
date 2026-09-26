import Link from "next/link";
import { EVENT } from "@/data/festival";
import { Wordmark } from "@/components/icons";
import { WhatsAppLink } from "@/components/ui";

// Phase 4 replaces this with the 3-step registration sheet.
export default function RegisterStub() {
  return (
    <main className="t-ink grid min-h-[100svh] place-items-center px-5">
      <div className="max-w-md">
        <Wordmark />
        <h1 className="display mt-16 text-6xl">Registration opens shortly.</h1>
        <p className="mt-6 text-muted">The registration flow is being built. To reserve your spot now, message the {EVENT.organiserShort} team.</p>
        <WhatsAppLink className="mt-8" label="Register via WhatsApp" />
        <p className="mt-16">
          <Link href="/" className="text-sm text-muted hover:text-fg">← Back to the festival</Link>
        </p>
      </div>
    </main>
  );
}
