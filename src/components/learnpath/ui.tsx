// Shared UI primitives for all LearnPath pages.
import React from 'react';
import { Loader2, Search, X } from 'lucide-react';

export const LEVEL_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  BEGINNER:     { bg: 'rgba(16,185,129,0.1)',  color: '#34d399', border: 'rgba(16,185,129,0.3)' },
  INTERMEDIATE: { bg: 'rgba(245,158,11,0.1)',  color: '#fbbf24', border: 'rgba(245,158,11,0.3)' },
  ADVANCED:     { bg: 'rgba(239,68,68,0.1)',   color: '#f87171', border: 'rgba(239,68,68,0.3)' },
};

export const CATEGORIES = ['Engineering', 'Design', 'DevOps', 'Data Science', 'Leadership', 'Product', 'Security', 'Other'];
export const LEVELS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as const;

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="theme-text text-2xl font-bold">{title}</h1>
        {subtitle && <p className="theme-text-muted text-sm mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`theme-card-bg rounded-xl border ${className}`}>{children}</div>;
}

export function CardHeader({ title, icon, action }: { title: string; icon?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="theme-border flex items-center justify-between px-5 py-3.5 border-b">
      <div className="flex items-center gap-2">
        {icon}
        <span className="theme-text font-semibold text-sm">{title}</span>
      </div>
      {action}
    </div>
  );
}

export function StatCard({ label, value, icon: Icon, color, loading }: { label: string; value: string | number; icon: React.ElementType; color: string; loading?: boolean }) {
  return (
    <div className="dg-card p-5">
      <div className="rounded-lg p-2.5 w-fit mb-3" style={{ background: `${color}20` }}>
        <Icon className="h-5 w-5" style={{ color }} />
      </div>
      <p className="theme-text text-2xl font-bold">{loading ? '—' : value}</p>
      <p className="theme-text-muted text-xs mt-0.5">{label}</p>
    </div>
  );
}

export function LevelBadge({ level }: { level: string }) {
  const lc = LEVEL_COLORS[level] ?? LEVEL_COLORS.BEGINNER;
  return (
    <span className="text-xs px-2 py-0.5 rounded-full font-semibold border"
      style={{ background: lc.bg, color: lc.color, borderColor: lc.border }}>
      {level}
    </span>
  );
}

export function PublishedBadge({ published }: { published: boolean }) {
  const styles = published
    ? { background: 'rgba(52,211,153,0.1)', color: '#34d399', borderColor: 'rgba(52,211,153,0.2)' }
    : { background: 'rgba(251,191,36,0.1)', color: '#fbbf24', borderColor: 'rgba(251,191,36,0.2)' };

  return (
    <span className="text-xs px-2 py-0.5 rounded-full border" style={styles}>
      {published ? 'Published' : 'Draft'}
    </span>
  );
}

export function FieldInput({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <div className="space-y-1">
      <label className="theme-text-muted block text-xs font-semibold">{label}</label>
      <input className="theme-input-field theme-border w-full rounded-lg px-3 py-2.5 text-sm outline-none border transition-colors" {...props} />
    </div>
  );
}

export function FieldTextarea({ label, mono, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; mono?: boolean }) {
  return (
    <div className="space-y-1">
      <label className="theme-text-muted block text-xs font-semibold">{label}</label>
      <textarea className="theme-input-field theme-border w-full rounded-lg px-3 py-2.5 text-sm outline-none border resize-none"
        style={{ fontFamily: mono ? 'monospace' : 'inherit' }} {...props} />
    </div>
  );
}

export function FieldSelect({ label, options, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; options: string[] }) {
  return (
    <div className="space-y-1">
      <label className="theme-text-muted block text-xs font-semibold">{label}</label>
      <select className="theme-select theme-border w-full rounded-lg px-3 py-2.5 text-sm outline-none border" {...props}>
        {options.map(o => <option key={o} value={o} className="theme-option">{o}</option>)}
      </select>
    </div>
  );
}

