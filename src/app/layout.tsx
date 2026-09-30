import type { Metadata, Viewport } from "next";
import { Anton, Poppins } from "next/font/google";
import "./globals.css";

// Anton: display (has ₹). Poppins: body + Hindi (has ₹ and Devanagari).
const anton = Anton({ variable: "--font-anton", weight: "400", subsets: ["latin", "latin-ext"] });
const poppins = Poppins({ variable: "--font-poppins", weight: ["400", "500", "600", "700"], subsets: ["latin", "latin-ext", "devanagari"] });

export const metadata: Metadata = {
  title: "Sports Festival 2026 · India’s Biggest Sports Festival · ₹1.5 Crore Prize Pool",
  description:
    "7 championships. ₹1,50,00,000 in prizes. 4–6 December 2026, Bhubaneswar, Odisha. Organised by the All Odisha Gym Association. Register for ₹5,000.",
  icons: { icon: "/img/icon-512.png", apple: "/img/icon-512.png" },
};

export const viewport: Viewport = { themeColor: "#0a0a0a" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${anton.variable} ${poppins.variable} antialiased`} suppressHydrationWarning>
      <head>
        {/* reveal-on-scroll only when JS runs; ?shot disables it for QA screenshots */}
        <script dangerouslySetInnerHTML={{ __html: "if(!/[?&]shot/.test(location.search))document.documentElement.classList.add('js')" }} />
      </head>
      <body className="t-ink">{children}</body>
    </html>
  );
}
