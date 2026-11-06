import { isAdmin, ticketReady } from "@/lib/ticket";
import { toSheet } from "@/lib/sheet";

/** Staff only: look up a registration by Reg ID or phone to retrieve the ticket URL for resending. */
export async function POST(req: Request) {
  if (!ticketReady()) return Response.json({ error: "Ticket system not configured." }, { status: 503 });
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  if (!isAdmin(b.key)) return Response.json({ error: "Wrong staff password." }, { status: 401 });

  const regId = String(b.regId ?? "").trim().toUpperCase();
  const phone = String(b.phone ?? "").trim().replace(/\D/g, "").slice(-10);

  if (!regId && !phone) return Response.json({ error: "Enter a Registration ID (SF26-XXXXXX) or phone number." }, { status: 400 });

  const r = await toSheet("lookup", regId ? { regId } : { phone }) as Record<string, unknown> | null;
  if (!r?.ok || !r.ticketUrl) return Response.json({ error: "No verified ticket found for this athlete." }, { status: 404 });

  return Response.json({
    regId: r.regId,
    name: r.name,
    phone: r.phone,
    category: r.category,
    ticketUrl: r.ticketUrl,
    status: r.status,
  });
}

