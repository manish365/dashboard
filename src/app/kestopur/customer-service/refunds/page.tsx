'use client';
import { useState, useEffect } from 'react';
import { RefreshCw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { kpFetch } from '@/lib/kestopur/api';
import { KpPageHeader, KpCard, KpTable, KpBadge, KpSearch, KpSkeleton } from '@/components/kestopur/ui';

interface Refund { id: string; orderId: string; amount: number; status: string; createdAt: string; }

export default function RefundsPage() {
  const [items, setItems] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    kpFetch('/wp-admin/customer-service/refunds')
      .then(r => setItems(Array.isArray(r.data) ? r.data : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = items.filter(i => i.orderId?.toLowerCase().includes(search.toLowerCase()));

  const cols = [
    { key: 'order', label: 'Order ID', render: (r: Refund) => <span className="text-sm font-mono" style={{ color: 'var(--neon-green)' }}>{r.orderId}</span> },
    { key: 'amount', label: 'Amount', render: (r: Refund) => <span className="text-sm font-semibold" style={{ color: 'var(--text-color)' }}>₹{r.amount?.toLocaleString()}</span> },
    { key: 'status', label: 'Status', render: (r: Refund) => <KpBadge label={r.status} variant={r.status} /> },
    { key: 'date', label: 'Date', render: (r: Refund) => <span className="text-sm" style={{ color: 'var(--circle)' }}>{new Date(r.createdAt).toLocaleDateString()}</span> },
  ];

  return (
    <div className="space-y-6">
      <Link href="/kestopur/customer-service" className="inline-flex items-center gap-1.5 text-sm hover:opacity-80" style={{ color: 'var(--circle)' }}>
        <ArrowLeft className="h-4 w-4" /> Customer Service
      </Link>
      <KpPageHeader title="Refunds" subtitle="Process customer refunds"
        action={<div className="rounded-xl p-2.5" style={{ background: 'rgba(96,165,250,0.1)' }}><RefreshCw className="h-5 w-5" style={{ color: '#60a5fa' }} /></div>} />
      <KpSearch value={search} onChange={setSearch} placeholder="Search by order ID..." className="max-w-md" />
      <KpCard>
        {loading ? <KpSkeleton /> : <KpTable cols={cols} rows={filtered} rowKey={r => r.id} emptyMsg="No refunds found." />}
      </KpCard>
    </div>
  );
}
