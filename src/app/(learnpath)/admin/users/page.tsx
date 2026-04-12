'use client';
import { useState, useEffect, useCallback } from 'react';
import { UserPlus, Edit2, Trash2, Loader2, Users, Shield, GraduationCap, Save } from 'lucide-react';
import { lpFetch, type LPUser } from '@/lib/learnpath/api';
import {
  PageHeader, Card, DataTable, SearchInput, Modal,
  FieldInput, FieldSelect, EmptyState, SkeletonList,
  PrimaryBtn, GhostBtn, DangerBtn, ErrorAlert, SuccessAlert,
} from '@/components/learnpath/ui';

interface FormState { name: string; email: string; password: string; role: 'LEARNER' | 'ADMIN'; }
const emptyForm: FormState = { name: '', email: '', password: '', role: 'LEARNER' };

function RoleBadge({ role }: { role: 'ADMIN' | 'LEARNER' }) {
  const isAdmin = role === 'ADMIN';
  const cls = isAdmin ? 'theme-tag-purple border-purple-500/20' : 'theme-tag-success border-green-500/20';

  return (
    <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full w-fit font-semibold border ${cls}`}>
      {isAdmin ? <Shield className="h-2.5 w-2.5" /> : <GraduationCap className="h-2.5 w-2.5" />}
      {role}
    </span>
  );
}

function UserAvatar({ name, role }: { name: string; role: string }) {
  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const isAdmin = role === 'ADMIN';
  return (
    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 text-white ${isAdmin ? 'bg-gradient-to-br from-indigo-500 to-purple-500' : 'bg-gradient-to-br from-emerald-500 to-green-600'}`}>
      {initials}
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
    lpFetch('/api/learnpath/users')
      .then(r => r.json()).then(d => setUsers(Array.isArray(d) ? d : [])).catch(() => setUsers([])).finally(() => setLoading(false));
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

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      key: 'user', label: 'User', render: (u: LPUser) => (
        <div className="flex items-center gap-3">
          <UserAvatar name={u.name} role={u.role} />
          <div>
            <p className="text-sm font-semibold theme-text">{u.name}</p>
            <p className="text-xs theme-text-muted">{u.email}</p>
          </div>
        </div>
      ),
    },
    { key: 'role', label: 'Role', render: (u: LPUser) => <RoleBadge role={u.role} /> },
    { key: 'enrollments', label: 'Enrollments', render: (u: LPUser) => <span className="text-sm theme-text-muted">{u._count.enrollments}</span> },
    {
      key: 'joined', label: 'Joined', render: (u: LPUser) => (
        <span className="text-sm theme-text-subtle">
          {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      ),
    },
    {
      key: 'actions', label: 'Actions', align: 'right' as const, render: (u: LPUser) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={() => openEdit(u)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors theme-text-subtle">
            <Edit2 className="h-4 w-4" />
          </button>
          <DangerBtn onClick={() => handleDelete(u.id, u.name)} loading={deleting === u.id}>
            <Trash2 className="h-4 w-4" />
          </DangerBtn>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        subtitle="Add, edit, and manage learner accounts."
        action={
          <button onClick={openAdd} className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold hover:opacity-90 theme-btn-neon">
            <UserPlus className="h-4 w-4" /> Add User
          </button>
        }
      />

      <SuccessAlert message={success} />

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by name or email…" className="flex-1 max-w-sm" />
        <div className="flex gap-2">
          <span className="theme-tag-accent border-indigo-500/20 text-xs px-3 py-1.5 rounded-lg font-semibold border">
            {users.filter(u => u.role === 'LEARNER').length} Learners
          </span>
          <span className="theme-tag-purple border-purple-500/20 text-xs px-3 py-1.5 rounded-lg font-semibold border">
            {users.filter(u => u.role === 'ADMIN').length} Admins
          </span>
        </div>
      </div>

      <Card>
        {loading ? (
          <SkeletonList rows={5} />
        ) : filtered.length === 0 ? (
          <EmptyState icon={Users} title={search ? 'No users match.' : 'No users found.'} />
        ) : (
          <DataTable columns={columns} rows={filtered} rowKey={u => u.id} />
        )}
      </Card>

      {showModal && (
        <Modal title={showModal === 'add' ? 'Add New User' : `Edit ${editUser?.name}`} onClose={closeModal}>
          <div className="space-y-4">
            <FieldInput label="Full Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Jane Doe" />
            <FieldInput label="Email Address" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="jane@company.com" />
            <FieldInput
              label={showModal === 'edit' ? 'New Password (leave blank to keep)' : 'Password'}
              type="password" value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              placeholder="••••••••"
            />
            <FieldSelect
              label="Role"
              options={['LEARNER', 'ADMIN']}
              value={form.role}
              onChange={e => setForm(f => ({ ...f, role: e.target.value as 'LEARNER' | 'ADMIN' }))}
            />
            <ErrorAlert message={error} />
            <div className="flex gap-3 pt-1">
              <GhostBtn onClick={closeModal} className="flex-1 justify-center">Cancel</GhostBtn>
              <PrimaryBtn onClick={handleSave} loading={saving} className="flex-1 justify-center">
                <Save className="h-4 w-4" />{saving ? 'Saving…' : 'Save User'}
              </PrimaryBtn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
