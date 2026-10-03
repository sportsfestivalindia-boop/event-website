import { checkEntry, regId, upiLink, type Entry } from "@/lib/pay";
import { createOrder } from "@/lib/razorpay";

/** Step 3: validate the entry, reserve a registration ID, then open Razorpay — or fall back to the UPI QR if Razorpay isn't configured. */
export async function POST(req: Request) {
  const entry = (await req.json().catch(() => ({}))) as Partial<Entry>;
  const check = checkEntry(entry);
  if (!check.ok) return Response.json({ error: check.error }, { status: 400 });

  const id = regId();
  if (check.fee === 0) return Response.json({ free: true, regId: id, label: check.label });

  try {
    const razorpay = await createOrder(check.fee, id, {
      type: "registration",
      reg_id: id,
      category: check.label,
      name: entry.name!,
      dob: entry.dob!,
      phone: entry.phone!,
      email: entry.email!,
      city: entry.city!,
      association: entry.association ?? "",
    });
    if (razorpay) return Response.json({ regId: id, amount: check.fee, label: check.label, razorpay });
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 502 });
  }
  return Response.json({ regId: id, amount: check.fee, label: check.label, upi: upiLink(check.fee, id) });
}
