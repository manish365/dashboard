"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import { INVOICE_DATA, DEFAULT_FILTERS, type Invoice, type Filters } from "./data";

function fmt(d: Date) { return d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }); }

const PRIORITY_CLASSES: Record<string, { tag: string; text: string }> = {
  Critical: { tag: 'theme-tag-purple', text: 'theme-text-purple' },
  High: { tag: 'theme-tag-danger', text: 'theme-text-danger' },
  Medium: { tag: 'theme-tag-orange', text: 'theme-text-orange' },
  Low: { tag: 'theme-tag-success', text: 'theme-text-success' },
};

const STATUS_CLASSES: Record<string, { tag: string; text: string }> = {
  Approved: { tag: 'theme-tag-success', text: 'theme-text-success' },
  Pending: { tag: 'theme-tag-warning', text: 'theme-text-warning' },
  Review: { tag: 'theme-tag-info', text: 'theme-text-info' },
  Blocked: { tag: 'theme-tag-danger', text: 'theme-text-danger' },
  Completed: { tag: 'theme-tag-brand', text: 'theme-text-brand' },
};

function Sparkline({ vals }: { vals: number[] }) {
  const max = Math.max(...vals);
  return (
    <div className="flex items-end gap-0.5 h-[22px]">
      {vals.map((v, i) => <div key={i} style={{ height: Math.round((v / max) * 20) + 2 }} className="w-1 rounded-t-sm theme-tag-info opacity-50" />)}
    </div>
  );
}

function PriBadge({ p }: { p: string }) {
  const cls = PRIORITY_CLASSES[p] ?? PRIORITY_CLASSES.Low;
  return (
    <span className={`dg-badge ${cls.tag}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 inline-block bg-current`} />
      {p}
    </span>
  );
}

function StatusPill({ s }: { s: string }) {
  const cls = STATUS_CLASSES[s] ?? STATUS_CLASSES.Pending;
  const icons: Record<string, string> = { Approved: "✓", Pending: "⏱", Review: "◉", Blocked: "⚠", Completed: "✔" };
  return (
    <span className={`dg-status-pill ${cls.tag} border`}>
      <span className="text-[0.65rem]">{icons[s] ?? "·"}</span>
      {s}
    </span>
  );
}

function ProgressCell({ pct }: { pct: number }) {
  const getCls = (p: number) => {
    if (p >= 75) return 'theme-text-success';
    if (p >= 40) return 'theme-text-orange';
    return 'theme-text-danger';
  };
  const getBgCls = (p: number) => {
    if (p >= 75) return 'theme-tag-success';
    if (p >= 40) return 'theme-tag-warning';
    return 'theme-tag-danger';
  };
  const textCls = getCls(pct);
  const bgCls = getBgCls(pct);
  return (
    <div className="flex items-center gap-[7px] min-w-[110px]">
      <div className="flex-1 h-1.5 rounded-full theme-footer-bg overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-300 ${bgCls}`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-[0.7rem] font-bold w-[32px] text-right ${textCls}`}>{pct}%</span>
    </div>
  );
}

// Form styles moved to globals.css (.dg-input, .dg-select)

