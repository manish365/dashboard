'use client';
import { useState, useEffect } from 'react';
import { Star, ArrowLeft, ThumbsUp, ThumbsDown, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { kpFetch } from '@/lib/kestopur/api';
import { KpPageHeader, KpCard, KpTable, KpBadge, KpSearch, KpSkeleton } from '@/components/kestopur/ui';

interface Review { id: string; productName?: string; rating: number; comment: string; status: string; createdAt: string; }

function StarRating({ n }: { n: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={`h-3.5 w-3.5 ${i <= n ? 'theme-text-warning' : 'theme-text-subtle'}`} fill={i <= n ? 'currentColor' : 'none'} />
      ))}
      <span className="text-xs ml-1 theme-text-subtle">{n}/5</span>
    </div>
  );
}

export default function ReviewsPage() {
  const [items, setItems] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    kpFetch('/customer-service/reviews')
      .then(r => setItems(Array.isArray(r.data) ? r.data : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const handleApprove = async (id: string) => {
    await kpFetch(`/customer-service/reviews/${id}/approve`, { method: 'PATCH' });
    setItems(prev => prev.map(r => r.id === id ? { ...r, status: 'approved' } : r));
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this review?')) return;
    await kpFetch(`/customer-service/reviews/${id}`, { method: 'DELETE' });
    setItems(prev => prev.filter(r => r.id !== id));
  };

  const filtered = items.filter(i =>
    i.productName?.toLowerCase().includes(search.toLowerCase()) ||
    i.comment?.toLowerCase().includes(search.toLowerCase())
  );

  const cols = [
    { key: 'product', label: 'Product', render: (r: Review) => <span className="text-sm font-medium theme-text">{r.productName || 'Unknown'}</span> },
    { key: 'rating', label: 'Rating', render: (r: Review) => <StarRating n={r.rating} /> },
    { key: 'comment', label: 'Comment', render: (r: Review) => <span className="text-sm line-clamp-2 max-w-xs theme-text-muted">{r.comment}</span> },
    { key: 'status', label: 'Status', render: (r: Review) => <KpBadge label={r.status} variant={r.status === 'approved' ? 'active' : r.status === 'rejected' ? 'cancelled' : 'pending'} /> },
    { key: 'date', label: 'Date', render: (r: Review) => <span className="text-sm theme-text-subtle">{new Date(r.createdAt).toLocaleDateString()}</span> },
    {
      key: 'actions', label: 'Actions', align: 'right' as const, render: (r: Review) => (
        <div className="flex items-center justify-end gap-1">
          {r.status !== 'approved' && (
            <button onClick={() => handleApprove(r.id)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors theme-text-success" title="Approve">
              <ThumbsUp className="h-4 w-4" />
            </button>
          )}
          <button onClick={() => handleDelete(r.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors theme-text-danger" title="Delete">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Link href="/kestopur/customer-service" className="inline-flex items-center gap-1.5 text-sm hover:opacity-80 theme-text-subtle">
        <ArrowLeft className="h-4 w-4" /> Customer Service
      </Link>
      <KpPageHeader title="Product Reviews" subtitle="Moderate and manage product reviews"
        action={<div className="rounded-xl p-2.5 theme-tag-orange"><Star className="h-5 w-5 theme-text-orange" /></div>} />
      <KpSearch value={search} onChange={setSearch} placeholder="Search reviews..." className="max-w-md" />
      <KpCard>
        {loading ? <KpSkeleton /> : <KpTable cols={cols} rows={filtered} rowKey={r => r.id} emptyMsg="No reviews found." />}
      </KpCard>
    </div>
  );
}
