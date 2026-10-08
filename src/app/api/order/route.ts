import { checkEntry, regId, upiLink, type Entry } from "@/lib/pay";
import { istNow, toSheet } from "@/lib/sheet";
import { isAdmin } from "@/lib/ticket";
import { after } from "next/server";

/** Step 3: validate the entry, reserve a registration ID, record it in AOGA's sheet and return the UPI payment link for the QR (null until a UPI ID is set). */
export async function POST(req: Request) {
  const entry = (await req.json().catch(() => ({}))) as Partial<Entry> & { tracking?: Record<string, string>; testKey?: string };
  const check = checkEntry(entry);
  if (!check.ok) return Response.json({ error: check.error }, { status: 400 });

  // staff test mode (/register?test=1 + staff password): the real flow end to end for ₹1 instead of the full fee
  const test = entry.testKey !== undefined;
  if (test && !isAdmin(entry.testKey)) return Response.json({ error: "Wrong staff password." }, { status: 401 });
  const fee = test && check.fee > 0 ? 1 : check.fee;
  const label = test ? `${check.label} · TEST ₹1` : check.label;

  const id = regId();
  const t = entry.tracking ?? {};
  // logged after the response: the athlete sees the QR at once, the sheet (0.5–10 s) catches up while they pay
  after(() => toSheet("registration", {
    regId: id,
    created: istNow(),
    name: entry.name!.trim(),
    dob: entry.dob!,
    phone: entry.phone!,
    email: entry.email!.trim(),
    city: entry.city!.trim(),
    association: (entry.association ?? "").trim(),
    category: label,
    fee,
    status: fee === 0 ? "Verified" : "Awaiting payment",
    source: test ? "STAFF TEST" : [t.utm_source, t.utm_campaign, t.gym && `gym:${t.gym}`].filter(Boolean).join(" · "),
  }));

  if (fee === 0) return Response.json({ free: true, regId: id, label });
  return Response.json({ regId: id, amount: fee, label, upi: upiLink(fee, id) });
}
