// Server only. Writes records to AOGA's Google Sheet through its Apps Script web app (sheet/Code.gs).
// Off until SHEET_WEBHOOK_URL is set in Vercel. Never throws: the athlete's flow must not break if the sheet is slow —
// the WhatsApp message to AOGA is the backup record.
export type SheetAction = "registration" | "ticket" | "stall" | "enquiry";

/** Returns the script's JSON reply, or null if the sheet is off, slow or down. */
export async function toSheet(action: SheetAction, data: Record<string, string | number>): Promise<Record<string, unknown> | null> {
  const url = process.env.SHEET_WEBHOOK_URL;
  if (!url) return null;
  try {
    const res = await fetch(url, {
      method: "POST",
      // text/plain avoids an extra preflight hop on Apps Script; the body is still JSON
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action, ...data }),
      redirect: "follow",
      signal: AbortSignal.timeout(8000),
    });
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

/** India time stamp for humans reading the sheet. */
export const istNow = () => new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", hour12: false });
