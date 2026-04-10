'use client';
import { useState, useEffect } from 'react';
import { CreditCard, Calendar, DollarSign, RefreshCw } from 'lucide-react';
import { kpFetch } from '@/lib/kestopur/api';
import { KpPageHeader, KpCard, KpTable, KpBadge, KpSearch, KpSelect, KpSkeleton, KpStatCard } from '@/components/kestopur/ui';

interface Payment { transactionId: string; orderId: string; paymentGateway: string; amount: number; paymentStatus: string; createdAt: string; }

const fmt = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(n || 0);

export default function PaymentsPage() {
  const [items, setItems] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [gatewayFilter, setGatewayFilter] = useState('');

  const fetchPayments = async () => {
    setLoading(true);
    const params = new URLSearchParams({ ...(statusFilter && { status: statusFilter }), ...(gatewayFilter && { gateway: gatewayFilter }) });
    const r = await kpFetch(`/wp-admin/payments?${params}`);
    setItems(Array.isArray(r.data) ? r.data : []);
    setLoading(false);
  };
  useEffect(() => { fetchPayments(); }, [statusFilter, gatewayFilter]);

  const totalRevenue = items.filter(p => p.paymentStatus === 'succeeded').reduce((s, p) => s + (p.amount || 0), 0);
  const filtered = items.filter(p => p.transactionId?.toLowerCase().includes(search.toLowerCase()) || p.orderId?.toLowerCase().includes(search.toLowerCase()));

  const cols = [
    { key: 'txn', label: 'Transaction', render: (p: Payment) => <span className="text-sm font-mono" style={{ color: 'var(--text-color)' }}>{p.transactionId?.slice(0, 14)}...</span> },
    { key: 'order', label: 'Order', render: (p: Payment) => <span className="text-sm font-mono" style={{ color: 'var(--old-price)' }}>{p.orderId?.slice(0, 10)}...</span> },
    { key: 'gateway', label: 'Gateway', render: (p: Payment) => <span className="text-sm capitalize" style={{ color: 'var(--old-price)' }}>{p.paymentGateway}</span> },
    { key: 'amount', label: 'Amount', render: (p: Payment) => <span className="text-sm font-semibold flex items-center gap-1" style={{ color: 'var(--text-color)' }}><DollarSign className="h-3.5 w-3.5" style={{ color: 'var(--circle)' }} />{fmt(p.amount)}</span> },
    { key: 'status', label: 'Status', render: (p: Payment) => <KpBadge label={p.paymentStatus} variant={p.paymentStatus === 'succeeded' ? 'active' : p.paymentStatus === 'failed' ? 'cancelled' : 'pending'} /> },
    { key: 'date', label: 'Date', render: (p: Payment) => <span className="text-sm flex items-center gap-1" style={{ color: 'var(--circle)' }}><Calendar className="h-3.5 w-3.5" />{new Date(p.createdAt).toLocaleDateString()}</span> },
    { key: 'actions', label: '', align: 'right' as const, render: (p: Payment) => p.paymentStatus === 'succeeded' ? <button className="flex items-center gap-1 text-xs hover:opacity-80" style={{ color: '#f87171' }}><RefreshCw className="h-3.5 w-3.5" /> Refund</button> : null },
  ];

  return (
    <div className="space-y-6">
      <KpPageHeader title="Payment Transactions" subtitle="View and manage payment transactions" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpStatCard label="Total Transactions" value={items.length} icon={CreditCard} color="#60a5fa" />
        <KpStatCard label="Successful" value={items.filter(p => p.paymentStatus === 'succeeded').length} icon={CreditCard} color="#34d399" />
        <KpStatCard label="Failed" value={items.filter(p => p.paymentStatus === 'failed').length} icon={CreditCard} color="#f87171" />
        <KpStatCard label="Total Revenue" value={fmt(totalRevenue)} icon={DollarSign} color="var(--neon-green)" />
      </div>
      <div className="flex flex-wrap gap-3">
        <KpSearch value={search} onChange={setSearch} placeholder="Search by transaction or order ID..." className="flex-1 max-w-sm" />
        <KpSelect value={statusFilter} onChange={setStatusFilter}>
          {['', 'pending', 'processing', 'succeeded', 'failed', 'refunded'].map(s => <option key={s} value={s} style={{ background: 'var(--navbar-carousel-color)' }}>{s || 'All Statuses'}</option>)}
        </KpSelect>
        <KpSelect value={gatewayFilter} onChange={setGatewayFilter}>
          {['', 'razorpay', 'stripe', 'phonepe', 'payu'].map(g => <option key={g} value={g} style={{ background: 'var(--navbar-carousel-color)' }}>{g || 'All Gateways'}</option>)}
        </KpSelect>
      </div>
      <KpCard>{loading ? <KpSkeleton /> : <KpTable cols={cols} rows={filtered} rowKey={p => p.transactionId} emptyMsg="No transactions found." />}</KpCard>
    </div>
  );
}
