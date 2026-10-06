// Server-side registration + stall validation. The fee is always computed here, never trusted from the client.
import { randomBytes } from "node:crypto";
import { CHAMPIONSHIPS, EVENT } from "../data/festival";
import { STALLS } from "../data/partners";

export type Entry = {
  sport: string;
  division: string;
  cls: string;
  name: string;
  dob: string;
  phone: string;
  email: string;
  city: string;
  association?: string;
};

/** Validates the entry against the facts file; returns the category label + fee in rupees, or an error. */
export function checkEntry(e: Partial<Entry>): { ok: true; fee: number; label: string } | { ok: false; error: string } {
  const champ = CHAMPIONSHIPS.find((c) => c.id === e.sport);
  const div = champ?.divisions.find((d) => d.id === e.division);
  if (!champ || !div || !e.cls || !div.classes.includes(e.cls)) return { ok: false, error: "Please choose a valid category." };
  if (!e.name || e.name.trim().length < 2 || e.name.length > 80) return { ok: false, error: "Please enter your full name." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(e.dob ?? "") || new Date(e.dob!) > new Date("2012-12-31") || new Date(e.dob!) < new Date("1930-01-01"))
    return { ok: false, error: "Please enter a valid date of birth." };
  if (!/^[6-9]\d{9}$/.test(e.phone ?? "")) return { ok: false, error: "Please enter a valid 10-digit mobile number." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.email ?? "")) return { ok: false, error: "Please enter a valid email address." };
  if (!e.city || e.city.trim().length < 2) return { ok: false, error: "Please enter your city." };
  if (div.id === "masters" && new Date(e.dob!) > new Date("1981-12-04")) return { ok: false, error: "Masters is for athletes aged 45 and above." };
  const label = `${champ.sport} · ${div.name}${div.classes.length > 1 ? ` · ${e.cls}` : ""}`;
  return { ok: true, fee: div.fee ?? EVENT.fee, label };
}

export const regId = () => "SF26-" + randomBytes(4).toString("hex").toUpperCase().slice(0, 6);

export type StallEntry = { stall: string; company: string; contact: string; phone: string; email: string; gstin?: string; sector?: string };

/** Validates a stall booking against the price list; the price is ours, never the browser's. */
export function checkStall(e: Partial<StallEntry>): { ok: true; price: number; label: string } | { ok: false; error: string } {
  const st = STALLS.find((s) => s.id === e.stall);
  if (!st) return { ok: false, error: "Please choose a stall size." };
  if (!e.company || e.company.trim().length < 2 || e.company.length > 120) return { ok: false, error: "Please enter your company / brand name." };
  if (!e.contact || e.contact.trim().length < 2) return { ok: false, error: "Please enter the contact person’s name." };
  if (!/^[6-9]\d{9}$/.test(e.phone ?? "")) return { ok: false, error: "Please enter a valid 10-digit mobile number." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.email ?? "")) return { ok: false, error: "Please enter a valid email address." };
  if (e.gstin && !/^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(e.gstin)) return { ok: false, error: "GSTIN looks wrong — check it or leave it blank." };
  return { ok: true, price: st.price, label: `Stall ${st.size}` };
}

export const stallId = () => "SF26-ST-" + randomBytes(3).toString("hex").toUpperCase();
