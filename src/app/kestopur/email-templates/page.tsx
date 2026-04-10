'use client';
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Mail } from 'lucide-react';
import { kpFetch } from '@/lib/kestopur/api';
import { KpPageHeader, KpCard, KpTable, KpSearch, KpSkeleton, KpBtn, KpModal, KpField } from '@/components/kestopur/ui';

interface Template { id: string; name: string; subject: string; }

export default function EmailTemplatesPage() {
  const [items, setItems] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState<Template | null>(null);
  const [form, setForm] = useState({ name: '', subject: '', body: '' });
  const [saving, setSaving] = useState(false);

  const fetch = async () => { setLoading(true); const r = await kpFetch('/wp-admin/email-templates'); setItems(Array.isArray(r.data) ? r.data : []); setLoading(false); };
  useEffect(() => { fetch(); }, []);

  const handleDelete = async (id: string) => { if (!confirm('Delete?')) return; await kpFetch(`/wp-admin/email-templates/${id}`, { method: 'DELETE' }); fetch(); };
  const handleSave = async () => { setSaving(true); if (selected) await kpFetch(`/wp-admin/email-templates/${selected.id}`, { method: 'PUT', body: JSON.stringify(form) }); else await kpFetch('/wp-admin/email-templates', { method: 'POST', body: JSON.stringify(form) }); setSaving(false); setShowModal(false); fetch(); };

  const filtered = items.filter(t => t.name?.toLowerCase().includes(search.toLowerCase()) || t.subject?.toLowerCase().includes(search.toLowerCase()));

  const cols = [
    { key: 'name', label: 'Name', render: (t: Template) => <div className="flex items-center gap-2"><Mail className="h-4 w-4" style={{ color: 'var(--neon-green)' }} /><span className="text-sm font-medium" style={{ color: 'var(--text-color)' }}>{t.name}</span></div> },
    { key: 'subject', label: 'Subject', render: (t: Template) => <span className="text-sm" style={{ color: 'var(--old-price)' }}>{t.subject}</span> },
    { key: 'actions', label: 'Actions', align: 'right' as const, render: (t: Template) => <div className="flex items-center justify-end gap-1"><button onClick={() => { setSelected(t); setForm({ name: t.name, subject: t.subject, body: '' }); setShowModal(true); }} className="p-1.5 rounded-lg hover:bg-white/10" style={{ color: 'var(--circle)' }}><Edit className="h-4 w-4" /></button><button onClick={() => handleDelete(t.id)} className="p-1.5 rounded-lg hover:bg-red-500/10" style={{ color: '#f87171' }}><Trash2 className="h-4 w-4" /></button></div> },
  ];

  return (
    <div className="space-y-6">
      <KpPageHeader title="Email Templates" subtitle="Manage system email templates" action={<KpBtn onClick={() => { setSelected(null); setForm({ name: '', subject: '', body: '' }); setShowModal(true); }}><Plus className="h-4 w-4" /> Add Template</KpBtn>} />
      <KpSearch value={search} onChange={setSearch} placeholder="Search templates..." className="max-w-md" />
      <KpCard>{loading ? <KpSkeleton /> : <KpTable cols={cols} rows={filtered} rowKey={t => t.id} emptyMsg="No email templates found." />}</KpCard>
      {showModal && <KpModal title={selected ? 'Edit Template' : 'Add Template'} onClose={() => setShowModal(false)}><div className="space-y-4"><KpField label="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Welcome Email" /><KpField label="Subject" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="e.g. Welcome to Kestopur!" /><div className="flex gap-3 pt-1"><button onClick={() => setShowModal(false)} className="flex-1 rounded-xl py-2.5 text-sm border hover:bg-white/5" style={{ borderColor: 'var(--border-color)', color: 'var(--old-price)' }}>Cancel</button><KpBtn onClick={handleSave} loading={saving} className="flex-1 justify-center">Save</KpBtn></div></div></KpModal>}
    </div>
  );
}
