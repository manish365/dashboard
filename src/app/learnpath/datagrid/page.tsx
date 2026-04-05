"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import { INVOICE_DATA, DEFAULT_FILTERS, type Invoice, type Filters } from "./data";

function fmt(d: Date) { return d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }); }
function progColor(p: number) { if (p >= 75) return "#16a34a"; if (p >= 40) return "#d97706"; return "#dc2626"; }

const PRIORITY_STYLE: Record<string, { bg: string; color: string }> = {
  Critical: { bg: "#fdf4ff", color: "#7e22ce" }, High: { bg: "#fff1f1", color: "#b91c1c" },
  Medium: { bg: "#fff7ed", color: "#c2410c" }, Low: { bg: "#f0fdf4", color: "#15803d" },
};
const PRIORITY_DOT: Record<string, string> = { Critical: "#a855f7", High: "#ef4444", Medium: "#f97316", Low: "#22c55e" };
const STATUS_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  Approved: { bg: "#ecfdf5", color: "#065f46", border: "#a7f3d0" },
  Pending: { bg: "#fffbeb", color: "#92400e", border: "#fde68a" },
  Review: { bg: "#eff6ff", color: "#1e40af", border: "#bfdbfe" },
  Blocked: { bg: "#fff1f2", color: "#9f1239", border: "#fecdd3" },
  Completed: { bg: "#f5f3ff", color: "#5b21b6", border: "#ddd6fe" },
};

function Sparkline({ vals }: { vals: number[] }) {
  const max = Math.max(...vals);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 22 }}>
      {vals.map((v, i) => <div key={i} style={{ width: 4, height: Math.round((v / max) * 20) + 2, borderRadius: "2px 2px 0 0", background: "#3b82f6", opacity: 0.45 }} />)}
    </div>
  );
}

function PriBadge({ p }: { p: string }) {
  const s = PRIORITY_STYLE[p] ?? PRIORITY_STYLE.Low;
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 99, fontSize: ".68rem", fontWeight: 700, background: s.bg, color: s.color }}><span style={{ width: 7, height: 7, borderRadius: "50%", background: PRIORITY_DOT[p] ?? "#22c55e", flexShrink: 0, display: "inline-block" }} />{p}</span>;
}

function StatusPill({ s }: { s: string }) {
  const st = STATUS_STYLE[s] ?? STATUS_STYLE.Pending;
  const icons: Record<string, string> = { Approved: "✓", Pending: "⏱", Review: "◉", Blocked: "⚠", Completed: "✔" };
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 99, fontSize: ".7rem", fontWeight: 600, background: st.bg, color: st.color, border: `1px solid ${st.border}` }}><span style={{ fontSize: ".65rem" }}>{icons[s] ?? "·"}</span>{s}</span>;
}

function ProgressCell({ pct }: { pct: number }) {
  const c = progColor(pct);
  return <div style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 110 }}><div style={{ flex: 1, height: 6, borderRadius: 99, background: "#e5e7eb", overflow: "hidden" }}><div style={{ height: "100%", width: `${pct}%`, borderRadius: 99, background: c }} /></div><span style={{ fontSize: ".7rem", fontWeight: 700, color: c, width: 32, textAlign: "right" }}>{pct}%</span></div>;
}

