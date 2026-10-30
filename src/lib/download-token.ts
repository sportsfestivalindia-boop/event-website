// Server only. Cryptographic download tokens for tickets and receipts.
// 30-day expiration, tamper-proof via HMAC-SHA256, tied to registration ID.

import { createHmac, timingSafeEqual } from "node:crypto";

const getSecret = (): string =>
  process.env.DOWNLOAD_TOKEN_SECRET?.trim() ||
  process.env.ADMIN_KEY?.trim() ||
  "aoga-sports-festival-download-secret-2026";

export interface DownloadTokenPayload {
  regId: string;
  type: "ticket" | "receipt" | "ticket-image";
  exp: number; // Unix timestamp in seconds
}

/** Signs a download token valid for 30 days */
export function generateDownloadToken(regId: string, type: "ticket" | "receipt" | "ticket-image"): string {
  const cleanId = regId.trim().toUpperCase();
  const exp = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60; // 30 days
  const data = `${cleanId}:${type}:${exp}`;
  const sig = createHmac("sha256", getSecret()).update(data).digest("base64url");
  const token = Buffer.from(data, "utf8").toString("base64url") + "." + sig;
  return token;
}

/** Verifies a download token and returns the payload if valid */
export function verifyDownloadToken(token: string): DownloadTokenPayload | null {
  if (!token || typeof token !== "string" || !token.includes(".")) {
    return null;
  }

  const [encodedData, sig] = token.split(".");
  if (!encodedData || !sig) return null;

  try {
    const data = Buffer.from(encodedData, "base64url").toString("utf8");
    const [regId, type, expStr] = data.split(":");
    const exp = parseInt(expStr, 10);

    if (!regId || !type || isNaN(exp)) return null;
    if (type !== "ticket" && type !== "receipt" && type !== "ticket-image") return null;

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (now > exp) return null;

    // Verify signature in constant time
    const expectedSig = createHmac("sha256", getSecret()).update(data).digest("base64url");
    const a = Buffer.from(sig);
    const b = Buffer.from(expectedSig);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

    return { regId, type: type as DownloadTokenPayload["type"], exp };
  } catch {
    return null;
  }
}