export default function DataGridPage() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [sortCol, setSortCol] = useState("index");
  const [sortDir, setSortDir] = useState(1);
  const [page, setPage] = useState(1);
  const [rpp, setRpp] = useState(12);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const debounce = useRef<ReturnType<typeof setTimeout>>(undefined);

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
    const va = a[sortCol as keyof Invoice];
    const vb = b[sortCol as keyof Invoice];
    const da = va instanceof Date ? va.getTime() : va;
    const db = vb instanceof Date ? vb.getTime() : vb;
    if (typeof da === "string" && typeof db === "string") return da.localeCompare(db) * sortDir;
    return ((da as number) - (db as number)) * sortDir;
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
    // Styles moved to globals.css (.dg-card, .dg-toolbar, .dg-btn, .dg-table-cell, etc)
    btnActive: { border: '1px solid var(--neon-green)', color: 'var(--neon-green)' } as React.CSSProperties,
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
    <div className="dg-page-container">
      <div className="dg-section-header">
        <h1 className="dg-title">Project Invoice Management</h1>
        <p className="dg-subtitle">Advanced filtering · Column sorting · Row selection · Aggregations</p>
      </div>

      <div className="dg-card">
        <div className="dg-toolbar">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[0.9375rem] font-bold theme-text">Invoices <span className="dg-badge theme-tag-info">{filtered.length} records</span></span>
            <button className={`dg-btn ${hasActiveFilters ? 'theme-tag-accent' : ''}`} onClick={clearAll}>✕ Clear Filters</button>
          </div>
          <div className="flex gap-1.5">
            <button className="dg-btn dg-btn-primary">+ New Invoice</button>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="dg-filter-bar">
            <span className="text-[0.7rem] theme-text-subtle font-medium">Filtered by:</span>
            {filters.status && <span className="dg-badge theme-tag-accent">Status: {filters.status} <span onClick={() => setFI("status", "")} className="cursor-pointer ml-1 font-bold opacity-60">×</span></span>}
            {filters.team && <span className="dg-badge theme-tag-accent">Team: {filters.team} <span onClick={() => setFI("team", "")} className="cursor-pointer ml-1 font-bold opacity-60">×</span></span>}
          </div>
        )}

        <div className="dg-stats-bar">
          {[{ label: "Total Budget", val: `$${aggregBudget.toLocaleString()}` }, { label: "Total Hours", val: aggregHours.toLocaleString() + "h" }, { label: "Avg Completion", val: `${aggregPct}%` }].map(({ label, val }) => (
            <span key={label} className="text-[0.72rem] theme-text-muted">{label}: <strong className="theme-text">{val}</strong></span>
          ))}
        </div>

        <div className="dg-table-wrapper">
          <table className="dg-table">
            <thead>
              <tr className="dg-table-header-row">
                <th className="w-[44px] p-0 border-r theme-border">
                  <div className="flex items-center justify-center h-[42px]">
                    <input type="checkbox" checked={allOnPage} ref={el => { if (el) el.indeterminate = someOnPage && !allOnPage; }} onChange={e => toggleAll(e.target.checked)} className="w-3.5 h-3.5 accent-[var(--neon-green)] cursor-pointer" />
                  </div>
                  <div className="h-[36px] theme-footer-bg border-t theme-border" />
                </th>
                {COLS.map(({ col, label, fa, mw }) => (
                  <th key={col} style={{ minWidth: mw }} className="p-0 relative border-none">
                    <div onClick={() => onSort(col)} className="flex items-center justify-between px-[10px] h-[42px] cursor-pointer select-none">
                      <span className={`text-[0.7rem] font-bold uppercase tracking-wider ${fa ? 'theme-text-info' : 'theme-text-muted'}`}>{label}</span>
                      <span className={`text-[10px] ${fa ? 'theme-text-info' : 'theme-text-subtle'}`}>▼</span>
                    </div>
                    <div className="p-[3px_6px] theme-footer-bg border-t theme-border">
                      {col === "id" && <input className="dg-input" defaultValue={filters.id} placeholder="Search ID…" onChange={e => setF("id", e.target.value)} />}
                      {col === "company" && <input className="dg-input" defaultValue={filters.company} placeholder="Contains…" onChange={e => setF("company", e.target.value)} />}
                      {col === "project" && <input className="dg-input" defaultValue={filters.project} placeholder="Contains…" onChange={e => setF("project", e.target.value)} />}
                      {col === "team" && <select className="dg-select" value={filters.team} onChange={e => setFI("team", e.target.value)}><option value="">All Teams</option>{["Alpha", "Beta", "Gamma", "Delta", "Epsilon"].map(t => <option key={t} value={t}>{t}</option>)}</select>}
                      {col === "budget" && <div className="flex gap-1"><input type="number" className="dg-input w-[62px] text-center" defaultValue={filters.bmin} placeholder="Min" onChange={e => setF("bmin", e.target.value)} /><span className="theme-text-subtle text-[0.65rem]">–</span><input type="number" className="dg-input w-[62px] text-center" defaultValue={filters.bmax} placeholder="Max" onChange={e => setF("bmax", e.target.value)} /></div>}
                      {col === "hours" && <div className="flex gap-1"><input type="number" className="dg-input w-[56px] text-center" placeholder="≥" onChange={e => setF("hmin", e.target.value)} /><span className="theme-text-subtle text-[0.65rem]">–</span><input type="number" className="dg-input w-[56px] text-center" placeholder="≤" onChange={e => setF("hmax", e.target.value)} /></div>}
                      {col === "start" && <input type="date" className="dg-input" onChange={e => setFI("startAfter", e.target.value)} />}
                      {col === "deadline" && <input type="date" className={`dg-input ${filters.deadlineBefore ? 'theme-border-brand' : ''}`} defaultValue={filters.deadlineBefore} onChange={e => setFI("deadlineBefore", e.target.value)} />}
                      {col === "pct" && <div className="flex gap-1"><input type="number" className="dg-input w-[52px] text-center" placeholder="≥%" onChange={e => setF("pmin", e.target.value)} /><span className="theme-text-subtle text-[0.65rem]">–</span><input type="number" className="dg-input w-[52px] text-center" placeholder="≤%" onChange={e => setF("pmax", e.target.value)} /></div>}
                      {col === "priority" && <select className="dg-select" value={filters.priority} onChange={e => setFI("priority", e.target.value)}><option value="">All</option>{["Critical", "High", "Medium", "Low"].map(p => <option key={p} value={p}>{p}</option>)}</select>}
                      {col === "status" && <select className={`dg-select ${filters.status ? 'theme-border-brand' : ''}`} value={filters.status} onChange={e => setFI("status", e.target.value)}><option value="">All</option>{["Approved", "Pending", "Review", "Blocked", "Completed"].map(s => <option key={s} value={s}>{s}</option>)}</select>}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 ? (
                <tr><td colSpan={12} className="text-center p-12 theme-text-subtle">No records match. <button onClick={clearAll} className="bg-none border-none cursor-pointer font-semibold theme-text-info">Clear filters</button></td></tr>
              ) : pageRows.map((row, ri) => {
                const sel = selected.has(row.id);
                const pastDue = row.deadline < new Date("2026-03-01");
                return (
                  <tr key={row.id} onClick={() => toggleSel(row.id)}
                    className={`dg-table-row cursor-pointer ${sel ? 'theme-tag-info border-l-4 theme-border-brand' : 'hover:bg-white/5 border-l-4 border-l-transparent'}`}>
                    <td className="dg-table-cell w-[44px] p-0"><div className="flex items-center justify-center h-[48px]"><input type="checkbox" checked={sel} onChange={() => toggleSel(row.id)} onClick={e => e.stopPropagation()} className="w-3.5 h-3.5 accent-[var(--neon-green)] cursor-pointer" /></div></td>
                    <td className="dg-table-cell"><span className="theme-mono text-[.74rem] theme-text-info font-bold">{row.id}</span></td>
                    <td className="dg-table-cell">
                      <div className="flex items-center gap-2">
                        <div className="w-[26px] h-[26px] rounded-md text-[0.6rem] font-extrabold text-white flex items-center justify-center flex-shrink-0" style={{ background: row.avatarColor }}>{row.initials}</div>
                        <div><div className="font-semibold text-[0.8rem]">{row.company}</div><div className="text-[.66rem] theme-text-subtle">{row.team} Team</div></div>
                      </div>
                    </td>
                    <td className="dg-table-cell"><span className="font-medium">{row.project}</span></td>
                    <td className="dg-table-cell"><span className="text-[.75rem] px-2 py-0.5 rounded theme-footer-bg theme-text-muted font-semibold">{row.team}</span></td>
                    <td className="dg-table-cell"><span className="font-bold">${row.budget.toLocaleString()}</span></td>
                    <td className="dg-table-cell"><div className="flex items-center gap-1.5"><span className="theme-text-muted font-medium">{row.hours.toLocaleString()}h</span><Sparkline vals={row.spark} /></div></td>
                    <td className="dg-table-cell"><span className="theme-text-muted text-[.775rem]">{fmt(row.start)}</span></td>
                    <td className="dg-table-cell"><span className={`text-[.775rem] ${pastDue ? 'theme-text-danger font-semibold' : 'theme-text-muted'}`}>{fmt(row.deadline)}</span></td>
                    <td className="dg-table-cell"><ProgressCell pct={row.pct} /></td>
                    <td className="dg-table-cell"><PriBadge p={row.priority} /></td>
                    <td className="dg-table-cell !border-r-0"><StatusPill s={row.status} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="dg-toolbar !border-t theme-border theme-footer-bg">
          <span className="text-[.775rem] theme-text-muted">Showing <strong>{sorted.length === 0 ? 0 : (safePage - 1) * rpp + 1}–{Math.min(safePage * rpp, sorted.length)}</strong> of <strong>{sorted.length}</strong> records</span>
          <div className="flex gap-1">
            {[{ label: "‹", pg: safePage - 1, disabled: safePage <= 1 }, ...dedupedPgs.map(p => ({ label: String(p), pg: typeof p === "number" ? p : -1, disabled: p === "…" })), { label: "›", pg: safePage + 1, disabled: safePage >= totalPages }].map(({ label, pg: p, disabled }, i) => (
              disabled && label !== "‹" && label !== "›" ? <span key={i} className="w-7 text-center theme-text-subtle">…</span> :
                <button key={i} disabled={disabled} onClick={() => !disabled && setPage(p)}
                  className={`dg-btn w-7 h-7 !p-0 justify-center transition-colors ${p === safePage ? 'theme-btn-neon' : 'theme-card-bg theme-text'} ${disabled ? 'opacity-30' : ''}`}>
                  {label}
                </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
