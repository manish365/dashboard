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
    const r = await kpFetch('/wp-admin/roles');
    setRoles(Array.isArray(r.data) ? r.data : r.data?.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchRoles(); }, [search]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this role?')) return;
    await kpFetch(`/wp-admin/roles/${id}`, { method: 'DELETE' });
    fetchRoles();
  };

  const handleSave = async () => {
    setSaving(true);
    if (selected) await kpFetch(`/wp-admin/roles/${selected.id}`, { method: 'PATCH', body: JSON.stringify(form) });
    else await kpFetch('/wp-admin/roles', { method: 'POST', body: JSON.stringify(form) });
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
            <div className="col-span-full text-center py-12" style={{ color: 'var(--old-price)' }}>No roles found.</div>
          ) : filtered.map(role => (
            <div key={role.id} className="rounded-xl border p-5 transition-all hover:border-[var(--neon-green)]/20"
              style={{ background: 'var(--croma-wall)', borderColor: 'var(--border-color)' }}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg p-2" style={{ background: 'rgba(129,140,248,0.1)' }}>
                    <Shield className="h-5 w-5" style={{ color: '#818cf8' }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm" style={{ color: 'var(--text-color)' }}>{role.name}</h3>
                    <p className="text-xs" style={{ color: 'var(--old-price)' }}>{role.description || 'No description'}</p>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-xs mb-2" style={{ color: 'var(--circle)' }}>Permissions ({role.permissions?.length || 0})</p>
                <div className="flex flex-wrap gap-1 max-h-16 overflow-hidden">
                  {role.permissions?.slice(0, 3).map(p => (
                    <span key={p.id} className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(52,211,153,0.1)', color: '#34d399' }}>{p.name}</span>
                  ))}
                  {(role.permissions?.length || 0) > 3 && (
                    <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--foot-color)', color: 'var(--circle)' }}>+{(role.permissions?.length || 0) - 3} more</span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs mb-4" style={{ color: 'var(--circle)' }}>
                <span>Users: {role.userCount || 0}</span>
                <span>Created: {new Date(role.createdAt).toLocaleDateString()}</span>
              </div>

              <div className="flex justify-end gap-2">
                <button onClick={() => { setSelected(role); setForm({ name: role.name, description: role.description || '' }); setShowModal(true); }}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" style={{ color: 'var(--circle)' }}><Edit className="h-4 w-4" /></button>
                <button onClick={() => handleDelete(role.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors" style={{ color: '#f87171' }}><Trash2 className="h-4 w-4" /></button>
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
