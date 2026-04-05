"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import { EMP_DATA, EMP_DEFAULT_FILTERS, type Employee, type EmpFilters } from "./data";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
const fmtSal = (n: number) => `$${Math.round(n / 1000)}k`;

const DEPT_COLORS: Record<string, { bg: string; color: string }> = {
    Engineering: { bg: "#eff6ff", color: "#1d4ed8" },
    Design: { bg: "#fdf4ff", color: "#7e22ce" },
    Marketing: { bg: "#fff7ed", color: "#c2410c" },
    Sales: { bg: "#f0fdf4", color: "#15803d" },
    Finance: { bg: "#fefce8", color: "#a16207" },
    HR: { bg: "#fff1f2", color: "#9f1239" },
    Operations: { bg: "#f0fdfa", color: "#0f766e" },
    Legal: { bg: "#fafaf9", color: "#44403c" },
};
const STATUS_STYLE: Record<string, { bg: string; color: string; border: string; dot: string }> = {
    Active: { bg: "#ecfdf5", color: "#065f46", border: "#a7f3d0", dot: "#10b981" },
    "On Leave": { bg: "#eff6ff", color: "#1e40af", border: "#bfdbfe", dot: "#3b82f6" },
    Probation: { bg: "#fffbeb", color: "#92400e", border: "#fde68a", dot: "#f59e0b" },
    Contract: { bg: "#f5f3ff", color: "#5b21b6", border: "#ddd6fe", dot: "#8b5cf6" },
    Terminated: { bg: "#fff1f2", color: "#9f1239", border: "#fecdd3", dot: "#ef4444" },
};
const PERF_STYLE: Record<string, { bg: string; color: string }> = {
    Exceeds: { bg: "#ecfdf5", color: "#065f46" },
    Meets: { bg: "#eff6ff", color: "#1e40af" },
    Below: { bg: "#fff1f2", color: "#9f1239" },
    "N/A": { bg: "#f9fafb", color: "#6b7280" },
};

function Sparkline({ vals }: { vals: number[] }) {
    const max = Math.max(...vals);
    return (
        <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 22 }}>
            {vals.map((v, i) => (
                <div key={i} style={{ width: 4, height: Math.round((v / max) * 20) + 2, borderRadius: "2px 2px 0 0", background: "#6366f1", opacity: 0.5 }} />
            ))}
        </div>
    );
}

function Stars({ n }: { n: number }) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
            {[1, 2, 3, 4, 5].map(i => (
                <svg key={i} width="10" height="10" viewBox="0 0 24 24" fill={i <= Math.round(n / 2) ? "#f59e0b" : "#e5e7eb"}>
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
            ))}
            <span style={{ fontSize: ".65rem", color: "#6b7280", marginLeft: 2 }}>{n}/10</span>
        </div>
    );
}

