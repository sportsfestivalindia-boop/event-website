import { validUtr } from "@/lib/pay";

/** After the athlete pays by UPI QR: record the UTR they entered. AOGA confirms it against the bank statement. */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { regId?: string; utr?: string };
  if (!/^SF26-[0-9A-F]{6}$/.test(body.regId ?? "")) return Response.json({ error: "Registration not found. Please start again." }, { status: 400 });
  if (!validUtr(body.utr)) return Response.json({ error: "Enter the 12-digit UTR / UPI reference number from your payment app." }, { status: 400 });
  // ponytail: no database yet — nothing is stored. Add Supabase (registrations + UTR + status) before real launch.
  return Response.json({ regId: body.regId, status: "verifying" });
}
