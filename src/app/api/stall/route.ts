import { checkStall, stallId, type StallEntry } from "@/lib/pay";
import { istNow, toSheet } from "@/lib/sheet";

/** Stall booking: validate against our price list, issue a booking ID and record it in AOGA's sheet. The brand then sends it to AOGA on WhatsApp (stall amounts exceed UPI limits). */
export async function POST(req: Request) {
  const e = (await req.json().catch(() => ({}))) as Partial<StallEntry>;
  const check = checkStall(e);
  if (!check.ok) return Response.json({ error: check.error }, { status: 400 });
  const id = stallId();
  await toSheet("stall", {
    bookingId: id,
    created: istNow(),
    stall: check.label,
    price: check.price,
    company: e.company!.trim(),
    contact: e.contact!.trim(),
    phone: e.phone!,
    email: e.email!.trim(),
    gstin: e.gstin ?? "",
    sector: e.sector ?? "",
    status: "New",
  });
  return Response.json({ bookingId: id, amount: check.price, label: check.label });
}
