import { checkEntry, regId, upiLink, type Entry } from "@/lib/pay";
import { istNow, toSheet } from "@/lib/sheet";

/** Step 3: validate the entry, reserve a registration ID, record it in AOGA's sheet and return the UPI payment link for the QR (null until a UPI ID is set). */
export async function POST(req: Request) {
  const entry = (await req.json().catch(() => ({}))) as Partial<Entry> & { tracking?: Record<string, string> };
  const check = checkEntry(entry);
  if (!check.ok) return Response.json({ error: check.error }, { status: 400 });

  const id = regId();
  const t = entry.tracking ?? {};
  await toSheet("registration", {
    regId: id,
    created: istNow(),
    name: entry.name!.trim(),
    dob: entry.dob!,
    phone: entry.phone!,
    email: entry.email!.trim(),
    city: entry.city!.trim(),
    association: (entry.association ?? "").trim(),
    category: check.label,
    fee: check.fee,
    status: check.fee === 0 ? "Verified" : "Awaiting payment",
    source: [t.utm_source, t.utm_campaign, t.gym && `gym:${t.gym}`].filter(Boolean).join(" · "),
  });

  if (check.fee === 0) return Response.json({ free: true, regId: id, label: check.label });
  return Response.json({ regId: id, amount: check.fee, label: check.label, upi: upiLink(check.fee, id) });
}
