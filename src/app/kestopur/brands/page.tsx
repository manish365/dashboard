'use client';
import { useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { kpFetch } from '@/lib/kestopur/api';
import { useToast } from '@/providers/toast-context';
import { KpDataPage, KpBadge, KpBtn, KpModal, KpField } from '@/components/kestopur/ui';

interface Brand { brand_id: string; brand_name: string; brand_slug: string; is_active: boolean; logo_url?: string; }

export default function BrandsPage() {
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState<Brand | null>(null);
  const [form, setForm] = useState({ brand_name: '', brand_slug: '' });
  const [saving, setSaving] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { showToast } = useToast();

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this brand?')) return;
    const r = await kpFetch(`/wp-admin/brands/${id}`, { method: 'DELETE' });
    if (r.success) {
      showToast('Brand deleted', 'success');
      setRefreshKey(k => k + 1);
    } else {
      showToast(r.error || 'Delete failed', 'error');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const r = selected
      ? await kpFetch(`/wp-admin/brands/${selected.brand_id}`, { method: 'PUT', body: JSON.stringify(form) })
      : await kpFetch('/wp-admin/brands', { method: 'POST', body: JSON.stringify(form) });
    setSaving(false);
    if (r.success) {
      showToast(selected ? 'Brand updated' : 'Brand created', 'success');
      setShowModal(false);
      setRefreshKey(k => k + 1);
    } else {
      showToast(r.error || 'Save failed', 'error');
    }
  };

  const cols = [
    { 
      key: 'brand', 
      label: 'Brand', 
      render: (b: Brand) => (
        <div className="flex items-center gap-3">
          {b.logo_url && <img src={b.logo_url} alt={b.brand_name} className="w-8 h-8 rounded object-contain" />}
          <span className="text-sm font-semibold theme-text">{b.brand_name}</span>
        </div>
      ) 
    },
    { 
      key: 'slug', 
      label: 'Slug', 
      render: (b: Brand) => <span className="text-xs font-mono theme-text-subtle">{b.brand_slug}</span> 
    },
    { 
      key: 'status', 
      label: 'Status', 
      render: (b: Brand) => <KpBadge label={b.is_active ? 'Active' : 'Inactive'} variant={b.is_active ? 'active' : 'inactive'} /> 
    },
    { 
      key: 'actions', 
      label: 'Actions', 
      align: 'right' as const, 
      render: (b: Brand) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={() => { setSelected(b); setForm({ brand_name: b.brand_name, brand_slug: b.brand_slug }); setShowModal(true); }} 
            className="p-1.5 rounded-lg hover:bg-white/10 theme-text-subtle"><Edit className="h-4 w-4" /></button>
          <button onClick={() => handleDelete(b.brand_id)} 
            className="p-1.5 rounded-lg hover:bg-red-500/10 theme-text-danger"><Trash2 className="h-4 w-4" /></button>
        </div>
      ) 
    },
  ];

  return (
    <>
      <KpDataPage<Brand>
        key={refreshKey}
        title="Brand Registry"
        subtitle="Manage product brands and verified suppliers"
        fetchUrl="/wp-admin/brands"
        cols={cols}
        rowKey={b => b.brand_id}
        searchPlaceholder="Search brands..."
        action={
          <KpBtn onClick={() => { setSelected(null); setForm({ brand_name: '', brand_slug: '' }); setShowModal(true); }}>
            <Plus className="h-4 w-4" /> Add Brand
          </KpBtn>
        }
      />

      {showModal && (
        <KpModal title={selected ? 'Edit Brand' : 'Add Brand'} onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <KpField label="Brand Name" value={form.brand_name} onChange={e => setForm(f => ({ ...f, brand_name: e.target.value }))} placeholder="e.g. Nike" />
            <KpField label="Slug" value={form.brand_slug} onChange={e => setForm(f => ({ ...f, brand_slug: e.target.value }))} placeholder="e.g. nike" />
            <div className="flex gap-3 pt-1">
              <button onClick={() => setShowModal(false)} className="flex-1 rounded-xl py-2.5 text-sm border hover:bg-white/5 theme-btn-cancel">Cancel</button>
              <KpBtn onClick={handleSave} loading={saving} className="flex-1 justify-center">Save</KpBtn>
            </div>
          </div>
        </KpModal>
      )}
    </>
  );
}
