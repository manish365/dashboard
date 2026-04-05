'use client';
import { useState, useEffect, useCallback } from 'react';
import { UserPlus, Edit2, Trash2, X, Save, Loader2, Users, Search, Shield, GraduationCap } from 'lucide-react';
import { lpFetch, type LPUser } from '@/lib/learnpath/api';

interface FormState { name: string; email: string; password: string; role: 'LEARNER' | 'ADMIN'; }
const emptyForm: FormState = { name: '', email: '', password: '', role: 'LEARNER' };

function FieldInput({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-semibold" style={{ color: 'var(--old-price)' }}>{label}</label>
      <input className="w-full rounded-lg px-3 py-2.5 text-sm outline-none border" style={{ background: 'var(--foot-color)', borderColor: 'var(--border-color)', color: 'var(--text-color)' }} {...props} />
    </div>
  );
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<LPUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState<'add' | 'edit' | null>(null);
  const [editUser, setEditUser] = useState<LPUser | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    lpFetch('/api/learnpath/users').then(r => r.json()).then(d => setUsers(Array.isArray(d) ? d : [])).catch(() => setUsers([])).finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const openAdd = () => { setForm(emptyForm); setError(''); setShowModal('add'); };
  const openEdit = (u: LPUser) => { setEditUser(u); setForm({ name: u.name, email: u.email, password: '', role: u.role }); setError(''); setShowModal('edit'); };
  const closeModal = () => { setShowModal(null); setEditUser(null); setError(''); };

  const handleSave = async () => {
    if (!form.name || !form.email) { setError('Name and email are required.'); return; }
    if (showModal === 'add' && !form.password) { setError('Password is required.'); return; }
    setSaving(true); setError('');
    const url = showModal === 'edit' ? `/api/learnpath/users/${editUser!.id}` : '/api/learnpath/users';
    const body: Partial<FormState> = { name: form.name, email: form.email, role: form.role };
    if (form.password) body.password = form.password;
    const res = await lpFetch(url, { method: showModal === 'edit' ? 'PATCH' : 'POST', body: JSON.stringify(body) });
    const data = await res.json();
    if (!res.ok) { setError(data.error || 'Something went wrong.'); setSaving(false); return; }
    setSuccess(showModal === 'add' ? 'User created!' : 'User updated!');
    setTimeout(() => setSuccess(''), 3000);
    closeModal(); fetchUsers(); setSaving(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete user "${name}"?`)) return;
    setDeleting(id);
    await lpFetch(`/api/learnpath/users/${id}`, { method: 'DELETE' });
    setSuccess('User deleted.'); setTimeout(() => setSuccess(''), 3000);
    fetchUsers(); setDeleting(null);
  };

  const filtered = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-color)' }}>User Management</h1>
          <p className="text-sm" style={{ color: 'var(--old-price)' }}>Add, edit, and manage learner accounts.</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold hover:opacity-90"
          style={{ background: 'var(--neon-green)', color: 'var(--text-color-black)' }}>
          <UserPlus className="h-4 w-4" /> Add User
        </button>
      </div>

      {success && <div className="rounded-xl p-3 text-sm" style={{ background: 'rgba(52,211,153,0.1)', color: '#34d399', border: '1px solid rgba(52,211,153,0.2)' }}>{success}</div>}

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--circle)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email…"
            className="w-full rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none border"
            style={{ background: 'var(--foot-color)', borderColor: 'var(--border-color)', color: 'var(--text-color)' }} />
        </div>
        <div className="flex gap-2">
          <span className="text-xs px-3 py-1.5 rounded-lg font-semibold" style={{ background: 'rgba(129,140,248,0.1)', color: '#818cf8', border: '1px solid rgba(129,140,248,0.2)' }}>{users.filter(u => u.role === 'LEARNER').length} Learners</span>
          <span className="text-xs px-3 py-1.5 rounded-lg font-semibold" style={{ background: 'rgba(167,139,250,0.1)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.2)' }}>{users.filter(u => u.role === 'ADMIN').length} Admins</span>
        </div>
      </div>

      <div className="rounded-xl border overflow-hidden" style={{ background: 'var(--croma-wall)', borderColor: 'var(--border-color)' }}>
        {loading ? (
          <div className="p-6 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-14 rounded-lg animate-pulse" style={{ background: 'var(--foot-color)' }} />)}</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center"><Users className="h-10 w-10 mx-auto mb-3 opacity-20" style={{ color: 'var(--circle)' }} /><p className="text-sm" style={{ color: 'var(--old-price)' }}>{search ? 'No users match.' : 'No users found.'}</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  {['User', 'Role', 'Enrollments', 'Joined', 'Actions'].map((h, i) => (
                    <th key={h} className="px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--circle)', textAlign: i === 4 ? 'right' : 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u.id} className="hover:bg-white/5 transition-colors" style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{ background: u.role === 'ADMIN' ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'linear-gradient(135deg,#10b981,#059669)', color: '#fff' }}>
                          {u.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold" style={{ color: 'var(--text-color)' }}>{u.name}</p>
                          <p className="text-xs" style={{ color: 'var(--old-price)' }}>{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full w-fit font-semibold"
                        style={u.role === 'ADMIN' ? { background: 'rgba(167,139,250,0.1)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.2)' } : { background: 'rgba(52,211,153,0.1)', color: '#34d399', border: '1px solid rgba(52,211,153,0.2)' }}>
                        {u.role === 'ADMIN' ? <Shield className="h-2.5 w-2.5" /> : <GraduationCap className="h-2.5 w-2.5" />}{u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--old-price)' }}>{u._count.enrollments}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--circle)' }}>{new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(u)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" style={{ color: 'var(--circle)' }}><Edit2 className="h-4 w-4" /></button>
                        <button onClick={() => handleDelete(u.id, u.name)} disabled={deleting === u.id} className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors" style={{ color: '#f87171' }}>
                          {deleting === u.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={e => { if (e.target === e.currentTarget) closeModal(); }}>
          <div className="w-full max-w-md rounded-2xl border p-6 shadow-2xl" style={{ background: 'var(--croma-wall)', borderColor: 'var(--border-color)' }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-color)' }}>{showModal === 'add' ? 'Add New User' : `Edit ${editUser?.name}`}</h2>
              <button onClick={closeModal} className="p-1.5 rounded-lg hover:bg-white/10" style={{ color: 'var(--circle)' }}><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <FieldInput label="Full Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Jane Doe" />
              <FieldInput label="Email Address" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="jane@company.com" />
              <FieldInput label={showModal === 'edit' ? 'New Password (leave blank to keep)' : 'Password'} type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="••••••••" />
              <div className="space-y-1">
                <label className="block text-xs font-semibold" style={{ color: 'var(--old-price)' }}>Role</label>
                <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as 'LEARNER' | 'ADMIN' }))}
                  className="w-full rounded-lg px-3 py-2.5 text-sm outline-none border"
                  style={{ background: 'var(--foot-color)', borderColor: 'var(--border-color)', color: 'var(--text-color)' }}>
                  <option value="LEARNER" style={{ background: 'var(--navbar-carousel-color)' }}>Learner</option>
                  <option value="ADMIN" style={{ background: 'var(--navbar-carousel-color)' }}>Admin</option>
                </select>
              </div>
              {error && <div className="rounded-lg p-2.5 text-sm" style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171' }}>{error}</div>}
              <div className="flex gap-3 pt-1">
                <button onClick={closeModal} className="flex-1 rounded-xl py-2.5 text-sm border hover:bg-white/5 transition-colors" style={{ borderColor: 'var(--border-color)', color: 'var(--old-price)' }}>Cancel</button>
                <button onClick={handleSave} disabled={saving} className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold hover:opacity-90 disabled:opacity-40"
                  style={{ background: 'var(--neon-green)', color: 'var(--text-color-black)' }}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}{saving ? 'Saving…' : 'Save User'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
