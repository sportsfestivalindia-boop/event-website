// POST /api/payu/initiate
// Called by the browser after /api/order succeeds.
// Returns the PayU form fields (including hash) so the frontend can auto-POST to PayU.

import { buildPayuPayload, payuReady } from "@/lib/payu";
import { checkEntry, type Entry } from "@/lib/pay";

export async function POST(req: Request) {
  if (!payuReady()) {
    return Response.json(
      { error: "PayU is not configured yet. Set PAYU_MERCHANT_KEY and PAYU_MERCHANT_SALT in environment variables." },
      { status: 503 },
    );
  }

  const b = (await req.json().catch(() => ({}))) as {
    regId?: string;
    amount?: number;
    label?: string;
    entry?: Partial<Entry>;
  };

  const regId = String(b.regId ?? "").trim().toUpperCase();
  if (!/^SF26-[0-9A-F]{6}$/.test(regId)) {
    return Response.json({ error: "Invalid registration ID." }, { status: 400 });
  }

  // Server-side amount validation (preserves the locked amount)
  let amount = Number(b.amount);
  if (b.entry && b.entry.sport && b.entry.division) {
    const verified = checkEntry(b.entry);
    if (verified.ok) {
      amount = verified.fee;
    }
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    return Response.json({ error: "Invalid amount." }, { status: 400 });
  }

  const origin = new URL(req.url).origin;

  try {
    // Build hash string and form fields from ONE shared object
    const { fields, hashStringMasked, payuUrl } = buildPayuPayload({
      txnid: regId,
      amount,
      productinfo: b.label ?? "Sports Festival 2026",
      firstname: b.entry?.name ?? "Athlete",
      email: b.entry?.email ?? "noreply@sportsfestivalindia.com",
      phone: b.entry?.phone ?? "",
      surl: `${origin}/api/payu/return`,
      furl: `${origin}/api/payu/return`,
    });

    // 1. Print (server log, never to the client) the exact hash string before hashing, with the salt replaced by "***"
    console.log("[PayU Initiate] Hash string (masked):", hashStringMasked);
    console.log("[PayU Initiate] Form fields for PayU:", {
      ...fields,
      hash: fields.hash ? `${fields.hash.slice(0, 8)}...${fields.hash.slice(-8)}` : "",
    });

    return Response.json({ fields, payuUrl });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to initiate PayU payment.";
    console.error("[PayU Initiate Error]:", message);
    return Response.json({ error: message }, { status: 400 });
  }
}
