import Link from "next/link";
import { EVENT } from "@/data/festival";
import { Crest } from "@/components/icons";
import { WhatsAppLink } from "@/components/ui";

// Phase 4 replaces this with the 3-step registration sheet.
export default function RegisterStub() {
  return (
    <main className="grid min-h-[100svh] place-items-center px-5 text-center">
      <div className="max-w-md">
        <Crest className="mx-auto size-16" />
        <p className="eyebrow mt-8">Registration</p>
        <h1 className="display mt-3 text-6xl">Opening shortly</h1>
        <p className="mt-4 text-ivory/75">The registration flow is being built (Phase 4). To reserve your spot now, message the {EVENT.organiserShort} team.</p>
        <WhatsAppLink className="mt-6" label="Register via WhatsApp" />
        <p className="mt-10">
          <Link href="/" className="text-sm text-mute hover:text-molten">← Back to the festival</Link>
        </p>
      </div>
    </main>
  );
}
