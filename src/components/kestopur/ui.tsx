'use client';
import { Loader2, Search, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/providers/toast-context';
import { kpFetch } from '@/lib/kestopur/api';

export function KpPageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="theme-text text-2xl font-bold">{title}</h1>
        {subtitle && <p className="theme-text-muted text-sm mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function KpStatCard({ label, value, icon: Icon, color, loading, variant }: { label: string; value: string | number; icon: React.ElementType; color?: string; loading?: boolean; variant?: string }) {
  const getSemanticCls = (c: string, v?: string) => {
    const iconVariant = v?.toLowerCase();
    if (iconVariant === 'success') return { tag: 'theme-tag-success', text: 'theme-text-success' };
    if (iconVariant === 'warning') return { tag: 'theme-tag-warning', text: 'theme-text-warning' };
    if (iconVariant === 'info')    return { tag: 'theme-tag-info',    text: 'theme-text-info' };
    if (iconVariant === 'danger')  return { tag: 'theme-tag-danger',  text: 'theme-text-danger' };
    if (iconVariant === 'accent')  return { tag: 'theme-tag-accent',  text: 'theme-text-accent' };
    if (iconVariant === 'orange')  return { tag: 'theme-tag-orange',  text: 'theme-text-orange' };

    const map: Record<string, { tag: string; text: string }> = {
      '#34d399': { tag: 'theme-tag-success', text: 'theme-text-success' },
      '#fbbf24': { tag: 'theme-tag-warning', text: 'theme-text-warning' },
      '#60a5fa': { tag: 'theme-tag-info', text: 'theme-text-info' },
      '#f87171': { tag: 'theme-tag-danger', text: 'theme-text-danger' },
      '#818cf8': { tag: 'theme-tag-accent', text: 'theme-text-accent' },
      '#f97316': { tag: 'theme-tag-orange', text: 'theme-text-orange' },
    };
    return map[c || ''] || { tag: 'theme-footer-bg', text: 'theme-text-subtle' };
  };

  const cls = getSemanticCls(color || '', variant);

  return (
    <div className="dg-card p-5">
      <div className={`rounded-lg p-2.5 w-fit mb-3 ${cls.tag}`}>
        <Icon className={`h-5 w-5 ${cls.text}`} />
      </div>
      <p className="theme-text text-2xl font-bold">{loading ? '—' : value}</p>
      <p className="theme-text-muted text-xs mt-0.5">{label}</p>
    </div>
  );
}

export function KpCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`theme-card-bg rounded-xl border overflow-hidden ${className}`}>
      {children}
    </div>
  );
}

export function KpSearch({ value, onChange, placeholder = 'Search…', className = '', ...props }: Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> & { value: string; onChange: (v: string) => void }) {
  return (
    <div className={`relative ${className}`}>
      <Search className="theme-text-subtle absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" />
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        suppressHydrationWarning
        className="theme-input-field theme-border w-full rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none border"
        {...props} />
    </div>
  );
}

export function KpSelect({ value, onChange, children, className = '' }: { value: string; onChange: (v: string) => void; children: React.ReactNode; className?: string }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      suppressHydrationWarning
      className={`theme-select theme-border rounded-xl px-3 py-2.5 text-sm outline-none border ${className}`}>
      {children}
    </select>
  );
}

