'use client';
import { useState, useEffect } from 'react';
import { MapPin, Plus, Edit, Trash2, CheckCircle, XCircle, Truck } from 'lucide-react';
import { kpFetch } from '@/lib/kestopur/api';
import { KpPageHeader, KpCard, KpTable, KpBadge, KpSearch, KpSelect, KpSkeleton, KpBtn, KpModal, KpField } from '@/components/kestopur/ui';

interface Pincode { pincodeId: string; pincode: string; city: string; state: string; deliveryDaysMin?: number; deliveryDaysMax?: number; deliveryCharges?: { standard?: number }; isCodAvailable?: boolean; isActive: boolean; }

export default function PincodesPage() {
  const [items, setItems] = useState<Pincode[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState<Pincode | null>(null);
  const [form, setForm] = useState({ pincode: '', city: '', state: '' });
  const [saving, setSaving] = useState(false);

  const fetch = async () => { setLoading(true); const params = new URLSearchParams(activeFilter !== '' ? { isActive: activeFilter } : {}); const r = await kpFetch(`/pincodes?${params}`); setItems(Array.isArray(r.data) ? r.data : []); setLoading(false); };
  useEffect(() => { fetch(); }, [activeFilter]);

  const handleDelete = async (id: string) => { if (!confirm('Delete?')) return; await kpFetch(`/pincodes/${id}`, { method: 'DELETE' }); fetch(); };
  const handleSave = async () => { setSaving(true); if (selected) await kpFetch(`/pincodes/${selected.pincodeId}`, { method: 'PUT', body: JSON.stringify(form) }); else await kpFetch('/pincodes', { method: 'POST', body: JSON.stringify(form) }); setSaving(false); setShowModal(false); fetch(); };

  const filtered = items.filter(p => p.pincode?.includes(search) || p.city?.toLowerCase().includes(search.toLowerCase()) || p.state?.toLowerCase().includes(search.toLowerCase()));

  const cols = [
    { key: 'pincode', label: 'Pincode', render: (p: Pincode) => <span className="text-sm font-bold theme-text">{p.pincode}</span> },
    { key: 'location', label: 'Location', render: (p: Pincode) => <div><p className="text-sm theme-text">{p.city}</p><p className="text-xs theme-text-subtle">{p.state}</p></div> },
    { key: 'delivery', label: 'Delivery Days', render: (p: Pincode) => <span className="text-sm flex items-center gap-1 theme-text-muted"><Truck className="h-3.5 w-3.5" />{p.deliveryDaysMin}–{p.deliveryDaysMax}d</span> },
    { key: 'charges', label: 'Charges', render: (p: Pincode) => <span className="text-sm theme-text-muted">₹{p.deliveryCharges?.standard || 0}</span> },
    { key: 'cod', label: 'COD', render: (p: Pincode) => p.isCodAvailable ? <CheckCircle className="h-5 w-5 theme-text-success" /> : <XCircle className="h-5 w-5 theme-text-subtle" /> },
    { key: 'status', label: 'Status', render: (p: Pincode) => <KpBadge label={p.isActive ? 'Active' : 'Inactive'} variant={p.isActive ? 'active' : 'inactive'} /> },
    { key: 'actions', label: 'Actions', align: 'right' as const, render: (p: Pincode) => <div className="flex items-center justify-end gap-1"><button onClick={() => { setSelected(p); setForm({ pincode: p.pincode, city: p.city, state: p.state }); setShowModal(true); }} className="p-1.5 rounded-lg hover:bg-white/10 theme-text-subtle"><Edit className="h-4 w-4" /></button><button onClick={() => handleDelete(p.pincodeId)} className="p-1.5 rounded-lg hover:bg-white/10 theme-text-danger"><Trash2 className="h-4 w-4" /></button></div> },
  ];

  return (
    <div className="space-y-6">
      <KpPageHeader title="Serviceable Pincodes" subtitle="Manage delivery coverage and pricing" action={<KpBtn onClick={() => { setSelected(null); setForm({ pincode: '', city: '', state: '' }); setShowModal(true); }}><Plus className="h-4 w-4" /> Add Pincode</KpBtn>} />
      <div className="flex gap-3">
        <KpSearch value={search} onChange={setSearch} placeholder="Search by pincode, city, or state..." className="flex-1 max-w-sm" />
        <KpSelect value={activeFilter} onChange={setActiveFilter}>
          <option value="" className="theme-option">All Pincodes</option>
          <option value="true" className="theme-option">Active Only</option>
          <option value="false" className="theme-option">Inactive Only</option>
        </KpSelect>
      </div>
      <KpCard>{loading ? <KpSkeleton /> : <KpTable cols={cols} rows={filtered} rowKey={p => p.pincodeId} emptyMsg="No pincodes found." />}</KpCard>
      {showModal && <KpModal title={selected ? 'Edit Pincode' : 'Add Pincode'} onClose={() => setShowModal(false)}><div className="space-y-4"><KpField label="Pincode" value={form.pincode} onChange={e => setForm(f => ({ ...f, pincode: e.target.value }))} placeholder="e.g. 400001" /><KpField label="City" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder="e.g. Mumbai" /><KpField label="State" value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} placeholder="e.g. Maharashtra" /><div className="flex gap-3 pt-1"><button onClick={() => setShowModal(false)} className="flex-1 rounded-xl py-2.5 text-sm border hover:bg-white/5 theme-btn-cancel">Cancel</button><KpBtn onClick={handleSave} loading={saving} className="flex-1 justify-center">Save</KpBtn></div></div></KpModal>}
    </div>
  );
}
