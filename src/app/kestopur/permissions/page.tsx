'use client';
import { useState, useEffect } from 'react';
import { Plus, Eye, Edit, Trash2, Shield } from 'lucide-react';
import { kpFetch } from '@/lib/kestopur/api';
import { KpPageHeader, KpSearch, KpSkeleton, KpBtn } from '@/components/kestopur/ui';

interface Permission { id: string; name: string; description?: string; key?: string; }
interface PermCategory { id: string; name: string; permissions: Permission[]; }

export default function PermissionsPage() {
  const [categories, setCategories] = useState<PermCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    kpFetch('/wp-admin/permissions').then(r => setCategories(Array.isArray(r.data) ? r.data : [])).catch(() => setCategories([])).finally(() => setLoading(false));
  }, []);

  const filtered = categories.map(cat => ({
    ...cat,
    permissions: cat.permissions.filter(p =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter(cat => cat.permissions.length > 0 || cat.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <KpPageHeader title="Permissions" subtitle="Configure system permissions by category" action={<KpBtn><Plus className="h-4 w-4" /> Add Permission</KpBtn>} />
      <KpSearch value={search} onChange={setSearch} placeholder="Search permissions..." className="max-w-md" />

      {loading ? <KpSkeleton rows={3} /> : filtered.length === 0 ? (
        <div className="text-center py-12 theme-text-muted">No permissions found.</div>
      ) : (
        <div className="space-y-4">
          {filtered.map(cat => (
            <div key={cat.id} className="rounded-xl border overflow-hidden theme-card-bg">
              <div className="px-5 py-3.5 border-b flex items-center justify-between theme-footer-bg theme-border">
                <h4 className="font-semibold text-sm theme-text">{cat.name}</h4>
                <span className="text-xs px-2 py-0.5 rounded-full theme-neon-tag">{cat.permissions.length} permissions</span>
              </div>
              {cat.permissions.length === 0 ? (
                <p className="px-5 py-4 text-sm theme-text-subtle">No permissions in this category.</p>
              ) : (
                <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
                  {cat.permissions.map(perm => (
                    <div key={perm.id} className="rounded-xl border p-4 transition-all hover:border-[var(--neon-green)]/20 theme-footer-bg theme-border">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 flex-shrink-0" style={{ color: '#818cf8' }} />
                          <p className="text-sm font-medium theme-text">{perm.name}</p>
                        </div>
                        <div className="flex gap-1">
                          <button className="p-1 rounded hover:bg-white/10 theme-text-subtle"><Eye className="h-3.5 w-3.5" /></button>
                          <button className="p-1 rounded hover:bg-white/10 theme-text-subtle"><Edit className="h-3.5 w-3.5" /></button>
                          <button className="p-1 rounded hover:bg-red-500/10 theme-text-danger"><Trash2 className="h-3.5 w-3.5" /></button>
                        </div>
                      </div>
                      <p className="text-xs mb-2 theme-text-muted">{perm.description || 'No description'}</p>
                      {perm.key && <code className="text-[10px] px-1.5 py-0.5 rounded theme-card-bg theme-text-subtle">{perm.key}</code>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
