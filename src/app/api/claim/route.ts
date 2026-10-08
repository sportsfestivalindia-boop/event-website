import { validUtr } from "@/lib/pay";
import { istNow, toSheet } from "@/lib/sheet";
import { issueTicket, ticketReady } from "@/lib/ticket";

type Claim = {
  regId?: string;
  ticketUrl?: string;
  verified?: boolean;
  duplicate?: boolean;
  error?: string;
  row?: { name: string; phone: string; category: string; fee: number };
  bank?: { amount: number } | null;
};

/**
 * Public, safe to call repeatedly: "I paid registration X (or: I registered with mobile M) with UTR Y — is it confirmed?"
 * Called by the athlete's browser (payment screen and /verify, polling) and by the Make scenario when Yes Bank's credit
 * alert arrives. A ticket is issued only when Yes Bank's own alert for that UTR is in the sheet, the amount covers the
 * fee and the UTR has not been used by anyone else — a typed UTR alone proves nothing.
 */
export async function POST(req: Request) {
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const regId = String(b.regId ?? "").trim().toUpperCase();
  const phone = String(b.phone ?? "").replace(/\D/g, "").slice(-10);
  const utr = String(b.utr ?? "").replace(/\D/g, "");
  const byPhone = !/^SF26-[0-9A-F]{6}$/.test(regId);
  if (byPhone && !/^[6-9]\d{9}$/.test(phone)) return Response.json({ error: "Enter the 10-digit mobile number you registered with." }, { status: 400 });
  if (!validUtr(utr)) return Response.json({ error: "The UTR / UPI reference is the 12-digit number on your payment screen." }, { status: 400 });

  const c = (await toSheet("claim", byPhone ? { phone, utr, at: istNow() } : { regId, utr, at: istNow() })) as Claim | null;
  if (!c) return Response.json({ pending: true }); // sheet slow (Apps Script cold start) or down: the page keeps polling, then falls back to WhatsApp
  if (c.error === "not-found")
    return byPhone
      ? Response.json({ error: "No registration found for this mobile number. Use the number you registered with, or WhatsApp us." }, { status: 404 })
      : Response.json({ pending: true }); // registration row may still be on its way to the sheet
  if (c.duplicate) return Response.json({ error: "This UTR is already linked to another registration. Please send your payment screenshot on WhatsApp." }, { status: 409 });
  if (c.verified) return Response.json({ verified: true, ticketUrl: c.ticketUrl || null });
  if (!c.bank || !c.row || !ticketReady()) return Response.json({ pending: true });
  if (c.bank.amount < c.row.fee)
    return Response.json({ error: `We received ₹${c.bank.amount} but the fee is ₹${c.row.fee}. Please WhatsApp us — we’ll sort it out.` }, { status: 402 });

  const r = await issueTicket({ ...c.row, amount: c.bank.amount, utr, regId: c.regId || regId }, req.url);
  if ("duplicate" in r) return Response.json({ error: "This UTR is already linked to another registration. Please send your payment screenshot on WhatsApp." }, { status: 409 });
  return Response.json({ verified: true, ticketUrl: r.url, ticketNo: r.ticketNo });
}
