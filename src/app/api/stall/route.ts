import { checkStall, stallId, type StallEntry } from "@/lib/pay";

/** Stall booking: validate against our price list and issue a booking ID. The booking is sent to AOGA on WhatsApp (stall amounts exceed UPI limits). */
export async function POST(req: Request) {
  const e = (await req.json().catch(() => ({}))) as Partial<StallEntry>;
  const check = checkStall(e);
  if (!check.ok) return Response.json({ error: check.error }, { status: 400 });
  return Response.json({ bookingId: stallId(), amount: check.price, label: check.label });
}
