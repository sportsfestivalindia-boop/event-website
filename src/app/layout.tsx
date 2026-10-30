import type { Metadata, Viewport } from "next";
import { Anton, Montserrat } from "next/font/google";
import Script from "next/script";
import { ScrollTopOnLoad } from "./ScrollTopOnLoad";
import "./globals.css";

// Anton: display for all primary headings; Montserrat: all body and normal text
const anton = Anton({
  variable: "--font-anton",
  weight: "400",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const title = "India’s Biggest Sports Festival 2026 · Bodybuilding, Powerlifting, Dangal & more · Bhubaneswar";
const description =
  "Six championships — bodybuilding & physique, powerlifting, arm wrestling, Dangal, boxing and a marathon. 4–6 December 2026, Baramunda Ground, Bhubaneswar. Organised by the All Odisha Gym Association. ₹1.5 Crore in prize money for the winners.";
// Link previews (WhatsApp, Facebook, X): the poster, not a blank card
const cover = { url: "/img/og-cover.jpg", width: 1200, height: 630, alt: "India’s Biggest Sports Festival 2026 — ₹1.5 Crore prize money, 4–6 December, Bhubaneswar" };

export const metadata: Metadata = {
  metadataBase: new URL("https://www.sportsfestivalindia.com"),
  title,
  description,
  icons: { icon: "/img/icon-512.png", apple: "/img/icon-512.png" },
  openGraph: { type: "website", siteName: "India’s Biggest Sports Festival 2026", title, description, url: "/", locale: "en_IN", images: [cover] },
  twitter: { card: "summary_large_image", title, description, images: [cover] },
  verification: {
    google: [
      "DuYmhaA--L-6koZEI0wX0IP4m4zvVDy_zCTY5QlPPXM",
      "e44773b32774749a",
    ],
  },
};

export const viewport: Viewport = { themeColor: "#000000" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${anton.variable} ${montserrat.variable} antialiased`} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Anton&family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet" />
        {/* reveal-on-scroll only when JS runs; ?shot disables it for QA screenshots */}
        <script dangerouslySetInnerHTML={{ __html: "if(!/[?&]shot/.test(location.search))document.documentElement.classList.add('js')" }} />
        {/* Early scroll reset to prevent flash of restored scroll position before hydration */}
        <script dangerouslySetInnerHTML={{ __html: "if('scrollRestoration' in history){history.scrollRestoration='manual';}window.scrollTo(0,0);window.addEventListener('pageshow',function(e){if(e.persisted)window.scrollTo(0,0);});" }} />
      </head>
      <body className="t-ink">
        <ScrollTopOnLoad />
        {children}
        {/* Meta Pixel + ad attribution, supplied by the ads team. Do not add a second pixel snippet. */}
        <Script src="/aoga-tracking.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
