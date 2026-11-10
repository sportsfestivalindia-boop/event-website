import { isAdmin, issueTicket, ticketReady } from "@/lib/ticket";
import { getAllRegistrationsFromFirestore, getRegistrationFromFirestore, updateRegistrationInFirestore } from "@/lib/firebase";

export async function POST(req: Request) {
  if (!ticketReady()) {
    return Response.json({ error: "Ticket system not configured." }, { status: 503 });
  }

  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const key = String(b.key ?? "").trim();
  if (!isAdmin(key)) {
    return Response.json({ error: "Wrong staff password." }, { status: 401 });
  }

  const action = String(b.action ?? "list");

  // Action: Update Category / Name & Re-issue Ticket
  if (action === "update") {
    const regId = String(b.regId ?? "").trim().toUpperCase();
    const newCategory = String(b.category ?? "").trim();
    const newName = String(b.name ?? "").trim();

    if (!regId) return Response.json({ error: "Missing Registration ID." }, { status: 400 });
    if (!newCategory && !newName) return Response.json({ error: "No changes provided." }, { status: 400 });

    const existing = await getRegistrationFromFirestore(regId);
    if (!existing) return Response.json({ error: "Athlete record not found in database." }, { status: 404 });

    const name = newName || existing.name;
    const category = newCategory || existing.category;

    // Issue updated ticket with force: true
    const issued = await issueTicket(
      {
        name,
        phone: existing.phone,
        category,
        amount: existing.fee || 5000,
        utr: existing.utr || regId,
        regId: existing.regId,
        paymentMode: existing.source || "UPI",
        force: true,
      },
      req.url
    );

    const ticketUrl = "url" in issued ? issued.url : `https://sportsfestivalindia.com/ticket/${regId}`;
    const ticketNo = "ticketNo" in issued ? issued.ticketNo : (existing.ticketNo || "");

    await updateRegistrationInFirestore(regId, {
      name,
      category,
      ticketNo,
      ticketUrl,
    });

    return Response.json({
      success: true,
      regId,
      name,
      category,
      ticketNo,
      ticketUrl,
    });
  }

  // Default Action: Return all registrations
  try {
    const all = await getAllRegistrationsFromFirestore();
    // Sort descending by registration / creation
    all.sort((a, b) => {
      const ta = typeof a.createdAt === "string" ? new Date(a.createdAt).getTime() : 0;
      const tb = typeof b.createdAt === "string" ? new Date(b.createdAt).getTime() : 0;
      return tb - ta;
    });

    return Response.json({
      ok: true,
      count: all.length,
      registrations: all,
    });
  } catch (err) {
    console.error("[admin/registrations] Error fetching registrations:", err);
    return Response.json({ error: "Failed to fetch registrations." }, { status: 500 });
  }
}

