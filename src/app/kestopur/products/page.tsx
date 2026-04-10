'use client';
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import { kpFetch } from '@/lib/kestopur/api';
import { useToast } from '@/providers/toast-context';
import { KpPageHeader, KpCard, KpTable, KpBadge, KpBtn, KpSearch, KpSkeleton, KpModal, KpField } from '@/components/kestopur/ui';

interface Product { product_id: string; name: string; product_type: string; status: string; created_at: string; }

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: '', product_type: 'simple', status: 'active' });
  const [saving, setSaving] = useState(false);

  const { showToast } = useToast();

  const fetch = async () => {
    setLoading(true);
    const r = await kpFetch('/wp-admin/products');
    if (r.success) {
      setProducts(Array.isArray(r.data) ? r.data : []);
    } else {
      showToast(r.error || 'Failed to fetch products', 'error');
    }
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const openCreate = () => { setSelected(null); setForm({ name: '', product_type: 'simple', status: 'active' }); setShowModal(true); };
  const openEdit = (p: Product) => { setSelected(p); setForm({ name: p.name, product_type: p.product_type, status: p.status }); setShowModal(true); };

  const handleSave = async () => {
    setSaving(true);
    const r = selected
      ? await kpFetch(`/wp-admin/products/${selected.product_id}`, { method: 'PUT', body: JSON.stringify(form) })
      : await kpFetch('/wp-admin/products', { method: 'POST', body: JSON.stringify(form) });

    setSaving(false);
    if (r.success) {
      showToast(selected ? 'Product updated successfully' : 'Product created successfully', 'success');
      setShowModal(false);
      fetch();
    } else {
      showToast(r.error || 'Failed to save product', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    const r = await kpFetch(`/wp-admin/products/${id}`, { method: 'DELETE' });
    if (r.success) {
      showToast('Product deleted successfully', 'success');
      fetch();
    } else {
      showToast(r.error || 'Failed to delete product', 'error');
    }
  };

  const filtered = products.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()));

  const cols = [
    { key: 'name', label: 'Product Name', render: (p: Product) => <span className="text-sm font-medium" style={{ color: 'var(--text-color)' }}>{p.name}</span> },
    { key: 'type', label: 'Type', render: (p: Product) => <span className="text-sm" style={{ color: 'var(--old-price)' }}>{p.product_type}</span> },
    { key: 'status', label: 'Status', render: (p: Product) => <KpBadge label={p.status} variant={p.status} /> },
    { key: 'created', label: 'Created', render: (p: Product) => <span className="text-sm" style={{ color: 'var(--circle)' }}>{new Date(p.created_at).toLocaleDateString()}</span> },
    {
      key: 'actions', label: 'Actions', align: 'right' as const, render: (p: Product) => (
        <div className="flex items-center justify-end gap-2">
          <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" style={{ color: 'var(--circle)' }}><Edit className="h-4 w-4" /></button>
          <button onClick={() => handleDelete(p.product_id)} className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors" style={{ color: '#f87171' }}><Trash2 className="h-4 w-4" /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <KpPageHeader title="Products" subtitle="Manage your product catalog"
        action={<KpBtn onClick={openCreate}><Plus className="h-4 w-4" /> Add Product</KpBtn>} />
      <KpSearch value={search} onChange={setSearch} placeholder="Search products..." className="max-w-md" />
      <KpCard>
        {loading ? <KpSkeleton /> : <KpTable cols={cols} rows={filtered} rowKey={p => p.product_id} emptyMsg="No products found." />}
      </KpCard>

      {showModal && (
        <KpModal title={selected ? 'Edit Product' : 'Add Product'} onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <KpField label="Product Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Wireless Headphones" />
            <div className="space-y-1">
              <label className="block text-xs font-semibold" style={{ color: 'var(--old-price)' }}>Type</label>
              <select value={form.product_type} onChange={e => setForm(f => ({ ...f, product_type: e.target.value }))}
                className="w-full rounded-lg px-3 py-2.5 text-sm outline-none border"
                style={{ background: 'var(--foot-color)', borderColor: 'var(--border-color)', color: 'var(--text-color)' }}>
                {['simple', 'variable', 'bundle', 'digital'].map(t => <option key={t} value={t} style={{ background: 'var(--navbar-carousel-color)' }}>{t}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-semibold" style={{ color: 'var(--old-price)' }}>Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                className="w-full rounded-lg px-3 py-2.5 text-sm outline-none border"
                style={{ background: 'var(--foot-color)', borderColor: 'var(--border-color)', color: 'var(--text-color)' }}>
                {['active', 'draft', 'inactive'].map(s => <option key={s} value={s} style={{ background: 'var(--navbar-carousel-color)' }}>{s}</option>)}
              </select>
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={() => setShowModal(false)} className="flex-1 rounded-xl py-2.5 text-sm border hover:bg-white/5 transition-colors"
                style={{ borderColor: 'var(--border-color)', color: 'var(--old-price)' }}>Cancel</button>
              <KpBtn onClick={handleSave} loading={saving} className="flex-1 justify-center">Save</KpBtn>
            </div>
          </div>
        </KpModal>
      )}
    </div>
  );
}
