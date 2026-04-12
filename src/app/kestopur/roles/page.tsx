'use client';
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Shield } from 'lucide-react';
import { kpFetch } from '@/lib/kestopur/api';
import { KpPageHeader, KpSearch, KpSkeleton, KpBtn, KpModal, KpField } from '@/components/kestopur/ui';

interface Role { id: string; name: string; description?: string; permissions?: { id: string; name: string }[]; userCount?: number; createdAt: string; }

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState<Role | null>(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);

  const fetchRoles = async () => {
    setLoading(true);
    const r = await kpFetch('/roles');
    setRoles(Array.isArray(r.data) ? r.data : r.data?.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchRoles(); }, [search]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this role?')) return;
    await kpFetch(`/roles/${id}`, { method: 'DELETE' });
    fetchRoles();
  };

  const handleSave = async () => {
    setSaving(true);
    if (selected) await kpFetch(`/roles/${selected.id}`, { method: 'PATCH', body: JSON.stringify(form) });
    else await kpFetch('/roles', { method: 'POST', body: JSON.stringify(form) });
    setSaving(false); setShowModal(false); fetchRoles();
  };

  const filtered = roles.filter(r =>
    r.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <KpPageHeader title="Roles" subtitle="Create roles and assign permissions"
        action={<KpBtn onClick={() => { setSelected(null); setForm({ name: '', description: '' }); setShowModal(true); }}><Plus className="h-4 w-4" /> Add Role</KpBtn>} />
      <KpSearch value={search} onChange={setSearch} placeholder="Search roles..." className="max-w-md" />

      {loading ? <KpSkeleton /> : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.length === 0 ? (
            <div className="col-span-full text-center py-12 theme-text-muted">No roles found.</div>
          ) : filtered.map(role => (
            <div key={role.id} className="rounded-xl border p-5 transition-all hover:border-[var(--neon-green)]/20 theme-card-bg">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg p-2 theme-tag-accent">
                    <Shield className="h-5 w-5 theme-text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm theme-text">{role.name}</h3>
                    <p className="text-xs theme-text-muted">{role.description || 'No description'}</p>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-xs mb-2 theme-text-subtle">Permissions ({role.permissions?.length || 0})</p>
                <div className="flex flex-wrap gap-1 max-h-16 overflow-hidden">
                  {role.permissions?.slice(0, 3).map(p => (
                    <span key={p.id} className="text-xs px-1.5 py-0.5 rounded theme-tag-success">{p.name}</span>
                  ))}
                  {(role.permissions?.length || 0) > 3 && (
                    <span className="text-xs px-1.5 py-0.5 rounded theme-footer-bg theme-text-subtle">+{(role.permissions?.length || 0) - 3} more</span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs mb-4 theme-text-subtle">
                <span>Users: {role.userCount || 0}</span>
                <span>Created: {new Date(role.createdAt).toLocaleDateString()}</span>
              </div>

              <div className="flex justify-end gap-2">
                <button onClick={() => { setSelected(role); setForm({ name: role.name, description: role.description || '' }); setShowModal(true); }}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors theme-text-subtle"><Edit className="h-4 w-4" /></button>
                <button onClick={() => handleDelete(role.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors theme-text-danger"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <KpModal title={selected ? 'Edit Role' : 'Add Role'} onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <KpField label="Role Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Store Manager" />
            <KpField label="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description of this role" />
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
