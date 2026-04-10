'use client';
import { useState, useEffect } from 'react';
import { Eye, Edit, Filter, X, Calendar, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { kpFetch } from '@/lib/kestopur/api';
import { useToast } from '@/providers/toast-context';
import { KpPageHeader, KpCard, KpTable, KpBadge, KpSearch, KpSelect, KpSkeleton, KpPagination } from '@/components/kestopur/ui';

interface Order { orderId: string; orderNumber: string; customerId: string; orderStatus: string; paymentStatus: string; finalAmount: number; createdAt: string; items?: any[]; }

const STATUS_OPTIONS = ['', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });

  const { showToast } = useToast();

  const fetchOrders = async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(pagination.page), limit: '10', ...(statusFilter && { status: statusFilter }), ...(search && { search }) });
    const r = await kpFetch(`/wp-admin/orders?${params}`);
    if (r.success) {
      setOrders(r.data?.data || r.data || []);
      setPagination(p => ({ ...p, total: r.data?.total || 0, totalPages: r.data?.totalPages || 0 }));
    } else {
      showToast(r.error || 'Failed to load orders', 'error');
    }
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, [pagination.page, statusFilter]);

  const fmt = (d: string) => new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  const fmtCurrency = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(n || 0);

  const stats = [
    { label: 'Total', value: pagination.total, color: 'var(--neon-green)' },
    { label: 'Pending', value: orders.filter(o => o.orderStatus === 'pending').length, color: '#fbbf24' },
    { label: 'Processing', value: orders.filter(o => ['confirmed', 'processing'].includes(o.orderStatus)).length, color: '#f97316' },
    { label: 'Delivered', value: orders.filter(o => o.orderStatus === 'delivered').length, color: '#34d399' },
  ];

  const cols = [
    { key: 'order', label: 'Order', render: (o: Order) => <div><p className="text-sm font-medium" style={{ color: 'var(--text-color)' }}>{o.orderNumber}</p><p className="text-xs" style={{ color: 'var(--circle)' }}>{o.items?.length || 0} items</p></div> },
    { key: 'customer', label: 'Customer', render: (o: Order) => <span className="text-sm" style={{ color: 'var(--old-price)' }}>{o.customerId}</span> },
    { key: 'date', label: 'Date', render: (o: Order) => <span className="text-sm flex items-center gap-1" style={{ color: 'var(--old-price)' }}><Calendar className="h-3.5 w-3.5" />{fmt(o.createdAt)}</span> },
    { key: 'total', label: 'Total', render: (o: Order) => <span className="text-sm font-medium flex items-center gap-1" style={{ color: 'var(--text-color)' }}><DollarSign className="h-3.5 w-3.5" style={{ color: 'var(--circle)' }} />{fmtCurrency(o.finalAmount)}</span> },
    { key: 'status', label: 'Status', render: (o: Order) => <KpBadge label={o.orderStatus} variant={o.orderStatus} /> },
    { key: 'payment', label: 'Payment', render: (o: Order) => <KpBadge label={o.paymentStatus || 'unknown'} variant={o.paymentStatus} /> },
    {
      key: 'actions', label: 'Actions', align: 'right' as const, render: (o: Order) => (
        <div className="flex items-center justify-end gap-2">
          <Link href={`/kestopur/orders/${o.orderId}`} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" style={{ color: 'var(--neon-green)' }}><Eye className="h-4 w-4" /></Link>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <KpPageHeader title="Orders" subtitle="View and manage all customer orders" />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(s => (
          <div key={s.label} className="rounded-xl border p-4" style={{ background: 'var(--croma-wall)', borderColor: 'var(--border-color)' }}>
            <p className="text-xs" style={{ color: 'var(--old-price)' }}>{s.label}</p>
            <p className="text-2xl font-bold mt-1" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <KpSearch value={search} onChange={setSearch} placeholder="Search orders..." className="flex-1 max-w-sm"
          onKeyDown={(e: any) => e.key === 'Enter' && fetchOrders()} />
        <KpSelect value={statusFilter} onChange={v => { setStatusFilter(v); setPagination(p => ({ ...p, page: 1 })); }}>
          {STATUS_OPTIONS.map(s => <option key={s} value={s} style={{ background: 'var(--navbar-carousel-color)' }}>{s || 'All Orders'}</option>)}
        </KpSelect>
        {(search || statusFilter) && (
          <button onClick={() => { setSearch(''); setStatusFilter(''); }} className="flex items-center gap-1 text-sm hover:opacity-80" style={{ color: 'var(--circle)' }}>
            <X className="h-4 w-4" /> Clear
          </button>
        )}
      </div>

      <div className="rounded-xl border overflow-hidden" style={{ background: 'var(--croma-wall)', borderColor: 'var(--border-color)' }}>
        {loading ? <KpSkeleton /> : <KpTable cols={cols} rows={orders} rowKey={o => o.orderId} emptyMsg="No orders found." />}
        <KpPagination page={pagination.page} totalPages={pagination.totalPages} total={pagination.total} limit={pagination.limit}
          onPage={p => setPagination(prev => ({ ...prev, page: p }))} />
      </div>
    </div>
  );
}
