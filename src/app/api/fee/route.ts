// GET /api/fee?phone=...&sport=...&division=...
// Lightweight server-only check for UI to display the exact server-calculated fee
// and show the test override badge for approved numbers.

import { checkEntry } from "@/lib/pay";
import { computePayableFee } from "@/lib/test-fee";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const phone = url.searchParams.get("phone") ?? "";
  const sport = url.searchParams.get("sport") ?? "";
  const division = url.searchParams.get("division") ?? "";
  const cls = url.searchParams.get("cls") ?? "Open";

  let baseFee = 5000;
  if (sport && division) {
    const verified = checkEntry({ sport, division, cls, name: "Check", dob: "2000-01-01", phone: "9876543210", email: "check@example.com", city: "Check" });
    if (verified.ok) {
      baseFee = verified.fee;
    }
  }

  const result = computePayableFee(baseFee, phone);
  return Response.json(result);
}

