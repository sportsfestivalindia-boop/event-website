import type { Metadata, Viewport } from "next";
import { Geist_Mono, Mona_Sans } from "next/font/google";
import "./globals.css";

// Both carry the ₹ glyph (U+20B9) in latin-ext.
const mona = Mona_Sans({ variable: "--font-mona", subsets: ["latin", "latin-ext"], axes: ["wdth"] });
const mono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin", "latin-ext"] });

export const metadata: Metadata = {
  title: "India’s Biggest Sports Festival 2026 · ₹1.5 Crore Prize Pool · Register ₹5,000",
  description:
    "7 championships. ₹1,50,00,000 in prizes. 4–6 December 2026, Bhubaneswar, Odisha. Organised by the All Odisha Gym Association. Register for ₹5,000.",
};

export const viewport: Viewport = { themeColor: "#0b0b0c" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${mona.variable} ${mono.variable} antialiased`} suppressHydrationWarning>
      <head>
        {/* reveal-on-scroll only when JS runs; ?shot disables it for QA screenshots */}
        <script dangerouslySetInnerHTML={{ __html: "if(!/[?&]shot/.test(location.search))document.documentElement.classList.add('js')" }} />
      </head>
      <body className="t-ink">{children}</body>
    </html>
  );
}