// ─── CSS constants ─────────────────────────────────────────────────────────────
const TD: React.CSSProperties = { height: 46, padding: "0 10px", verticalAlign: "middle", borderRight: "1px solid #e2e5eb", borderBottom: "1px solid #e2e5eb", color: "#1e2a45", whiteSpace: "nowrap" };
const BTN: React.CSSProperties = { height: 32, padding: "0 12px", display: "inline-flex", alignItems: "center", gap: 5, borderRadius: 6, fontSize: ".775rem", fontWeight: 500, fontFamily: "inherit", cursor: "pointer", border: "1px solid #c8cdde", background: "#fff", color: "#4b5775", transition: "all .15s" };
const INPUT: React.CSSProperties = { width: "100%", height: 26, border: "1px solid #c8cedf", borderRadius: 4, padding: "0 6px", fontSize: ".72rem", fontFamily: "inherit", outline: "none", background: "#fff", color: "#1e2a45" };
const SELECT: React.CSSProperties = { ...INPUT, paddingRight: 18, cursor: "pointer", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='9' height='9' viewBox='0 0 24 24' fill='none' stroke='%238b93ac' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 5px center", appearance: "none" as const };

// ─── Header Cell ──────────────────────────────────────────────────────────────
function ColHeader({ col, label, sort, dir, onSort, filterActive, children, mw = 100 }:
    { col: string; label: string; sort: string; dir: number; onSort: (c: string) => void; filterActive?: boolean; children?: React.ReactNode; mw?: number }) {
    const active = col === sort;
    return (
        <th style={{ minWidth: mw, padding: 0, position: "relative", borderRight: "1px solid #dde1ec" }}>
            <div onClick={() => onSort(col)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 10px", height: 42, cursor: "pointer", userSelect: "none", background: "transparent", gap: 4 }}>
                <span style={{ fontSize: ".7rem", fontWeight: 700, color: filterActive ? "#6366f1" : "#4b5775", textTransform: "uppercase", letterSpacing: ".04em", flex: 1, whiteSpace: "nowrap" }}>{label}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 3, flexShrink: 0 }}>
                    <span style={{ display: "flex", flexDirection: "column", gap: 1, opacity: active ? 1 : 0.3 }}>
                        <svg width="7" height="7" viewBox="0 0 24 24" fill={active && dir === 1 ? "#2563eb" : "currentColor"}><path d="M12 5l7 7H5z" /></svg>
                        <svg width="7" height="7" viewBox="0 0 24 24" fill={active && dir === -1 ? "#2563eb" : "currentColor"}><path d="M12 19l7-7H5z" /></svg>
                    </span>
                    <span style={{ fontSize: 10, color: filterActive ? "#6366f1" : "#9ca3af" }}>▼</span>
                    <span style={{ fontSize: ".68rem", color: "#c0c4d0" }}>⋮⋮</span>
                </div>
            </div>
            {children !== undefined && (
                <div style={{ padding: "3px 6px", background: "#eef1fb", borderTop: "1px solid #dde1ec" }}>{children}</div>
            )}
        </th>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function EmployeeGridPage() {
    const [filters, setFilters] = useState<EmpFilters>(EMP_DEFAULT_FILTERS);
    const [sort, setSort] = useState("id");
    const [dir, setDir] = useState(1);
    const [page, setPage] = useState(1);
    const [rpp, setRpp] = useState(20);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [groupBy, setGroupBy] = useState<"" | "department" | "location" | "status">("");
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
    const debRef = useRef<ReturnType<typeof setTimeout>>();

    const setF = useCallback((k: keyof EmpFilters, v: string) => {
        clearTimeout(debRef.current);
        debRef.current = setTimeout(() => { setFilters(p => ({ ...p, [k]: v })); setPage(1); }, 200);
    }, []);
    const setFNow = useCallback((k: keyof EmpFilters, v: string) => {
        setFilters(p => ({ ...p, [k]: v })); setPage(1);
    }, []);
    const clearAll = () => { setFilters({ ...EMP_DEFAULT_FILTERS, status: "" }); setPage(1); };

    const filtered = useMemo(() => {
        const q = filters.search.toLowerCase();
        return EMP_DATA.filter(r => {
            if (q && !(r.firstName + " " + r.lastName + " " + r.id + " " + r.email + " " + r.role).toLowerCase().includes(q)) return false;
            if (filters.department && r.department !== filters.department) return false;
            if (filters.status && r.status !== filters.status) return false;
            if (filters.performance && r.performance !== filters.performance) return false;
            if (filters.location && r.location !== filters.location) return false;
            if (filters.salMin && r.salary < +filters.salMin) return false;
            if (filters.salMax && r.salary > +filters.salMax) return false;
            if (filters.projMin && r.projects < +filters.projMin) return false;
            if (filters.projMax && r.projects > +filters.projMax) return false;
            if (filters.startAfter && r.startDate < new Date(filters.startAfter)) return false;
            return true;
        });
    }, [filters]);

    const sorted = useMemo(() => {
        return [...filtered].sort((a, b) => {
            const va = a[sort as keyof Employee], vb = b[sort as keyof Employee];
            if (va instanceof Date && vb instanceof Date) return (va.getTime() - vb.getTime()) * dir;
            if (typeof va === "string" && typeof vb === "string") return va.localeCompare(vb) * dir;
            return (+(va as number) - +(vb as number)) * dir;
        });
    }, [filtered, sort, dir]);

    const onSort = (col: string) => {
        if (sort === col) setDir(d => d * -1); else { setSort(col); setDir(1); }
        setPage(1);
    };

    // Grouping
    const grouped = useMemo(() => {
        if (!groupBy) return null;
        const map = new Map<string, Employee[]>();
        sorted.forEach(r => {
            const key = String(r[groupBy as keyof Employee]);
            if (!map.has(key)) map.set(key, []);
            map.get(key)!.push(r);
        });
        return map;
    }, [sorted, groupBy]);

    const toggleGroup = (key: string) => setExpandedGroups(p => { const n = new Set(p); n.has(key) ? n.delete(key) : n.add(key); return n; });

    const totalPages = Math.max(1, Math.ceil(sorted.length / rpp));
    const safePg = Math.min(page, totalPages);
    const pageRows = grouped ? sorted : sorted.slice((safePg - 1) * rpp, safePg * rpp);

    const toggleSel = (id: string) => setSelected(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
    const allSel = pageRows.length > 0 && pageRows.every(r => selected.has(r.id));
    const someSel = pageRows.some(r => selected.has(r.id));
    const toggleAll = (c: boolean) => setSelected(() => {
        const n = new Set<string>();
        if (c) pageRows.forEach(r => n.add(r.id));
        return n;
    });

    // Aggregations
    const avgSal = filtered.length ? Math.round(filtered.reduce((s, r) => s + r.salary, 0) / filtered.length) : 0;
    const totalProj = filtered.reduce((s, r) => s + r.projects, 0);
    const activeCount = filtered.filter(r => r.status === "Active").length;
    const avgSat = filtered.length ? (filtered.reduce((s, r) => s + r.satisfaction, 0) / filtered.length).toFixed(1) : "0";

    const hasFilters = Object.entries(filters).some(([, v]) => v !== "");

    // Build pagination
    const pgs: (number | "…")[] = [];
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || Math.abs(i - safePg) <= 1) pgs.push(i);
        else if ((i === 2 && safePg > 3) || (i === totalPages - 1 && safePg < totalPages - 2)) pgs.push("…");
    }
    const dedPgs = pgs.filter((v, i, a) => !(v === "…" && a[i - 1] === "…"));

    // Row renderer
    const renderRow = (r: Employee, ri: number) => {
        const sel = selected.has(r.id);
        const ss = STATUS_STYLE[r.status] ?? STATUS_STYLE.Active;
        const ps = PERF_STYLE[r.performance] ?? PERF_STYLE["N/A"];
        const dc = DEPT_COLORS[r.department] ?? DEPT_COLORS.Engineering;
        return (
            <tr key={r.id} onClick={() => toggleSel(r.id)}
                style={{ background: sel ? "#e8effe" : ri % 2 ? "#f9fafd" : "#fff", borderLeft: sel ? "3px solid #3b82f6" : "3px solid transparent", cursor: "pointer", transition: "background .1s" }}
                onMouseEnter={e => { if (!sel) e.currentTarget.style.background = "#eff3ff"; }}
                onMouseLeave={e => { e.currentTarget.style.background = sel ? "#e8effe" : ri % 2 ? "#f9fafd" : "#fff"; }}
            >
                <td style={{ ...TD, width: 44, padding: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 46 }}>
                        <input type="checkbox" checked={sel} onChange={() => toggleSel(r.id)} onClick={e => e.stopPropagation()} style={{ width: 14, height: 14, accentColor: "#2563eb", cursor: "pointer" }} />
                    </div>
                </td>
                <td style={TD}><span style={{ fontFamily: "monospace", fontSize: ".74rem", color: "#2563eb", fontWeight: 700 }}>{r.id}</span></td>
                <td style={TD}>
                    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                        <div style={{ width: 30, height: 30, borderRadius: "50%", background: r.avatarColor, fontSize: ".68rem", fontWeight: 800, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{r.initials}</div>
                        <div>
                            <div style={{ fontWeight: 600, fontSize: ".825rem" }}>{r.firstName} {r.lastName}</div>
                            <div style={{ fontSize: ".68rem", color: "#8b93ac" }}>{r.email}</div>
                        </div>
                    </div>
                </td>
                <td style={TD}>
                    <span style={{ ...dc, fontSize: ".72rem", fontWeight: 700, padding: "2px 8px", borderRadius: 4, display: "inline-block" }}>{r.department}</span>
                </td>
                <td style={TD}><span style={{ fontSize: ".8rem", color: "#374151" }}>{r.role}</span></td>
                <td style={TD}><span style={{ fontSize: ".78rem", color: "#4b5775" }}>📍 {r.location}</span></td>
                <td style={TD}><span style={{ fontWeight: 700, color: "#1e2a45" }}>{fmtSal(r.salary)}</span></td>
                <td style={{ ...TD }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ color: "#4b5775", fontSize: ".775rem", fontWeight: 500 }}>{r.projects}</span>
                        <Sparkline vals={r.spark} />
                    </div>
                </td>
                <td style={TD}><span style={{ fontSize: ".775rem", color: "#4b5775" }}>{fmt(r.startDate)}</span></td>
                <td style={TD}>
                    <span style={{ ...ps, fontSize: ".7rem", fontWeight: 700, padding: "2px 10px", borderRadius: 99, display: "inline-block" }}>{r.performance}</span>
                </td>
                <td style={TD}><Stars n={r.satisfaction} /></td>
                <td style={{ ...TD }}>
                    <span style={{ marginRight: 4, fontSize: ".68rem", color: "#6b7280" }}>Mgr:</span>
                    <span style={{ fontSize: ".775rem", fontWeight: 500 }}>{r.manager}</span>
                </td>
                <td style={{ ...TD, borderRight: "none" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 99, fontSize: ".7rem", fontWeight: 600, background: ss.bg, color: ss.color, border: `1px solid ${ss.border}` }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: ss.dot, display: "inline-block" }} />
                        {r.status}
                    </span>
                </td>
            </tr>
        );
    };

    return (
        <div style={{ fontFamily: "'Inter',system-ui,sans-serif", padding: "24px 20px 48px", background: "#f0f2f8", minHeight: "100vh" }}>
            {/* Page header */}
            <div style={{ maxWidth: 1500, margin: "0 auto 18px", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                <div>
                    <h1 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#1e2a45", display: "flex", alignItems: "center", gap: 8 }}>
                        Employee Directory
                        <span style={{ fontSize: ".68rem", padding: "3px 8px", borderRadius: 99, background: "#fdf4ff", color: "#7e22ce", border: "1px solid #e9d5ff", fontWeight: 700 }}>HR Enterprise</span>
                    </h1>
                    <p style={{ fontSize: ".78rem", color: "#8b93ac", marginTop: 2 }}>
                        2,400 employees · Multi-row grid · AG Grid style · Live filtering · Grouping
                    </p>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", fontSize: ".775rem" }}>
                    <span style={{ fontWeight: 600, color: "#4b5775" }}>{selected.size} selected</span>
                    <span style={{ color: "#dde1ec" }}>|</span>
                    <span style={{ color: "#8b93ac" }}>Showing <strong style={{ color: "#1e2a45" }}>{filtered.length.toLocaleString()}</strong> of <strong style={{ color: "#1e2a45" }}>2,400</strong></span>
                </div>
            </div>

            <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,.07),0 4px 16px rgba(0,0,0,.05)", border: "1px solid #dde1ec", overflow: "hidden", maxWidth: 1500, margin: "0 auto" }}>

                {/* Toolbar */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", borderBottom: "1px solid #dde1ec", gap: 10, flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span style={{ fontSize: ".9375rem", fontWeight: 700, color: "#1e2a45", display: "flex", alignItems: "center", gap: 8 }}>
                            Employees
                            <span style={{ fontSize: ".7rem", background: "#eff4ff", color: "#2563eb", border: "1px solid #c7d7fd", padding: "2px 8px", borderRadius: 99, fontWeight: 700 }}>{filtered.length.toLocaleString()} records</span>
                        </span>
                        <div style={{ width: 1, height: 20, background: "#dde1ec" }} />
                        {/* Global search */}
                        <div style={{ position: "relative" }}>
                            <svg style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", width: 13, height: 13, color: "#8b93ac", pointerEvents: "none" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                            </svg>
                            <input
                                style={{ ...INPUT, width: 220, paddingLeft: 28, height: 32, borderRadius: 6 }}
                                placeholder="Search name, ID, role…"
                                defaultValue={filters.search}
                                onChange={e => setF("search", e.target.value)}
                            />
                        </div>
                        <button style={{ ...BTN, ...(hasFilters ? { background: "#f0f0ff", borderColor: "#a5b4fc", color: "#6366f1" } : {}) }} onClick={clearAll}>✕ Clear Filters</button>
                        {/* Group By */}
                        <select style={{ ...BTN, padding: "0 24px 0 10px", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='9' height='9' viewBox='0 0 24 24' fill='none' stroke='%238b93ac' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center", appearance: "none", cursor: "pointer" }}
                            value={groupBy} onChange={e => { setGroupBy(e.target.value as "" | "department" | "location" | "status"); setExpandedGroups(new Set()); }}>
                            <option value="">⊞ No Grouping</option>
                            <option value="department">Group by Department</option>
                            <option value="location">Group by Location</option>
                            <option value="status">Group by Status</option>
                        </select>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                        <button style={BTN}>↓ Export CSV</button>
                        <button style={BTN}>📄 Export Excel</button>
                        <button style={{ ...BTN, background: "#2563eb", color: "#fff", borderColor: "#2563eb" }}>+ Add Employee</button>
                    </div>
                </div>

                {/* Active filter chips */}
                {hasFilters && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 16px", borderBottom: "1px solid #dde1ec", background: "#fafbff", flexWrap: "wrap" }}>
                        <span style={{ fontSize: ".7rem", color: "#8b93ac", fontWeight: 500 }}>Filtered by:</span>
                        {filters.status && <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 99, fontSize: ".7rem", fontWeight: 600, background: "#f0f0ff", border: "1px solid #c7c7fd", color: "#6366f1" }}>Status: {filters.status} <span onClick={() => setFNow("status", "")} style={{ cursor: "pointer", marginLeft: 3, fontWeight: 700, opacity: .6 }}>×</span></span>}
                        {filters.department && <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 99, fontSize: ".7rem", fontWeight: 600, background: "#f0f0ff", border: "1px solid #c7c7fd", color: "#6366f1" }}>Dept: {filters.department} <span onClick={() => setFNow("department", "")} style={{ cursor: "pointer", marginLeft: 3, fontWeight: 700, opacity: .6 }}>×</span></span>}
                        {filters.location && <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 99, fontSize: ".7rem", fontWeight: 600, background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#16a34a" }}>📍 {filters.location} <span onClick={() => setFNow("location", "")} style={{ cursor: "pointer", marginLeft: 3, fontWeight: 700, opacity: .6 }}>×</span></span>}
                        {filters.performance && <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 99, fontSize: ".7rem", fontWeight: 600, background: "#fff7ed", border: "1px solid #fed7aa", color: "#ea580c" }}>Perf: {filters.performance} <span onClick={() => setFNow("performance", "")} style={{ cursor: "pointer", marginLeft: 3, fontWeight: 700, opacity: .6 }}>×</span></span>}
                        {(filters.salMin || filters.salMax) && <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 99, fontSize: ".7rem", fontWeight: 600, background: "#fff7ed", border: "1px solid #fed7aa", color: "#ea580c" }}>${(+filters.salMin || 0) / 1000}k–${(+filters.salMax || 0) / 1000}k <span onClick={() => { setFNow("salMin", ""); setFNow("salMax", ""); }} style={{ cursor: "pointer", marginLeft: 3, fontWeight: 700, opacity: .6 }}>×</span></span>}
                        {filters.search && <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 99, fontSize: ".7rem", fontWeight: 600, background: "#f0f0ff", border: "1px solid #c7c7fd", color: "#6366f1" }}>🔍 "{filters.search}" <span onClick={() => setFNow("search", "")} style={{ cursor: "pointer", marginLeft: 3, fontWeight: 700, opacity: .6 }}>×</span></span>}
                    </div>
                )}

                {/* Aggregation bar */}
                <div style={{ display: "flex", gap: 12, padding: "7px 16px", borderBottom: "1px solid #dde1ec", background: "linear-gradient(90deg,#f8f9ff,#fff)", flexWrap: "wrap" }}>
                    {[
                        { label: "Avg Salary", val: fmtSal(avgSal) },
                        { label: "Active Employees", val: activeCount.toLocaleString() },
                        { label: "Total Projects", val: totalProj.toLocaleString() },
                        { label: "Avg Satisfaction", val: `${avgSat}/10` },
                        { label: "Filtered", val: `${filtered.length.toLocaleString()} / 2,400` },
                    ].map(({ label, val }) => (
                        <span key={label} style={{ fontSize: ".72rem", color: "#4b5775" }}>
                            {label}: <strong style={{ color: "#1e2a45" }}>{val}</strong>
                        </span>
                    ))}
                </div>

                {/* Table */}
                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1300, fontSize: ".8rem" }}>
                        <thead>
                            {/* Multi-row group headers */}
                            <tr style={{ background: "linear-gradient(180deg,#e8edf8,#dde3f0)" }}>
                                <td colSpan={3} style={{ borderRight: "2px solid #c8cdde", height: 26 }} />
                                <td colSpan={3} style={{ textAlign: "center", fontSize: ".63rem", fontWeight: 700, color: "#4b5775", textTransform: "uppercase", letterSpacing: ".05em", borderRight: "2px solid #c8cdde" }}>Identity & Role</td>
                                <td colSpan={2} style={{ textAlign: "center", fontSize: ".63rem", fontWeight: 700, color: "#4b5775", textTransform: "uppercase", letterSpacing: ".05em", borderRight: "2px solid #c8cdde" }}>Compensation</td>
                                <td colSpan={2} style={{ textAlign: "center", fontSize: ".63rem", fontWeight: 700, color: "#4b5775", textTransform: "uppercase", letterSpacing: ".05em", borderRight: "2px solid #c8cdde" }}>Timeline & Perf</td>
                                <td colSpan={3} style={{ textAlign: "center", fontSize: ".63rem", fontWeight: 700, color: "#4b5775", textTransform: "uppercase", letterSpacing: ".05em" }}>Engagement</td>
                            </tr>
                            <tr style={{ background: "#f4f6fb", borderBottom: "2px solid #c8cdde" }}>
                                {/* Checkbox */}
                                <th style={{ width: 44, padding: 0, borderRight: "1px solid #dde1ec" }}>
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 42 }}>
                                        <input type="checkbox" checked={allSel} ref={el => { if (el) el.indeterminate = someSel && !allSel; }} onChange={e => toggleAll(e.target.checked)} style={{ width: 14, height: 14, accentColor: "#2563eb", cursor: "pointer" }} />
                                    </div>
                                    <div style={{ height: 32, background: "#eef1fb", borderTop: "1px solid #dde1ec" }} />
                                </th>
                                <ColHeader col="id" label="Emp ID" sort={sort} dir={dir} onSort={onSort} mw={100} filterActive={false}>
                                    <input style={INPUT} placeholder="Search…" defaultValue={filters.search} onChange={e => setF("search", e.target.value)} />
                                </ColHeader>
                                <ColHeader col="lastName" label="Name" sort={sort} dir={dir} onSort={onSort} mw={180} filterActive={!!filters.search}>
                                    <input style={INPUT} placeholder="Contains…" defaultValue={filters.search} onChange={e => setF("search", e.target.value)} />
                                </ColHeader>
                                <ColHeader col="department" label="Department" sort={sort} dir={dir} onSort={onSort} mw={130} filterActive={!!filters.department}>
                                    <select style={SELECT} value={filters.department} onChange={e => setFNow("department", e.target.value)}>
                                        <option value="">All</option>
                                        {["Engineering", "Design", "Marketing", "Sales", "Finance", "HR", "Operations", "Legal"].map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </ColHeader>
                                <ColHeader col="role" label="Role" sort={sort} dir={dir} onSort={onSort} mw={150}>
                                    <input style={INPUT} placeholder="Contains…" onChange={e => setF("search", e.target.value)} />
                                </ColHeader>
                                <ColHeader col="location" label="Location" sort={sort} dir={dir} onSort={onSort} mw={120} filterActive={!!filters.location}>
                                    <select style={SELECT} value={filters.location} onChange={e => setFNow("location", e.target.value)}>
                                        <option value="">All Locations</option>
                                        {["New York", "London", "Singapore", "Berlin", "Sydney", "Toronto", "Bangalore", "Dubai"].map(l => <option key={l} value={l}>{l}</option>)}
                                    </select>
                                </ColHeader>
                                <ColHeader col="salary" label="Salary" sort={sort} dir={dir} onSort={onSort} mw={110} filterActive={!!(filters.salMin || filters.salMax)}>
                                    <div style={{ display: "flex", gap: 4 }}>
                                        <input type="number" style={{ ...INPUT, width: "50%", textAlign: "center" }} placeholder="Min" defaultValue={filters.salMin} onChange={e => setF("salMin", e.target.value)} />
                                        <input type="number" style={{ ...INPUT, width: "50%", textAlign: "center" }} placeholder="Max" defaultValue={filters.salMax} onChange={e => setF("salMax", e.target.value)} />
                                    </div>
                                </ColHeader>
                                <ColHeader col="projects" label="Projects" sort={sort} dir={dir} onSort={onSort} mw={110} filterActive={!!(filters.projMin || filters.projMax)}>
                                    <div style={{ display: "flex", gap: 4 }}>
                                        <input type="number" style={{ ...INPUT, width: "50%", textAlign: "center" }} placeholder="≥" defaultValue={filters.projMin} onChange={e => setF("projMin", e.target.value)} />
                                        <input type="number" style={{ ...INPUT, width: "50%", textAlign: "center" }} placeholder="≤" defaultValue={filters.projMax} onChange={e => setF("projMax", e.target.value)} />
                                    </div>
                                </ColHeader>
                                <ColHeader col="startDate" label="Start Date" sort={sort} dir={dir} onSort={onSort} mw={110} filterActive={!!filters.startAfter}>
                                    <input type="date" style={INPUT} defaultValue={filters.startAfter} onChange={e => setFNow("startAfter", e.target.value)} />
                                </ColHeader>
                                <ColHeader col="performance" label="Performance" sort={sort} dir={dir} onSort={onSort} mw={120} filterActive={!!filters.performance}>
                                    <select style={SELECT} value={filters.performance} onChange={e => setFNow("performance", e.target.value)}>
                                        <option value="">All</option>
                                        {["Exceeds", "Meets", "Below", "N/A"].map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </ColHeader>
                                <ColHeader col="satisfaction" label="Satisfaction" sort={sort} dir={dir} onSort={onSort} mw={130}>
                                    <div style={{ height: 26 }} />
                                </ColHeader>
                                <ColHeader col="manager" label="Manager" sort={sort} dir={dir} onSort={onSort} mw={140}>
                                    <input style={INPUT} placeholder="Search…" onChange={e => setF("search", e.target.value)} />
                                </ColHeader>
                                <ColHeader col="status" label="Status" sort={sort} dir={dir} onSort={onSort} mw={120} filterActive={!!filters.status}>
                                    <select style={{ ...SELECT, borderColor: filters.status ? "#6366f1" : "#c8cedf" }} value={filters.status} onChange={e => setFNow("status", e.target.value)}>
                                        <option value="">All</option>
                                        {["Active", "On Leave", "Probation", "Contract", "Terminated"].map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </ColHeader>
                            </tr>
                        </thead>
                        <tbody>
                            {!grouped ? (
                                pageRows.length === 0 ? (
                                    <tr><td colSpan={13} style={{ textAlign: "center", padding: "3rem", color: "#8b93ac" }}>
                                        No employees match the current filters. <button onClick={clearAll} style={{ color: "#2563eb", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>Clear filters</button>
                                    </td></tr>
                                ) : pageRows.map((r, i) => renderRow(r, i))
                            ) : (
                                Array.from(grouped.entries()).map(([groupKey, rows]) => {
                                    const isOpen = expandedGroups.has(groupKey);
                                    const firstRow = rows[0];
                                    const ss = STATUS_STYLE[groupKey as keyof typeof STATUS_STYLE];
                                    const dc = DEPT_COLORS[groupKey as keyof typeof DEPT_COLORS];
                                    const groupStyle = ss ?? dc ?? { bg: "#f8f9fc", color: "#4b5775", border: "#e2e5eb" };
                                    return [
                                        <tr key={`grp-${groupKey}`} onClick={() => toggleGroup(groupKey)} style={{ background: "#f0f2fa", cursor: "pointer", borderLeft: `3px solid ${groupStyle.color ?? "#6366f1"}` }}>
                                            <td colSpan={13} style={{ padding: "10px 16px", borderBottom: "1px solid #dde1ec" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                    <span style={{ fontSize: ".8rem", fontWeight: 700, color: groupStyle.color ?? "#1e2a45" }}>
                                                        {isOpen ? "▼" : "▶"} {groupBy.charAt(0).toUpperCase() + groupBy.slice(1)}: {groupKey}
                                                    </span>
                                                    <span style={{ fontSize: ".72rem", background: "#fff", border: "1px solid #dde1ec", borderRadius: 99, padding: "2px 8px", color: "#4b5775", fontWeight: 600 }}>
                                                        {rows.length} employees
                                                    </span>
                                                    <span style={{ fontSize: ".72rem", color: "#8b93ac" }}>
                                                        Avg Salary: <strong style={{ color: "#1e2a45" }}>{fmtSal(Math.round(rows.reduce((s, r) => s + r.salary, 0) / rows.length))}</strong>
                                                        &nbsp;·&nbsp; Avg Projects: <strong style={{ color: "#1e2a45" }}>{(rows.reduce((s, r) => s + r.projects, 0) / rows.length).toFixed(1)}</strong>
                                                        &nbsp;·&nbsp; Departments: <strong style={{ color: "#1e2a45" }}>{[...new Set(rows.map(r => r.department))].length}</strong>
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>,
                                        ...(isOpen ? rows.slice(0, 50).map((r, i) => renderRow(r, i)) : []),
                                        ...(isOpen && rows.length > 50 ? [
                                            <tr key={`grp-more-${groupKey}`}><td colSpan={13} style={{ padding: "8px 16px", color: "#8b93ac", fontSize: ".75rem", background: "#fafbff", borderBottom: "1px solid #dde1ec" }}>
                                                + {rows.length - 50} more employees in this group
                                            </td></tr>
                                        ] : []),
                                    ];
                                }).flat()
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", borderTop: "1px solid #dde1ec", background: "#f4f6fb", flexWrap: "wrap", gap: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                        <span style={{ fontSize: ".775rem", color: "#4b5775" }}>
                            {!grouped
                                ? <>Showing <strong style={{ color: "#1e2a45" }}>{sorted.length === 0 ? 0 : (safePg - 1) * rpp + 1}–{Math.min(safePg * rpp, sorted.length)}</strong> of <strong style={{ color: "#1e2a45" }}>{sorted.length.toLocaleString()}</strong> employees</>
                                : <><strong style={{ color: "#1e2a45" }}>{grouped.size}</strong> groups · <strong style={{ color: "#1e2a45" }}>{sorted.length.toLocaleString()}</strong> employees</>
                            }
                        </span>
                        {!grouped && (
                            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: ".775rem", color: "#4b5775" }}>
                                Rows per page:
                                <select style={{ height: 28, padding: "0 20px 0 8px", border: "1px solid #c8cdde", borderRadius: 5, fontSize: ".765rem", fontFamily: "inherit", appearance: "none", background: "#fff", color: "#1e2a45", outline: "none", cursor: "pointer" }}
                                    value={rpp} onChange={e => { setRpp(+e.target.value); setPage(1); }}>
                                    {[20, 50, 100, 200].map(n => <option key={n} value={n}>{n}</option>)}
                                </select>
                            </div>
                        )}
                    </div>
                    {!grouped && (
                        <div style={{ display: "flex", gap: 3 }}>
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePg <= 1} style={{ width: 28, height: 28, borderRadius: 5, border: "1px solid #c8cdde", background: "#fff", color: "#4b5775", cursor: safePg <= 1 ? "default" : "pointer", opacity: safePg <= 1 ? .35 : 1, fontSize: ".85rem" }}>‹</button>
                            {dedPgs.map((p, i) => p === "…" ? (
                                <span key={i} style={{ width: 28, textAlign: "center", color: "#8b93ac", lineHeight: "28px" }}>…</span>
                            ) : (
                                <button key={i} onClick={() => setPage(p as number)} style={{ width: 28, height: 28, borderRadius: 5, border: "1px solid #c8cdde", background: p === safePg ? "#2563eb" : "#fff", color: p === safePg ? "#fff" : "#4b5775", fontWeight: p === safePg ? 700 : 500, fontSize: ".755rem", cursor: "pointer", fontFamily: "inherit" }}>{p}</button>
                            ))}
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePg >= totalPages} style={{ width: 28, height: 28, borderRadius: 5, border: "1px solid #c8cdde", background: "#fff", color: "#4b5775", cursor: safePg >= totalPages ? "default" : "pointer", opacity: safePg >= totalPages ? .35 : 1, fontSize: ".85rem" }}>›</button>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