export function SearchInput({ value, onChange, placeholder = 'Search…', className = '' }: { value: string; onChange: (v: string) => void; placeholder?: string; className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <Search className="theme-text-subtle absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" />
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="theme-input-field theme-border w-full rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none border" />
    </div>
  );
}

export function PrimaryBtn({ children, loading, disabled, className = '', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button disabled={disabled || loading}
      className={`theme-btn-neon flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-40 ${className}`}
      {...props}>
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}

export function GhostBtn({ children, className = '', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={`theme-btn-cancel flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm border hover:bg-white/5 transition-colors ${className}`} {...props}>
      {children}
    </button>
  );
}

export function DangerBtn({ children, loading, disabled, className = '', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button disabled={disabled || loading}
      className={`theme-text-danger flex items-center gap-1.5 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors disabled:opacity-40 ${className}`}
      {...props}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : children}
    </button>
  );
}

export function ErrorAlert({ message }: { message: string }) {
  if (!message) return null;
  return <div className="dg-alert-error">{message}</div>;
}

export function SuccessAlert({ message }: { message: string }) {
  if (!message) return null;
  return <div className="dg-alert-success">{message}</div>;
}

export function EmptyState({ icon: Icon, title, action }: { icon: React.ElementType; title: string; action?: React.ReactNode }) {
  return (
    <div className="p-12 text-center">
      <Icon className="theme-text-subtle h-10 w-10 mx-auto mb-3 opacity-20" />
      <p className="theme-text-muted text-sm mb-2">{title}</p>
      {action}
    </div>
  );
}

export function SkeletonList({ rows = 5, height = 'h-14' }: { rows?: number; height?: string }) {
  return (
    <div className="p-6 space-y-3">
      {[...Array(rows)].map((_, i) => <div key={i} className={`theme-footer-bg ${height} rounded-lg animate-pulse`} />)}
    </div>
  );
}

interface Column<T> { key: string; label: string; align?: 'left' | 'right'; render: (row: T) => React.ReactNode; }
export function DataTable<T>({ columns, rows, rowKey }: { columns: Column<T>[]; rows: T[]; rowKey: (row: T) => string }) {
  return (
    <div className="dg-table-wrapper">
      <table className="dg-table">
        <thead>
          <tr className="dg-table-header-row">
            {columns.map(col => (
              <th key={col.key} className="theme-text-subtle px-4 py-3 text-xs font-semibold uppercase tracking-wider"
                style={{ textAlign: col.align ?? 'left' }}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={rowKey(row)} className="dg-table-row hover:bg-white/5">
              {columns.map(col => (
                <td key={col.key} className="px-4 py-3" style={{ textAlign: col.align ?? 'left' }}>{col.render(row)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="theme-card-bg w-full max-w-md rounded-2xl border p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="theme-text text-lg font-bold">{title}</h2>
          <button onClick={onClose} className="theme-text-subtle p-1.5 rounded-lg hover:bg-white/10"><X className="h-5 w-5" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function ProgressBar({ pct, label }: { pct: number; label?: string }) {
  return (
    <div>
      {label !== undefined && (
        <div className="flex justify-between text-xs mb-1">
          <span className="theme-text-muted">{label}</span>
          <span className="theme-text-neon font-bold">{pct}%</span>
        </div>
      )}
      <div className="theme-progress-track h-1.5 rounded-full overflow-hidden">
        <div className="theme-progress-fill h-full rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function LevelSelector({ value, onChange }: { value: string; onChange: (l: string) => void }) {
  return (
    <div className="space-y-1">
      <label className="theme-text-muted block text-xs font-semibold">Level</label>
      <div className="flex gap-2">
        {LEVELS.map(l => {
          const lc = LEVEL_COLORS[l];
          const active = value === l;
          return (
            <button key={l} type="button" onClick={() => onChange(l)}
              className="flex-1 rounded-lg py-2.5 text-xs font-bold transition-all border"
              style={{
                background: active ? lc.bg : 'var(--foot-color)',
                color: active ? lc.color : 'var(--circle)',
                borderColor: active ? lc.border : 'var(--border-color)',
              }}>
              {l.slice(0, 3)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
