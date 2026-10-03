import { checkStall, stallId, type StallEntry } from "@/lib/pay";
import { createOrder } from "@/lib/razorpay";

/** Stall booking: validate, then open Razorpay for the full stall price. Without Razorpay keys, the booking goes to AOGA on WhatsApp. */
export async function POST(req: Request) {
  const e = (await req.json().catch(() => ({}))) as Partial<StallEntry>;
  const check = checkStall(e);
  if (!check.ok) return Response.json({ error: check.error }, { status: 400 });

  const id = stallId();
  try {
    const razorpay = await createOrder(check.price, id, {
      type: "stall",
      booking_id: id,
      stall: check.label,
      company: e.company!,
      contact: e.contact!,
      phone: e.phone!,
      email: e.email!,
      gstin: e.gstin ?? "",
      sector: e.sector ?? "",
    });
    return Response.json({ bookingId: id, amount: check.price, label: check.label, razorpay });
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 502 });
  }
}
