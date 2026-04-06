// Shared UI primitives for all LearnPath pages.
// All components use croma CSS variables — no hardcoded colors.

import React from 'react';
import { Loader2 } from 'lucide-react';

// ── Constants ──────────────────────────────────────────────────────────────────

export const LEVEL_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  BEGINNER:     { bg: 'rgba(16,185,129,0.1)',  color: '#34d399', border: 'rgba(16,185,129,0.3)' },
  INTERMEDIATE: { bg: 'rgba(245,158,11,0.1)',  color: '#fbbf24', border: 'rgba(245,158,11,0.3)' },
  ADVANCED:     { bg: 'rgba(239,68,68,0.1)',   color: '#f87171', border: 'rgba(239,68,68,0.3)' },
};

export const CATEGORIES = [
  'Engineering', 'Design', 'DevOps', 'Data Science',
  'Leadership', 'Product', 'Security', 'Other',
];

export const LEVELS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as const;

// ── Layout ─────────────────────────────────────────────────────────────────────

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}
export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-color)' }}>{title}</h1>
        {subtitle && <p className="text-sm mt-0.5" style={{ color: 'var(--old-price)' }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

// ── Card ───────────────────────────────────────────────────────────────────────

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-xl border ${className}`}
      style={{ background: 'var(--croma-wall)', borderColor: 'var(--border-color)' }}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps { title: string; icon?: React.ReactNode; action?: React.ReactNode; }
export function CardHeader({ title, icon, action }: CardHeaderProps) {
  return (
    <div className="flex items-center justify-between px-5 py-3.5 border-b" style={{ borderColor: 'var(--border-color)' }}>
      <div className="flex items-center gap-2">
        {icon}
        <span className="font-semibold text-sm" style={{ color: 'var(--text-color)' }}>{title}</span>
      </div>
      {action}
    </div>
  );
}

// ── Stat Card ──────────────────────────────────────────────────────────────────

interface StatCardProps { label: string; value: string | number; icon: React.ElementType; color: string; loading?: boolean; }
export function StatCard({ label, value, icon: Icon, color, loading }: StatCardProps) {
  return (
    <div className="rounded-xl border p-5" style={{ background: 'var(--croma-wall)', borderColor: 'var(--border-color)' }}>
      <div className="rounded-lg p-2.5 w-fit mb-3" style={{ background: `${color}20` }}>
        <Icon className="h-5 w-5" style={{ color }} />
      </div>
      <p className="text-2xl font-bold" style={{ color: 'var(--text-color)' }}>{loading ? '—' : value}</p>
      <p className="text-xs mt-0.5" style={{ color: 'var(--old-price)' }}>{label}</p>
    </div>
  );
}

// ── Badges ─────────────────────────────────────────────────────────────────────

export function LevelBadge({ level }: { level: string }) {
  const lc = LEVEL_COLORS[level] ?? LEVEL_COLORS.BEGINNER;
  return (
    <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
      style={{ background: lc.bg, color: lc.color, border: `1px solid ${lc.border}` }}>
      {level}
    </span>
  );
}

export function PublishedBadge({ published }: { published: boolean }) {
  return (
    <span className="text-xs px-2 py-0.5 rounded-full"
      style={published
        ? { background: 'rgba(52,211,153,0.1)', color: '#34d399', border: '1px solid rgba(52,211,153,0.2)' }
        : { background: 'rgba(251,191,36,0.1)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.2)' }}>
      {published ? 'Published' : 'Draft'}
    </span>
  );
}

// ── Form Inputs ────────────────────────────────────────────────────────────────

type FieldInputProps = React.InputHTMLAttributes<HTMLInputElement> & { label: string };
export function FieldInput({ label, ...props }: FieldInputProps) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-semibold" style={{ color: 'var(--old-price)' }}>{label}</label>
      <input
        className="w-full rounded-lg px-3 py-2.5 text-sm outline-none border transition-colors"
        style={{ background: 'var(--foot-color)', borderColor: 'var(--border-color)', color: 'var(--text-color)' }}
        {...props}
      />
    </div>
  );
}

type FieldTextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; mono?: boolean };
export function FieldTextarea({ label, mono, ...props }: FieldTextareaProps) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-semibold" style={{ color: 'var(--old-price)' }}>{label}</label>
      <textarea
        className="w-full rounded-lg px-3 py-2.5 text-sm outline-none border resize-none"
        style={{ background: 'var(--foot-color)', borderColor: 'var(--border-color)', color: 'var(--text-color)', fontFamily: mono ? 'monospace' : 'inherit' }}
        {...props}
      />
    </div>
  );
}

type FieldSelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; options: string[] };
export function FieldSelect({ label, options, ...props }: FieldSelectProps) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-semibold" style={{ color: 'var(--old-price)' }}>{label}</label>
      <select
        className="w-full rounded-lg px-3 py-2.5 text-sm outline-none border"
        style={{ background: 'var(--foot-color)', borderColor: 'var(--border-color)', color: 'var(--text-color)' }}
        {...props}
      >
        {options.map(o => (
          <option key={o} value={o} style={{ background: 'var(--navbar-carousel-color)' }}>{o}</option>
        ))}
      </select>
    </div>
  );
}

// ── Search Input ───────────────────────────────────────────────────────────────

import { Search } from 'lucide-react';
interface SearchInputProps { value: string; onChange: (v: string) => void; placeholder?: string; className?: string; }
export function SearchInput({ value, onChange, placeholder = 'Search…', className = '' }: SearchInputProps) {
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" style={{ color: 'var(--circle)' }} />
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none border"
        style={{ background: 'var(--foot-color)', borderColor: 'var(--border-color)', color: 'var(--text-color)' }}
      />
    </div>
  );
}

// ── Buttons ────────────────────────────────────────────────────────────────────

interface PrimaryBtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { loading?: boolean; }
export function PrimaryBtn({ children, loading, disabled, className = '', ...props }: PrimaryBtnProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-40 ${className}`}
      style={{ background: 'var(--neon-green)', color: 'var(--text-color-black)' }}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}

