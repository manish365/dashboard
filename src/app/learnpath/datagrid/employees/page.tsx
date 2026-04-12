"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import { Search, X } from "lucide-react";
import { EMP_DATA, EMP_DEFAULT_FILTERS, type Employee, type EmpFilters } from "./data";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
const fmtSal = (n: number) => `$${Math.round(n / 1000)}k`;

const STATUS_MAP: Record<string, string> = {
    Active: 'theme-tag-success theme-border',
    'On Leave': 'theme-tag-info theme-border',
    Probation: 'theme-tag-warning theme-border',
    Contract: 'theme-tag-accent theme-border',
    Terminated: 'theme-tag-danger theme-border',
};

const PERF_MAP: Record<string, string> = {
    Exceeds: 'theme-tag-success',
    Meets: 'theme-tag-info',
    Below: 'theme-tag-danger',
    'N/A': 'theme-tag-subtle',
};

const DEPT_MAP: Record<string, string> = {
    Engineering: 'theme-tag-info',
    Design: 'theme-tag-accent',
    Marketing: 'theme-tag-orange',
    Sales: 'theme-tag-success',
    Finance: 'theme-tag-warning',
    HR: 'theme-tag-danger',
    Operations: 'theme-tag-teal',
    Legal: 'theme-tag-subtle',
};

const getGroupCls = (key: string) => {
    if (STATUS_MAP[key]) return { text: 'theme-text-neon', border: 'theme-border-brand' };
    if (DEPT_MAP[key])   return { text: 'theme-text-info', border: 'theme-border-info' };
    return { text: 'theme-text', border: 'theme-border' };
};

function Sparkline({ vals }: { vals: number[] }) {
    const max = Math.max(...vals);
    return (
        <div className="flex items-end gap-0.5 h-5.5">
            {vals.map((v, i) => (
                <div key={i} className="w-1 rounded-t theme-tag-info opacity-50" 
                     style={{ height: Math.round((v / max) * 20) + 2 }} />
            ))}
        </div>
    );
}

function Stars({ n }: { n: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map(i => (
                <svg key={i} width="10" height="10" viewBox="0 0 24 24" className={i <= Math.round(n / 2) ? 'fill-theme-neon' : 'fill-current theme-text-subtle opacity-40'}>
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
            ))}
            <span className="text-[10px] theme-text-subtle ml-0.5">{n}/10</span>
        </div>
    );
}

// ─── CSS constants ─────────────────────────────────────────────────────────────
const SELECT_CLS = "dg-select !h-6.5 text-[10px]";
const INPUT_CLS = "dg-input !h-6.5 text-[10px]";
const TD_CLS = "dg-table-cell !h-11";
const BTN_CLS = "dg-btn !h-8";

