'use client';
import { useState, useEffect } from 'react';
import { RotateCcw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { kpFetch } from '@/lib/kestopur/api';
import { KpPageHeader, KpCard, KpTable, KpBadge, KpSearch, KpSkeleton } from '@/components/kestopur/ui';

interface ReturnReq { id: string; orderId: string; reason: string; status: string; createdAt: string; }

export default function ReturnsPage() {
  const [items, setItems] = useState<ReturnReq[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    kpFetch('/wp-admin/customer-service/returns')
      .then(r => setItems(Array.isArray(r.data) ? r.data : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = items.filter(i => i.orderId?.toLowerCase().includes(search.toLowerCase()) || i.reason?.toLowerCase().includes(search.toLowerCase()));

  const cols = [
    { key: 'order', label: 'Order ID', render: (r: ReturnReq) => <span className="text-sm font-mono" style={{ color: 'var(--neon-green)' }}>{r.orderId}</span> },
    { key: 'reason', label: 'Reason', render: (r: ReturnReq) => <span className="text-sm" style={{ color: 'var(--old-price)' }}>{r.reason}</span> },
    { key: 'status', label: 'Status', render: (r: ReturnReq) => <KpBadge label={r.status} variant={r.status} /> },
    { key: 'date', label: 'Date', render: (r: ReturnReq) => <span className="text-sm" style={{ color: 'var(--circle)' }}>{new Date(r.createdAt).toLocaleDateString()}</span> },
  ];

  return (
    <div className="space-y-6">
      <Link href="/kestopur/customer-service" className="inline-flex items-center gap-1.5 text-sm hover:opacity-80" style={{ color: 'var(--circle)' }}>
        <ArrowLeft className="h-4 w-4" /> Customer Service
      </Link>
      <KpPageHeader title="Returns" subtitle="Manage product return requests"
        action={<div className="rounded-xl p-2.5" style={{ background: 'rgba(251,191,36,0.1)' }}><RotateCcw className="h-5 w-5" style={{ color: '#fbbf24' }} /></div>} />
      <KpSearch value={search} onChange={setSearch} placeholder="Search returns..." className="max-w-md" />
      <KpCard>
        {loading ? <KpSkeleton /> : <KpTable cols={cols} rows={filtered} rowKey={r => r.id} emptyMsg="No return requests found." />}
      </KpCard>
    </div>
  );
}
