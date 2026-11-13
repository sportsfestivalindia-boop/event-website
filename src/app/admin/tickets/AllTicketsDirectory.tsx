"use client";

import { useEffect, useState, useMemo } from "react";
import { CHAMPIONSHIPS, EVENT } from "@/data/festival";
import { inr } from "@/lib/format";
import { WhatsAppGlyph, Icon } from "@/components/icons";

const input = "h-11 w-full rounded-lg border border-line bg-raise px-3 text-sm outline-none focus:border-gold";
const KEY = "sf26_staff_key";

// All official championship categories for the quick-change dropdown
const ALL_CATEGORIES = CHAMPIONSHIPS.flatMap((c) =>
  c.divisions.flatMap((d) =>
    d.classes.map((k) => `${c.sport} · ${d.name}${d.classes.length > 1 ? ` · ${k}` : ""}`),
  ),
);

interface AthleteRecord {
  regId: string;
  name: string;
  phone: string;
  callingPhone?: string;
  email?: string;
  category: string;
  city?: string;
  fee: number;
  status: "Awaiting payment" | "Paid" | "Verified" | "Failed";
  ticketNo?: string;
  ticketUrl?: string;
  isTest?: boolean;
  createdAt?: string;
}

export function AllTicketsDirectory() {
  const [key, setKey] = useState("");
  const [athletes, setAthletes] = useState<AthleteRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"ALL" | "PAID" | "PENDING">("ALL");

  // Editing state for sudden category or name / phone change
  const [editingAthlete, setEditingAthlete] = useState<AthleteRecord | null>(null);
  const [editCategory, setEditCategory] = useState("");
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editCallingPhone, setEditCallingPhone] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved) {
        setKey(saved);
        loadAthletes(saved);
      }
    } catch {}
  }, []);

  async function loadAthletes(staffKey = key) {
    if (!staffKey) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: staffKey, action: "list" }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Failed to load registrations.");
      try {
        localStorage.setItem(KEY, staffKey);
      } catch {}
      setAthletes(d.registrations || []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  // Quick edit category / name / phone numbers
  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingAthlete) return;
    setSavingEdit(true);
    setEditError("");
    setEditSuccess("");

    try {
      const res = await fetch("/api/admin/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key,
          action: "update",
          regId: editingAthlete.regId,
          category: editCategory,
          name: editName,
          phone: editPhone,
          callingPhone: editCallingPhone,
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Failed to update category.");

      setEditSuccess(`Updated ${editingAthlete.regId} to ${editCategory}! New ticket issued.`);
      // Update local state immediately
      setAthletes((prev) =>
        prev.map((a) =>
          a.regId === editingAthlete.regId
            ? { ...a, name: editName, phone: editPhone, callingPhone: editCallingPhone, category: editCategory, ticketNo: d.ticketNo, ticketUrl: d.ticketUrl, status: "Paid" }
            : a,
        ),
      );
      // keep editSuccess visible so staff can click Send WhatsApp if needed
    } catch (err) {
      setEditError((err as Error).message);
    } finally {
      setSavingEdit(false);
    }
  }

  // Cancel duplicate registration
  async function handleCancelDuplicate(regId: string) {
    if (!confirm(`Cancel duplicate registration ${regId}?`)) return;
    try {
      const res = await fetch("/api/admin/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, action: "cancel", regId }),
      });
      if (res.ok) {
        setAthletes((prev) => prev.filter((a) => a.regId !== regId));
      }
    } catch {}
  }

  // Filtering & search
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return athletes.filter((a) => {
      // Status filter
      if (filterStatus === "PAID" && a.status !== "Paid" && a.status !== "Verified") return false;
      if (filterStatus === "PENDING" && (a.status === "Paid" || a.status === "Verified")) return false;

      // Query search
      if (!q) return true;
      return (
        a.name?.toLowerCase().includes(q) ||
        a.regId?.toLowerCase().includes(q) ||
        a.phone?.includes(q) ||
        a.category?.toLowerCase().includes(q) ||
        a.ticketNo?.toLowerCase().includes(q)
      );
    });
  }, [athletes, search, filterStatus]);

  // Export to CSV for non-coders
  function exportCSV() {
    if (!athletes.length) return;
    const headers = ["Reg ID", "Name", "WhatsApp", "Calling No", "Email", "Category", "Fee", "Status", "Ticket No", "Ticket Link"];
    const rows = filtered.map((a) => [
      a.regId,
      `"${a.name || ""}"`,
      a.phone || "",
      a.callingPhone || "",
      a.email || "",
      `"${a.category || ""}"`,
      a.fee || "",
      a.status,
      a.ticketNo || "",
      a.ticketUrl || `https://sportsfestivalindia.com/ticket/${a.regId}`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encoded = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encoded);
    link.setAttribute("download", `Sports_Festival_2026_Athletes_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const verifiedCount = athletes.filter((a) => a.status === "Paid" || a.status === "Verified").length;

  return (
    <div className="space-y-6">
      {/* Password authentication bar */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <input
            className={input}
            type="password"
            placeholder="Enter Staff Password to view full directory"
            value={key}
            onChange={(e) => setKey(e.target.value)}
          />
          <button
            onClick={() => loadAthletes()}
            disabled={!key || loading}
            className="btn btn-gold w-full sm:w-auto px-6 whitespace-nowrap"
          >
            {loading ? "Loading athletes…" : "View & Refresh List"}
          </button>
        </div>
        {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
      </div>

      {athletes.length > 0 && (
        <>
          {/* Summary counters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="card p-3">
              <p className="text-xs text-muted uppercase">Total Athletes</p>
              <p className="display text-3xl text-gold">{athletes.length}</p>
            </div>
            <div className="card p-3">
              <p className="text-xs text-muted uppercase">Tickets Verified</p>
              <p className="display text-3xl text-wa">{verifiedCount}</p>
            </div>
            <div className="card p-3">
              <p className="text-xs text-muted uppercase">Pending / Awaiting</p>
              <p className="display text-3xl text-amber-400">{athletes.length - verifiedCount}</p>
            </div>
            <div className="card p-3 flex flex-col justify-center items-center">
              <button
                onClick={exportCSV}
                className="btn btn-line text-xs py-2 w-full flex items-center justify-center gap-1.5"
              >
                📥 Download Excel/CSV
              </button>
            </div>
          </div>

          {/* Controls: Search & Status Filter */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="w-full sm:w-80">
              <input
                className={input}
                placeholder="Search athlete, ID, phone, sport…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={() => setFilterStatus("ALL")}
                className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  filterStatus === "ALL" ? "bg-gold text-black" : "border border-line text-muted"
                }`}
              >
                All ({athletes.length})
              </button>
              <button
                onClick={() => setFilterStatus("PAID")}
                className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  filterStatus === "PAID" ? "bg-wa text-white" : "border border-line text-muted"
                }`}
              >
                Verified Tickets ({verifiedCount})
              </button>
              <button
                onClick={() => setFilterStatus("PENDING")}
                className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  filterStatus === "PENDING" ? "bg-amber-400 text-black" : "border border-line text-muted"
                }`}
              >
                Pending ({athletes.length - verifiedCount})
              </button>
            </div>
          </div>

          {/* Registrations & Tickets Table */}
          <div className="overflow-x-auto rounded-xl border border-line bg-black">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line bg-raise text-xs uppercase text-muted">
                <tr>
                  <th className="px-4 py-3">Athlete</th>
                  <th className="px-4 py-3">Category & Sport</th>
                  <th className="px-4 py-3">Status / Ticket</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filtered.map((a) => {
                  const isPaid = a.status === "Paid" || a.status === "Verified";
                  const cleanPhone = (a.phone || "").replace(/\D/g, "").slice(-10);
                  const ticketLink = a.ticketUrl || `https://sportsfestivalindia.com/ticket/${a.regId}`;
                  const waText = `Hi ${a.name}, your registration for ${a.category} at ${EVENT.name} is confirmed! Open your ticket: ${ticketLink}`;
                  const waUrl = cleanPhone
                    ? `https://api.whatsapp.com/send/?phone=91${cleanPhone}&text=${encodeURIComponent(waText)}`
                    : `https://api.whatsapp.com/send/?text=${encodeURIComponent(waText)}`;

                  return (
                    <tr key={a.regId} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-white">{a.name}</p>
                        <p className="text-xs text-gold">{a.regId}</p>
                        <p className="text-xs text-wa inline-flex items-center gap-1 font-mono">
                          <WhatsAppGlyph className="size-3" /> {a.phone}
                        </p>
                        {a.callingPhone && a.callingPhone !== a.phone && (
                          <p className="text-[11px] text-muted">📞 Call: {a.callingPhone}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs font-medium text-white">{a.category}</p>
                        <p className="text-xs text-muted">{inr(a.fee)}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            isPaid ? "bg-wa/15 text-wa" : "bg-amber-500/15 text-amber-400"
                          }`}
                        >
                          {isPaid ? "✅ Verified" : a.status}
                        </span>
                        {a.ticketNo && <p className="text-xs text-gold mt-1 font-mono">{a.ticketNo}</p>}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isPaid && (
                            <>
                              <a
                                href={ticketLink}
                                target="_blank"
                                rel="noopener"
                                className="btn btn-line text-xs py-1 px-2.5"
                                title="Open Ticket"
                              >
                                View
                              </a>
                              <a
                                href={waUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn bg-wa text-white text-xs py-1 px-2.5 inline-flex items-center gap-1"
                                title={`Send to athlete WhatsApp (${cleanPhone || a.phone})`}
                              >
                                <WhatsAppGlyph className="size-3.5" />
                              </a>
                            </>
                          )}
                          {!isPaid && (
                            <button
                              onClick={() => handleCancelDuplicate(a.regId)}
                              className="btn btn-line text-xs py-1 px-2 text-red-400 hover:text-red-300"
                              title="Cancel Duplicate / Unpaid"
                            >
                              ✕
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setEditingAthlete(a);
                              setEditName(a.name);
                              setEditPhone(a.phone || "");
                              setEditCallingPhone(a.callingPhone || "");
                              setEditCategory(a.category);
                              setEditError("");
                              setEditSuccess("");
                            }}
                            className="btn bg-gold text-black text-xs py-1 px-2 font-semibold hover:brightness-110"
                            title="Edit details / change number or category"
                          >
                            ✏️ Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-muted">
                      No athletes found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ── Modal for Sudden Category / Details Change ── */}
      {editingAthlete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-line bg-[#111] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-line">
              <div>
                <p className="text-xs text-gold uppercase tracking-wider">Sudden Change / Instant Edit</p>
                <h3 className="text-xl font-bold mt-0.5">{editingAthlete.name}</h3>
                <p className="text-xs text-muted">{editingAthlete.regId} · {editingAthlete.phone}</p>
              </div>
              <button
                onClick={() => setEditingAthlete(null)}
                className="text-muted hover:text-white text-lg p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="mt-4 space-y-4">
              <label className="block">
                <span className="block text-xs font-semibold mb-1">Athlete Name</span>
                <input
                  className={input}
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="block">
                  <span className="block text-xs font-semibold mb-1 text-wa flex items-center gap-1">
                    <WhatsAppGlyph className="size-3.5" /> WhatsApp Number
                  </span>
                  <input
                    className={input}
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    placeholder="10-digit WhatsApp number"
                    required
                  />
                </label>

                <label className="block">
                  <span className="block text-xs font-semibold mb-1 text-muted">
                    Calling Number (Optional)
                  </span>
                  <input
                    className={input}
                    value={editCallingPhone}
                    onChange={(e) => setEditCallingPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    placeholder="10-digit calling number"
                  />
                </label>
              </div>

              <label className="block">
                <span className="block text-xs font-semibold mb-1">Select New Category / Weight Class</span>
                <select
                  className={input}
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                >
                  <option value={editCategory}>{editCategory} (Current)</option>
                  {ALL_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="block text-xs font-semibold mb-1">Or Type Custom Category / Class:</span>
                <input
                  className={input}
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  placeholder="e.g. Powerlifting · Men · 85 kg"
                  required
                />
              </label>

              {editError && <p className="text-xs text-red-400 bg-red-500/10 p-2 rounded">{editError}</p>}
              {editSuccess && (
                <div className="space-y-2">
                  <p className="text-xs text-wa bg-wa/10 p-2.5 rounded font-medium">{editSuccess}</p>
                  {editingAthlete && (
                    <a
                      href={`https://api.whatsapp.com/send/?phone=91${(editingAthlete.phone || "").replace(/\D/g, "").slice(-10)}&text=${encodeURIComponent(
                        `Hi ${editName}, your registration for ${editCategory} at ${EVENT.name} has been updated!\n\nOpen your updated ticket:\nhttps://sportsfestivalindia.com/ticket/${editingAthlete.regId}\n\n— All Odisha Gym Association`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn w-full bg-wa text-white text-xs py-2 inline-flex items-center justify-center gap-2 font-bold shadow"
                    >
                      <WhatsAppGlyph className="size-4" /> Send Updated Ticket to Athlete (+91 {(editingAthlete.phone || "").replace(/\D/g, "").slice(-10)})
                    </a>
                  )}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingAthlete(null);
                    setEditSuccess("");
                    setEditError("");
                  }}
                  className="btn btn-line flex-1 text-sm"
                >
                  {editSuccess ? "Done / Close" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="btn btn-gold flex-1 text-sm font-bold"
                >
                  {savingEdit ? "Updating & Re-issuing…" : editSuccess ? "Save Again" : "Save & Re-issue Ticket"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

