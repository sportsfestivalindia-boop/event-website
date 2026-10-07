import { validUtr } from "@/lib/pay";
import { istNow, toSheet } from "@/lib/sheet";
import { issueTicket, ticketReady } from "@/lib/ticket";

type Claim = {
  ticketUrl?: string;
  verified?: boolean;
  duplicate?: boolean;
  error?: string;
  row?: { name: string; phone: string; category: string; fee: number };
  bank?: { amount: number } | null;
};

/**
 * Public, safe to call repeatedly: "I paid registration X with UTR Y — is it confirmed?"
 * Called by the athlete's browser (polling) and by the Make scenario when Yes Bank's credit alert arrives.
 * A ticket is issued only when Yes Bank's own alert for that UTR is in the sheet, the amount covers the fee
 * and the UTR has not been used by anyone else — a typed UTR alone proves nothing.
 */
export async function POST(req: Request) {
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const regId = String(b.regId ?? "").trim().toUpperCase();
  const utr = String(b.utr ?? "").replace(/\D/g, "");
  if (!/^SF26-[0-9A-F]{6}$/.test(regId)) return Response.json({ error: "Registration ID not recognised." }, { status: 400 });
  if (!validUtr(utr)) return Response.json({ error: "The UTR / UPI reference is the 12-digit number on your payment screen." }, { status: 400 });

  const c = (await toSheet("claim", { regId, utr, at: istNow() })) as Claim | null;
  if (!c) return Response.json({ error: "We couldn’t check right now. Please send your payment screenshot on WhatsApp instead." }, { status: 503 });
  if (c.error === "not-found") return Response.json({ error: "Registration ID not found. Please send your payment screenshot on WhatsApp." }, { status: 404 });
  if (c.duplicate) return Response.json({ error: "This UTR is already linked to another registration. Please send your payment screenshot on WhatsApp." }, { status: 409 });
  if (c.verified) return Response.json({ verified: true, ticketUrl: c.ticketUrl || null });
  if (!c.bank || !c.row || !ticketReady()) return Response.json({ pending: true });
  if (c.bank.amount < c.row.fee)
    return Response.json({ error: `We received ₹${c.bank.amount} but the fee is ₹${c.row.fee}. Please WhatsApp us — we’ll sort it out.` }, { status: 402 });

  const r = await issueTicket({ ...c.row, amount: c.bank.amount, utr, regId }, req.url);
  if ("duplicate" in r) return Response.json({ error: "This UTR is already linked to another registration. Please send your payment screenshot on WhatsApp." }, { status: 409 });
  return Response.json({ verified: true, ticketUrl: r.url, ticketNo: r.ticketNo });
}
