'use client';
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Globe } from 'lucide-react';
import { kpFetch } from '@/lib/kestopur/api';
import { KpPageHeader, KpCard, KpTable, KpBadge, KpSearch, KpSkeleton, KpBtn, KpModal, KpField } from '@/components/kestopur/ui';

interface Manufacturer { manufacturer_id: string; manufacturer_name: string; manufacturer_slug: string; website_url?: string; is_active: boolean; }

export default function ManufacturersPage() {
  const [items, setItems] = useState<Manufacturer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState<Manufacturer | null>(null);
  const [form, setForm] = useState({ manufacturer_name: '', manufacturer_slug: '', website_url: '' });
  const [saving, setSaving] = useState(false);

  const fetch = async () => { setLoading(true); const r = await kpFetch('/wp-admin/manufacturers'); setItems(Array.isArray(r.data) ? r.data : r.data?.data || []); setLoading(false); };
  useEffect(() => { fetch(); }, []);

  const handleDelete = async (id: string) => { if (!confirm('Delete?')) return; await kpFetch(`/wp-admin/manufacturers/${id}`, { method: 'DELETE' }); fetch(); };
  const handleSave = async () => { setSaving(true); if (selected) await kpFetch(`/wp-admin/manufacturers/${selected.manufacturer_id}`, { method: 'PUT', body: JSON.stringify(form) }); else await kpFetch('/wp-admin/manufacturers', { method: 'POST', body: JSON.stringify(form) }); setSaving(false); setShowModal(false); fetch(); };

  const filtered = items.filter(m => m.manufacturer_name?.toLowerCase().includes(search.toLowerCase()) || m.manufacturer_slug?.toLowerCase().includes(search.toLowerCase()));

  const cols = [
    { key: 'name', label: 'Manufacturer', render: (m: Manufacturer) => <div><p className="text-sm font-semibold" style={{ color: 'var(--text-color)' }}>{m.manufacturer_name}</p><p className="text-xs font-mono" style={{ color: 'var(--circle)' }}>{m.manufacturer_slug}</p></div> },
    { key: 'website', label: 'Website', render: (m: Manufacturer) => m.website_url ? <a href={m.website_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm hover:opacity-80" style={{ color: '#60a5fa' }}><Globe className="h-3.5 w-3.5" /> Website</a> : <span className="text-sm" style={{ color: 'var(--circle)' }}>—</span> },
    { key: 'status', label: 'Status', render: (m: Manufacturer) => <KpBadge label={m.is_active ? 'Active' : 'Inactive'} variant={m.is_active ? 'active' : 'inactive'} /> },
    { key: 'actions', label: 'Actions', align: 'right' as const, render: (m: Manufacturer) => <div className="flex items-center justify-end gap-1"><button onClick={() => { setSelected(m); setForm({ manufacturer_name: m.manufacturer_name, manufacturer_slug: m.manufacturer_slug, website_url: m.website_url || '' }); setShowModal(true); }} className="p-1.5 rounded-lg hover:bg-white/10" style={{ color: 'var(--circle)' }}><Edit className="h-4 w-4" /></button><button onClick={() => handleDelete(m.manufacturer_id)} className="p-1.5 rounded-lg hover:bg-red-500/10" style={{ color: '#f87171' }}><Trash2 className="h-4 w-4" /></button></div> },
  ];

  return (
    <div className="space-y-6">
      <KpPageHeader title="Manufacturers" subtitle="Manage product manufacturers" action={<KpBtn onClick={() => { setSelected(null); setForm({ manufacturer_name: '', manufacturer_slug: '', website_url: '' }); setShowModal(true); }}><Plus className="h-4 w-4" /> Add Manufacturer</KpBtn>} />
      <KpSearch value={search} onChange={setSearch} placeholder="Search manufacturers..." className="max-w-md" />
      <KpCard>{loading ? <KpSkeleton /> : <KpTable cols={cols} rows={filtered} rowKey={m => m.manufacturer_id} emptyMsg="No manufacturers found." />}</KpCard>
      {showModal && <KpModal title={selected ? 'Edit Manufacturer' : 'Add Manufacturer'} onClose={() => setShowModal(false)}><div className="space-y-4"><KpField label="Name" value={form.manufacturer_name} onChange={e => setForm(f => ({ ...f, manufacturer_name: e.target.value }))} placeholder="e.g. Samsung" /><KpField label="Slug" value={form.manufacturer_slug} onChange={e => setForm(f => ({ ...f, manufacturer_slug: e.target.value }))} placeholder="e.g. samsung" /><KpField label="Website URL" type="url" value={form.website_url} onChange={e => setForm(f => ({ ...f, website_url: e.target.value }))} placeholder="https://samsung.com" /><div className="flex gap-3 pt-1"><button onClick={() => setShowModal(false)} className="flex-1 rounded-xl py-2.5 text-sm border hover:bg-white/5" style={{ borderColor: 'var(--border-color)', color: 'var(--old-price)' }}>Cancel</button><KpBtn onClick={handleSave} loading={saving} className="flex-1 justify-center">Save</KpBtn></div></div></KpModal>}
    </div>
  );
}