// ─── Header Cell ──────────────────────────────────────────────────────────────
function ColHeader({ col, label, sort, dir, onSort, filterActive, children, mw = 100 }:
    { col: string; label: string; sort: string; dir: number; onSort: (c: string) => void; filterActive?: boolean; children?: React.ReactNode; mw?: number }) {
    const active = col === sort;
    return (
        <th className="dg-table-header-cell !p-0 relative border-r theme-border" style={{ minWidth: mw }}>
            <div onClick={() => onSort(col)} className="flex items-center justify-between px-2.5 h-10.5 cursor-pointer select-none gap-1">
                <span className={`text-[11px] font-bold uppercase tracking-wider truncate transition-colors ${filterActive ? 'theme-text-neon' : 'theme-text-muted'}`}>{label}</span>
                <div className="flex items-center gap-0.5 shrink-0">
                    <span className={`flex flex-col gap-0.25 transition-opacity ${active ? 'opacity-100' : 'opacity-30'}`}>
                        <svg width="7" height="7" viewBox="0 0 24 24" className={active && dir === 1 ? 'fill-theme-neon' : 'fill-current'}><path d="M12 5l7 7H5z" /></svg>
                        <svg width="7" height="7" viewBox="0 0 24 24" className={active && dir === -1 ? 'fill-theme-neon' : 'fill-current'}><path d="M12 19l7-7H5z" /></svg>
                    </span>
                    <span className={`text-[10px] ${filterActive ? 'theme-text-neon' : 'theme-text-subtle'}`}>▼</span>
                    <span className="text-[11px] theme-text-subtle opacity-40 leading-none">⋮</span>
                </div>
            </div>
            {children !== undefined && (
                <div className="px-1.5 py-1 theme-footer-bg border-t theme-border">{children}</div>
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
        const statusCls = STATUS_MAP[r.status] || 'theme-tag-subtle';
        const perfCls = PERF_MAP[r.performance] || 'theme-tag-subtle';
        const deptCls = DEPT_MAP[r.department] || 'theme-tag-subtle';
        
        return (
            <tr key={r.id} onClick={() => toggleSel(r.id)}
                className={`dg-table-row cursor-pointer transition-colors border-l-3 ${sel ? 'bg-blue-500/10 border-blue-500' : 'theme-border-transparent hover:theme-table-header'}`}>
                <td className={`${TD_CLS} !w-11 !p-0`}>
                    <div className="flex items-center justify-center h-full">
                        <input type="checkbox" checked={sel} onChange={() => toggleSel(r.id)} onClick={e => e.stopPropagation()} className="w-3.5 h-3.5 accent-blue-600 cursor-pointer" />
                    </div>
                </td>
                <td className={TD_CLS}><span className="theme-mono text-[11px] theme-text-neon font-bold">{r.id}</span></td>
                <td className={TD_CLS}>
                    <div className="flex items-center gap-2.5">
                        <div className="w-7.5 h-7.5 rounded-full text-[10px] font-black theme-text-on-neon flex items-center justify-center shrink-0 shadow-sm" style={{ background: r.avatarColor }}>{r.initials}</div>
                        <div className="truncate">
                            <div className="font-semibold text-xs theme-text truncate">{r.firstName} {r.lastName}</div>
                            <div className="text-[10px] theme-text-muted truncate">{r.email}</div>
                        </div>
                    </div>
                </td>
                <td className={TD_CLS}>
                    <span className={`${deptCls} text-[11px] font-bold px-2 py-0.5 rounded`}>{r.department}</span>
                </td>
                <td className={TD_CLS}><span className="text-xs theme-text">{r.role}</span></td>
                <td className={TD_CLS}><span className="text-xs theme-text-muted">📍 {r.location}</span></td>
                <td className={TD_CLS}><span className="font-bold theme-text">{fmtSal(r.salary)}</span></td>
                <td className={TD_CLS}>
                    <div className="flex items-center gap-1.5">
                        <span className="theme-text-muted text-[11px] font-medium">{r.projects}</span>
                        <Sparkline vals={r.spark} />
                    </div>
                </td>
                <td className={TD_CLS}><span className="text-xs theme-text-muted">{fmt(r.startDate)}</span></td>
                <td className={TD_CLS}>
                    <span className={`${perfCls} text-[11px] font-bold px-2 py-0.5 rounded-full`}>{r.performance}</span>
                </td>
                <td className={TD_CLS}><Stars n={r.satisfaction} /></td>
                <td className={TD_CLS}>
                    <span className="text-[10px] theme-text-subtle mr-1">Mgr:</span>
                    <span className="text-xs font-medium theme-text">{r.manager}</span>
                </td>
                <td className={`${TD_CLS} border-r-0`}>
                    <span className={`dg-status-pill ${statusCls} !py-0.5`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                        {r.status}
                    </span>
                </td>
            </tr>
        );
    };

    return (
    return (
        <div className="theme-main-bg min-h-screen p-5 sm:p-6 pb-12">
            {/* Page header */}
            <div className="max-w-[1500px] mx-auto mb-4.5 flex justify-between items-end flex-wrap gap-2">
                <div>
                    <h1 className="theme-text text-xl font-bold flex items-center gap-2">
                        Employee Directory
                        <span className="text-[10px] theme-tag-purple px-2 py-0.5 rounded-full font-bold">HR Enterprise</span>
                    </h1>
                    <p className="theme-text-muted text-xs mt-0.5">
                        2,400 employees · Multi-row grid · AG Grid style · Live filtering · Grouping
                    </p>
                </div>
                <div className="flex gap-2 items-center text-[11px] font-medium">
                    <span className="theme-text-muted"><strong className="theme-text">{selected.size}</strong> selected</span>
                    <span className="theme-text-subtle opacity-30">|</span>
                    <span className="theme-text-muted">Showing <strong className="theme-text">{filtered.length.toLocaleString()}</strong> of <strong className="theme-text">2,400</strong></span>
                </div>
            </div>

            <div className="dg-card max-w-[1500px] mx-auto shadow-xl">

                {/* Toolbar */}
                <div className="dg-toolbar theme-footer-bg">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[14px] font-bold theme-text flex items-center gap-2">
                            Employees
                            <span className="dg-badge theme-tag-brand text-[10px] font-bold">{filtered.length.toLocaleString()} records</span>
                        </span>
                        <div className="w-[1px] h-5 theme-border border-r mx-1" />
                        {/* Global search */}
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 theme-text-subtle pointer-events-none" />
                            <input
                                className={`${INPUT_CLS} !pl-7 !h-8 !w-55 !rounded-lg`}
                                placeholder="Search name, ID, role…"
                                defaultValue={filters.search}
                                onChange={e => setF("search", e.target.value)}
                            />
                        </div>
                        <button className={`${BTN_CLS} ${hasFilters ? 'theme-tag-info' : 'theme-footer-bg'}`} onClick={clearAll}>✕ Clear Filters</button>
                        {/* Group By */}
                        <select className={`${BTN_CLS} !pr-6 !bg-right cursor-pointer dg-select`}
                            value={groupBy} onChange={e => { setGroupBy(e.target.value as "" | "department" | "location" | "status"); setExpandedGroups(new Set()); }}>
                            <option value="" className="theme-option">⊞ No Grouping</option>
                            <option value="department" className="theme-option">Group by Department</option>
                            <option value="location" className="theme-option">Group by Location</option>
                            <option value="status" className="theme-option">Group by Status</option>
                        </select>
                    </div>
                    <div className="flex gap-1.5">
                        <button className={BTN_CLS}>↓ CSV</button>
                        <button className={BTN_CLS}>📄 Excel</button>
                        <button className={`${BTN_CLS} theme-btn-neon shadow-none !border-none`}>+ Add Employee</button>
                    </div>
                </div>

                {/* Active filter chips */}
                {hasFilters && (
                    <div className="dg-filter-bar !bg-white/3">
                        <span className="text-[11px] theme-text-muted font-bold mr-1">Filtered by:</span>
                        {filters.status && <span className="dg-badge theme-tag-info">Status: {filters.status} <X onClick={() => setFNow("status", "")} className="w-3 h-3 cursor-pointer ml-1 opacity-60 hover:opacity-100" /></span>}
                        {filters.department && <span className="dg-badge theme-tag-info">Dept: {filters.department} <X onClick={() => setFNow("department", "")} className="w-3 h-3 cursor-pointer ml-1 opacity-60 hover:opacity-100" /></span>}
                        {filters.location && <span className="dg-badge theme-tag-teal">📍 {filters.location} <X onClick={() => setFNow("location", "")} className="w-3 h-3 cursor-pointer ml-1 opacity-60 hover:opacity-100" /></span>}
                        {filters.performance && <span className="dg-badge theme-tag-orange">Perf: {filters.performance} <X onClick={() => setFNow("performance", "")} className="w-3 h-3 cursor-pointer ml-1 opacity-60 hover:opacity-100" /></span>}
                        {(filters.salMin || filters.salMax) && <span className="dg-badge theme-tag-orange">${(+filters.salMin || 0) / 1000}k–${(+filters.salMax || 0) / 1000}k <X onClick={() => { setFNow("salMin", ""); setFNow("salMax", ""); }} className="w-3 h-3 cursor-pointer ml-1 opacity-60 hover:opacity-100" /></span>}
                    </div>
                )}

                {/* Aggregation bar */}
                <div className="dg-stats-bar border-b theme-border !bg-black/5">
                    {[
                        { label: "Avg Salary", val: fmtSal(avgSal) },
                        { label: "Active", val: activeCount.toLocaleString() },
                        { label: "Projects", val: totalProj.toLocaleString() },
                        { label: "Satisfaction", val: `${avgSat}/10` },
                        { label: "In View", val: `${filtered.length.toLocaleString()}` },
                    ].map(({ label, val }) => (
                        <span key={label} className="text-[10px] theme-text-muted font-medium">
                            {label}: <strong className="theme-text mx-1">{val}</strong>
                        </span>
                    ))}
                </div>

                {/* Table */}
                <div className="dg-table-wrapper">
                    <table className="dg-table !min-w-[1400px]">
                        <thead>
                            {/* Multi-row group headers */}
                            <tr className="theme-table-header">
                                <td colSpan={3} className="border-r theme-border h-6" />
                                <td colSpan={3} className="text-center text-[9px] font-black theme-text-muted uppercase tracking-widest border-r theme-border">Identity & Role</td>
                                <td colSpan={2} className="text-center text-[9px] font-black theme-text-muted uppercase tracking-widest border-r theme-border">Compensation</td>
                                <td colSpan={2} className="text-center text-[9px] font-black theme-text-muted uppercase tracking-widest border-r theme-border">Timeline & Perf</td>
                                <td colSpan={3} className="text-center text-[9px] font-black theme-text-muted uppercase tracking-widest">Engagement</td>
                            </tr>
                            <tr className="dg-table-header-cell border-b-2 theme-border">
                                {/* Checkbox */}
                                <th className="dg-table-header-cell !w-11 !p-0 border-r theme-border">
                                    <div className="flex items-center justify-center h-10.5">
                                        <input type="checkbox" checked={allSel} ref={el => { if (el) el.indeterminate = someSel && !allSel; }} onChange={e => toggleAll(e.target.checked)} className="w-3.5 h-3.5 accent-blue-600 cursor-pointer" />
                                    </div>
                                    <div className="h-8 theme-footer-bg border-t theme-border" />
                                </th>
                                <ColHeader col="id" label="Emp ID" sort={sort} dir={dir} onSort={onSort} mw={100} filterActive={false}>
                                    <input className={INPUT_CLS} placeholder="Search…" defaultValue={filters.search} onChange={e => setF("search", e.target.value)} suppressHydrationWarning />
                                </ColHeader>
                                <ColHeader col="lastName" label="Name" sort={sort} dir={dir} onSort={onSort} mw={180} filterActive={!!filters.search}>
                                    <input className={INPUT_CLS} placeholder="Contains…" defaultValue={filters.search} onChange={e => setF("search", e.target.value)} suppressHydrationWarning />
                                </ColHeader>
                                <ColHeader col="department" label="Department" sort={sort} dir={dir} onSort={onSort} mw={130} filterActive={!!filters.department}>
                                    <select className={SELECT_CLS} value={filters.department} onChange={e => setFNow("department", e.target.value)} suppressHydrationWarning>
                                        <option value="" className="theme-option">All</option>
                                        {["Engineering", "Design", "Marketing", "Sales", "Finance", "HR", "Operations", "Legal"].map(d => <option key={d} value={d} className="theme-option">{d}</option>)}
                                    </select>
                                </ColHeader>
                                <ColHeader col="role" label="Role" sort={sort} dir={dir} onSort={onSort} mw={150}>
                                    <input className={INPUT_CLS} placeholder="Contains…" onChange={e => setF("search", e.target.value)} suppressHydrationWarning />
                                </ColHeader>
                                <ColHeader col="location" label="Location" sort={sort} dir={dir} onSort={onSort} mw={120} filterActive={!!filters.location}>
                                    <select className={SELECT_CLS} value={filters.location} onChange={e => setFNow("location", e.target.value)} suppressHydrationWarning>
                                        <option value="" className="theme-option">All Locations</option>
                                        {["New York", "London", "Singapore", "Berlin", "Sydney", "Toronto", "Bangalore", "Dubai"].map(l => <option key={l} value={l} className="theme-option">{l}</option>)}
                                    </select>
                                </ColHeader>
                                <ColHeader col="salary" label="Salary" sort={sort} dir={dir} onSort={onSort} mw={110} filterActive={!!(filters.salMin || filters.salMax)}>
                                    <div className="flex gap-1">
                                        <input type="number" className={`${INPUT_CLS} !w-1/2 text-center`} placeholder="Min" defaultValue={filters.salMin} onChange={e => setF("salMin", e.target.value)} suppressHydrationWarning />
                                        <input type="number" className={`${INPUT_CLS} !w-1/2 text-center`} placeholder="Max" defaultValue={filters.salMax} onChange={e => setF("salMax", e.target.value)} suppressHydrationWarning />
                                    </div>
                                </ColHeader>
                                <ColHeader col="projects" label="Projects" sort={sort} dir={dir} onSort={onSort} mw={110} filterActive={!!(filters.projMin || filters.projMax)}>
                                    <div className="flex gap-1">
                                        <input type="number" className={`${INPUT_CLS} !w-1/2 text-center`} placeholder="≥" defaultValue={filters.projMin} onChange={e => setF("projMin", e.target.value)} suppressHydrationWarning />
                                        <input type="number" className={`${INPUT_CLS} !w-1/2 text-center`} placeholder="≤" defaultValue={filters.projMax} onChange={e => setF("projMax", e.target.value)} suppressHydrationWarning />
                                    </div>
                                </ColHeader>
                                <ColHeader col="startDate" label="Start Date" sort={sort} dir={dir} onSort={onSort} mw={110} filterActive={!!filters.startAfter}>
                                    <input type="date" className={INPUT_CLS} defaultValue={filters.startAfter} onChange={e => setFNow("startAfter", e.target.value)} suppressHydrationWarning />
                                </ColHeader>
                                <ColHeader col="performance" label="Performance" sort={sort} dir={dir} onSort={onSort} mw={120} filterActive={!!filters.performance}>
                                    <select className={SELECT_CLS} value={filters.performance} onChange={e => setFNow("performance", e.target.value)} suppressHydrationWarning>
                                        <option value="" className="theme-option">All</option>
                                        {["Exceeds", "Meets", "Below", "N/A"].map(p => <option key={p} value={p} className="theme-option">{p}</option>)}
                                    </select>
                                </ColHeader>
                                <ColHeader col="satisfaction" label="Satisfaction" sort={sort} dir={dir} onSort={onSort} mw={130}>
                                    <div className="h-6.5" />
                                </ColHeader>
                                <ColHeader col="manager" label="Manager" sort={sort} dir={dir} onSort={onSort} mw={140}>
                                    <input className={INPUT_CLS} placeholder="Search…" onChange={e => setF("search", e.target.value)} suppressHydrationWarning />
                                </ColHeader>
                                <ColHeader col="status" label="Status" sort={sort} dir={dir} onSort={onSort} mw={120} filterActive={!!filters.status}>
                                    <select className={`${SELECT_CLS} ${filters.status ? 'border-blue-500' : ''}`} value={filters.status} onChange={e => setFNow("status", e.target.value)} suppressHydrationWarning>
                                        <option value="" className="theme-option">All</option>
                                        {["Active", "On Leave", "Probation", "Contract", "Terminated"].map(s => <option key={s} value={s} className="theme-option">{s}</option>)}
                                    </select>
                                </ColHeader>
                            </tr>
                        </thead>
                        <tbody>
                            {!grouped ? (
                                pageRows.length === 0 ? (
                                    <tr><td colSpan={13} className="text-center py-12 theme-text-muted">
                                        No employees match the current filters. <button onClick={clearAll} className="theme-text-info font-semibold hover:underline">Clear filters</button>
                                    </td></tr>
                                ) : pageRows.map((r, i) => renderRow(r, i))
                            ) : (
                                Array.from(grouped.entries()).map(([groupKey, rows]) => {
                                    const isOpen = expandedGroups.has(groupKey);
                                    const firstRow = rows[0];
                                    const ss = STATUS_STYLE[groupKey as keyof typeof STATUS_STYLE];
                                    const dc = DEPT_COLORS[groupKey as keyof typeof DEPT_COLORS];
                                    const groupCls = getGroupCls(groupKey);
                                    return [
                                        <tr key={`grp-${groupKey}`} onClick={() => toggleGroup(groupKey)} 
                                            className={`theme-footer-bg cursor-pointer border-l-4 ${groupCls.border}`} >
                                            <td colSpan={13} className="px-4 py-2.5 border-b theme-border">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xs font-bold theme-text uppercase tracking-wide">
                                                        {isOpen ? "▼" : "▶"} {groupBy}: <span className={groupCls.text}>{groupKey}</span>
                                                    </span>
                                                    <span className="text-[10px] theme-footer-bg border theme-border rounded-full px-2 py-0.5 theme-text-muted font-bold">
                                                        {rows.length} employees
                                                    </span>
                                                    <span className="text-[10px] theme-text-subtle">
                                                        Avg Salary: <strong className="theme-text">{fmtSal(Math.round(rows.reduce((s, r) => s + r.salary, 0) / rows.length))}</strong>
                                                        &nbsp;·&nbsp; Projects: <strong className="theme-text">{(rows.reduce((s, r) => s + r.projects, 0) / rows.length).toFixed(1)}</strong>
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>,
                                        ...(isOpen ? rows.slice(0, 50).map((r, i) => renderRow(r, i)) : []),
                                        ...(isOpen && rows.length > 50 ? [
                                            <tr key={`grp-more-${groupKey}`}><td colSpan={13} className="px-4 py-2 theme-text-subtle text-[0.75rem] theme-footer-bg border-b theme-border">
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
                <div className="flex items-center justify-between px-4 py-2.5 border-t theme-border theme-footer-bg flex-wrap gap-2">
                    <div className="flex items-center gap-4 flex-wrap">
                        <span className="text-[11px] theme-text-muted">
                            {!grouped
                                ? <>Showing <strong className="theme-text">{sorted.length === 0 ? 0 : (safePg - 1) * rpp + 1}–{Math.min(safePg * rpp, sorted.length)}</strong> of <strong className="theme-text">{sorted.length.toLocaleString()}</strong></>
                                : <><strong className="theme-text">{grouped.size}</strong> groups · <strong className="theme-text">{sorted.length.toLocaleString()}</strong> employees</>
                            }
                        </span>
                        {!grouped && (
                            <div className="flex items-center gap-1.5 text-[11px] theme-text-muted">
                                Rows:
                                <select className="h-7 px-2 border theme-border rounded theme-footer-bg theme-text text-[11px] outline-none cursor-pointer"
                                    value={rpp} onChange={e => { setRpp(+e.target.value); setPage(1); }}>
                                    {[20, 50, 100, 200].map(n => <option key={n} value={n} className="theme-option">{n}</option>)}
                                </select>
                            </div>
                        )}
                    </div>
                    {!grouped && (totalPages > 1) && (
                        <div className="flex gap-1">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePg <= 1} className="w-7 h-7 flex items-center justify-center rounded border theme-border theme-footer-bg theme-text text-sm disabled:opacity-30 hover:bg-white/5 transition-colors">‹</button>
                            {dedPgs.map((p, i) => p === "…" ? (
                                <span key={i} className="w-7 text-center theme-text-subtle text-xs leading-7">…</span>
                            ) : (
                                <button key={i} onClick={() => setPage(p as number)} className={`w-7 h-7 flex items-center justify-center rounded border transition-colors text-[11px] font-bold ${p === safePg ? 'theme-btn-neon shadow-none !border-none' : 'theme-border theme-footer-bg theme-text hover:bg-white/5'}`}>{p}</button>
                            ))}
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePg >= totalPages} className="w-7 h-7 flex items-center justify-center rounded border theme-border theme-footer-bg theme-text text-sm disabled:opacity-30 hover:bg-white/5 transition-colors">›</button>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
