import type { Metadata, Viewport } from "next";
import { Anton, Poppins } from "next/font/google";
import Script from "next/script";
import "./globals.css";

// Anton: display, Poppins: body — both carry the ₹ glyph.
const anton = Anton({ variable: "--font-anton", weight: "400", subsets: ["latin", "latin-ext"] });
const poppins = Poppins({ variable: "--font-poppins", weight: ["400", "500", "600", "700"], subsets: ["latin", "latin-ext"] });

const title = "India’s Biggest Sports Festival 2026 · Bodybuilding, Powerlifting, Dangal & more · Bhubaneswar";
const description =
  "Six championships — bodybuilding & physique, powerlifting, arm wrestling, Dangal, boxing and a marathon. 4–6 December 2026, Baramunda Ground, Bhubaneswar. Organised by the All Odisha Gym Association. ₹1.5 Crore in prize money for the winners.";
// Link previews (WhatsApp, Facebook, X): the poster, not a blank card
const cover = { url: "/img/og-cover.jpg", width: 1200, height: 630, alt: "India’s Biggest Sports Festival 2026 — ₹1.5 Crore prize money, 4–6 December, Bhubaneswar" };

export const metadata: Metadata = {
  metadataBase: new URL("https://sportsfestivalindia.com"),
  title,
  description,
  icons: { icon: "/img/icon-512.png", apple: "/img/icon-512.png" },
  openGraph: { type: "website", siteName: "India’s Biggest Sports Festival 2026", title, description, url: "/", locale: "en_IN", images: [cover] },
  twitter: { card: "summary_large_image", title, description, images: [cover] },
};

export const viewport: Viewport = { themeColor: "#0a0a0a" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${anton.variable} ${poppins.variable} antialiased`} suppressHydrationWarning>
      <head>
        {/* reveal-on-scroll only when JS runs; ?shot disables it for QA screenshots */}
        <script dangerouslySetInnerHTML={{ __html: "if(!/[?&]shot/.test(location.search))document.documentElement.classList.add('js')" }} />
      </head>
      <body className="t-ink">
        {children}
        {/* Meta Pixel + ad attribution, supplied by the ads team. Do not add a second pixel snippet. */}
        <Script src="/aoga-tracking.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
