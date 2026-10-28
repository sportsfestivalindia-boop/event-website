import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import QRCode from "qrcode";
import { EVENT } from "@/data/festival";
import { inr } from "@/lib/format";
import { unseal } from "@/lib/ticket";

// The ticket as a PNG the athlete saves to their phone ("Download ticket"). Same data and check-in code as the ticket page.
const file = (f: string) => readFile(join(process.cwd(), f));
const [anton, poppins, poppinsRupee, poppinsBold, poppinsBoldRupee, mark] = await Promise.all(
  [
    "assets/anton-latin-400-normal.woff",
    "assets/poppins-latin-400-normal.woff",
    "assets/poppins-devanagari-400-normal.woff", // the subset that carries ₹
    "assets/poppins-latin-700-normal.woff",
    "assets/poppins-devanagari-700-normal.woff",
    "public/img/mark.png",
  ].map(file),
);
const logo = `data:image/png;base64,${mark.toString("base64")}`;

const INK = "#000000", GOLD = "#ffde00", ORANGE = "#ff4500", MUTED = "#ffffffaa", LINE = "#ffffff33";

export async function GET(_req: Request, { params }: RouteContext<"/ticket/[token]/image">) {
  const t = unseal((await params).token);
  if (!t) return new Response("Ticket not valid", { status: 404 });

  const qr = await QRCode.toDataURL(`${t.t} · ${t.n} · ${t.c}`, { margin: 1, width: 360 });
  const issued = new Date(t.i).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });
  const label = { fontSize: 24, color: MUTED, textTransform: "uppercase" as const, letterSpacing: 2 };

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: INK, padding: 48, fontFamily: "Poppins, Rupee", color: "#fff" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", border: `3px solid ${GOLD}`, borderRadius: 32, overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "space-between", background: GOLD, color: INK, padding: "22px 40px", fontSize: 26, fontWeight: 700, letterSpacing: 4 }}>
            <span>OFFICIAL ATHLETE TICKET</span>
            <span>4–6 DEC 2026</span>
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "44px 48px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                {/* eslint-disable-next-line @next/next/no-img-element -- rendered to PNG, not HTML */}
                <img src={logo} width={112} height={64} alt="" />
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontFamily: "Anton", fontSize: 38, lineHeight: 1 }}>India’s Biggest</span>
                  <span style={{ fontSize: 18, fontWeight: 700, color: GOLD, letterSpacing: 5, marginTop: 6 }}>SPORTS FESTIVAL 2026</span>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#25d36622", color: "#25d366", borderRadius: 999, padding: "8px 20px", fontSize: 20, fontWeight: 700 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#25d366" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12.5l4.5 4.5L19 7.5" />
                </svg>
                PAYMENT VERIFIED
              </div>
            </div>

            <span style={{ ...label, marginTop: 56 }}>Athlete</span>
            <span style={{ fontFamily: "Anton", fontSize: 84, lineHeight: 1.1 }}>{t.n}</span>
            <span style={{ ...label, marginTop: 28 }}>Category</span>
            <span style={{ fontSize: 34, fontWeight: 700 }}>{t.c}</span>
            {t.w && <span style={{ fontSize: 28, color: GOLD, marginTop: 6 }}>{t.w}</span>}

            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: "auto", paddingTop: 36, borderTop: `3px dashed ${LINE}` }}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={label}>Ticket no.</span>
                <span style={{ fontFamily: "Anton", fontSize: 72, color: GOLD, letterSpacing: 4 }}>{t.t}</span>
                {t.r && <span style={{ ...label, marginTop: 14 }}>Registration ID</span>}
                {t.r && <span style={{ fontSize: 30, fontWeight: 700 }}>{t.r}</span>}
                <span style={{ fontSize: 24, color: MUTED, marginTop: 18 }}>{`${inr(t.a)} paid · UTR ••••${t.u.slice(-4)} · Issued ${issued}`}</span>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element -- rendered to PNG, not HTML */}
              <img src={qr} width={260} height={260} alt="" style={{ background: "#fff", borderRadius: 16, padding: 12 }} />
            </div>
            <span style={{ fontSize: 24, color: MUTED, marginTop: 28 }}>{`${EVENT.venue}, ${EVENT.city}`}</span>
            <span style={{ fontSize: 24, color: "#fff", marginTop: 8 }}>Show this ticket and your Government ID at the check-in desk.</span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1350,
      fonts: [
        { name: "Poppins", data: poppins, weight: 400 },
        { name: "Rupee", data: poppinsRupee, weight: 400 },
        { name: "Poppins", data: poppinsBold, weight: 700 },
        { name: "Rupee", data: poppinsBoldRupee, weight: 700 },
        { name: "Anton", data: anton, weight: 400 },
      ],
      headers: { "Content-Disposition": `attachment; filename="SportsFestival-ticket-${t.t}.png"`, "Cache-Control": "private, max-age=86400" },
    },
  );
}
