import type { Prize } from "@/data/festival";

const fmt = new Intl.NumberFormat("en-IN");

/** ₹1,50,00,000 — Indian grouping */
export const inr = (n: number) => "₹" + fmt.format(n);

/** ₹1.5 Crore · ₹20 Lakh · ₹50,000 — words Indian readers use */
export const inrShort = (n: number) => {
  if (n >= 1_00_00_000) return `₹${+(n / 1_00_00_000).toFixed(2)} Crore`;
  if (n >= 1_00_000) return `₹${+(n / 1_00_000).toFixed(2)} Lakh`;
  return inr(n);
};

export const prizeLabel = (p: Prize) => (typeof p === "number" ? inr(p) : p);

export const ordinal = (i: number) => ["1st", "2nd", "3rd", "4th", "5th", "6th"][i] ?? `${i + 1}th`;
