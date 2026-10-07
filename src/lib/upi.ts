// Browser-safe (no node imports): used by the pay screen.

/** The big UPI apps, so a phone opens the one the athlete uses instead of the generic chooser (which iPhones don't have). */
export const UPI_APPS = [
  { name: "Google Pay", pkg: "com.google.android.apps.nbu.paisa.user", ios: "gpay://upi/pay" },
  { name: "PhonePe", pkg: "com.phonepe.app", ios: "phonepe://pay" },
  { name: "Paytm", pkg: "net.one97.paytm", ios: "paytmmp://pay" },
] as const;

/** Same payment as `upi`, opened in one app: Android intent pinned to its package (Play Store if not installed), iPhone its own scheme. */
export function upiAppLink(upi: string, app: (typeof UPI_APPS)[number], ios: boolean) {
  const q = upi.slice(upi.indexOf("?") + 1);
  if (ios) return `${app.ios}?${q}`;
  const store = encodeURIComponent(`https://play.google.com/store/apps/details?id=${app.pkg}`);
  return `intent://pay?${q}#Intent;scheme=upi;package=${app.pkg};S.browser_fallback_url=${store};end`;
}
