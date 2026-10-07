import { validUtr } from "@/lib/pay";
import { istNow, toSheet } from "@/lib/sheet";
import { isAdmin, seal, ticketNo, ticketReady } from "@/lib/ticket";

/** Staff only: after checking the payment in the Yes Bank app, issue the athlete's ticket. */
export async function POST(req: Request) {
  if (!ticketReady()) return Response.json({ error: "Ticket system not set up yet: ADMIN_KEY in Vercel is missing or shorter than 12 characters." }, { status: 503 });
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  if (!isAdmin(b.key)) return Response.json({ error: "Wrong staff password." }, { status: 401 });

  const s = (k: string, max = 120) => String(b[k] ?? "").trim().slice(0, max);
  const utr = s("utr");
  const amount = Number(b.amount);
  if (!validUtr(utr)) return Response.json({ error: "UTR must be 12 digits." }, { status: 400 });
  if (s("name").length < 2) return Response.json({ error: "Enter the athlete’s name." }, { status: 400 });
  if (!s("category")) return Response.json({ error: "Choose the category." }, { status: 400 });
  if (!Number.isFinite(amount) || amount < 0 || amount > 1_00_000) return Response.json({ error: "Check the amount." }, { status: 400 });
  const regId = s("regId", 20).toUpperCase();

  const t = ticketNo(utr);
  const token = seal({ t, n: s("name", 80), c: s("category"), w: s("when"), a: amount, u: utr, r: regId || undefined, i: new Date().toISOString() });
  const url = new URL(`/ticket/${token}`, req.url).toString();
  // Logs every ticket in the sheet; the sheet refuses a UTR that already has a ticket for another athlete (reused screenshot).
  const sheet = await toSheet("ticket", { regId, utr, ticketNo: t, ticketUrl: url, verifiedAt: istNow(), name: s("name", 80), phone: s("phone", 10), category: s("category"), fee: amount });
  if (sheet?.duplicate) return Response.json({ error: `This UTR already has a ticket (${sheet.duplicate}). Do not issue another — ask the athlete for their own payment screenshot.` }, { status: 409 });
  return Response.json({ ticketNo: t, url });
}
