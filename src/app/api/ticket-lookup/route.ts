import { isAdmin, ticketReady } from "@/lib/ticket";
import { getRegistrationFromFirestore, getAllRegistrationsFromFirestore } from "@/lib/firebase";
import { toSheet } from "@/lib/sheet";

/** Staff only: look up a registration by Reg ID or phone to retrieve the ticket URL for resending. */
export async function POST(req: Request) {
  if (!ticketReady()) return Response.json({ error: "Ticket system not configured." }, { status: 503 });
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  if (!isAdmin(b.key)) return Response.json({ error: "Wrong staff password." }, { status: 401 });

  const regId = String(b.regId ?? "").trim().toUpperCase();
  const phone = String(b.phone ?? "").trim().replace(/\D/g, "").slice(-10);

  if (!regId && !phone) return Response.json({ error: "Enter a Registration ID (SF26-XXXXXX) or phone number." }, { status: 400 });

  // 1. Try Firestore first
  if (regId) {
    const dbRec = await getRegistrationFromFirestore(regId).catch(() => null);
    if (dbRec && (dbRec.status === "Paid" || dbRec.status === "Verified")) {
      return Response.json({
        regId: dbRec.regId,
        name: dbRec.name,
        phone: dbRec.phone,
        category: dbRec.category,
        ticketUrl: dbRec.ticketUrl || `https://sportsfestivalindia.com/ticket/${dbRec.regId}`,
        status: dbRec.status,
      });
    }
  } else if (phone) {
    const all = await getAllRegistrationsFromFirestore().catch(() => []);
    const match = all.find((r) => r.phone?.endsWith(phone) && (r.status === "Paid" || r.status === "Verified"));
    if (match) {
      return Response.json({
        regId: match.regId,
        name: match.name,
        phone: match.phone,
        category: match.category,
        ticketUrl: match.ticketUrl || `https://sportsfestivalindia.com/ticket/${match.regId}`,
        status: match.status,
      });
    }
  }

  // 2. Fallback to Google Sheet
  const r = (await toSheet("lookup", regId ? { regId } : { phone })) as Record<string, unknown> | null;
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

