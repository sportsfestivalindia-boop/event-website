import { istNow, toSheet } from "@/lib/sheet";

/** Sponsorship enquiry → AOGA's sheet (the brand also sends it on WhatsApp / email). */
export async function POST(req: Request) {
  const b = (await req.json().catch(() => ({}))) as Record<string, string>;
  const s = (k: string, max = 200) => String(b[k] ?? "").trim().slice(0, max);
  if (s("company").length < 2 || s("contact").length < 2 || !/^[6-9]\d{9}$/.test(s("phone"))) return Response.json({ error: "Missing details." }, { status: 400 });
  await toSheet("enquiry", {
    created: istNow(),
    company: s("company"),
    contact: s("contact"),
    phone: s("phone"),
    email: s("email"),
    tier: s("tier"),
    budget: s("budget"),
    note: s("note", 1000),
    status: "New",
  });
  return Response.json({ ok: true });
}
