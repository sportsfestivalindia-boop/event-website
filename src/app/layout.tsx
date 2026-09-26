import type { Metadata, Viewport } from "next";
import { Big_Shoulders, Inter } from "next/font/google";
import "./globals.css";

// latin-ext carries the ₹ glyph (U+20B9)
const shoulders = Big_Shoulders({ variable: "--font-shoulders", subsets: ["latin", "latin-ext"], axes: ["opsz"], adjustFontFallback: false, fallback: ["Arial Narrow", "sans-serif"] });
const inter = Inter({ variable: "--font-inter", subsets: ["latin", "latin-ext"] });

export const metadata: Metadata = {
  title: "India’s Biggest Sports Festival 2026 · ₹1.5 Crore Prize Pool · Register ₹5,000",
  description:
    "7 championships. ₹1,50,00,000 in prizes. 4–6 December 2026, Bhubaneswar, Odisha. Organised by the All Odisha Gym Association. Register for ₹5,000.",
};

export const viewport: Viewport = { themeColor: "#0b0a08" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${shoulders.variable} ${inter.variable} antialiased`} suppressHydrationWarning>
      <head>
        {/* enables reveal-on-scroll only when JS runs */}
        <script dangerouslySetInnerHTML={{ __html: "if(!/[?&]shot/.test(location.search))document.documentElement.classList.add('js')" }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