const ffInput: React.CSSProperties = { width: "100%", height: 26, border: "1px solid #c8cedf", borderRadius: 4, padding: "0 6px", fontSize: ".72rem", fontFamily: "inherit", outline: "none", background: "#fff", color: "#1e2a45" };
const ffSelect: React.CSSProperties = { ...ffInput, padding: "0 18px 0 6px", cursor: "pointer", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='9' height='9' viewBox='0 0 24 24' fill='none' stroke='%238b93ac' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 5px center", appearance: "none" as const };

export default function DataGridPage() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [sortCol, setSortCol] = useState("index");
  const [sortDir, setSortDir] = useState(1);
  const [page, setPage] = useState(1);
  const [rpp, setRpp] = useState(12);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const debounce = useRef<ReturnType<typeof setTimeout>>();

  const filtered = useMemo(() => INVOICE_DATA.filter(r => {
    if (filters.id && !r.id.toLowerCase().includes(filters.id.toLowerCase())) return false;
    if (filters.company && !r.company.toLowerCase().includes(filters.company.toLowerCase())) return false;
    if (filters.project && !r.project.toLowerCase().includes(filters.project.toLowerCase())) return false;
    if (filters.team && r.team !== filters.team) return false;
    if (filters.status && r.status !== filters.status) return false;
    if (filters.priority && r.priority !== filters.priority) return false;
    if (filters.bmin && r.budget < +filters.bmin) return false;
    if (filters.bmax && r.budget > +filters.bmax) return false;
    if (filters.hmin && r.hours < +filters.hmin) return false;
    if (filters.hmax && r.hours > +filters.hmax) return false;
    if (filters.pmin && r.pct < +filters.pmin) return false;
    if (filters.pmax && r.pct > +filters.pmax) return false;
    if (filters.startAfter && r.start < new Date(filters.startAfter)) return false;
    if (filters.deadlineBefore && r.deadline > new Date(filters.deadlineBefore)) return false;
    return true;
  }), [filters]);

  const sorted = useMemo(() => [...filtered].sort((a, b) => {
    let va: string | number = a[sortCol as keyof Invoice] as string | number;
    let vb: string | number = b[sortCol as keyof Invoice] as string | number;
    if (va instanceof Date) va = (va as Date).getTime();
    if (vb instanceof Date) vb = (vb as Date).getTime();
    if (typeof va === "string") return (va as string).localeCompare(vb as string) * sortDir;
    return ((va as number) - (vb as number)) * sortDir;
  }), [filtered, sortCol, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / rpp));
  const safePage = Math.min(page, totalPages);
  const pageRows = sorted.slice((safePage - 1) * rpp, safePage * rpp);

  const onSort = useCallback((col: string) => {
    setSortCol(prev => { if (prev === col) { setSortDir(d => d * -1); return col; } setSortDir(1); return col; });
    setPage(1);
  }, []);

  const setF = (key: keyof Filters, val: string) => {
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => { setFilters(prev => ({ ...prev, [key]: val })); setPage(1); }, 150);
  };
  const setFI = (key: keyof Filters, val: string) => { setFilters(prev => ({ ...prev, [key]: val })); setPage(1); };
  const clearAll = () => { setFilters({ ...DEFAULT_FILTERS, status: "", bmin: "", bmax: "", deadlineBefore: "" }); setPage(1); };

  const toggleSel = (id: string) => setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAll = (checked: boolean) => setSelected(() => { const n = new Set<string>(); if (checked) pageRows.forEach(r => n.add(r.id)); return n; });

  const hasActiveFilters = Object.entries(filters).some(([, v]) => v !== "");
  const aggregBudget = filtered.reduce((s, r) => s + r.budget, 0);
  const aggregHours = filtered.reduce((s, r) => s + r.hours, 0);
  const aggregPct = filtered.length ? Math.round(filtered.reduce((s, r) => s + r.pct, 0) / filtered.length) : 0;
  const allOnPage = pageRows.length > 0 && pageRows.every(r => selected.has(r.id));
  const someOnPage = pageRows.some(r => selected.has(r.id));

  const S = {
    shell: { background: "#fff", borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,.07),0 4px 16px rgba(0,0,0,.05)", border: "1px solid #dde1ec", overflow: "hidden" } as React.CSSProperties,
    toolbar: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", borderBottom: "1px solid #dde1ec", gap: 10, flexWrap: "wrap" } as React.CSSProperties,
    btn: { height: 32, padding: "0 12px", display: "inline-flex", alignItems: "center", gap: 5, borderRadius: 6, fontSize: ".775rem", fontWeight: 500, fontFamily: "inherit", cursor: "pointer", border: "1px solid #c8cdde", background: "#fff", color: "#4b5775" } as React.CSSProperties,
    hdrRow: { background: "#f4f6fb", borderBottom: "2px solid #c8cdde" } as React.CSSProperties,
    td: { height: 48, padding: "0 10px", verticalAlign: "middle", borderRight: "1px solid #dde1ec", borderBottom: "1px solid #dde1ec", color: "#1e2a45" } as React.CSSProperties,
    footer: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", borderTop: "1px solid #dde1ec", background: "#f4f6fb", flexWrap: "wrap", gap: 8 } as React.CSSProperties,
  } as const;

  const pgs: (number | "…")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - safePage) <= 1) pgs.push(i);
    else if (i === 2 || i === totalPages - 1) pgs.push("…");
  }
  const dedupedPgs = pgs.filter((v, i, a) => !(v === "…" && a[i - 1] === "…"));

  const COLS = [
    { col: "id", label: "Invoice ID", fa: !!filters.id, mw: 110 },
    { col: "company", label: "Client Company", fa: !!filters.company, mw: 180 },
    { col: "project", label: "Project Name", fa: false, mw: 150 },
    { col: "team", label: "Assigned Team", fa: !!filters.team, mw: 120 },
    { col: "budget", label: "Budget ($)", fa: !!(filters.bmin || filters.bmax), mw: 110 },
    { col: "hours", label: "Hours Logged", fa: !!(filters.hmin || filters.hmax), mw: 120 },
    { col: "start", label: "Start Date", fa: !!filters.startAfter, mw: 110 },
    { col: "deadline", label: "Deadline", fa: !!filters.deadlineBefore, mw: 110 },
    { col: "pct", label: "Completion %", fa: !!(filters.pmin || filters.pmax), mw: 130 },
    { col: "priority", label: "Priority", fa: !!filters.priority, mw: 100 },
    { col: "status", label: "Status", fa: !!filters.status, mw: 120 },
  ];

  return (
    <div style={{ fontFamily: "'Inter',system-ui,sans-serif", paddingBottom: 40 }}>
      <div style={{ marginBottom: 18 }}>
        <h1 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-color)" }}>Project Invoice Management</h1>
        <p style={{ fontSize: ".78rem", color: "var(--old-price)", marginTop: 2 }}>Advanced filtering · Column sorting · Row selection · Aggregations</p>
      </div>

      <div style={S.shell}>
        <div style={S.toolbar}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: ".9375rem", fontWeight: 700, color: "#1e2a45" }}>Invoices <span style={{ fontSize: ".7rem", background: "#eff4ff", color: "#2563eb", border: "1px solid #c7d7fd", padding: "2px 8px", borderRadius: 99, fontWeight: 700 }}>{filtered.length} records</span></span>
            <button style={{ ...S.btn, ...(hasActiveFilters ? { background: "#f0f0ff", borderColor: "#a5b4fc", color: "#6366f1" } : {}) }} onClick={clearAll}>✕ Clear Filters</button>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button style={{ ...S.btn, background: "#2563eb", color: "#fff", borderColor: "#2563eb" }}>+ New Invoice</button>
          </div>
        </div>

        {hasActiveFilters && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 16px", borderBottom: "1px solid #dde1ec", background: "#fafbff", flexWrap: "wrap" }}>
            <span style={{ fontSize: ".7rem", color: "#8b93ac", fontWeight: 500 }}>Filtered by:</span>
            {filters.status && <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 99, fontSize: ".7rem", fontWeight: 600, background: "#f0f0ff", border: "1px solid #c7c7fd", color: "#6366f1" }}>Status: {filters.status} <span onClick={() => setFI("status", "")} style={{ cursor: "pointer", marginLeft: 3, fontWeight: 700, opacity: .6 }}>×</span></span>}
            {filters.team && <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 99, fontSize: ".7rem", fontWeight: 600, background: "#f0f0ff", border: "1px solid #c7c7fd", color: "#6366f1" }}>Team: {filters.team} <span onClick={() => setFI("team", "")} style={{ cursor: "pointer", marginLeft: 3, fontWeight: 700, opacity: .6 }}>×</span></span>}
          </div>
        )}

        <div style={{ display: "flex", gap: 12, padding: "7px 16px", borderBottom: "1px solid #dde1ec", background: "linear-gradient(90deg,#f8f9ff,#fff)", flexWrap: "wrap" }}>
          {[{ label: "Total Budget", val: `$${aggregBudget.toLocaleString()}` }, { label: "Total Hours", val: aggregHours.toLocaleString() + "h" }, { label: "Avg Completion", val: `${aggregPct}%` }].map(({ label, val }) => (
            <span key={label} style={{ fontSize: ".72rem", color: "#4b5775" }}>{label}: <strong style={{ color: "#1e2a45" }}>{val}</strong></span>
          ))}
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1100, fontSize: ".8rem" }}>
            <thead>
              <tr style={S.hdrRow}>
                <th style={{ width: 44, padding: 0, borderRight: "1px solid #dde1ec" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 42 }}>
                    <input type="checkbox" checked={allOnPage} ref={el => { if (el) el.indeterminate = someOnPage && !allOnPage; }} onChange={e => toggleAll(e.target.checked)} style={{ width: 14, height: 14, accentColor: "#2563eb", cursor: "pointer" }} />
                  </div>
                  <div style={{ height: 36, background: "#eef1fb", borderTop: "1px solid #dde1ec" }} />
                </th>
                {COLS.map(({ col, label, fa, mw }) => (
                  <th key={col} style={{ minWidth: mw, padding: 0, position: "relative", border: "none" }}>
                    <div onClick={() => onSort(col)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 10px", height: 42, cursor: "pointer", userSelect: "none" }}>
                      <span style={{ fontSize: ".7rem", fontWeight: 700, color: fa ? "#6366f1" : "#4b5775", textTransform: "uppercase", letterSpacing: ".04em" }}>{label}</span>
                      <span style={{ fontSize: 10, color: fa ? "#6366f1" : "#9ca3af" }}>▼</span>
                    </div>
                    <div style={{ padding: "3px 6px", background: "#eef1fb", borderTop: "1px solid #dde1ec" }}>
                      {col === "id" && <input style={ffInput} defaultValue={filters.id} placeholder="Search ID…" onChange={e => setF("id", e.target.value)} />}
                      {col === "company" && <input style={ffInput} defaultValue={filters.company} placeholder="Contains…" onChange={e => setF("company", e.target.value)} />}
                      {col === "project" && <input style={ffInput} defaultValue={filters.project} placeholder="Contains…" onChange={e => setF("project", e.target.value)} />}
                      {col === "team" && <select style={ffSelect} value={filters.team} onChange={e => setFI("team", e.target.value)}><option value="">All Teams</option>{["Alpha", "Beta", "Gamma", "Delta", "Epsilon"].map(t => <option key={t} value={t}>{t}</option>)}</select>}
                      {col === "budget" && <div style={{ display: "flex", gap: 4 }}><input type="number" style={{ ...ffInput, width: 62, textAlign: "center" }} defaultValue={filters.bmin} placeholder="Min" onChange={e => setF("bmin", e.target.value)} /><span style={{ color: "#8b93ac", fontSize: ".65rem" }}>–</span><input type="number" style={{ ...ffInput, width: 62, textAlign: "center" }} defaultValue={filters.bmax} placeholder="Max" onChange={e => setF("bmax", e.target.value)} /></div>}
                      {col === "hours" && <div style={{ display: "flex", gap: 4 }}><input type="number" style={{ ...ffInput, width: 56, textAlign: "center" }} placeholder="≥" onChange={e => setF("hmin", e.target.value)} /><span style={{ color: "#8b93ac", fontSize: ".65rem" }}>–</span><input type="number" style={{ ...ffInput, width: 56, textAlign: "center" }} placeholder="≤" onChange={e => setF("hmax", e.target.value)} /></div>}
                      {col === "start" && <input type="date" style={ffInput} onChange={e => setFI("startAfter", e.target.value)} />}
                      {col === "deadline" && <input type="date" style={{ ...ffInput, borderColor: filters.deadlineBefore ? "#6366f1" : "#c8cedf" }} defaultValue={filters.deadlineBefore} onChange={e => setFI("deadlineBefore", e.target.value)} />}
                      {col === "pct" && <div style={{ display: "flex", gap: 4 }}><input type="number" style={{ ...ffInput, width: 52, textAlign: "center" }} placeholder="≥%" onChange={e => setF("pmin", e.target.value)} /><span style={{ color: "#8b93ac", fontSize: ".65rem" }}>–</span><input type="number" style={{ ...ffInput, width: 52, textAlign: "center" }} placeholder="≤%" onChange={e => setF("pmax", e.target.value)} /></div>}
                      {col === "priority" && <select style={ffSelect} value={filters.priority} onChange={e => setFI("priority", e.target.value)}><option value="">All</option>{["Critical", "High", "Medium", "Low"].map(p => <option key={p} value={p}>{p}</option>)}</select>}
                      {col === "status" && <select style={{ ...ffSelect, borderColor: filters.status ? "#6366f1" : "#c8cedf" }} value={filters.status} onChange={e => setFI("status", e.target.value)}><option value="">All</option>{["Approved", "Pending", "Review", "Blocked", "Completed"].map(s => <option key={s} value={s}>{s}</option>)}</select>}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 ? (
                <tr><td colSpan={12} style={{ textAlign: "center", padding: "3rem", color: "#8b93ac" }}>No records match. <button onClick={clearAll} style={{ color: "#2563eb", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>Clear filters</button></td></tr>
              ) : pageRows.map((row, ri) => {
                const sel = selected.has(row.id);
                const pastDue = row.deadline < new Date("2026-03-01");
                return (
                  <tr key={row.id} onClick={() => toggleSel(row.id)} style={{ background: sel ? "#e8effe" : ri % 2 ? "#f9fafd" : "#fff", borderLeft: sel ? "3px solid #3b82f6" : "3px solid transparent", cursor: "pointer" }}
                    onMouseEnter={e => { if (!sel) e.currentTarget.style.background = "#eef2fd"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = sel ? "#e8effe" : ri % 2 ? "#f9fafd" : "#fff"; }}>
                    <td style={{ ...S.td, width: 44, padding: 0 }}><div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 48 }}><input type="checkbox" checked={sel} onChange={() => toggleSel(row.id)} onClick={e => e.stopPropagation()} style={{ width: 14, height: 14, accentColor: "#2563eb", cursor: "pointer" }} /></div></td>
                    <td style={S.td}><span style={{ fontFamily: "monospace", fontSize: ".74rem", color: "#2563eb", fontWeight: 700 }}>{row.id}</span></td>
                    <td style={S.td}><div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ width: 26, height: 26, borderRadius: 6, background: row.avatarColor, fontSize: ".6rem", fontWeight: 800, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{row.initials}</div><div><div style={{ fontWeight: 600, fontSize: ".8rem" }}>{row.company}</div><div style={{ fontSize: ".66rem", color: "#8b93ac" }}>{row.team} Team</div></div></div></td>
                    <td style={S.td}><span style={{ fontWeight: 500 }}>{row.project}</span></td>
                    <td style={S.td}><span style={{ fontSize: ".75rem", padding: "2px 8px", borderRadius: 4, background: "#f1f3f9", color: "#4b5775", fontWeight: 600 }}>{row.team}</span></td>
                    <td style={S.td}><span style={{ fontWeight: 600 }}>${row.budget.toLocaleString()}</span></td>
                    <td style={S.td}><div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ color: "#4b5775", fontWeight: 500 }}>{row.hours.toLocaleString()}h</span><Sparkline vals={row.spark} /></div></td>
                    <td style={S.td}><span style={{ color: "#4b5775", fontSize: ".775rem" }}>{fmt(row.start)}</span></td>
                    <td style={S.td}><span style={{ color: pastDue ? "#dc2626" : "#4b5775", fontWeight: pastDue ? 600 : 400, fontSize: ".775rem" }}>{fmt(row.deadline)}</span></td>
                    <td style={S.td}><ProgressCell pct={row.pct} /></td>
                    <td style={S.td}><PriBadge p={row.priority} /></td>
                    <td style={{ ...S.td, borderRight: "none" }}><StatusPill s={row.status} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div style={S.footer}>
          <span style={{ fontSize: ".775rem", color: "#4b5775" }}>Showing <strong>{sorted.length === 0 ? 0 : (safePage - 1) * rpp + 1}–{Math.min(safePage * rpp, sorted.length)}</strong> of <strong>{sorted.length}</strong> records</span>
          <div style={{ display: "flex", gap: 3 }}>
            {[{ label: "‹", pg: safePage - 1, disabled: safePage <= 1 }, ...dedupedPgs.map(p => ({ label: String(p), pg: typeof p === "number" ? p : -1, disabled: p === "…" })), { label: "›", pg: safePage + 1, disabled: safePage >= totalPages }].map(({ label, pg: p, disabled }, i) => (
              disabled && label !== "‹" && label !== "›" ? <span key={i} style={{ width: 28, textAlign: "center", color: "#8b93ac" }}>…</span> :
                <button key={i} disabled={disabled} onClick={() => !disabled && setPage(p)} style={{ width: 28, height: 28, borderRadius: 5, border: "1px solid #c8cdde", background: p === safePage ? "#2563eb" : "#fff", color: p === safePage ? "#fff" : "#4b5775", fontWeight: p === safePage ? 700 : 500, fontSize: ".755rem", cursor: disabled ? "default" : "pointer", fontFamily: "inherit", opacity: disabled ? .35 : 1 }}>{label}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
