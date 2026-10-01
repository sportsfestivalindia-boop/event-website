// Thin, safe wrapper around window.AOGA from /public/aoga-tracking.js (Meta Pixel, supplied by the ads team).
// Every call is a no-op if the script is blocked (ad-blockers) or not loaded yet — tracking must never break registration.
type Aoga = {
  trackingPayload: () => Record<string, string>;
  viewSport: (sport: string) => void;
  registrationStarted: (o: { value: number; sport: string; label: string; eventId?: string }) => void;
  paid: (o: { orderId: string; value: number; sport: string; label: string }) => void;
  freeRegistered: (o: { label: string; regId: string }) => void;
};

const aoga = () => (typeof window === "undefined" ? undefined : (window as unknown as { AOGA?: Aoga }).AOGA);

export function track<K extends keyof Aoga>(fn: K, ...args: Parameters<Aoga[K]>): ReturnType<Aoga[K]> | undefined {
  try {
    const a = aoga();
    // @ts-expect-error — args are typed by the caller signature above
    return a?.[fn](...args);
  } catch {
    return undefined;
  }
}
