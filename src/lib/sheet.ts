// Server only. Writes records to AOGA's Google Sheet through its Apps Script web app (sheet/Code.gs).
// Off until SHEET_WEBHOOK_URL is set in Vercel. Never throws: the athlete's flow must not break if the sheet is slow —
// the WhatsApp message to AOGA is the backup record.
export type SheetAction = "registration" | "claim" | "lookup" | "ticket" | "stall" | "enquiry";

// About 1 in 6 times Google's reply link fails ("unable to open the file") and stays broken, so a lost reply means
// asking again. Only for actions that are safe to repeat; appends (registration, stall, enquiry) are sent once.
const SAFE_TO_REPEAT: SheetAction[] = ["claim", "lookup", "ticket"];

/** Returns the script's JSON reply, or null if the sheet is off, slow or down. */
export async function toSheet(action: SheetAction, data: Record<string, string | number>): Promise<Record<string, unknown> | null> {
  const url = process.env.SHEET_WEBHOOK_URL?.trim(); // trim() also drops a stray BOM from a pasted value
  if (!url) return null;
  for (let tries = SAFE_TO_REPEAT.includes(action) ? 3 : 1; tries > 0; tries--) {
    const reply = await once(url, action, data);
    if (reply) return reply;
  }
  return null;
}

async function once(url: string, action: SheetAction, data: Record<string, string | number>): Promise<Record<string, unknown> | null> {
  try {
    const signal = AbortSignal.timeout(20_000); // Apps Script replies in 0.5–10 s
    let res = await fetch(url, {
      method: "POST",
      // text/plain avoids an extra preflight hop on Apps Script; the body is still JSON
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action, ...data }),
      redirect: "manual",
      signal,
    });
    // Apps Script runs doPost, then 302s to its reply. Follow that as a plain GET ourselves: fetch's automatic
    // follow lands back on /exec ("doGet not found") and the reply is lost.
    const reply = res.headers.get("location");
    if (reply) res = await fetch(reply, { signal });
    if (!res.ok) console.error(`toSheet ${action}: HTTP ${res.status}`);
    return res.ok ? await res.json() : null;
  } catch (e) {
    console.error(`toSheet ${action}:`, e);
    return null;
  }
}

/** India time stamp for humans reading the sheet. */
export const istNow = () => new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", hour12: false });
