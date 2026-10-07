import { validUtr } from "@/lib/pay";
import { istNow, toSheet } from "@/lib/sheet";

/** Athlete paid by UPI QR and entered the UTR → mark their sheet row "Pending" for AOGA to match against the Yes Bank statement. */
export async function POST(req: Request) {
  const b = (await req.json().catch(() => ({}))) as { regId?: string; utr?: string };
  if (!/^SF26-[0-9A-F]{6}$/.test(b.regId ?? "")) return Response.json({ error: "Registration not found." }, { status: 400 });
  if (!validUtr(b.utr)) return Response.json({ error: "Enter the 12-digit UTR number." }, { status: 400 });
  const saved = await toSheet("utr", { regId: b.regId!, utr: b.utr!, utrAt: istNow(), status: "Pending" });
  return Response.json({ ok: true, saved });
}
