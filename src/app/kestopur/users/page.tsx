'use client';
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Upload, Lock, Shield, GraduationCap } from 'lucide-react';
import { kpFetch } from '@/lib/kestopur/api';
import { KpPageHeader, KpCard, KpTable, KpBadge, KpSearch, KpSkeleton, KpBtn, KpModal, KpField } from '@/components/kestopur/ui';

interface User { id: string; fullName?: string; first_name?: string; last_name?: string; email: string; user_type: string; status: string; roles?: { id: string; name: string }[]; created_at: string; }

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState<User | null>(null);
  const [form, setForm] = useState({ email: '', password: '', user_type: 'employee' });
  const [saving, setSaving] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    const r = await kpFetch('/wp-admin/users');
    setUsers(Array.isArray(r.data) ? r.data : r.data?.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const getName = (u: User) => u.fullName || `${u.first_name || ''} ${u.last_name || ''}`.trim() || 'N/A';

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this user?')) return;
    await kpFetch(`/wp-admin/users/${id}`, { method: 'DELETE' });
    fetchUsers();
  };

  const handleSave = async () => {
    setSaving(true);
    if (selected) await kpFetch(`/wp-admin/users/${selected.id}`, { method: 'PATCH', body: JSON.stringify(form) });
    else await kpFetch('/wp-admin/users', { method: 'POST', body: JSON.stringify(form) });
    setSaving(false); setShowModal(false); fetchUsers();
  };

  const filtered = users.filter(u =>
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    getName(u).toLowerCase().includes(search.toLowerCase())
  );

  const cols = [
    { key: 'name', label: 'Name', render: (u: User) => <div><p className="text-sm font-medium" style={{ color: 'var(--text-color)' }}>{getName(u)}</p><p className="text-xs" style={{ color: 'var(--old-price)' }}>{u.email}</p></div> },
    {
      key: 'type', label: 'Type', render: (u: User) => (
        <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
          style={u.user_type === 'admin' ? { background: 'rgba(248,113,113,0.1)', color: '#f87171' } : { background: 'rgba(96,165,250,0.1)', color: '#60a5fa' }}>
          {u.user_type}
        </span>
      ),
    },
    {
      key: 'roles', label: 'Roles', render: (u: User) => (
        <div className="flex flex-wrap gap-1">
          {u.roles?.length ? u.roles.map(r => (
            <span key={r.id} className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(52,211,153,0.1)', color: '#34d399' }}>{r.name}</span>
          )) : <span className="text-xs" style={{ color: 'var(--circle)' }}>No roles</span>}
        </div>
      ),
    },
    { key: 'status', label: 'Status', render: (u: User) => <KpBadge label={u.status} variant={u.status} /> },
    { key: 'created', label: 'Created', render: (u: User) => <span className="text-sm" style={{ color: 'var(--circle)' }}>{new Date(u.created_at).toLocaleDateString()}</span> },
    {
      key: 'actions', label: 'Actions', align: 'right' as const, render: (u: User) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={() => { setSelected(u); setForm({ email: u.email, password: '', user_type: u.user_type }); setShowModal(true); }}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" style={{ color: 'var(--circle)' }}><Edit className="h-4 w-4" /></button>
          <button onClick={() => handleDelete(u.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors" style={{ color: '#f87171' }}><Trash2 className="h-4 w-4" /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <KpPageHeader title="User Management" subtitle="Add, edit, and manage admin accounts"
        action={
          <div className="flex gap-2">
            <KpBtn onClick={() => { setSelected(null); setForm({ email: '', password: '', user_type: 'employee' }); setShowModal(true); }}>
              <Plus className="h-4 w-4" /> Add User
            </KpBtn>
          </div>
        }
      />
      <KpSearch value={search} onChange={setSearch} placeholder="Search users..." className="max-w-md" />
      <KpCard>
        {loading ? <KpSkeleton /> : <KpTable cols={cols} rows={filtered} rowKey={u => u.id} emptyMsg="No users found." />}
      </KpCard>

      {showModal && (
        <KpModal title={selected ? 'Edit User' : 'Add User'} onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <KpField label="Email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="user@example.com" />
            <KpField label={selected ? 'New Password (leave blank to keep)' : 'Password'} type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="••••••••" />
            <div className="space-y-1">
              <label className="block text-xs font-semibold" style={{ color: 'var(--old-price)' }}>User Type</label>
              <select value={form.user_type} onChange={e => setForm(f => ({ ...f, user_type: e.target.value }))}
                className="w-full rounded-lg px-3 py-2.5 text-sm outline-none border"
                style={{ background: 'var(--foot-color)', borderColor: 'var(--border-color)', color: 'var(--text-color)' }}>
                {['admin', 'employee', 'customer'].map(t => <option key={t} value={t} style={{ background: 'var(--navbar-carousel-color)' }}>{t}</option>)}
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
