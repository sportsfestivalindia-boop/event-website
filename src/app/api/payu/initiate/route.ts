// POST /api/payu/initiate
// Called by the browser after /api/order succeeds.
// Returns the PayU form fields (including hash) so the frontend can auto-POST to PayU.

import { payuFields, payuReady } from "@/lib/payu";
import { checkEntry, type Entry } from "@/lib/pay";

export async function POST(req: Request) {
  if (!payuReady())
    return Response.json(
      { error: "PayU is not configured yet. Set PAYU_MERCHANT_KEY and PAYU_MERCHANT_SALT in environment variables." },
      { status: 503 },
    );

  const b = (await req.json().catch(() => ({}))) as {
    regId?: string;
    amount?: number;
    label?: string;
    entry?: Partial<Entry>;
  };

  const regId  = String(b.regId  ?? "").trim().toUpperCase();
  const amount = Number(b.amount);
  const label  = String(b.label  ?? "Sports Festival 2026").slice(0, 100);

  if (!/^SF26-[0-9A-F]{6}$/.test(regId))
    return Response.json({ error: "Invalid registration ID." }, { status: 400 });
  if (!Number.isFinite(amount) || amount <= 0)
    return Response.json({ error: "Invalid amount." }, { status: 400 });

  const name  = String(b.entry?.name  ?? "").trim() || "Athlete";
  const email = String(b.entry?.email ?? "").trim() || "noreply@sportsfestivalindia.com";
  const phone = String(b.entry?.phone ?? "").trim();

  const origin = new URL(req.url).origin;

  const fields = payuFields(
    {
      txnid:       regId,
      amount,
      productinfo: label,
      firstname:   name.split(" ")[0].slice(0, 60),
      email,
      phone,
      surl:        `${origin}/api/payu/return`,
      furl:        `${origin}/api/payu/return`,
    },
    origin,
  );

  return Response.json({ fields, payuUrl: process.env.PAYU_BASE_URL ?? "https://test.payu.in/_payment" });
}
