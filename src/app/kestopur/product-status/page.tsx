'use client';
import { useState, useEffect } from 'react';
import { Search, ChevronRight, CheckCircle, XCircle, Clock, AlertTriangle, Save, Loader2 } from 'lucide-react';
import { kpFetch } from '@/lib/kestopur/api';
import { useToast } from '@/providers/toast-context';
import { KpPageHeader, KpCard, KpTable, KpBadge, KpBtn, KpSearch, KpSkeleton, KpModal, KpField } from '@/components/kestopur/ui';

interface Product {
  product_id: string;
  product_name: string;
  sku: string;
  status: string;
}

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft', color: 'bg-gray-100 text-gray-700', icon: Clock },
  { value: 'pending_review', label: 'Pending Review', color: 'bg-blue-100 text-blue-700', icon: AlertTriangle },
  { value: 'published', label: 'Published', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-700', icon: XCircle },
  { value: 'archived', label: 'Archived', color: 'bg-orange-100 text-orange-700', icon: XCircle },
];

export default function ProductStatusPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [updating, setUpdating] = useState(false);
  const [bulkStatus, setBulkStatus] = useState('');
  const { showToast } = useToast();

  const fetchProducts = async () => {
    setLoading(true);
    const r = await kpFetch('/wp-admin/products');
    if (r.success) {
      setProducts(Array.isArray(r.data) ? r.data : []);
    } else {
      showToast(r.error || 'Failed to load products', 'error');
    }
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  const toggleSelection = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]);
  };

  const handleBulkUpdate = async () => {
    if (!bulkStatus || selected.length === 0) return;
    setUpdating(true);
    let successCount = 0;
    
    for (const id of selected) {
      const r = await kpFetch(`/wp-admin/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: bulkStatus }),
      });
      if (r.success) successCount++;
    }

    setUpdating(false);
    if (successCount === selected.length) {
      showToast(`Successfully updated ${successCount} products to ${bulkStatus}`, 'success');
      setSelected([]);
      setBulkStatus('');
      fetchProducts();
    } else {
      showToast(`Updated ${successCount}/${selected.length} products. Some updates failed.`, 'warning');
      fetchProducts();
    }
  };

  const filtered = products.filter(p =>
    p.product_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.sku?.toLowerCase().includes(search.toLowerCase())
  );

  const cols = [
    {
      key: 'select',
      label: '',
      render: (p: Product) => (
        <input
          type="checkbox"
          checked={selected.includes(p.product_id)}
          onChange={() => toggleSelection(p.product_id)}
          className="w-4 h-4 rounded border-gray-300 text-[var(--neon-green)] bg-transparent"
        />
      ),
    },
    {
      key: 'product',
      label: 'Product',
      render: (p: Product) => (
        <div>
          <p className="text-sm font-medium theme-text">{p.product_name}</p>
          <p className="text-xs theme-text-subtle">ID: {p.product_id.split('-')[0]}...</p>
        </div>
      ),
    },
    {
      key: 'sku',
      label: 'SKU',
      render: (p: Product) => <span className="text-xs font-mono theme-text-muted">{p.sku || 'NO-SKU'}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (p: Product) => <KpBadge label={p.status} variant={p.status} />,
    },
    {
      key: 'actions',
      label: 'Quick Update',
      align: 'right' as const,
      render: (p: Product) => (
        <select
          value={p.status}
          onChange={async (e) => {
            const r = await kpFetch(`/wp-admin/products/${p.product_id}`, {
              method: 'PUT',
              body: JSON.stringify({ status: e.target.value }),
            });
            if (r.success) {
              showToast('Status updated', 'success');
              fetchProducts();
            } else {
              showToast(r.error || 'Update failed', 'error');
            }
          }}
          className="text-xs rounded-lg p-1 outline-none border transition-all opacity-60 hover:opacity-100 theme-select theme-border"
        >
          {STATUS_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value} className="theme-option">{opt.label}</option>
          ))}
        </select>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <KpPageHeader
        title="Product Status Mgmt"
        subtitle="Bulk manage product publishing workflows"
        action={
          selected.length > 0 && (
            <div className="flex items-center gap-3 p-2 rounded-xl border animate-in fade-in slide-in-from-top-2 theme-card-bg">
              <span className="text-xs font-bold px-2 theme-text-neon">{selected.length} Selected</span>
              <select
                value={bulkStatus}
                onChange={(e) => setBulkStatus(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-lg outline-none border theme-select theme-border"
              >
                <option value="">Choose status...</option>
                {STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value} className="theme-option">{opt.label}</option>)}
              </select>
              <KpBtn onClick={handleBulkUpdate} loading={updating} disabled={!bulkStatus} className="py-1.5 px-3 whitespace-nowrap">
                Apply Bulk
              </KpBtn>
            </div>
          )
        }
      />

      <KpSearch value={search} onChange={setSearch} placeholder="Filter by name or SKU..." className="max-w-md" />

      <KpCard>
        {loading ? (
          <KpSkeleton />
        ) : (
          <KpTable
            cols={cols}
            rows={filtered}
            rowKey={(p) => p.product_id}
            emptyMsg="No products found matching your search."
          />
        )}
      </KpCard>
    </div>
  );
}