interface GhostBtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { }
export function GhostBtn({ children, className = '', ...props }: GhostBtnProps) {
  return (
    <button
      className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm border hover:bg-white/5 transition-colors ${className}`}
      style={{ borderColor: 'var(--border-color)', color: 'var(--old-price)' }}
      {...props}
    >
      {children}
    </button>
  );
}

interface DangerBtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { loading?: boolean; }
export function DangerBtn({ children, loading, disabled, className = '', ...props }: DangerBtnProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`flex items-center gap-1.5 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors disabled:opacity-40 ${className}`}
      style={{ color: '#f87171' }}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : children}
    </button>
  );
}

// ── Alerts ─────────────────────────────────────────────────────────────────────

export function ErrorAlert({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="rounded-xl p-3 text-sm" style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }}>
      {message}
    </div>
  );
}

export function SuccessAlert({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="rounded-xl p-3 text-sm" style={{ background: 'rgba(52,211,153,0.1)', color: '#34d399', border: '1px solid rgba(52,211,153,0.2)' }}>
      {message}
    </div>
  );
}

// ── Empty State ────────────────────────────────────────────────────────────────

interface EmptyStateProps { icon: React.ElementType; title: string; action?: React.ReactNode; }
export function EmptyState({ icon: Icon, title, action }: EmptyStateProps) {
  return (
    <div className="p-12 text-center">
      <Icon className="h-10 w-10 mx-auto mb-3 opacity-20" style={{ color: 'var(--circle)' }} />
      <p className="text-sm mb-2" style={{ color: 'var(--old-price)' }}>{title}</p>
      {action}
    </div>
  );
}

// ── Skeleton List ──────────────────────────────────────────────────────────────

export function SkeletonList({ rows = 5, height = 'h-14' }: { rows?: number; height?: string }) {
  return (
    <div className="p-6 space-y-3">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className={`${height} rounded-lg animate-pulse`} style={{ background: 'var(--foot-color)' }} />
      ))}
    </div>
  );
}

// ── Data Table ─────────────────────────────────────────────────────────────────

interface Column<T> { key: string; label: string; align?: 'left' | 'right'; render: (row: T) => React.ReactNode; }
interface DataTableProps<T> { columns: Column<T>[]; rows: T[]; rowKey: (row: T) => string; }
export function DataTable<T>({ columns, rows, rowKey }: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full" style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
            {columns.map(col => (
              <th key={col.key}
                className="px-4 py-3 text-xs font-semibold uppercase tracking-wider"
                style={{ color: 'var(--circle)', textAlign: col.align ?? 'left' }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={rowKey(row)} className="hover:bg-white/5 transition-colors" style={{ borderBottom: '1px solid var(--border-color)' }}>
              {columns.map(col => (
                <td key={col.key} className="px-4 py-3" style={{ textAlign: col.align ?? 'left' }}>
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Modal ──────────────────────────────────────────────────────────────────────

import { X } from 'lucide-react';
interface ModalProps { title: string; onClose: () => void; children: React.ReactNode; }
export function Modal({ title, onClose, children }: ModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md rounded-2xl border p-6 shadow-2xl" style={{ background: 'var(--croma-wall)', borderColor: 'var(--border-color)' }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-color)' }}>{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10" style={{ color: 'var(--circle)' }}>
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Progress Bar ───────────────────────────────────────────────────────────────

export function ProgressBar({ pct, label }: { pct: number; label?: string }) {
  return (
    <div>
      {label !== undefined && (
        <div className="flex justify-between text-xs mb-1">
          <span style={{ color: 'var(--old-price)' }}>{label}</span>
          <span className="font-bold" style={{ color: 'var(--neon-green)' }}>{pct}%</span>
        </div>
      )}
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--foot-color)' }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: 'var(--neon-green)' }} />
      </div>
    </div>
  );
}

// ── Level Selector (for forms) ─────────────────────────────────────────────────

interface LevelSelectorProps { value: string; onChange: (l: string) => void; }
export function LevelSelector({ value, onChange }: LevelSelectorProps) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-semibold" style={{ color: 'var(--old-price)' }}>Level</label>
      <div className="flex gap-2">
        {LEVELS.map(l => {
          const lc = LEVEL_COLORS[l];
          return (
            <button key={l} type="button" onClick={() => onChange(l)}
              className="flex-1 rounded-lg py-2.5 text-xs font-bold transition-all border"
              style={{
                background: value === l ? lc.bg : 'var(--foot-color)',
                color: value === l ? lc.color : 'var(--circle)',
                borderColor: value === l ? lc.border : 'var(--border-color)',
              }}>
              {l.slice(0, 3)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
