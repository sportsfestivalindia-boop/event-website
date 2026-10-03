import Link from "next/link";
import { notFound } from "next/navigation";
import { Wordmark } from "@/components/icons";
import { WhatsAppLink } from "@/components/ui";

const PAGES: Record<string, string> = {
  prizes: "Prize & payout policy",
  rules: "Rules & rulebooks",
  refund: "Refund policy",
  terms: "Terms & conditions",
  privacy: "Privacy policy",
  international: "International athletes",
};

export const dynamicParams = false;
export const generateStaticParams = () => Object.keys(PAGES).map((slug) => ({ slug }));

// Draft placeholder until the organiser-approved text is ready.
export default async function InfoPage({ params }: PageProps<"/[slug]">) {
  const title = PAGES[(await params).slug];
  if (!title) notFound();
  return (
    <main className="t-ink grid min-h-[100svh] place-items-center px-5">
      <div className="max-w-md">
        <Wordmark />
        <h1 className="display mt-14 text-5xl">{title}</h1>
        <p className="mt-4 text-muted">This page is being finalised with the organisers and will be published soon.</p>
        <WhatsAppLink className="mt-8" label="Questions? WhatsApp us" />
        <p className="mt-14">
          <Link href="/" className="text-sm text-muted hover:text-white">← Back to the festival</Link>
        </p>
      </div>
    </main>
  );
}
