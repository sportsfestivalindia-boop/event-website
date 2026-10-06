import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Wordmark } from "@/components/icons";
import { Footer } from "@/components/sections/Sections";
import { EVENT, registerHref } from "@/data/festival";
import { PAGES, UPDATED } from "./content";

export const dynamicParams = false;
export const generateStaticParams = () => Object.keys(PAGES).map((slug) => ({ slug }));

export async function generateMetadata({ params }: PageProps<"/[slug]">): Promise<Metadata> {
  const page = PAGES[(await params).slug];
  return page ? { title: `${page.title} · ${EVENT.name} ${EVENT.year}`, description: page.lead } : {};
}

export default async function InfoPage({ params }: PageProps<"/[slug]">) {
  const page = PAGES[(await params).slug];
  if (!page) notFound();
  return (
    <>
      <header className="t-ink sticky top-0 z-50 border-b border-line bg-ink/85 backdrop-blur-xl">
        <div className="flex h-16 w-full items-center gap-6 px-5 md:h-20 md:px-10">
          <Link href="/" aria-label="Sports Festival — home">
            <Wordmark />
          </Link>
          <Link href={registerHref()} className="btn btn-gold ml-auto !min-h-10 shrink-0 !px-4 !text-xs md:!min-h-11 md:!px-5 md:!text-sm">
            Register
          </Link>
        </div>
      </header>
      <main className="t-ink px-5 pt-14 pb-24 md:px-10 md:pt-20">
        <article className="mx-auto max-w-3xl text-white/80">
          <p className="label text-gold">
            {EVENT.name} {EVENT.year}
          </p>
          <h1 className="display mt-4 text-[clamp(2.6rem,7vw,4.5rem)] text-white">{page.title}</h1>
          <span className="mt-6 block h-[3px] w-24 bg-gold" />
          <p className="mt-6 text-lg">{page.lead}</p>
          <p className="mt-2 text-xs text-muted">Last updated {UPDATED}</p>
          {page.body}
        </article>
      </main>
      <Footer />
    </>
  );
}
