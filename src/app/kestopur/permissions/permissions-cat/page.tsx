'use client';
import { useState, useEffect } from 'react';
import { PlusCircle, Filter, Edit, Trash2 } from 'lucide-react';
import { kpFetch } from '@/lib/kestopur/api';
import { useToast } from '@/providers/toast-context';
import { KpPageHeader, KpCard, KpTable, KpBadge, KpBtn, KpSearch, KpSkeleton, KpModal, KpField } from '@/components/kestopur/ui';

interface PermissionCategory {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
}

export default function PermissionsCatPage() {
  const [items, setItems] = useState<PermissionCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState<PermissionCategory | null>(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const fetchCategories = async () => {
    setLoading(true);
    const r = await kpFetch('/wp-admin/permissions/categories');
    if (r.success) {
      setItems(Array.isArray(r.data) ? r.data : []);
    } else {
      showToast(r.error || 'Failed to load permission categories', 'error');
    }
    setLoading(false);
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleSave = async () => {
    setSaving(true);
    const r = selected
      ? await kpFetch(`/wp-admin/permissions/categories/${selected.id}`, { method: 'PUT', body: JSON.stringify(form) })
      : await kpFetch('/wp-admin/permissions/categories', { method: 'POST', body: JSON.stringify(form) });
      
    setSaving(false);
    if (r.success) {
      showToast(selected ? 'Category updated' : 'Category created', 'success');
      setShowModal(false);
      fetchCategories();
    } else {
      showToast(r.error || 'Operation failed', 'error');
    }
  };

  const cols = [
    {
      key: 'name',
      label: 'Category Name',
      render: (c: PermissionCategory) => <span className="text-sm font-medium theme-text">{c.name}</span>,
    },
    {
      key: 'desc',
      label: 'Description',
      render: (c: PermissionCategory) => <span className="text-sm theme-text-muted">{c.description || '—'}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (c: PermissionCategory) => <KpBadge label={c.is_active ? 'Active' : 'Inactive'} variant={c.is_active ? 'active' : 'inactive'} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right' as const,
      render: (c: PermissionCategory) => (
        <div className="flex items-center justify-end gap-2">
          <button onClick={() => { setSelected(c); setForm({ name: c.name, description: c.description || '' }); setShowModal(true); }}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors theme-text-subtle"><Edit className="h-4 w-4" /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <KpPageHeader
        title="Permission Categories"
        subtitle="Manage groups for system permissions"
        action={
          <KpBtn onClick={() => { setSelected(null); setForm({ name: '', description: '' }); setShowModal(true); }}>
            <PlusCircle className="h-4 w-4" /> Create Category
          </KpBtn>
        }
      />

      <KpCard>
        {loading ? (
          <KpSkeleton />
        ) : (
          <KpTable
            cols={cols}
            rows={items}
            rowKey={(c) => c.id}
            emptyMsg="No permission categories found."
          />
        )}
      </KpCard>

      {showModal && (
        <KpModal title={selected ? 'Edit Category' : 'Create Category'} onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <KpField label="Category Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Sales Management" />
            <div className="space-y-1">
              <label className="block text-xs font-semibold theme-text-muted">Description</label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Briefly describe the category usage..."
                className="w-full rounded-lg px-3 py-2.5 text-sm outline-none border min-h-[100px] theme-select theme-border"
              />
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={() => setShowModal(false)} className="flex-1 rounded-xl py-2.5 text-sm border hover:bg-white/5 transition-colors theme-btn-cancel">Cancel</button>
              <KpBtn onClick={handleSave} loading={saving} className="flex-1 justify-center">Save</KpBtn>
            </div>
          </div>
        </KpModal>
      )}
    </div>
  );
}
