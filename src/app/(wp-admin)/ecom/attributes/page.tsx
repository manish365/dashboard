'use client';
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { kpFetch } from '@/lib/kestopur/api';
import { KpPageHeader, KpCard, KpTable, KpBadge, KpSearch, KpSelect, KpSkeleton, KpBtn, KpModal, KpField } from '@/components/kestopur/ui';

interface Attr { attribute_id: string; attribute_name: string; attribute_code: string; attribute_type: string; attribute_group?: string; is_required?: boolean; }

export default function AttributesPage() {
  const [items, setItems] = useState<Attr[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState<Attr | null>(null);
  const [form, setForm] = useState({ attribute_name: '', attribute_code: '', attribute_type: 'text', attribute_group: '' });
  const [saving, setSaving] = useState(false);

  const fetch = async () => {
    setLoading(true);
    const r = await kpFetch('/attributes');
    setItems(Array.isArray(r.data) ? r.data : []);
    setLoading(false);
  };
  useEffect(() => { fetch(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this attribute?')) return;
    await kpFetch(`/attributes/${id}`, { method: 'DELETE' });
    fetch();
  };

  const handleSave = async () => {
    setSaving(true);
    if (selected) await kpFetch(`/attributes/${selected.attribute_id}`, { method: 'PUT', body: JSON.stringify(form) });
    else await kpFetch('/attributes', { method: 'POST', body: JSON.stringify(form) });
    setSaving(false); setShowModal(false); fetch();
  };

  const uniqueTypes = [...new Set(items.map(a => a.attribute_type))];
  const filtered = items.filter(a =>
    (a.attribute_name?.toLowerCase().includes(search.toLowerCase()) || a.attribute_code?.toLowerCase().includes(search.toLowerCase())) &&
    (typeFilter === 'all' || a.attribute_type === typeFilter)
  );

  const cols = [
    { key: 'name', label: 'Code / Name', render: (a: Attr) => <div><p className="text-sm font-semibold theme-text">{a.attribute_name}</p><p className="text-xs font-mono theme-text-subtle">{a.attribute_code}</p></div> },
    { key: 'type', label: 'Type', render: (a: Attr) => <span className="text-xs px-2 py-0.5 rounded font-medium theme-tag-info">{a.attribute_type}</span> },
    { key: 'group', label: 'Group', render: (a: Attr) => <span className="text-sm theme-text-muted">{a.attribute_group || '—'}</span> },
    { key: 'required', label: 'Required', render: (a: Attr) => <KpBadge label={a.is_required ? 'Required' : 'Optional'} variant={a.is_required ? 'active' : 'default'} /> },
    {
      key: 'actions', label: 'Actions', align: 'right' as const, render: (a: Attr) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={() => { setSelected(a); setForm({ attribute_name: a.attribute_name, attribute_code: a.attribute_code, attribute_type: a.attribute_type, attribute_group: a.attribute_group || '' }); setShowModal(true); }} className="p-1.5 rounded-lg hover:bg-white/10 theme-text-subtle"><Edit className="h-4 w-4" /></button>
          <button onClick={() => handleDelete(a.attribute_id)} className="p-1.5 rounded-lg hover:bg-red-500/10 theme-text-danger"><Trash2 className="h-4 w-4" /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <KpPageHeader title="Attributes" subtitle="Manage product and category attribute definitions"
        action={<KpBtn onClick={() => { setSelected(null); setForm({ attribute_name: '', attribute_code: '', attribute_type: 'text', attribute_group: '' }); setShowModal(true); }}><Plus className="h-4 w-4" /> Add Attribute</KpBtn>} />
      <div className="flex flex-wrap gap-3">
        <KpSearch value={search} onChange={setSearch} placeholder="Search code or name..." className="flex-1 max-w-sm" />
        <KpSelect value={typeFilter} onChange={setTypeFilter}>
          <option value="all" className="theme-option">All Types</option>
          {uniqueTypes.map(t => <option key={t} value={t} className="theme-option">{t}</option>)}
        </KpSelect>
      </div>
      <KpCard>{loading ? <KpSkeleton /> : <KpTable cols={cols} rows={filtered} rowKey={a => a.attribute_id} emptyMsg="No attributes found." />}</KpCard>
      {showModal && (
        <KpModal title={selected ? 'Edit Attribute' : 'Add Attribute'} onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <KpField label="Attribute Name" value={form.attribute_name} onChange={e => setForm(f => ({ ...f, attribute_name: e.target.value }))} placeholder="e.g. Color" />
            <KpField label="Attribute Code" value={form.attribute_code} onChange={e => setForm(f => ({ ...f, attribute_code: e.target.value }))} placeholder="e.g. color" />
            <KpField label="Group" value={form.attribute_group} onChange={e => setForm(f => ({ ...f, attribute_group: e.target.value }))} placeholder="e.g. Physical" />
            <div className="flex gap-3 pt-1">
              <button onClick={() => setShowModal(false)} className="flex-1 rounded-xl py-2.5 text-sm border hover:bg-white/5 theme-btn-cancel">Cancel</button>
              <KpBtn onClick={handleSave} loading={saving} className="flex-1 justify-center">Save</KpBtn>
            </div>
          </div>
        </KpModal>
      )}
    </div>
  );
}
