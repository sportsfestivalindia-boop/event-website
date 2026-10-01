import { checkEntry, regId, upiLink, type Entry } from "@/lib/pay";

/** Step 3: validate the entry, reserve a registration ID and return the UPI payment link for the QR. */
export async function POST(req: Request) {
  const entry = (await req.json().catch(() => ({}))) as Partial<Entry>;
  const check = checkEntry(entry);
  if (!check.ok) return Response.json({ error: check.error }, { status: 400 });

  const id = regId();
  if (check.fee === 0) return Response.json({ free: true, regId: id, label: check.label });
  return Response.json({ regId: id, amount: check.fee, label: check.label, upi: upiLink(check.fee, id) });
}
