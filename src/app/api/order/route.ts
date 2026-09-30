import { checkEntry, razorpayKeys, regId, type Entry } from "@/lib/pay";

/** Step 3: validate the entry, then create a Razorpay order (or a demo order when no keys are set). */
export async function POST(req: Request) {
  const entry = (await req.json().catch(() => ({}))) as Partial<Entry>;
  const check = checkEntry(entry);
  if (!check.ok) return Response.json({ error: check.error }, { status: 400 });

  if (check.fee === 0) return Response.json({ free: true, regId: regId(), label: check.label });

  const keys = razorpayKeys();
  if (!keys) return Response.json({ demo: true, amount: check.fee, label: check.label });

  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Basic " + Buffer.from(`${keys.id}:${keys.secret}`).toString("base64") },
    body: JSON.stringify({
      amount: check.fee * 100, // paise
      currency: "INR",
      receipt: `sf26-${Date.now()}`,
      notes: { category: check.label, name: entry.name!, phone: entry.phone!, email: entry.email!, city: entry.city!, gym: entry.gym ?? "" },
    }),
  });
  if (!res.ok) return Response.json({ error: "Payment gateway is busy. Please try again in a minute." }, { status: 502 });
  const order = (await res.json()) as { id: string; amount: number };
  return Response.json({ orderId: order.id, amount: order.amount, key: keys.id, label: check.label });
}
