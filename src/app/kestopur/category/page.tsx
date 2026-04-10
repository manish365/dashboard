'use client';
import { useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { kpFetch } from '@/lib/kestopur/api';
import { useToast } from '@/providers/toast-context';
import { KpDataPage, KpBadge, KpBtn, KpModal, KpField } from '@/components/kestopur/ui';

interface Category { 
  category_id: string; 
  name: string; 
  slug: string; 
  is_active: boolean; 
}

export default function CategoryPage() {
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: '', slug: '' });
  const [saving, setSaving] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { showToast } = useToast();

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    const r = await kpFetch(`/wp-admin/categories/${id}`, { method: 'DELETE' });
    if (r.success) {
      showToast('Category deleted successfully', 'success');
      setRefreshKey(prev => prev + 1);
    } else {
      showToast(r.error || 'Delete failed', 'error');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const r = selected
      ? await kpFetch(`/wp-admin/categories/${selected.category_id}`, { method: 'PUT', body: JSON.stringify(form) })
      : await kpFetch('/wp-admin/categories', { method: 'POST', body: JSON.stringify(form) });
    setSaving(false);
    if (r.success) {
      showToast(selected ? 'Category updated' : 'Category created', 'success');
      setShowModal(false);
      setRefreshKey(prev => prev + 1);
    } else {
      showToast(r.error || 'Save failed', 'error');
    }
  };

  const cols = [
    { 
      key: 'name', 
      label: 'Category Name', 
      render: (c: Category) => <span className="text-sm font-medium" style={{ color: 'var(--text-color)' }}>{c.name}</span> 
    },
    { 
      key: 'slug', 
      label: 'Slug', 
      render: (c: Category) => <span className="text-xs font-mono" style={{ color: 'var(--circle)' }}>{c.slug}</span> 
    },
    { 
      key: 'status', 
      label: 'Status', 
      render: (c: Category) => <KpBadge label={c.is_active ? 'Active' : 'Inactive'} variant={c.is_active ? 'active' : 'inactive'} /> 
    },
    { 
      key: 'actions', 
      label: 'Actions', 
      align: 'right' as const, 
      render: (c: Category) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={() => { setSelected(c); setForm({ name: c.name, slug: c.slug }); setShowModal(true); }} 
            className="p-1.5 rounded-lg hover:bg-white/10" style={{ color: 'var(--circle)' }}><Edit className="h-4 w-4" /></button>
          <button onClick={() => handleDelete(c.category_id)} 
            className="p-1.5 rounded-lg hover:bg-red-500/10" style={{ color: '#f87171' }}><Trash2 className="h-4 w-4" /></button>
        </div>
      ) 
    },
  ];

  return (
    <>
      <KpDataPage<Category>
        key={refreshKey}
        title="Categories"
        subtitle="Manage product categories and hierarchies"
        fetchUrl="/wp-admin/categories"
        cols={cols}
        rowKey={c => c.category_id}
        searchPlaceholder="Search categories..."
        action={
          <KpBtn onClick={() => { setSelected(null); setForm({ name: '', slug: '' }); setShowModal(true); }}>
            <Plus className="h-4 w-4" /> Add Category
          </KpBtn>
        }
      />

      {showModal && (
        <KpModal title={selected ? 'Edit Category' : 'Add Category'} onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <KpField label="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Electronics" />
            <KpField label="Slug" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="e.g. electronics" />
            <div className="flex gap-3 pt-1">
              <button onClick={() => setShowModal(false)} className="flex-1 rounded-xl py-2.5 text-sm border hover:bg-white/5" 
                style={{ borderColor: 'var(--border-color)', color: 'var(--old-price)' }}>Cancel</button>
              <KpBtn onClick={handleSave} loading={saving} className="flex-1 justify-center">Save</KpBtn>
            </div>
          </div>
        </KpModal>
      )}
    </>
  );
}
