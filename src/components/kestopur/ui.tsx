import { Loader2, Search, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/providers/toast-context';
import { kpFetch } from '@/lib/kestopur/api';

// ── Page Header ────────────────────────────────────────────────────────────────
export function KpPageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-color)' }}>{title}</h1>
        {subtitle && <p className="text-sm mt-0.5" style={{ color: 'var(--old-price)' }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

// ── Stat Card ──────────────────────────────────────────────────────────────────
export function KpStatCard({ label, value, icon: Icon, color, loading }: { label: string; value: string | number; icon: React.ElementType; color: string; loading?: boolean }) {
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

// ── Card ───────────────────────────────────────────────────────────────────────
export function KpCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border overflow-hidden ${className}`} style={{ background: 'var(--croma-wall)', borderColor: 'var(--border-color)' }}>
      {children}
    </div>
  );
}

// ── Search Input ───────────────────────────────────────────────────────────────
export function KpSearch({ value, onChange, placeholder = 'Search…', className = '', ...props }: Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> & { value: string; onChange: (v: string) => void }) {
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" style={{ color: 'var(--circle)' }} />
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none border"
        style={{ background: 'var(--foot-color)', borderColor: 'var(--border-color)', color: 'var(--text-color)' }}
        {...props} />
    </div>
  );
}

// ── Select ─────────────────────────────────────────────────────────────────────
export function KpSelect({ value, onChange, children, className = '' }: { value: string; onChange: (v: string) => void; children: React.ReactNode; className?: string }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      className={`rounded-xl px-3 py-2.5 text-sm outline-none border ${className}`}
      style={{ background: 'var(--foot-color)', borderColor: 'var(--border-color)', color: 'var(--text-color)' }}>
      {children}
    </select>
  );
}

// ── Primary Button ─────────────────────────────────────────────────────────────
export function KpBtn({ children, onClick, loading, disabled, className = '' }: { children: React.ReactNode; onClick?: () => void; loading?: boolean; disabled?: boolean; className?: string }) {
  return (
    <button onClick={onClick} disabled={disabled || loading}
      className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-40 ${className}`}
      style={{ background: 'var(--neon-green)', color: 'var(--text-color-black)' }}>
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}

// ── Ghost Button ───────────────────────────────────────────────────────────────
export function KpGhostBtn({ children, onClick, className = '' }: { children: React.ReactNode; onClick?: () => void; className?: string }) {
  return (
    <button onClick={onClick}
      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm border hover:bg-white/5 transition-colors ${className}`}
      style={{ borderColor: 'var(--border-color)', color: 'var(--old-price)' }}>
      {children}
    </button>
  );
}

// ── Badge ──────────────────────────────────────────────────────────────────────
const BADGE_STYLES: Record<string, { bg: string; color: string }> = {
  active:      { bg: 'rgba(52,211,153,0.1)',  color: '#34d399' },
  success:     { bg: 'rgba(52,211,153,0.1)',  color: '#34d399' },
  delivered:   { bg: 'rgba(52,211,153,0.1)',  color: '#34d399' },
  published:   { bg: 'rgba(52,211,153,0.1)',  color: '#34d399' },
  pending:     { bg: 'rgba(251,191,36,0.1)',  color: '#fbbf24' },
  processing:  { bg: 'rgba(251,191,36,0.1)',  color: '#fbbf24' },
  warning:     { bg: 'rgba(251,191,36,0.1)',  color: '#fbbf24' },
  draft:       { bg: 'rgba(251,191,36,0.1)',  color: '#fbbf24' },
  cancelled:   { bg: 'rgba(248,113,113,0.1)', color: '#f87171' },
  error:       { bg: 'rgba(248,113,113,0.1)', color: '#f87171' },
  inactive:    { bg: 'rgba(148,163,184,0.1)', color: 'var(--circle)' },
  default:     { bg: 'rgba(148,163,184,0.1)', color: 'var(--circle)' },
};

export function KpBadge({ label, variant = 'default' }: { label: string; variant?: string }) {
  const s = BADGE_STYLES[variant?.toLowerCase()] ?? BADGE_STYLES.default;
  return (
    <span className="text-xs px-2 py-0.5 rounded-full font-semibold capitalize"
      style={{ background: s.bg, color: s.color }}>
      {label}
    </span>
  );
}

// ── Table ──────────────────────────────────────────────────────────────────────
interface Col<T> { key: string; label: string; align?: 'left' | 'right'; render: (row: T) => React.ReactNode; }
export function KpTable<T>({ cols, rows, rowKey, loading, emptyMsg = 'No data found.' }: { cols: Col<T>[]; rows: T[]; rowKey: (r: T) => string; loading?: boolean; emptyMsg?: string }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full" style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
            {cols.map(c => (
              <th key={c.key} className="px-4 py-3 text-xs font-semibold uppercase tracking-wider"
                style={{ color: 'var(--circle)', textAlign: c.align ?? 'left' }}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={cols.length} className="px-4 py-10 text-center">
              <Loader2 className="h-6 w-6 animate-spin mx-auto" style={{ color: 'var(--neon-green)' }} />
            </td></tr>
          ) : rows.length === 0 ? (
            <tr><td colSpan={cols.length} className="px-4 py-10 text-center text-sm" style={{ color: 'var(--old-price)' }}>{emptyMsg}</td></tr>
          ) : rows.map(row => (
            <tr key={rowKey(row)} className="hover:bg-white/5 transition-colors" style={{ borderBottom: '1px solid var(--border-color)' }}>
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

// ── Data Page Component (High Level DRY) ───────────────────────────────────────
export function KpDataPage<T>({
  title,
  subtitle,
  fetchUrl,
  cols,
  rowKey,
  action,
  searchPlaceholder = 'Search…',
  emptyMsg,
  filterFn,
}: {
  title: string;
  subtitle?: string;
  fetchUrl: string;
  cols: Col<T>[];
  rowKey: (r: T) => string;
  action?: React.ReactNode;
  searchPlaceholder?: string;
  emptyMsg?: string;
  filterFn?: (item: T, search: string) => boolean;
}) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { showToast } = useToast();

  const fetchData = useCallback(async () => {
    setLoading(true);
    const r = await kpFetch(fetchUrl);
    if (r.success) {
      setData(Array.isArray(r.data) ? r.data : []);
    } else {
      showToast(r.error || `Failed to load ${title.toLowerCase()}`, 'error');
    }
    setLoading(false);
  }, [fetchUrl, title, showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = data.filter((item: any) => {
    if (!search) return true;
    if (filterFn) return filterFn(item, search);
    const s = search.toLowerCase();
    return Object.values(item).some(v =>
      typeof v === 'string' || typeof v === 'number'
        ? String(v).toLowerCase().includes(s)
        : false
    );
  });

  return (
    <div className="space-y-6">
      <KpPageHeader title={title} subtitle={subtitle} action={action} />
      <KpSearch value={search} onChange={setSearch} placeholder={searchPlaceholder} className="max-w-md" />
      <KpCard>
        {loading ? (
          <KpSkeleton />
        ) : (
          <KpTable
            cols={cols}
            rows={filtered}
            rowKey={rowKey}
            emptyMsg={emptyMsg}
          />
        )}
      </KpCard>
    </div>
  );
}

// ── Pagination ─────────────────────────────────────────────────────────────────
export function KpPagination({ page, totalPages, total, limit, onPage }: { page: number; totalPages: number; total: number; limit: number; onPage: (p: number) => void }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
      <span className="text-sm" style={{ color: 'var(--old-price)' }}>
        Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
      </span>
      <div className="flex gap-2">
        <button onClick={() => onPage(page - 1)} disabled={page <= 1}
          className="p-1.5 rounded-lg border hover:bg-white/5 disabled:opacity-40 transition-colors"
          style={{ borderColor: 'var(--border-color)', color: 'var(--old-price)' }}>
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button onClick={() => onPage(page + 1)} disabled={page >= totalPages}
          className="p-1.5 rounded-lg border hover:bg-white/5 disabled:opacity-40 transition-colors"
          style={{ borderColor: 'var(--border-color)', color: 'var(--old-price)' }}>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ── Modal ──────────────────────────────────────────────────────────────────────
export function KpModal({ title, onClose, children, maxWidth = 'max-w-lg' }: { title: string; onClose: () => void; children: React.ReactNode; maxWidth?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={`w-full ${maxWidth} rounded-2xl border p-6 shadow-2xl`}
        style={{ background: 'var(--croma-wall)', borderColor: 'var(--border-color)' }}>
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

// ── Field Input ────────────────────────────────────────────────────────────────
export function KpField({ label, error, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-semibold" style={{ color: 'var(--old-price)' }}>{label}</label>
      <input className="w-full rounded-lg px-3 py-2.5 text-sm outline-none border"
        style={{ background: 'var(--foot-color)', borderColor: error ? '#f87171' : 'var(--border-color)', color: 'var(--text-color)' }}
        {...props} />
      {error && <p className="text-xs" style={{ color: '#f87171' }}>{error}</p>}
    </div>
  );
}

// ── Skeleton ───────────────────────────────────────────────────────────────────
export function KpSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="p-6 space-y-3">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="h-14 rounded-lg animate-pulse" style={{ background: 'var(--foot-color)' }} />
      ))}
    </div>
  );
}