export function KpBtn({ children, onClick, loading, disabled, className = '' }: { children: React.ReactNode; onClick?: () => void; loading?: boolean; disabled?: boolean; className?: string }) {
  return (
    <button onClick={onClick} disabled={disabled || loading}
      suppressHydrationWarning
      className={`theme-btn-neon flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-40 ${className}`}>
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}

export function KpGhostBtn({ children, onClick, className = '' }: { children: React.ReactNode; onClick?: () => void; className?: string }) {
  return (
    <button onClick={onClick}
      suppressHydrationWarning
      className={`theme-btn-cancel flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm border hover:bg-white/5 transition-colors ${className}`}>
      {children}
    </button>
  );
}

export function KpBadge({ label, variant = 'default' }: { label: string; variant?: string }) {
  const v = variant?.toLowerCase();
  const getVariantCls = (val: string) => {
    if (['success', 'active', 'delivered', 'published'].includes(val)) return 'theme-tag-success theme-border';
    if (['warning', 'pending', 'processing', 'draft'].includes(val)) return 'theme-tag-warning theme-border';
    if (['error', 'cancelled', 'blocked'].includes(val)) return 'theme-tag-danger theme-border';
    return 'theme-tag-subtle theme-border';
  };

  return <span className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize border ${getVariantCls(v)}`}>{label}</span>;
}

interface Col<T> { key: string; label: string; align?: 'left' | 'right'; render: (row: T) => React.ReactNode; }
export function KpTable<T>({ cols, rows, rowKey, loading, emptyMsg = 'No data found.' }: { cols: Col<T>[]; rows: T[]; rowKey: (r: T, index: number) => string; loading?: boolean; emptyMsg?: string }) {
  return (
    <div className="dg-table-wrapper">
      <table className="dg-table">
        <thead>
          <tr className="dg-table-header-row">
            {cols.map(c => (
              <th key={c.key} className="theme-text-subtle px-4 py-3 text-xs font-semibold uppercase tracking-wider"
                style={{ textAlign: c.align ?? 'left' }}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={cols.length} className="px-4 py-10 text-center">
              <Loader2 className="theme-text-neon h-6 w-6 animate-spin mx-auto" />
            </td></tr>
          ) : rows.length === 0 ? (
            <tr><td colSpan={cols.length} className="theme-text-muted px-4 py-10 text-center text-sm">{emptyMsg}</td></tr>
          ) : rows.map((row, idx) => (
            <tr key={rowKey(row, idx)} className="dg-table-row hover:bg-white/5">
              {cols.map(c => (
                <td key={c.key} className="px-4 py-3" style={{ textAlign: c.align ?? 'left' }}>
                  {c.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function KpDataPage<T>({
  title, subtitle, fetchUrl, cols, rowKey, action,
  searchPlaceholder = 'Search…', emptyMsg, filterFn,
}: {
  title: string; subtitle?: string; fetchUrl: string; cols: Col<T>[]; rowKey: (r: T, index: number) => string;
  action?: React.ReactNode; searchPlaceholder?: string; emptyMsg?: string;
  filterFn?: (item: T, search: string) => boolean;
}) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { showToast } = useToast();

  const fetchData = useCallback(async () => {
    setLoading(true);
    const r = await kpFetch(fetchUrl);
    if (r.success) setData(Array.isArray(r.data) ? r.data : []);
    else showToast(r.error || `Failed to load ${title.toLowerCase()}`, 'error');
    setLoading(false);
  }, [fetchUrl, title, showToast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = data.filter((item: any) => {
    if (!search) return true;
    if (filterFn) return filterFn(item, search);
    const s = search.toLowerCase();
    return Object.values(item).some(v =>
      typeof v === 'string' || typeof v === 'number' ? String(v).toLowerCase().includes(s) : false
    );
  });

  return (
    <div className="space-y-6">
      <KpPageHeader title={title} subtitle={subtitle} action={action} />
      <KpSearch value={search} onChange={setSearch} placeholder={searchPlaceholder} className="max-w-md" />
      <KpCard>
        {loading ? <KpSkeleton /> : <KpTable cols={cols} rows={filtered} rowKey={rowKey} emptyMsg={emptyMsg} />}
      </KpCard>
    </div>
  );
}

export function KpPagination({ page, totalPages, total, limit, onPage }: { page: number; totalPages: number; total: number; limit: number; onPage: (p: number) => void }) {
  if (totalPages <= 1) return null;
  return (
    <div className="dg-toolbar !border-t theme-border theme-footer-bg">
      <span className="theme-text-muted text-sm px-4">
        Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
      </span>
      <div className="flex gap-2">
        <button onClick={() => onPage(page - 1)} disabled={page <= 1}
          className="dg-btn p-1.5 rounded-lg disabled:opacity-40">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button onClick={() => onPage(page + 1)} disabled={page >= totalPages}
          className="dg-btn p-1.5 rounded-lg disabled:opacity-40">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function KpModal({ title, onClose, children, maxWidth = 'max-w-lg' }: { title: string; onClose: () => void; children: React.ReactNode; maxWidth?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={`theme-card-bg w-full ${maxWidth} rounded-2xl border p-6 shadow-2xl`}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="theme-text text-lg font-bold">{title}</h2>
          <button onClick={onClose} className="theme-text-subtle p-1.5 rounded-lg hover:bg-white/10">
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function KpField({ label, error, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }) {
  return (
    <div className="space-y-1">
      <label className="theme-text-muted block text-xs font-semibold">{label}</label>
      <input className={`theme-input-field w-full rounded-lg px-3 py-2.5 text-sm outline-none border transition-colors ${error ? 'theme-border-danger' : 'theme-border'}`}
        {...props} />
      {error && <p className="theme-text-danger text-xs">{error}</p>}
    </div>
  );
}

export function KpSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="p-6 space-y-3">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="theme-footer-bg h-14 rounded-lg animate-pulse" />
      ))}
    </div>
  );
}
