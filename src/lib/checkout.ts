"use client";
// Opens Razorpay Standard Checkout and resolves with the signed payment, or rejects if the user closes it.

export type RzpOrder = { orderId: string; amount: number; key: string };
export type RzpPaid = { orderId: string; paymentId: string; signature: string };
type RzpResponse = { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string };
type RzpCtor = new (opts: Record<string, unknown>) => { open: () => void; on: (ev: string, cb: (r: { error?: { description?: string } }) => void) => void };

function load(): Promise<RzpCtor> {
  const w = window as unknown as { Razorpay?: RzpCtor };
  if (w.Razorpay) return Promise.resolve(w.Razorpay);
  return new Promise((ok, fail) => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => (w.Razorpay ? ok(w.Razorpay) : fail(new Error("Payment window failed to load.")));
    s.onerror = () => fail(new Error("Could not load the payment window. Check your internet and try again."));
    document.body.appendChild(s);
  });
}

export async function razorpayPay(
  order: RzpOrder,
  o: { description: string; prefill: { name: string; email: string; contact: string }; notes?: Record<string, string> },
): Promise<RzpPaid> {
  const Rzp = await load();
  return new Promise((ok, fail) => {
    const rzp = new Rzp({
      key: order.key,
      amount: order.amount,
      currency: "INR",
      order_id: order.orderId,
      name: "Sports Festival 2026",
      description: o.description,
      prefill: o.prefill,
      notes: o.notes,
      theme: { color: "#FFB81C" },
      handler: (r: RzpResponse) => ok({ orderId: r.razorpay_order_id, paymentId: r.razorpay_payment_id, signature: r.razorpay_signature }),
      modal: { ondismiss: () => fail(new Error("Payment cancelled. You can try again — nothing was charged.")) },
    });
    rzp.on("payment.failed", (r) => fail(new Error(r.error?.description ?? "Payment failed. Please try again.")));
    rzp.open();
  });
}
